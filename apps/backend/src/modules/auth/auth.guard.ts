import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, type IAuthGuard } from '@nestjs/passport';
import type { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends (AuthGuard('jwt') as { new (): IAuthGuard }) {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
