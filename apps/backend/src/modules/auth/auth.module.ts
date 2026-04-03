import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthController } from './auth.controller';
import { RbacGuard } from './auth.rbac.guard';
import { AuthRbacService } from './auth.rbac.service';
import { JwtStrategy } from './auth.jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule, JwtModule.register({}), AuditLogModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthRbacService, RbacGuard],
  exports: [AuthService, AuthRbacService, RbacGuard],
})
export class AuthModule {}
