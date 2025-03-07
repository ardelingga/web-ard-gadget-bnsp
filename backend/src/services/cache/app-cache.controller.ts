import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AppCacheService } from './app-cache.service';

@Controller('app-cache')
export class AppCacheController {
  constructor(private readonly appCacheService: AppCacheService) {}

  @Get('get')
  async getCache(@Query('key') key: string) {
    try {
      const result = await this.appCacheService.get(key);
      return { key, value: result };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('set')
  async setCache(@Body() { key, value }: { key: string; value: string }) {
    try {
      await this.appCacheService.set(key, value);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete('delete')
  async deleteCache(@Body() { key }: { key: string }) {
    try {
      console.log('DELET KEY', key);
      await this.appCacheService.delete(key);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete('clear')
  async clearCache() {
    try {
      await this.appCacheService.clear();
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
