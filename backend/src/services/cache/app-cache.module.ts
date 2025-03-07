import { Module } from '@nestjs/common';
import { AppCacheService } from './app-cache.service';
import { AppCacheController } from './app-cache.controller';

@Module({
  controllers: [AppCacheController],
  providers: [AppCacheService],
})
export class AppCacheModule {}
