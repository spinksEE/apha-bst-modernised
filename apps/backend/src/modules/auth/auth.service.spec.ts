import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditSeverity } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService audit logging', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };
  let auditLogService: { logEvent: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token') };
    auditLogService = { logEvent: jest.fn().mockResolvedValue(undefined) };

    service = new AuthService(
      prisma as any,
      new ConfigService({
        JWT_SECRET: 'secret',
        JWT_ISSUER: 'issuer',
        JWT_AUDIENCE: 'audience',
      }),
      jwtService as any,
      auditLogService as any,
    );
  });

  it('logs login failure when user is missing', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.login('ghost', 'password', '127.0.0.1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'AUTH_LOGIN_FAILURE',
        ipAddress: '127.0.0.1',
      }),
    );
  });

  it('logs login failure when password is invalid', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      userName: 'user',
      passwordHash: 'hash',
      isActive: true,
      role: 'Supervisor',
      locationId: 'loc-1',
      name: 'Test User',
      location: { name: 'Test Location' },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login('user', 'password', '127.0.0.1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'AUTH_LOGIN_FAILURE',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
      }),
    );
  });

  it('logs access denied when user is inactive', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      userName: 'user',
      passwordHash: 'hash',
      isActive: false,
      role: 'Supervisor',
      locationId: 'loc-1',
      name: 'Test User',
      location: { name: 'Test Location' },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.login('user', 'password', '127.0.0.1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'user-1',
      }),
    );
  });

  it('logs access denied when user is missing role or location during login', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-5',
      userName: 'user',
      passwordHash: 'hash',
      isActive: true,
      role: null,
      locationId: null,
      name: 'Test User',
      location: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.login('user', 'password', '127.0.0.1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'user-5',
      }),
    );
  });

  it('logs successful login', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      userName: 'user',
      passwordHash: 'hash',
      isActive: true,
      role: 'Supervisor',
      locationId: 'loc-1',
      name: 'Test User',
      location: { name: 'Test Location' },
    });
    prisma.user.update.mockResolvedValue({ id: 'user-1' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await service.login('user', 'password', '127.0.0.1');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { lastActivityAt: expect.any(Date) },
    });
    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'AUTH_LOGIN_SUCCESS',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
      }),
    );
  });

  it('updates last activity and returns user context on session validation', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      isActive: true,
      role: 'DataEntry',
      locationId: 'loc-2',
      name: 'Session User',
      location: { name: 'Session Location' },
    });

    const result = await service.validateUser({
      userId: 'user-2',
      name: 'Session User',
      role: 'DataEntry',
      locationId: 'loc-2',
      sessionId: 'session-2',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { lastActivityAt: expect.any(Date) },
    });
    expect(result).toEqual({
      userId: 'user-2',
      name: 'Session User',
      role: 'DataEntry',
      locationId: 'loc-2',
      locationName: 'Session Location',
      sessionId: 'session-2',
    });
  });

  it('logs access denied when session user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.validateUser({
        userId: 'missing-user',
        name: 'Missing',
        role: 'Supervisor',
        locationId: 'loc-3',
        sessionId: 'session-3',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'missing-user',
        sessionId: 'session-3',
      }),
    );
  });

  it('logs access denied when session user is inactive', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-3',
      isActive: false,
      role: 'Supervisor',
      locationId: 'loc-3',
      name: 'Inactive User',
      location: { name: 'Inactive Location' },
    });

    await expect(
      service.validateUser({
        userId: 'user-3',
        name: 'Inactive User',
        role: 'Supervisor',
        locationId: 'loc-3',
        sessionId: 'session-3',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'user-3',
        sessionId: 'session-3',
      }),
    );
  });

  it('logs access denied when session user is missing role or location', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-4',
      isActive: true,
      role: null,
      locationId: null,
      name: 'Missing Role',
      location: null,
    });

    await expect(
      service.validateUser({
        userId: 'user-4',
        name: 'Missing Role',
        role: 'Supervisor',
        locationId: 'loc-4',
        sessionId: 'session-4',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'user-4',
        sessionId: 'session-4',
      }),
    );
  });

  it('logs logout event', async () => {
    await service.logout(
      {
        userId: 'user-1',
        name: 'Test User',
        role: 'Supervisor',
        locationId: 'loc-1',
        locationName: 'Test Location',
        sessionId: 'session-1',
      },
      '127.0.0.1',
    );

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'AUTH_LOGOUT',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        sessionId: 'session-1',
      }),
    );
  });
});
