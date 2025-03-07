import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';
import * as path from 'node:path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { AppCacheModule } from './services/cache/app-cache.module';
import { RedisModule } from './services/redis/redis.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';
import { CashflowModule } from 'src/modules/cashflow/cashflow.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          store: [
            new Keyv({
              store: new CacheableMemory({
                ttl: 60000, // 1 menit,
                lruSize: 5000,
              }),
            }),
            createKeyv('redis://localhost:6379'),
          ],
          ttl: 3600000, // 1 jam
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../storage'),
      serveRoot: '/storage',
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    ProductModule,
    AppCacheModule,
    RedisModule,
    CategoryModule,
    TransactionsModule,
    CashflowModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
