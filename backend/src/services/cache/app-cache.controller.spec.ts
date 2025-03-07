import { Test, TestingModule } from '@nestjs/testing';
import { AppCacheController } from './app-cache.controller';
import { AppCacheService } from './app-cache.service';

describe('AppCacheController', () => {
  let controller: AppCacheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppCacheController],
      providers: [AppCacheService],
    }).compile();

    controller = module.get<AppCacheController>(AppCacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
