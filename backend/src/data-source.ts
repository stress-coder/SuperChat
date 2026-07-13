import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './config/database.config';

config({ path: join(__dirname, '../../.env') });

const AppDataSource = new DataSource(getDatabaseConfig());

export default AppDataSource;
