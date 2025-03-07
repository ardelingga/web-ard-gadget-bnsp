import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';
import { env } from 'process';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis.Redis;

  onModuleInit() {
    this.client = new Redis.Redis({
      host: env.REDIS_HOST || 'redis', // Redis server host
      port: 6379, // Redis server port
    });
  }

  onModuleDestroy() {
    this.client.quit(); //
  }

  async set(
    key: string,
    value: string,
    ttl: number = 3600000 /* 1 jam */,
  ): Promise<void> {
    await this.client.set(key, value, 'EX', ttl);
  }

  // Example of getting OTP from Redis
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async getAllKeys(): Promise<string[]> {
    return this.client.keys('*');
  }

  // Example of deleting OTP (optional)
  async delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  async deleteByPattern(pattern: string) {
    const keys = await this.client.keys(pattern);
    // remove all matches pattern key
    for (const key of keys) {
      await this.client.del(key);
    }
  }

  async clear(): Promise<void> {
    await this.client.flushall();
  }
}
