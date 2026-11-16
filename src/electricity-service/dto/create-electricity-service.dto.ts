import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateElectricityServiceDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  powerVa: number;

  @IsNumber()
  @Min(0)
  pricePerKwh: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
