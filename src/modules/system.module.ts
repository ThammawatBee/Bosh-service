import { DynamicModule, Module } from "@nestjs/common";
import { DataSourceOptions } from "typeorm";
import { SystemManagementController } from "../controllers/system.controller";
@Module({
  controllers: [SystemManagementController],
  providers: [],
})
export class SystemManagementModule {
  static register(dbConfig: DataSourceOptions): DynamicModule {
    return {
      module: SystemManagementModule,
      providers: [
        {
          provide: "DB_CONFIG_OPTIONS",
          useValue: dbConfig,
        },
      ],
    };
  }
}
