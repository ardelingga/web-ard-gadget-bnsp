import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: any, ttl: number = 3600000 /* 1 jam */) {
    await this.cacheManager.set(key, value, ttl);
  }

  async get(key: string) {
    return await this.cacheManager.get(key);
  }

  //get all keys
  // async getAllKeys() {
  //   return await this.cacheManager.keys();
  // }

  async delete(key: string) {
    // await this.cacheManager.del(key);
    await this.cacheManager.del(`products:*`);
  }

  async clear() {
    await this.cacheManager.clear();
  }
}
