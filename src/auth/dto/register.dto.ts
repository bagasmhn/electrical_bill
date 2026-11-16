import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap customer' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'budi@gmail.com', description: 'Email unik customer' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Password minimal 8 karakter' })
  @MinLength(6)
  password!: string;
}
