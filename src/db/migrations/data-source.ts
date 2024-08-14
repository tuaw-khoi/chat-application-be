import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5434,
  username: 'root',
  password: 'password',
  database: 'postgres',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
});
