import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateBillingDto {
  @IsString()
  @IsNotEmpty()
  electricityAccountId: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsNumber()
  @Min(2000)
  periodYear: number;

  @IsNumber()
  @Min(0)
  previousMeter: number;

  @IsNumber()
  @Min(0)
  currentMeter: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}
