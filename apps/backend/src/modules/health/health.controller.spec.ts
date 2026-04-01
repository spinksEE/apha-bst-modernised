import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthResponseDto } from './health.dto';

describe('HealthController', () => {
  let controller: HealthController;
  let service: { check: jest.Mock };
  let mockResponse: { status: jest.Mock; json: jest.Mock };

  beforeEach(async () => {
    service = { check: jest.fn() };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: service }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns 200 with ok body when healthy', async () => {
    const healthy: HealthResponseDto = {
      status: 'ok',
      database: 'connected',
      uptime: 42,
    };
    service.check.mockResolvedValue(healthy);

    await controller.check(mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(healthy);
  });

  it('returns 503 with error body when unhealthy', async () => {
    const unhealthy: HealthResponseDto = {
      status: 'error',
      database: 'disconnected',
      uptime: 42,
    };
    service.check.mockResolvedValue(unhealthy);

    await controller.check(mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith(unhealthy);
  });
});
