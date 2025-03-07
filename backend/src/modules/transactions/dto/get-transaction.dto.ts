import {
  IsOptional,
  IsString,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class GetTransactionsDto {
  @IsOptional()
  @IsString()
  search?: string; // search transaction, e.g., by transaction ID or notes

  @IsOptional()
  @IsString()
  sortBy?: string; // sort by 'date', 'price', etc.

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'; // sort order ASC or DESC

  @IsOptional()
  @IsNumberString()
  page?: number; // page number

  @IsOptional()
  @IsNumberString()
  limit?: number; // limit per page

  @IsOptional()
  @IsDateString()
  dateFrom?: string; // filter: start date

  @IsOptional()
  @IsDateString()
  dateTo?: string; // filter: end date

  @IsOptional()
  @IsNumberString()
  grandTotalMin?: string; // filter: minimum grand total transaction

  @IsOptional()
  @IsNumberString()
  grandTotalMax?: string; // filter: maximum grand total transaction
}
