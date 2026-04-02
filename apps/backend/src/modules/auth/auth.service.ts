import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditEventType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { AuditService } from '../audit/audit.service';
import { type LoginResponse, UserRole } from '@apha-bst/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

  validateStaticCredential(password: string): boolean {
    const adminPassword = this.configService.getOrThrow<string>('ADMIN_PASSWORD');
    return password === adminPassword;
  }

  async login(loginDto: LoginDto, ipAddress: string): Promise<LoginResponse> {
    if (!this.validateStaticCredential(loginDto.password)) {
      await this.auditService.log({
        eventType: AuditEventType.LoginFailed,
        details: `Failed login attempt for username: ${loginDto.username}`,
        ipAddress,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userService.findByUserName(loginDto.username);

    if (!user) {
      await this.auditService.log({
        eventType: AuditEventType.AccessDenied,
        details: `User not found in BST database: ${loginDto.username}`,
        ipAddress,
      });
      throw new ForbiddenException('User not found in BST system');
    }

    const sessionId = randomUUID();

    const payload = {
      sub: user.id,
      userName: user.userName,
      userLevel: user.userLevel,
      userLocation: user.locationId,
      locationName: user.location.locationName,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload);

    await this.auditService.log({
      userId: user.id,
      eventType: AuditEventType.Login,
      details: `User logged in: ${user.userName}`,
      ipAddress,
      sessionId,
    });

    return {
      accessToken,
      user: {
        userId: user.id,
        userName: user.userName,
        userLevel: user.userLevel as unknown as UserRole,
        userLocation: user.locationId,
        locationName: user.location.locationName,
      },
    };
  }
}
