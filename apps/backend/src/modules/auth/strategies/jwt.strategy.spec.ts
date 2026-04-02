import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return user object mapping sub to userId', () => {
      const payload: JwtPayload = {
        sub: 1,
        userName: 'admin.supervisor',
        userLevel: 'Supervisor',
        userLocation: 1,
        locationName: 'Preston Laboratory',
        sessionId: 'session-123',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 1,
        userName: 'admin.supervisor',
        userLevel: 'Supervisor',
        userLocation: 1,
        locationName: 'Preston Laboratory',
        sessionId: 'session-123',
      });
    });

    it('should map sub field to userId', () => {
      const payload: JwtPayload = {
        sub: 42,
        userName: 'data.entry',
        userLevel: 'DataEntry',
        userLocation: 2,
        locationName: 'Weybridge',
        sessionId: 'session-456',
      };

      const result = strategy.validate(payload);

      expect(result.userId).toBe(42);
      expect(result).not.toHaveProperty('sub');
    });

    it('should pass through all payload fields', () => {
      const payload: JwtPayload = {
        sub: 3,
        userName: 'read.only',
        userLevel: 'ReadOnly',
        userLocation: 3,
        locationName: 'Carmarthen',
        sessionId: 'session-789',
      };

      const result = strategy.validate(payload);

      expect(result.userName).toBe(payload.userName);
      expect(result.userLevel).toBe(payload.userLevel);
      expect(result.userLocation).toBe(payload.userLocation);
      expect(result.locationName).toBe(payload.locationName);
      expect(result.sessionId).toBe(payload.sessionId);
    });
  });
});
