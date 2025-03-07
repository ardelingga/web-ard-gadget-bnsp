import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RedisService } from 'src/services/redis/redis.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, RedisService],
})
export class TransactionsModule {}
