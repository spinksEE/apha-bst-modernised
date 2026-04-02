import { Injectable } from '@nestjs/common';
import { AuditEventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogData {
  userId?: number;
  eventType: AuditEventType;
  details: string;
  ipAddress: string;
  sessionId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: CreateAuditLogData): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        eventType: data.eventType,
        details: data.details,
        ipAddress: data.ipAddress,
        sessionId: data.sessionId ?? null,
      },
    });
  }
}
