import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { getRefreshCookieOptions } from '../../common/utils/cookie.util';
import { REFRESH_COOKIE_NAME } from '../../common/constants/auth.constants';
import { User } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const existingRefreshToken: string | null =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ?? null;
    const result = await this.authService.login(dto, existingRefreshToken);

    response.cookie(
      REFRESH_COOKIE_NAME,
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
    @Req() req: Request & { user: User & { jti?: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(req.user);

    response.cookie(
      REFRESH_COOKIE_NAME,
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
    const refreshToken: string | null =
      (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ?? null;
    const result = await this.authService.logout(req.user, refreshToken);

    response.clearCookie(REFRESH_COOKIE_NAME, {
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
