import type { ConfigService } from '@nestjs/config';
import ms from 'ms';
import type { StringValue } from 'ms';

export const parseExpiryToMs = (expiresIn: StringValue): number => {
  const parsed = ms(expiresIn);

  if (typeof parsed !== 'number' || Number.isNaN(parsed)) {
    throw new Error(`Invalid expiry format: ${expiresIn}`);
  }

  return parsed;
};

export const getRefreshCookieOptions = (configService: ConfigService) => {
  const refreshExpiresIn = configService.get<StringValue>('jwt.refreshExpiresIn') ?? '7d';

  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseExpiryToMs(refreshExpiresIn),
  };
};
