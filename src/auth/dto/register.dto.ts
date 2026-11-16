import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'cukamhihu', description: 'Nama lengkap customer' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'cukamhihu@gmail.com', description: 'Email unik customer' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Password minimal 8 karakter' })
  @MinLength(6)
  password!: string;
}
