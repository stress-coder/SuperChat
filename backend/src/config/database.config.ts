import { registerAs } from '@nestjs/config';
import { join } from 'path';
import type { DataSourceOptions } from 'typeorm';
import { PluralNamingStrategy } from '../common/strategies/plural-naming.strategy';

export const getDatabaseConfig = (): DataSourceOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../entities/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: false,
  namingStrategy: new PluralNamingStrategy(),
});

export const databaseConfig = registerAs('database', getDatabaseConfig);
