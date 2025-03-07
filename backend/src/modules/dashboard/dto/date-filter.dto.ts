import { IsOptional, IsDateString } from 'class-validator';

export class DateFilterDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

}
