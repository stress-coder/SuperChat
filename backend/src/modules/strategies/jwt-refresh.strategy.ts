import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import type { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { REFRESH_COOKIE_NAME } from '../../common/constants/auth.constants';
import { toSafeUser } from '../../common/utils/sanitize-user.util';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: (req: Request) =>
                req?.cookies?.[REFRESH_COOKIE_NAME] ?? null,
            ignoreExpiration: false,
            passReqToCallback: true,
            secretOrKey: configService.get<string>('jwt.refreshSecret') ?? '',
        });
    }

    async validate(req: Request, payload: JwtPayload) {
        const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] ?? null;
        const user = await this.userRepository.findOneBy({ id: payload.sub });

        if (!user) {
            return null;
        }

        return {
            ...toSafeUser(user),
            refreshToken: rawToken,
        };
    }
}