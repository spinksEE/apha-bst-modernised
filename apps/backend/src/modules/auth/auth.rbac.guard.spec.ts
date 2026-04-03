import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditSeverity } from '@prisma/client';
import { RbacGuard } from './auth.rbac.guard';

describe('RbacGuard', () => {
  let reflector: Reflector;
  let auditLogService: { logEvent: jest.Mock };

  const createContext = (user: any) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          ip: '127.0.0.1',
        }),
      }),
    }) as any;

  beforeEach(() => {
    auditLogService = { logEvent: jest.fn().mockResolvedValue(undefined) };
    reflector = {
      getAllAndOverride: jest.fn((key: string) => {
        if (key === 'rbac_roles') {
          return ['Supervisor', 'ReadOnly'];
        }
        if (key === 'rbac_read_only') {
          return false;
        }
        return undefined;
      }),
    } as any;
  });

  it('allows when no role metadata set', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(undefined);
    const guard = new RbacGuard(reflector, auditLogService as any, {
      isRoleAllowed: jest.fn().mockReturnValue(true),
    } as any);

    await expect(
      guard.canActivate(createContext({ role: 'Supervisor' })),
    ).resolves.toBe(true);
    expect(auditLogService.logEvent).not.toHaveBeenCalled();
  });

  it('blocks when user is missing and logs access denied', async () => {
    const guard = new RbacGuard(reflector, auditLogService as any, {
      isRoleAllowed: jest.fn().mockReturnValue(true),
    } as any);

    await expect(guard.canActivate(createContext(undefined))).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: null,
      }),
    );
  });

  it('blocks when role not allowed and logs access denied', async () => {
    const guard = new RbacGuard(reflector, auditLogService as any, {
      isRoleAllowed: jest.fn().mockImplementation((role: string) => role !== 'DataEntry'),
    } as any);

    await expect(
      guard.canActivate(createContext({ role: 'DataEntry', userId: 'user-1', sessionId: 's1' })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'user-1',
        sessionId: 's1',
      }),
    );
  });

  it('blocks read-only users when not allowed', async () => {
    const guard = new RbacGuard(reflector, auditLogService as any, {
      isRoleAllowed: jest.fn().mockImplementation((role: string) => role !== 'ReadOnly'),
    } as any);

    await expect(
      guard.canActivate(createContext({ role: 'ReadOnly', userId: 'user-2', sessionId: 's2' })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ACCESS_DENIED',
        severity: AuditSeverity.High,
        userId: 'user-2',
        sessionId: 's2',
      }),
    );
  });

  it('allows read-only users when explicitly allowed', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === 'rbac_roles') {
        return ['ReadOnly'];
      }
      if (key === 'rbac_read_only') {
        return true;
      }
      return undefined;
    });

    const guard = new RbacGuard(reflector, auditLogService as any, {
      isRoleAllowed: jest.fn().mockReturnValue(true),
    } as any);

    await expect(
      guard.canActivate(createContext({ role: 'ReadOnly', userId: 'user-3', sessionId: 's3' })),
    ).resolves.toBe(true);
  });
});
