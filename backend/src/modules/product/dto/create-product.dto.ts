import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  image_file: Express.Multer.File | null;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumberString()
  @IsNotEmpty()
  price: number;

  @IsNumberString()
  @IsNotEmpty()
  profit: number;

  @IsNumberString()
  @IsNotEmpty()
  category_id: number;

  @IsNumberString()
  @IsNotEmpty()
  stock: number;
}
