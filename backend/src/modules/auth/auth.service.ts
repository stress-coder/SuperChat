import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import type { Repository } from 'typeorm';
import type { StringValue } from 'ms';
import { User } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { SALT_ROUNDS } from '../../common/constants/auth.constants';
import { toSafeUser } from '../../common/utils/sanitize-user.util';
import { parseExpiryToMs } from '../../common/utils/cookie.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const passwordHash = await hash(dto.password, SALT_ROUNDS);

    const user = this.userRepository.create({
      name: dto.name,
      username: dto.username,
      email: dto.email,
      password: passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: 'Registration successful.',
      data: {
        user: toSafeUser(savedUser),
      },
    };
  }

  async login(dto: LoginDto, existingRefreshToken?: string | null) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (existingRefreshToken) {
      const activeSession = await this.findActiveSessionForToken(existingRefreshToken, user.id);

      if (activeSession) {
        throw new ConflictException('You are already logged in.');
      }
    }

    const tokens = await this.issueTokens(user);

    return {
      message: 'Login successful.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: toSafeUser(user),
      },
    };
  }

  async refresh(user: User & { jti?: string }) {
    if (!user.jti) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const session = await this.sessionRepository.findOne({
      where: { id: user.jti, userId: user.id },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session.');
    }

    await this.sessionRepository.update(session.id, {
      revokedAt: new Date(),
    });

    const tokens = await this.issueTokens(user);

    return {
      message: 'Token refreshed successfully.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async logout(user: User, refreshToken?: string | null) {
    if (refreshToken) {
      const payload = await this.decodeRefreshToken(refreshToken);

      if (payload?.jti) {
        await this.sessionRepository.update(
          { id: payload.jti, userId: user.id },
          { revokedAt: new Date() },
        );
      }
    }

    return {
      message: 'Logout successful.',
      data: null,
    };
  }

  private async decodeRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.refreshSecret') ?? '',
      });
    } catch {
      return null;
    }
  }

  private async findActiveSessionForToken(token: string, userId: string) {
    const payload = await this.decodeRefreshToken(token);

    if (!payload?.jti || payload.sub !== userId) {
      return null;
    }

    const session = await this.sessionRepository.findOne({
      where: { id: payload.jti, userId },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    return session;
  }

  private async issueTokens(user: User) {
    const jti = randomUUID();

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessSecret = this.configService.get<string>('jwt.accessSecret') ?? '';
    const accessExpiresIn = this.configService.get<StringValue>('jwt.accessExpiresIn') ?? '15m';

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') ?? '';
    const refreshExpiresIn = this.configService.get<StringValue>('jwt.refreshExpiresIn') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(
        { ...payload, jti },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    const session = this.sessionRepository.create({
      id: jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + parseExpiryToMs(refreshExpiresIn)),
    });
    await this.sessionRepository.save(session);

    return {
      accessToken,
      refreshToken,
    };
  }
}
