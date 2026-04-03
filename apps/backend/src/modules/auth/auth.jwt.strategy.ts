import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUser } from './auth.types';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER'),
      audience: configService.get<string>('JWT_AUDIENCE'),
    });
  }

  async validate(payload: {
    sub: string;
    name: string;
    role: string;
    locationId: string;
    locationName?: string;
    sessionId: string;
  }): Promise<AuthenticatedUser> {
    return this.authService.validateUser({
      userId: payload.sub,
      name: payload.name,
      role: payload.role as AuthenticatedUser['role'],
      locationId: payload.locationId,
      locationName: payload.locationName,
      sessionId: payload.sessionId,
    });
  }
}
