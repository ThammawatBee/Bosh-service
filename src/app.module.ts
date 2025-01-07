import { Logger, Module, OnApplicationShutdown } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "./configs";
import { postgresDbConfig } from "./configs/postgres.database.config";
import { AppController } from "./controllers/app.controller";
import { HealthCheckModule } from "./modules/healthCheck.module";
import { SystemManagementModule } from "./modules/system.module";
import { AppService } from "./services/app.service";
import { Equipment } from "./entities/equipment.entity";
import { ZodValidationPipe } from "nestjs-zod";
import { APP_PIPE } from "@nestjs/core";
import { EquipmentReport } from "./entities/report.entity";
import { ScheduleModule } from "@nestjs/schedule";
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("postgres"),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Equipment, EquipmentReport]),
    HealthCheckModule.register(postgresDbConfig()),
    SystemManagementModule.register(postgresDbConfig()),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class ApplicationModule implements OnApplicationShutdown {
  private readonly logger = new Logger(ApplicationModule.name);
  onApplicationShutdown(signal: string) {
    this.logger.log(signal);
  }
}
