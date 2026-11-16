import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPayment(
    userId: string,
    billingId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File bukti pembayaran wajib diunggah');
    }

    const billing = await this.prisma.billing.findUnique({
      where: { id: billingId },
      include: {
        electricityAccount: true,
        payment: true,
      },
    });

    if (!billing) {
      throw new NotFoundException('Tagihan tidak ditemukan');
    }

    if (billing.electricityAccount.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke tagihan ini');
    }

    if (billing.status === 'PAID') {
      throw new BadRequestException('Tagihan sudah lunas (PAID)');
    }

    if (
      billing.status !== 'UNPAID' &&
      billing.payment?.status !== 'REJECTED'
    ) {
      throw new BadRequestException(
        'Tagihan sedang menunggu verifikasi atau sudah diproses',
      );
    }

    const paymentProofPath = `/uploads/${file.filename}`;

    const existingPayment = billing.payment;

    let payment;
    if (existingPayment) {
      // Update existing payment record (re-upload after rejection)
      payment = await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          paymentProof: paymentProofPath,
          status: 'PENDING',
          verifiedBy: null,
          verifiedAt: null,
        },
      });
    } else {
      // Create new payment record
      payment = await this.prisma.payment.create({
        data: {
          billingId,
          paymentProof: paymentProofPath,
          status: 'PENDING',
        },
      });
    }

    // Update billing status to WAITING_VERIFICATION
    await this.prisma.billing.update({
      where: { id: billingId },
      data: { status: 'WAITING_VERIFICATION' },
    });

    return {
      message: 'Bukti pembayaran berhasil diunggah dan sedang menunggu verifikasi',
      payment,
    };
  }

  async findAll(user: { id: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return this.prisma.payment.findMany({
        include: {
          billing: {
            include: {
              electricityAccount: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                  electricityService: true,
                },
              },
            },
          },
          verifier: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Customer: payments for their billings
    const accounts = await this.prisma.electricityAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const accountIds = accounts.map((acc) => acc.id);

    const billings = await this.prisma.billing.findMany({
      where: { electricityAccountId: { in: accountIds } },
      select: { id: true },
    });
    const billingIds = billings.map((b) => b.id);

    return this.prisma.payment.findMany({
      where: { billingId: { in: billingIds } },
      include: {
        billing: {
          include: {
            electricityAccount: {
              include: { electricityService: true },
            },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        billing: {
          include: {
            electricityAccount: {
              include: {
                user: { select: { id: true, name: true, email: true } },
                electricityService: true,
              },
            },
          },
        },
        verifier: { select: { id: true, name: true, email: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }

    if (
      user.role !== Role.ADMIN &&
      payment.billing.electricityAccount.userId !== user.id
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pembayaran ini');
    }

    return payment;
  }

  async verify(adminId: string, paymentId: string, dto: VerifyPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { billing: true },
    });

    if (!payment) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }

    if (dto.status !== 'APPROVED' && dto.status !== 'REJECTED') {
      throw new BadRequestException('Status verifikasi harus APPROVED atau REJECTED');
    }

    const billingStatus = dto.status === 'APPROVED' ? 'PAID' : 'UNPAID';

    // Update payment and billing in transaction
    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: dto.status,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
        include: {
          verifier: { select: { id: true, name: true, email: true } },
          billing: true,
        },
      }),
      this.prisma.billing.update({
        where: { id: payment.billingId },
        data: { status: billingStatus },
      }),
    ]);

    return {
      message: `Pembayaran berhasil di-${dto.status === 'APPROVED' ? 'setujui' : 'tolak'}`,
      payment: updatedPayment,
    };
  }
}
