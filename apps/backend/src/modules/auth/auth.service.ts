import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuditSeverity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { AuthAccessResult, AuthenticatedUser } from './auth.types';
import { generateReferenceId } from './auth.reference';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid username or password';
const ACCESS_DENIED_MESSAGE = 'Access denied';
const DEFAULT_JWT_EXPIRES_IN = '8h';
const DEFAULT_BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async login(
    username: string,
    password: string,
    ipAddress?: string,
  ): Promise<AuthAccessResult> {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        userName: {
          equals: normalizedUsername,
          mode: 'insensitive',
        },
      },
      include: { location: true },
    });

    if (!user) {
      await this.auditLogService.logEvent({
        eventType: 'AUTH_LOGIN_FAILURE',
        ipAddress,
        details: {
          reason: 'USER_NOT_FOUND',
          username: normalizedUsername,
        },
      });
      throw new UnauthorizedException({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.auditLogService.logEvent({
        eventType: 'AUTH_LOGIN_FAILURE',
        userId: user.id,
        ipAddress,
        details: {
          reason: 'INVALID_PASSWORD',
          username: normalizedUsername,
        },
      });
      throw new UnauthorizedException({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (!user.isActive) {
      const referenceId = generateReferenceId();
      await this.auditLogService.logEvent({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: user.id,
        ipAddress,
        details: {
          reason: 'USER_INACTIVE',
          referenceId,
        },
      });
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    if (!user.role || !user.locationId) {
      const referenceId = generateReferenceId();
      await this.auditLogService.logEvent({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: user.id,
        ipAddress,
        details: {
          reason: 'MISSING_ROLE_OR_LOCATION',
          referenceId,
        },
      });
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    const sessionId = crypto.randomUUID();
    const payload = {
      sub: user.id,
      name: user.name,
      role: user.role,
      locationId: user.locationId,
      locationName: user.location?.name ?? undefined,
      sessionId,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      issuer: this.configService.get<string>('JWT_ISSUER'),
      audience: this.configService.get<string>('JWT_AUDIENCE'),
      expiresIn:
        this.configService.get<string>('JWT_EXPIRES_IN') ?? DEFAULT_JWT_EXPIRES_IN,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    });

    await this.auditLogService.logEvent({
      eventType: 'AUTH_LOGIN_SUCCESS',
      userId: user.id,
      ipAddress,
      sessionId,
      details: {
        role: user.role,
        locationId: user.locationId,
      },
    });

    return {
      accessToken: token,
      userContext: {
        userId: user.id,
        name: user.name,
        role: user.role,
        locationId: user.locationId,
        locationName: user.location?.name ?? undefined,
      },
    };
  }

  async validateUser(payload: AuthenticatedUser): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { location: true },
    });

    if (!user) {
      await this.auditLogService.logEvent({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: payload.userId,
        sessionId: payload.sessionId,
        details: {
          reason: 'USER_NOT_FOUND',
          referenceId: generateReferenceId(),
        },
      });
      throw new UnauthorizedException({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (!user.isActive) {
      const referenceId = generateReferenceId();
      await this.auditLogService.logEvent({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: user.id,
        sessionId: payload.sessionId,
        details: {
          reason: 'USER_INACTIVE',
          referenceId,
        },
      });
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    if (!user.role || !user.locationId) {
      const referenceId = generateReferenceId();
      await this.auditLogService.logEvent({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: user.id,
        sessionId: payload.sessionId,
        details: {
          reason: 'MISSING_ROLE_OR_LOCATION',
          referenceId,
        },
      });
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    });

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      locationId: user.locationId,
      locationName: user.location?.name ?? undefined,
      sessionId: payload.sessionId,
    };
  }

  async logout(user: AuthenticatedUser, ipAddress?: string): Promise<void> {
    await this.auditLogService.logEvent({
      eventType: 'AUTH_LOGOUT',
      userId: user.userId,
      ipAddress,
      sessionId: user.sessionId,
      details: {
        role: user.role,
        locationId: user.locationId,
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const rounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') ??
      DEFAULT_BCRYPT_SALT_ROUNDS;
    return bcrypt.hash(password, rounds);
  }

}
