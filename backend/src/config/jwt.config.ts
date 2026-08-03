import { registerAs } from "@nestjs/config";

export const getJwtConfig = () => ({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
});

export const jwtConfig = registerAs('jwt', getJwtConfig);