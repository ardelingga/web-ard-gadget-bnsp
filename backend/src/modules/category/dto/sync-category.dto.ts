import {
  IsBoolean, IsBooleanString,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SyncCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBooleanString()
  @IsOptional()
  is_synced: boolean;

  @IsBooleanString()
  @IsOptional()
  is_deleted: boolean;

  @IsDateString()
  @IsNotEmpty()
  updated_at: string;

  @IsDateString()
  @IsNotEmpty()
  created_at: string;
}
