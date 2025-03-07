import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class DetailTransactionDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  quantity: number;
}
