import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseIndicator } from '../healthCheck/indicators/database.indicator';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private db: DatabaseIndicator) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([() => this.db.isHealthy()]);
  }
}
