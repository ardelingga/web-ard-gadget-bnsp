import { IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class BestSellingProductsDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}