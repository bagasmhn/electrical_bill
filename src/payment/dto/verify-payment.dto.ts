import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class VerifyPaymentDto {
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus; // APPROVED or REJECTED
}
