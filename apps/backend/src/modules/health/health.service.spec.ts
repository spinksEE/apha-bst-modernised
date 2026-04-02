import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('returns ok status when database is reachable', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(typeof result.uptime).toBe('number');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('returns error status when database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    const result = await service.check();

    expect(result.status).toBe('error');
    expect(result.database).toBe('disconnected');
    expect(typeof result.uptime).toBe('number');
  });

  it('never throws an unhandled exception', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('unexpected failure'));

    await expect(service.check()).resolves.toBeDefined();
  });
});
