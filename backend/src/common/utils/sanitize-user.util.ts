export const toSafeUser = <T extends { password?: unknown; hashedRefreshToken?: unknown },>
    (
        user: T,

    ): Omit<T, 'password' | 'hashedRefreshToken'> => {
    const { password, hashedRefreshToken, ...safeUser } = user;
    return safeUser;
};