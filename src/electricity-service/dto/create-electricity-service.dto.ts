import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateElectricityServiceDto {
  @ApiProperty({ example: 'R1-2200', description: 'Kode unik layanan listrik' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Rumah Tangga 2200 VA', description: 'Nama layanan listrik' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2200, description: 'Daya VA' })
  @IsNumber()
  @Min(1)
  powerVa: number;

  @ApiProperty({ example: 1444.7, description: 'Harga per kWh' })
  @IsNumber()
  @Min(0)
  pricePerKwh: number;

  @ApiPropertyOptional({ example: true, description: 'Status aktif layanan' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
