import 'reflect-metadata';

// Optional TypeORM runtime wiring for migration tooling.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const req = Function('return require')() as (name: string) => unknown;
const typeorm = req('typeorm') as {
  DataSource: new (options: Record<string, unknown>) => unknown;
};

const migrationsGlob = process.env.NODE_ENV === 'production'
  ? 'dist/database/migrations/*{.js,.ts}'
  : 'src/database/migrations/*{.js,.ts}';

export const AppDataSource = new typeorm.DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/modules/**/*.entity.{ts,js}'],
  migrations: [migrationsGlob],
  synchronize: false,
  logging: false,
});
