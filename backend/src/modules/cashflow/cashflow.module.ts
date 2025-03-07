import { Module } from '@nestjs/common';
import { CashflowService } from './cashflow.service';
import { CashflowController } from './cashflow.controller';
import { RedisService } from 'src/services/redis/redis.service';

@Module({
  controllers: [CashflowController],
  providers: [CashflowService, RedisService],
})
export class CashflowModule {}
