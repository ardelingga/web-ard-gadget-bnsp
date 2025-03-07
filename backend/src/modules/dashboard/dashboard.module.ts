import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RedisService } from 'src/services/redis/redis.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, RedisService],
})
export class DashboardModule {}
