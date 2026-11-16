import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillingDto {
  @ApiProperty({ example: 'uuid-akun-listrik', description: 'ID Akun Listrik Pelanggan' })
  @IsString()
  @IsNotEmpty()
  electricityAccountId: string;

  @ApiProperty({ example: 11, description: 'Bulan periode tagihan (1-12)' })
  @IsNumber()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @ApiProperty({ example: 2026, description: 'Tahun periode tagihan' })
  @IsNumber()
  @Min(2000)
  periodYear: number;

  @ApiProperty({ example: 150.0, description: 'Angka meter bulan sebelumnya' })
  @IsNumber()
  @Min(0)
  previousMeter: number;

  @ApiProperty({ example: 320.0, description: 'Angka meter bulan saat ini' })
  @IsNumber()
  @Min(0)
  currentMeter: number;

  @ApiProperty({ example: '2026-12-10T23:59:59.000Z', description: 'Tanggal jatuh tempo tagihan' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}
