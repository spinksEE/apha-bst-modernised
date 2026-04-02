import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  userName: string;
  userLevel: string;
  userLocation: number;
  locationName: string;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): {
    userId: number;
    userName: string;
    userLevel: string;
    userLocation: number;
    locationName: string;
    sessionId: string;
  } {
    return {
      userId: payload.sub,
      userName: payload.userName,
      userLevel: payload.userLevel,
      userLocation: payload.userLocation,
      locationName: payload.locationName,
      sessionId: payload.sessionId,
    };
  }
}
