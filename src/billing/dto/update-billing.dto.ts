import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingDto } from './create-billing.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { BillingStatus } from '@prisma/client';

export class UpdateBillingDto extends PartialType(CreateBillingDto) {
  @IsEnum(BillingStatus)
  @IsOptional()
  status?: BillingStatus;
}
