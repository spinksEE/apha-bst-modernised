import { Test, TestingModule } from '@nestjs/testing';
import { AuditEventType } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';
import type { UserRole } from '@apha-bst/shared';

const mockLoginResponse = {
  accessToken: 'jwt-token',
  user: {
    userId: 1,
    userName: 'admin.supervisor',
    userLevel: 'Supervisor' as UserRole,
    userLocation: 1,
    locationName: 'Preston Laboratory',
  },
};

const mockAuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: 'Supervisor' as UserRole,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'session-123',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };
  let auditService: { log: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };
    auditService = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/login', () => {
    it('calls authService.login with DTO and IP address', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);
      const mockReq = { ip: '127.0.0.1' } as any;

      const result = await controller.login(
        { username: 'admin.supervisor', password: 'test' },
        mockReq,
      );

      expect(authService.login).toHaveBeenCalledWith(
        { username: 'admin.supervisor', password: 'test' },
        '127.0.0.1',
      );
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current authenticated user', () => {
      const result = controller.me(mockAuthenticatedUser);
      expect(result).toEqual(mockAuthenticatedUser);
    });
  });

  describe('POST /auth/logout', () => {
    it('logs audit event and returns success message', async () => {
      const mockReq = { ip: '127.0.0.1' } as any;

      const result = await controller.logout(mockAuthenticatedUser, mockReq);

      expect(auditService.log).toHaveBeenCalledWith({
        userId: 1,
        eventType: AuditEventType.Logout,
        details: 'User logged out: admin.supervisor',
        ipAddress: '127.0.0.1',
        sessionId: 'session-123',
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
