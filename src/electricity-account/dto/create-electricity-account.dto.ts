import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ElectricityAccountStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateElectricityAccountDto {
  @ApiProperty({ example: 'abaf8740-b8f5-491c-ad31-8da142dc6676', description: 'ID Layanan Listrik' })
  @IsString()
  @IsNotEmpty()
  electricityServiceId: string;

  @ApiProperty({ example: 'PLN123456789', description: 'Nomor Pelanggan Listrik unik' })
  @IsString()
  @IsNotEmpty()
  customerNumber: string;

  @ApiProperty({ example: 'Budi Santoso', description: 'Nama Pelanggan di rekening listrik' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 45, Jakarta', description: 'Alamat pelanggan listrik' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ enum: ElectricityAccountStatus, example: 'ACTIVE', description: 'Status akun listrik' })
  @IsEnum(ElectricityAccountStatus)
  @IsOptional()
  status?: ElectricityAccountStatus;
}
