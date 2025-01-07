import { join } from "path";

import { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export const postgresDbConfig = (): PostgresConnectionOptions => ({
  type: "postgres",
  host: "dpg-cttu9f3v2p9s738ml6f0-a.singapore-postgres.render.com",
  port: 5432,
  username: "bosch_user",
  password: "hUSfMETjB5wVGVlaiJlawCk49OijL2IY",
  database: "bosch",
  schema: "bosch",
  logging: false,
  entities: [join(__dirname, "../entities/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "../migrations/postgres/*{.ts,.js}")],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
});

if (
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "local"
) {
  Logger.debug(postgresDbConfig());
}

export default new DataSource(postgresDbConfig());
