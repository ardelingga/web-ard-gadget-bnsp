import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DetailTransactionDto } from './transaction/detail_transaction.dts';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  customer_name: string | null;

  @IsNumber()
  total_payment: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailTransactionDto)
  detail_transactions: DetailTransactionDto[];
}
