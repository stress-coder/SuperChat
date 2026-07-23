import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import type { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { SALT_ROUNDS } from '../../common/constants/auth.constants';
import { toSafeUser } from '../../common/utils/sanitize-user.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

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

    async login(dto: LoginDto) {
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

    async refresh(user: User) {
        const storedRefreshToken = null; // This should be retrieved from the request or a secure storage mechanism

        if (!storedRefreshToken) {
            throw new UnauthorizedException('Refresh token is missing.');
        }

        const rawRefreshToken = user.refreshToken;

        if (!rawRefreshToken) {
            throw new UnauthorizedException('Invalid refresh token.');
        }

        const isValid = await compare(rawRefreshToken, storedRefreshToken);

        if (!isValid) {
            await this.userRepository.update(user.id, { refreshToken: null });
            throw new UnauthorizedException('Invalid refresh token.');
        }

        const tokens = await this.issueTokens(user);

        return {
            message: 'Token refreshed successfully.',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    async logout(user: User) {
        await this.userRepository.update(user.id, { refreshToken: null });

        return {
            message: 'Logout successful.',
            data: null,
        };
    }

    private async issueTokens(user: User) {
        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };

        const accessSecret =
            this.configService.get<string>('jwt.accessSecret') ?? '';
        const accessExpiresIn =
            this.configService.get<string>('jwt.accessExpiresIn') ?? '15m';

        const refreshSecret =
            this.configService.get<string>('jwt.refreshSecret') ?? '';
        const refreshExpiresIn =
            this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessSecret,
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn,
            }),
        ]);

        const hashedRefreshToken = await hash(refreshToken, SALT_ROUNDS);

        await this.userRepository.update(user.id, {
            refreshToken: hashedRefreshToken,
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}