import { IsOptional, IsString, IsNumber, IsNumberString } from 'class-validator';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  search?: string; // search product

  @IsOptional()
  @IsString()
  sortBy?: string; // sort by 'price', 'name'

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'; // sort order 'ASC' atau 'DESC'

  @IsOptional()
  @IsNumberString()
  page?: number; // page number

  @IsOptional()
  @IsNumberString()
  limit?: number; // limit per page

  @IsOptional()
  // @IsNumberString()
  category_id?: number; // filter by category
}
