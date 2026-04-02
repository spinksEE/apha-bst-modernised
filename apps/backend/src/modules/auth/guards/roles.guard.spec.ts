import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditEventType, UserLevel } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import { AuditService } from '../../audit/audit.service';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockAuditService = {
    log: jest.fn().mockResolvedValue(undefined),
  };

  const createMockContext = (user?: Record<string, unknown>): ExecutionContext => {
    const request = {
      user,
      ip: '127.0.0.1',
    };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ userLevel: UserLevel.ReadOnly });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });

  it('should allow access when empty roles array is set', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createMockContext({ userLevel: UserLevel.ReadOnly });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has a required role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserLevel.Supervisor]);
    const context = createMockContext({
      userId: 1,
      userLevel: UserLevel.Supervisor,
      sessionId: 'session-123',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });

  it('should allow access when user has one of multiple required roles', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      UserLevel.Supervisor,
      UserLevel.DataEntry,
    ]);
    const context = createMockContext({
      userId: 2,
      userLevel: UserLevel.DataEntry,
      sessionId: 'session-456',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access and log audit event when user lacks required role', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserLevel.Supervisor]);
    const context = createMockContext({
      userId: 3,
      userLevel: UserLevel.ReadOnly,
      sessionId: 'session-789',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('Insufficient role permissions');

    expect(mockAuditService.log).toHaveBeenCalledWith({
      userId: 3,
      eventType: AuditEventType.AccessDenied,
      details: expect.stringContaining('Supervisor'),
      ipAddress: '127.0.0.1',
      sessionId: 'session-789',
    });
  });

  it('should include user role in audit log details', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserLevel.Supervisor]);
    const context = createMockContext({
      userId: 2,
      userLevel: UserLevel.DataEntry,
      sessionId: 'session-456',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.stringContaining('DataEntry'),
      }),
    );
  });

  it('should handle missing user gracefully and log with none', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserLevel.Supervisor]);
    const context = createMockContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: undefined,
        details: expect.stringContaining('none'),
      }),
    );
  });
});
