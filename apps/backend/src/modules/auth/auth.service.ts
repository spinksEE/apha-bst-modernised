import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthAccessResult, AuthenticatedUser } from './auth.types';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid username or password';
const ACCESS_DENIED_MESSAGE = 'Access denied';
const DEFAULT_JWT_EXPIRES_IN = '8h';
const DEFAULT_BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    username: string,
    password: string,
    ipAddress?: string,
  ): Promise<AuthAccessResult> {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        userName: {
          equals: normalizedUsername,
          mode: 'insensitive',
        },
      },
      include: { location: true },
    });

    if (!user) {
      throw new UnauthorizedException({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (!user.isActive) {
      const referenceId = this.generateReferenceId();
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    if (!user.role || !user.locationId) {
      const referenceId = this.generateReferenceId();
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    const sessionId = crypto.randomUUID();
    const payload = {
      sub: user.id,
      name: user.name,
      role: user.role,
      locationId: user.locationId,
      locationName: user.location?.name ?? undefined,
      sessionId,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      issuer: this.configService.get<string>('JWT_ISSUER'),
      audience: this.configService.get<string>('JWT_AUDIENCE'),
      expiresIn:
        this.configService.get<string>('JWT_EXPIRES_IN') ?? DEFAULT_JWT_EXPIRES_IN,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    });

    return {
      accessToken: token,
      userContext: {
        userId: user.id,
        name: user.name,
        role: user.role,
        locationId: user.locationId,
        locationName: user.location?.name ?? undefined,
      },
    };
  }

  async validateUser(payload: AuthenticatedUser): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { location: true },
    });

    if (!user) {
      throw new UnauthorizedException({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (!user.isActive) {
      const referenceId = this.generateReferenceId();
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    if (!user.role || !user.locationId) {
      const referenceId = this.generateReferenceId();
      throw new ForbiddenException({ message: ACCESS_DENIED_MESSAGE, referenceId });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    });

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      locationId: user.locationId,
      locationName: user.location?.name ?? undefined,
      sessionId: payload.sessionId,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const rounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') ??
      DEFAULT_BCRYPT_SALT_ROUNDS;
    return bcrypt.hash(password, rounds);
  }

  private generateReferenceId(): string {
    const now = new Date();
    const date = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
      now.getUTCDate(),
    ).padStart(2, '0')}`;
    const time = `${String(now.getUTCHours()).padStart(2, '0')}${String(
      now.getUTCMinutes(),
    ).padStart(2, '0')}`;
    const suffix = crypto.randomInt(100, 999);
    return `UA-${date}-${time}-${suffix}`;
  }
}
