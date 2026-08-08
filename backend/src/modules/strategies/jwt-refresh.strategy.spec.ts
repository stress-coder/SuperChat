import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { User } from '../../entities/user.entity';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let userRepository: { findOneBy: jest.Mock };

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
    userRepository = { findOneBy: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('refresh-secret') },
        },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  it('returns a sanitized user with jti attached when the payload subject exists', async () => {
    userRepository.findOneBy.mockResolvedValue(baseUser);
    const payload: JwtPayload = {
      sub: baseUser.id,
      username: baseUser.username,
      email: baseUser.email,
      jti: 'session-1',
    };

    const result = await strategy.validate(payload);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: baseUser.id });
    expect(result).not.toHaveProperty('password');
    expect(result).toMatchObject({ id: baseUser.id, jti: 'session-1' });
  });

  it('returns null when no matching user exists', async () => {
    userRepository.findOneBy.mockResolvedValue(null);
    const payload: JwtPayload = {
      sub: 'missing-user',
      username: 'ghost',
      email: 'ghost@example.com',
    };

    const result = await strategy.validate(payload);

    expect(result).toBeNull();
  });
});
