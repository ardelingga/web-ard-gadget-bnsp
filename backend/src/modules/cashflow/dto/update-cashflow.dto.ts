import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateCashflowDto {
  @IsOptional()
  @IsString()
  @IsIn(['income', 'expense'], {
    message: 'Type must be either income or expense',
  })
  type?: string; // Jenis cashflow baru (income/expense)

  @IsOptional()
  @IsNumber()
  value?: number; // Nilai baru dari cashflow

  @IsOptional()
  @IsString()
  description?: string; // Keterangan/deskripsi baru

  @IsOptional()
  @IsString()
  date?: string; // Tanggal baru (format ISO)
}
