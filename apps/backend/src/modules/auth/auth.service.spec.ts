import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuditEventType, UserLevel } from '@prisma/client';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuditService } from '../audit/audit.service';

const mockUser = {
  id: 1,
  userName: 'admin.supervisor',
  locationId: 1,
  userLevel: UserLevel.Supervisor,
  location: { id: 1, locationName: 'Preston Laboratory', isAHVLA: false },
};

describe('AuthService', () => {
  let service: AuthService;
  let configService: { getOrThrow: jest.Mock; get: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let userService: { findByUserName: jest.Mock };
  let auditService: { log: jest.Mock };

  beforeEach(async () => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('test-password'),
      get: jest.fn().mockReturnValue('8h'),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt-token') };
    userService = { findByUserName: jest.fn() };
    auditService = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configService },
        { provide: JwtService, useValue: jwtService },
        { provide: UserService, useValue: userService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateStaticCredential', () => {
    it('returns true for matching password', () => {
      expect(service.validateStaticCredential('test-password')).toBe(true);
    });

    it('returns false for wrong password', () => {
      expect(service.validateStaticCredential('wrong')).toBe(false);
    });
  });

  describe('login', () => {
    it('returns token and user on valid login', async () => {
      userService.findByUserName.mockResolvedValue(mockUser);

      const result = await service.login(
        { username: 'admin.supervisor', password: 'test-password' },
        '127.0.0.1',
      );

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user.userId).toBe(1);
      expect(result.user.userName).toBe('admin.supervisor');
      expect(result.user.userLevel).toBe(UserLevel.Supervisor);
      expect(result.user.userLocation).toBe(1);
      expect(result.user.locationName).toBe('Preston Laboratory');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          userName: 'admin.supervisor',
          userLevel: UserLevel.Supervisor,
          userLocation: 1,
          locationName: 'Preston Laboratory',
          sessionId: expect.any(String),
        }),
      );

      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          eventType: AuditEventType.Login,
          ipAddress: '127.0.0.1',
          sessionId: expect.any(String),
        }),
      );
    });

    it('throws UnauthorizedException and logs LoginFailed for wrong password', async () => {
      await expect(
        service.login({ username: 'admin.supervisor', password: 'wrong' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.LoginFailed,
          ipAddress: '127.0.0.1',
        }),
      );

      expect(userService.findByUserName).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException and logs AccessDenied for unknown user', async () => {
      userService.findByUserName.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'test-password' }, '127.0.0.1'),
      ).rejects.toThrow(ForbiddenException);

      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.AccessDenied,
          details: expect.stringContaining('nonexistent'),
          ipAddress: '127.0.0.1',
        }),
      );
    });
  });
});
