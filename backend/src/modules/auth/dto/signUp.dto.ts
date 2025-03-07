import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'The name of the business',
    example: 'Toko Serba Ada',
  })
  @IsString()
  @IsNotEmpty()
  name_business: string;

  @ApiProperty({
    description: 'The email of the business',
    example: 'tokoserbaada@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The phone number of the business',
    example: '08123456789',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'The address of the business',
    example: 'Jl. Raya, No. 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'The password of the business',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
