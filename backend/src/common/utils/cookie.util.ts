import type { ConfigService } from '@nestjs/config';

const unitMultipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
};

export const parseExpiryToMs = (expiresIn: string): number => {
    const normalized = expiresIn.trim().toLowerCase();
    const match = /^(\d+)(s|m|h|d)?$/.exec(normalized);

    if (!match) {
        throw new Error(`Invalid expiry format: ${expiresIn}`);
    }

    const value = Number(match[1]);
    const unit = match[2] ?? 's';

    return value * (unitMultipliers[unit] ?? 1000);
};

export const getRefreshCookieOptions = (configService: ConfigService,) => {
    const refreshExpiresIn = configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

    return {
        httpOnly: true,
        sameSite: 'strict' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseExpiryToMs(refreshExpiresIn),
    };
};