import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('extends the "jwt" passport AuthGuard', () => {
    const guard = new JwtAuthGuard();

    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  it('throws a 401 with a clear message when no user is present', () => {
    const guard = new JwtAuthGuard();
    const context = {} as ExecutionContext;

    expect(() => guard.handleRequest(null, false, null, context)).toThrow(UnauthorizedException);
    expect(() => guard.handleRequest(null, false, null, context)).toThrow(
      'Authentication required. Please log in.',
    );
  });

  it('throws a 401 when the strategy reports an error', () => {
    const guard = new JwtAuthGuard();
    const context = {} as ExecutionContext;

    expect(() => guard.handleRequest(new Error('bad token'), false, null, context)).toThrow(
      UnauthorizedException,
    );
  });

  it('returns the user when authentication succeeds', () => {
    const guard = new JwtAuthGuard();
    const context = {} as ExecutionContext;
    const user = { id: 'user-1' };

    expect(guard.handleRequest(null, user, null, context)).toBe(user);
  });
});
