import { Injectable } from '@nestjs/common';
import { AuditSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditLogEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'ACCESS_DENIED'
  | 'SESSION_TIMEOUT';

export type AuditLogEventInput = {
  eventType: AuditLogEventType;
  severity?: AuditSeverity;
  userId?: string | null;
  ipAddress?: string | null;
  sessionId?: string | null;
  details?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(input: AuditLogEventInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        eventType: input.eventType,
        severity: input.severity ?? AuditSeverity.Low,
        ipAddress: input.ipAddress ?? null,
        sessionId: input.sessionId ?? null,
        details: input.details ?? Prisma.JsonNull,
      },
    });
  }
}
