import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MulterModule } from '@nestjs/platform-express';
import { JwtStrategy } from 'src/modules/auth/strategy/jwt.strategy';
import * as multer from 'multer';
import { RedisService } from '../../services/redis/redis.service';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, JwtStrategy, RedisService],
})
export class ProductModule {}
