import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditEventType, UserLevel } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserLevel[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.userLevel)) {
      await this.auditService.log({
        userId: user?.userId,
        eventType: AuditEventType.AccessDenied,
        details: `Role-based access denied. Required: [${requiredRoles.join(', ')}], had: ${user?.userLevel ?? 'none'}`,
        ipAddress: request.ip ?? 'unknown',
        sessionId: user?.sessionId,
      });
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
