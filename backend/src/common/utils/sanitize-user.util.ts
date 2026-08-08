export type SafeUser<T extends { password?: unknown }> = Omit<T, 'password'>;

export const toSafeUser = <T extends { password?: unknown }>(user: T): SafeUser<T> => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};
