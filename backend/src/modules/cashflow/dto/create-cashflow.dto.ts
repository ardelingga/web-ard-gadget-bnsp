import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateCashflowDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['income', 'expense'], {
    message: 'Type must be either income or expense',
  })
  type: string; // Jenis cashflow (income/expense)

  @IsNotEmpty()
  @IsNumber()
  value: number; // Jumlah nilai pendapatan/pengeluaran

  @IsOptional()
  @IsString()
  description?: string; // Deskripsi tambahan (opsional)

  @IsOptional()
  @IsString()
  date?: string; // Tanggal transaksi dalam format ISO (opsional), default nya akan jadi sekarang
}
