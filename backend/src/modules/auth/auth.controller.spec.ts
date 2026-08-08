import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { type User } from '../../entities/user.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
  };
  let response: { cookie: jest.Mock; clearCookie: jest.Mock };

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
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    response = { cookie: jest.fn(), clearCookie: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('7d') },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('register delegates to AuthService.register', () => {
    const dto: RegisterDto = {
      name: 'Tanvir',
      username: 'tanvir',
      email: 'tanvir@example.com',
      password: 'plain-password',
    };
    authService.register.mockReturnValue({
      message: 'Registration successful.',
      data: {},
    });

    const result = controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'Registration successful.', data: {} });
  });

  it('login reads the existing refresh cookie, sets a new one, and strips it from the body', async () => {
    const dto: LoginDto = {
      email: 'tanvir@example.com',
      password: 'plain-password',
    };
    const req = {
      cookies: { refreshToken: 'existing-cookie' },
    } as unknown as Request;
    authService.login.mockResolvedValue({
      message: 'Login successful.',
      data: { accessToken: 'access', refreshToken: 'refresh', user: baseUser },
    });

    const result = await controller.login(dto, req, response as unknown as Response);

    expect(authService.login).toHaveBeenCalledWith(dto, 'existing-cookie');
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result.data).not.toHaveProperty('refreshToken');
    expect(result.data.accessToken).toBe('access');
  });

  it('login passes null when no refresh cookie is present', async () => {
    const dto: LoginDto = {
      email: 'tanvir@example.com',
      password: 'plain-password',
    };
    const req = { cookies: {} } as unknown as Request;
    authService.login.mockResolvedValue({
      message: 'Login successful.',
      data: { accessToken: 'access', refreshToken: 'refresh', user: baseUser },
    });

    await controller.login(dto, req, response as unknown as Response);

    expect(authService.login).toHaveBeenCalledWith(dto, null);
  });

  it('refresh sets a rotated cookie and strips the refresh token from the body', async () => {
    const req = {
      user: { ...baseUser, jti: 'session-1' },
    } as unknown as Request & {
      user: User & { jti?: string };
    };
    authService.refresh.mockResolvedValue({
      message: 'Token refreshed successfully.',
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });

    const result = await controller.refresh(req, response as unknown as Response);

    expect(authService.refresh).toHaveBeenCalledWith(req.user);
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result.data).not.toHaveProperty('refreshToken');
  });

  it('logout reads the cookie, clears it, and returns the service result', async () => {
    const req = {
      user: baseUser,
      cookies: { refreshToken: 'cookie-token' },
    } as unknown as Request & {
      user: User;
    };
    authService.logout.mockResolvedValue({
      message: 'Logout successful.',
      data: null,
    });

    const result = await controller.logout(req, response as unknown as Response);

    expect(authService.logout).toHaveBeenCalledWith(baseUser, 'cookie-token');
    expect(response.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result).toEqual({ message: 'Logout successful.', data: null });
  });

  it('me returns the authenticated user from the request', () => {
    const req = { user: baseUser } as unknown as Request & { user: User };

    const result = controller.me(req);

    expect(result).toEqual({
      message: 'Current user retrieved successfully.',
      data: baseUser,
    });
  });
});
