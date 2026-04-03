import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const buildRequest = (ip?: string) => ({ ip }) as any;

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; logout: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates login with credentials and ip', async () => {
    authService.login.mockResolvedValue({ accessToken: 'token', userContext: {} });

    await controller.login({ username: 'user', password: 'pass' }, buildRequest('1.2.3.4'));

    expect(authService.login).toHaveBeenCalledWith('user', 'pass', '1.2.3.4');
  });

  it('delegates logout with user and ip', async () => {
    authService.logout.mockResolvedValue(undefined);

    await controller.logout(
      {
        userId: 'user-1',
        name: 'Test User',
        role: 'Supervisor',
        locationId: 'loc-1',
        locationName: 'Location',
        sessionId: 'session-1',
      },
      buildRequest('5.6.7.8'),
    );

    expect(authService.logout).toHaveBeenCalledWith(
      {
        userId: 'user-1',
        name: 'Test User',
        role: 'Supervisor',
        locationId: 'loc-1',
        locationName: 'Location',
        sessionId: 'session-1',
      },
      '5.6.7.8',
    );
  });

  it('returns session user context', async () => {
    const result = await controller.session({
      userId: 'user-2',
      name: 'Session User',
      role: 'DataEntry',
      locationId: 'loc-2',
      locationName: 'Session Location',
      sessionId: 'session-2',
    });

    expect(result).toEqual({
      userContext: {
        userId: 'user-2',
        name: 'Session User',
        role: 'DataEntry',
        locationId: 'loc-2',
        locationName: 'Session Location',
      },
    });
  });
});
