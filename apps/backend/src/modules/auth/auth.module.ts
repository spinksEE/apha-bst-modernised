import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './auth.jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule, JwtModule.register({}), AuditLogModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
