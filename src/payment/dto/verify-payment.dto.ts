import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ enum: PaymentStatus, example: 'APPROVED', description: 'Status verifikasi pembayaran (APPROVED atau REJECTED)' })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus; // APPROVED or REJECTED
}
