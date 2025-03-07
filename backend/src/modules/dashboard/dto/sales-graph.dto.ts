import { IsOptional, IsIn, IsDateString } from 'class-validator';

export class SalesGraphDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsIn(['daily', 'monthly', 'yearly'])
  interval?: 'daily' | 'monthly' | 'yearly'; // Default bisa diset di Service atau Controller
}