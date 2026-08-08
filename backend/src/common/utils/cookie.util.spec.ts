import type { ConfigService } from '@nestjs/config';
import { getRefreshCookieOptions, parseExpiryToMs } from './cookie.util';

describe('parseExpiryToMs', () => {
  it('converts a valid ms-style duration string to milliseconds', () => {
    expect(parseExpiryToMs('15m')).toBe(15 * 60 * 1000);
    expect(parseExpiryToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('throws for an unparseable duration string', () => {
    // @ts-expect-error - intentionally invalid input to exercise the error path
    expect(() => parseExpiryToMs('not-a-duration')).toThrow(
      'Invalid expiry format: not-a-duration',
    );
  });
});

describe('getRefreshCookieOptions', () => {
  it('builds cookie options from the configured refresh expiry', () => {
    const getMock = jest.fn().mockReturnValue('7d');
    const configService = { get: getMock } as unknown as ConfigService;

    const options = getRefreshCookieOptions(configService);

    expect(getMock).toHaveBeenCalledWith('jwt.refreshExpiresIn');
    expect(options).toEqual({
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('defaults to a 7d expiry when none is configured', () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const options = getRefreshCookieOptions(configService);

    expect(options.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
