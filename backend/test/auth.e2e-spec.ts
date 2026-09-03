import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { type App } from 'supertest/types';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../src/modules/strategies/jwt-refresh.strategy';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { User } from '../src/entities/user.entity';

describe('JwtAuthGuard on GET /auth/me (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({})],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        { provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } },
        JwtStrategy,
        JwtRefreshStrategy,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 with the standard error format when no token is provided', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({
          statusCode: 401,
          message: 'Authentication required. Please log in.',
          error: 'Unauthorized',
        });
      });
  });

  it('returns 401 when an invalid token is provided', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
  });
});
