import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshGuard } from './jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
  it('extends the "jwt-refresh" passport AuthGuard', () => {
    const guard = new JwtRefreshGuard();

    expect(guard).toBeInstanceOf(AuthGuard('jwt-refresh'));
  });
});
