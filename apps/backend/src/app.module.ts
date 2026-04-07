import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { SiteModule } from './modules/site/site.module';
import { PersonModule } from './modules/person/person.module';
import { TrainerModule } from './modules/trainer/trainer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    SiteModule,
    PersonModule,
    TrainerModule,
  ],
})
export class AppModule {}
