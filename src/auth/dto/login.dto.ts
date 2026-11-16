import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@listrik.com', description: 'Email user atau admin' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin123', description: 'Password user' })
  @MinLength(6)
  password!: string;
}
