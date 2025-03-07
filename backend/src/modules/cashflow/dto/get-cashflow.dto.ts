import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GetCashflowsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'sortOrder harus berisi asc atau desc' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  page?: number;

  @IsOptional()
  @IsString()
  limit?: number;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsEnum(['income', 'expense'], {
    message: 'type harus berisi income atau expense',
  })
  type?: 'income' | 'expense'; // Filter berdasarkan tipe
}
