import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { getRefreshCookieOptions } from '../../common/utils/cookie.util';
import { User } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(dto);

        response.cookie(
            'refreshToken',
            result.data.refreshToken,
            getRefreshCookieOptions(this.configService),
        );

        return {
            message: result.message,
            data: {
                accessToken: result.data.accessToken,
                user: result.data.user,
            },
        };
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    async refresh(
        @Req() req: Request & { user: User },
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.refresh(req.user);

        response.cookie(
            'refreshToken',
            result.data.refreshToken,
            getRefreshCookieOptions(this.configService),
        );

        return {
            message: result.message,
            data: {
                accessToken: result.data.accessToken,
            },
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @Req() req: Request & { user: User },
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.logout(req.user);

        response.clearCookie('refreshToken', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        return result;
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: Request & { user: User }) {
        return {
            message: 'Current user retrieved successfully.',
            data: req.user,
        };
    }
}