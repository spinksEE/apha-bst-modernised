import { Test, TestingModule } from '@nestjs/testing';
import { AuditEventType } from '@prisma/client';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: { auditLog: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = { auditLog: { create: jest.fn().mockResolvedValue({ id: 1 }) } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('creates an audit log entry with all fields', async () => {
    await service.log({
      userId: 1,
      eventType: AuditEventType.Login,
      details: 'User logged in',
      ipAddress: '127.0.0.1',
      sessionId: 'session-123',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        eventType: AuditEventType.Login,
        details: 'User logged in',
        ipAddress: '127.0.0.1',
        sessionId: 'session-123',
      },
    });
  });

  it('sets userId to null when not provided', async () => {
    await service.log({
      eventType: AuditEventType.LoginFailed,
      details: 'Invalid credentials',
      ipAddress: '192.168.1.1',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: null,
        eventType: AuditEventType.LoginFailed,
        details: 'Invalid credentials',
        ipAddress: '192.168.1.1',
        sessionId: null,
      },
    });
  });

  it('sets sessionId to null when not provided', async () => {
    await service.log({
      userId: 2,
      eventType: AuditEventType.AccessDenied,
      details: 'Access denied',
      ipAddress: '10.0.0.1',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 2,
        eventType: AuditEventType.AccessDenied,
        details: 'Access denied',
        ipAddress: '10.0.0.1',
        sessionId: null,
      },
    });
  });
});
