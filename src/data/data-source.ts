import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/Restaurant';
import { Table } from '../entities/Table';
import { Reservation } from '../entities/Reservation';

import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Restaurant, Table, Reservation],
  migrations: [],
  subscribers: [],
});