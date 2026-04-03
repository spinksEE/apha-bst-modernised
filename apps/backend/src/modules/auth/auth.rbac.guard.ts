import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditSeverity } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthRbacService } from './auth.rbac.service';
import type { RoleRequirement } from './auth.rbac.types';
import type { AuthenticatedUser } from './auth.types';
import { RBAC_METADATA_KEY, READ_ONLY_METADATA_KEY } from './auth.rbac';
import { generateReferenceId } from './auth.reference';

const ACCESS_DENIED_MESSAGE = 'Access denied';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    private readonly authRbacService: AuthRbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<
      Array<AuthenticatedUser['role']>
    >(RBAC_METADATA_KEY, [context.getHandler(), context.getClass()]);

    const allowReadOnly = this.reflector.getAllAndOverride<boolean>(
      READ_ONLY_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requirement = this.buildRequirement(requiredRoles, allowReadOnly);
    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      const referenceId = generateReferenceId();
      await this.auditLogService.logEvent({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: null,
        ipAddress: request.ip,
        sessionId: null,
        details: {
          reason: 'USER_MISSING',
          referenceId,
          requiredRoles: requirement.allowedRoles,
          allowReadOnly: requirement.allowReadOnly,
        },
      });
      throw new ForbiddenException({
        message: ACCESS_DENIED_MESSAGE,
        referenceId,
      });
    }

    if (!this.authRbacService.isRoleAllowed(user.role, requirement)) {
      const referenceId = generateReferenceId();
      await this.logAccessDenied(user, request.ip, referenceId, {
        reason: user.role === 'ReadOnly' ? 'READ_ONLY_FORBIDDEN' : 'ROLE_NOT_AUTHORIZED',
        requiredRoles: requirement.allowedRoles,
        allowReadOnly: requirement.allowReadOnly,
      });
      throw new ForbiddenException({
        message: ACCESS_DENIED_MESSAGE,
        referenceId,
      });
    }

    return true;
  }

  private buildRequirement(
    roles: Array<AuthenticatedUser['role']> | undefined,
    allowReadOnly?: boolean,
  ): RoleRequirement | undefined {
    if (!roles || roles.length === 0) {
      return undefined;
    }
    return {
      allowedRoles: roles,
      allowReadOnly: allowReadOnly ?? false,
    };
  }

  private async logAccessDenied(
    user: AuthenticatedUser,
    ipAddress: string | undefined,
    referenceId: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.auditLogService.logEvent({
      eventType: 'ACCESS_DENIED',
      severity: AuditSeverity.High,
      userId: user.userId,
      ipAddress,
      sessionId: user.sessionId,
      details: {
        referenceId,
        ...details,
      },
    });
  }
}
