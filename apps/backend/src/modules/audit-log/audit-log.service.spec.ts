import { Test, TestingModule } from '@nestjs/testing';
import { AuditSeverity, Prisma } from '@prisma/client';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: { auditLog: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = { auditLog: { create: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('creates an audit log record with defaults', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

    await service.logEvent({
      eventType: 'AUTH_LOGIN_SUCCESS',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: null,
        eventType: 'AUTH_LOGIN_SUCCESS',
        severity: AuditSeverity.Low,
        ipAddress: null,
        sessionId: null,
        details: Prisma.JsonNull,
      },
    });
  });

  it('persists provided audit log data', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'log-2' });

    await service.logEvent({
      eventType: 'ACCESS_DENIED',
      severity: AuditSeverity.High,
      userId: 'user-1',
      ipAddress: '127.0.0.1',
      sessionId: 'session-1',
      details: { reason: 'USER_INACTIVE' },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        ipAddress: '127.0.0.1',
        sessionId: 'session-1',
        details: { reason: 'USER_INACTIVE' },
      },
    });
  });
});
