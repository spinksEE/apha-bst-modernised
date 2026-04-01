import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthResponseDto } from './health.dto';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponseDto> {
    const uptime = process.uptime();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected', uptime };
    } catch {
      return { status: 'error', database: 'disconnected', uptime };
    }
  }
}
