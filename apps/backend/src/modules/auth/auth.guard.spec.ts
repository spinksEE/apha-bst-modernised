import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';

describe('JwtAuthGuard', () => {
  it('throws when error provided', () => {
    const guard = new JwtAuthGuard();

    expect(() =>
      guard.handleRequest(new Error('boom'), undefined, undefined, {} as any),
    ).toThrow(UnauthorizedException);
  });

  it('throws when user is missing', () => {
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(null, undefined, undefined, {} as any)).toThrow(
      UnauthorizedException,
    );
  });

  it('returns user when present', () => {
    const guard = new JwtAuthGuard();

    expect(guard.handleRequest(null, { id: 'user-1' }, undefined, {} as any)).toEqual({
      id: 'user-1',
    });
  });
});
