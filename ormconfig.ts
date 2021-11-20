module.exports = {
  type: 'postgres',
  host: process.env.HOST,
  port: process.env.PG_PORT,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database:
    process.env.NODE_ENV === 'test'
      ? process.env.PG_DATABASE_NAME_TEST
      : process.env.PG_DATABASE_NAME,
  // entities: [User, Product],
  entities: ['dist/**/*.entity{.ts,.js}'],
  // synchronize: true,
  migrationsTableName: 'db_migrations',
  migrations: ['migration/*.js'],
  // logging: true,
  cli: {
    migrationsDir: 'migration',
  },
};
