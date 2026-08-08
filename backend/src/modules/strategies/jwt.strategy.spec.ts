import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../entities/user.entity';
import { toSafeUser } from '../../common/utils/sanitize-user.util';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
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
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('access-secret') },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('returns a sanitized user when the payload subject exists', async () => {
    userRepository.findOneBy.mockResolvedValue(baseUser);
    const payload: JwtPayload = {
      sub: baseUser.id,
      username: baseUser.username,
      email: baseUser.email,
    };

    const result = await strategy.validate(payload);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: baseUser.id });
    expect(result).toEqual(toSafeUser(baseUser));
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
