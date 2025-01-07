import { Controller, Inject, Post } from "@nestjs/common";
import { postgresDbConfig } from "src/configs/postgres.database.config";
import { DataSource, DataSourceOptions } from "typeorm";
@Controller()
export class SystemManagementController {
  constructor(
    @Inject("DB_CONFIG_OPTIONS")
    private dbConfig: DataSourceOptions
  ) {}

  async getOrm(): Promise<DataSource> {
    const orm = new DataSource(postgresDbConfig());
    return orm.initialize();
  }

  @Post("/system/migrate-up")
  async migrateUp() {
    const orm = await this.getOrm();
    if (!orm.isInitialized) {
      this.__errorHandle();
    }
    const res = await orm.runMigrations();
    await orm.destroy();
    return {
      message: `success ${res.length} records has been migrated up`,
      records: res.map((o) => ({ file: o.name })),
    };
  }

  @Post("/system/migrate-down")
  async migrateDown() {
    const orm = await this.getOrm();
    if (!orm.isInitialized) {
      this.__errorHandle();
    }
    await orm.undoLastMigration();
    await orm.destroy();
    return {
      message: "success migrated down",
    };
  }

  private __errorHandle() {
    throw new Error("orm not initialized");
  }
}
