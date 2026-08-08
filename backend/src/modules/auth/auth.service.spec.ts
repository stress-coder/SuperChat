import { Test, type TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import type { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { SALT_ROUNDS } from '../../common/constants/auth.constants';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepo = <T extends object>(): MockRepo<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepo<User>;
  let sessionRepository: MockRepo<Session>;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configService: { get: jest.Mock };

  const baseUser: User = {
    id: 'user-1',
    name: 'Tanvir',
    username: 'tanvir',
    email: 'tanvir@example.com',
    password: 'hashed-password',
    avatar: null as unknown as string,
    isOnline: false,
    lastSeen: new Date('2026-08-01T00:00:00Z'),
    createdAt: new Date('2026-08-01T00:00:00Z'),
  };

  beforeEach(async () => {
    userRepository = createMockRepo<User>();
    sessionRepository = createMockRepo<Session>();
    jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
    configService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Session), useValue: sessionRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'Tanvir',
      username: 'tanvir',
      email: 'tanvir@example.com',
      password: 'plain-password',
    };

    it('creates a user and returns a sanitized (no password) payload', async () => {
      userRepository.findOne!.mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create!.mockReturnValue({
        ...dto,
        password: 'hashed-password',
      });
      userRepository.save!.mockResolvedValue({
        ...baseUser,
        password: 'hashed-password',
      });

      const result = await service.register(dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: dto.email }, { username: dto.username }],
      });
      expect(hash).toHaveBeenCalledWith(dto.password, SALT_ROUNDS);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.data.user).not.toHaveProperty('password');
      expect(result.data.user.email).toBe(dto.email);
      expect(result.message).toBe('Registration successful.');
    });

    it('throws ConflictException when the email is already taken', async () => {
      userRepository.findOne!.mockResolvedValue(baseUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      await expect(service.register(dto)).rejects.toThrow('User already exists.');
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the username is already taken', async () => {
      userRepository.findOne!.mockResolvedValue({
        ...baseUser,
        email: 'other@example.com',
      });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'tanvir@example.com',
      password: 'plain-password',
    };

    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          'jwt.accessSecret': 'access-secret',
          'jwt.accessExpiresIn': '15m',
          'jwt.refreshSecret': 'refresh-secret',
          'jwt.refreshExpiresIn': '7d',
        };
        return map[key];
      });
      jwtService.signAsync.mockResolvedValue('signed-token');
      sessionRepository.create!.mockImplementation((input: Partial<Session>) => input);
      sessionRepository.save!.mockResolvedValue(undefined);
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      userRepository.findOne!.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Invalid credentials.');
      expect(compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password is invalid', async () => {
      userRepository.findOne!.mockResolvedValue(baseUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Invalid credentials.');
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('issues tokens and returns a sanitized user on valid credentials', async () => {
      userRepository.findOne!.mockResolvedValue(baseUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(compare).toHaveBeenCalledWith(dto.password, baseUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(sessionRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Login successful.');
      expect(result.data.accessToken).toBe('signed-token');
      expect(result.data.refreshToken).toBe('signed-token');
      expect(result.data.user).not.toHaveProperty('password');
    });

    it('throws ConflictException when an existing refresh token still maps to an active session', async () => {
      userRepository.findOne!.mockResolvedValue(baseUser);
      (compare as jest.Mock).mockResolvedValue(true);
      jwtService.verifyAsync.mockResolvedValue({
        sub: baseUser.id,
        jti: 'session-1',
      });
      sessionRepository.findOne!.mockResolvedValue({
        id: 'session-1',
        userId: baseUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.login(dto, 'existing-refresh-token')).rejects.toThrow(ConflictException);
      await expect(service.login(dto, 'existing-refresh-token')).rejects.toThrow(
        'You are already logged in.',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('allows login when the existing refresh token maps to a revoked session', async () => {
      userRepository.findOne!.mockResolvedValue(baseUser);
      (compare as jest.Mock).mockResolvedValue(true);
      jwtService.verifyAsync.mockResolvedValue({
        sub: baseUser.id,
        jti: 'session-1',
      });
      sessionRepository.findOne!.mockResolvedValue({
        id: 'session-1',
        userId: baseUser.id,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.login(dto, 'stale-refresh-token');

      expect(result.message).toBe('Login successful.');
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('allows login when the existing refresh token fails verification (different device / no cookie)', async () => {
      userRepository.findOne!.mockResolvedValue(baseUser);
      (compare as jest.Mock).mockResolvedValue(true);
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      const result = await service.login(dto, 'garbage-token');

      expect(result.message).toBe('Login successful.');
      expect(jwtService.signAsync).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const userWithJti = { ...baseUser, jti: 'session-1' };

    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          'jwt.accessSecret': 'access-secret',
          'jwt.accessExpiresIn': '15m',
          'jwt.refreshSecret': 'refresh-secret',
          'jwt.refreshExpiresIn': '7d',
        };
        return map[key];
      });
      jwtService.signAsync.mockResolvedValue('new-signed-token');
      sessionRepository.create!.mockImplementation((input: Partial<Session>) => input);
      sessionRepository.save!.mockResolvedValue(undefined);
      sessionRepository.update!.mockResolvedValue(undefined);
    });

    it('throws UnauthorizedException when the user has no jti', async () => {
      await expect(service.refresh(baseUser)).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh(baseUser)).rejects.toThrow('Invalid refresh token.');
      expect(sessionRepository.findOne).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when no matching session exists', async () => {
      sessionRepository.findOne!.mockResolvedValue(null);

      await expect(service.refresh(userWithJti)).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh(userWithJti)).rejects.toThrow('Invalid or expired session.');
    });

    it('throws UnauthorizedException when the session is revoked', async () => {
      sessionRepository.findOne!.mockResolvedValue({
        id: 'session-1',
        userId: baseUser.id,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.refresh(userWithJti)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the session is expired', async () => {
      sessionRepository.findOne!.mockResolvedValue({
        id: 'session-1',
        userId: baseUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(service.refresh(userWithJti)).rejects.toThrow(UnauthorizedException);
    });

    it('rotates the session and issues new tokens on success', async () => {
      sessionRepository.findOne!.mockResolvedValue({
        id: 'session-1',
        userId: baseUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.refresh(userWithJti);

      expect(sessionRepository.update).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining<Partial<Session>>({
          revokedAt: expect.any(Date) as Date,
        }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(sessionRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Token refreshed successfully.');
      expect(result.data.accessToken).toBe('new-signed-token');
      expect(result.data.refreshToken).toBe('new-signed-token');
    });
  });

  describe('logout', () => {
    it('returns a success message without touching sessions when no refresh token is provided', async () => {
      const result = await service.logout(baseUser, null);

      expect(sessionRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logout successful.', data: null });
    });

    it('revokes the session tied to the provided refresh token', async () => {
      configService.get.mockReturnValue('refresh-secret');
      jwtService.verifyAsync.mockResolvedValue({
        sub: baseUser.id,
        jti: 'session-1',
      });
      sessionRepository.update!.mockResolvedValue(undefined);

      const result = await service.logout(baseUser, 'valid-refresh-token');

      expect(sessionRepository.update).toHaveBeenCalledWith(
        { id: 'session-1', userId: baseUser.id },
        expect.objectContaining<Partial<Session>>({
          revokedAt: expect.any(Date) as Date,
        }),
      );
      expect(result).toEqual({ message: 'Logout successful.', data: null });
    });

    it('does not throw and skips revocation when the refresh token fails verification', async () => {
      configService.get.mockReturnValue('refresh-secret');
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      const result = await service.logout(baseUser, 'garbage-token');

      expect(sessionRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logout successful.', data: null });
    });
  });
});
