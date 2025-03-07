import { Controller, Delete, Get, Param } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('getAllKey')
  async getAllCache() {
    try {
      const result = await this.redisService.getAllKeys();
      return { result };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('clear')
  async clearCache() {
    try {
      await this.redisService.clear();
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
    // }
  }

  @Get(':key')
  async getCache(@Param('key') key: string) {
    try {
      const result = await this.redisService.get(key);
      return { key, value: result };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('set/:key/:value')
  async setCache(@Param('key') key: string, @Param('value') value: string) {
    try {
      await this.redisService.set(key, value, 60);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('delete/:key')
  async deleteCache(@Param('key') key: string) {
    try {
      await this.redisService.delete(key);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete('deleteByPattern/:pattern')
  async deleteByPattern(@Param('pattern') pattern: string) {
    try {
      await this.redisService.deleteByPattern(pattern);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
