import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { SyncCategoryDto } from 'src/modules/category/dto/sync-category.dto';

export class SyncBulkCategoryDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SyncCategoryDto) // Transform setiap entri ke dalam CategoryDTO
  categories: SyncCategoryDto[];
}
