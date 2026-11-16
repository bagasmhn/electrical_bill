import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ElectricityAccountStatus } from '@prisma/client';

export class CreateElectricityAccountDto {
  @IsString()
  @IsNotEmpty()
  electricityServiceId: string;

  @IsString()
  @IsNotEmpty()
  customerNumber: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(ElectricityAccountStatus)
  @IsOptional()
  status?: ElectricityAccountStatus;
}
