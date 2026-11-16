import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBillingDto) {
    if (dto.currentMeter < dto.previousMeter) {
      throw new BadRequestException(
        'Meter saat ini (current_meter) harus lebih besar atau sama dengan meter sebelumnya (previous_meter)',
      );
    }

    // Check account and service
    const account = await this.prisma.electricityAccount.findUnique({
      where: { id: dto.electricityAccountId },
      include: { electricityService: true },
    });

    if (!account) {
      throw new NotFoundException('Akun listrik tidak ditemukan');
    }

    // Check unique billing period for this account
    const existingBilling = await this.prisma.billing.findUnique({
      where: {
        electricityAccountId_periodMonth_periodYear: {
          electricityAccountId: dto.electricityAccountId,
          periodMonth: dto.periodMonth,
          periodYear: dto.periodYear,
        },
      },
    });

    if (existingBilling) {
      throw new BadRequestException(
        'Tagihan untuk akun listrik dan periode bulan/tahun tersebut sudah ada',
      );
    }

    const consumption = Number(dto.currentMeter) - Number(dto.previousMeter);
    const tariffPerKwh = Number(account.electricityService.pricePerKwh);
    const amount = consumption * tariffPerKwh;

    return this.prisma.billing.create({
      data: {
        electricityAccountId: dto.electricityAccountId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        previousMeter: dto.previousMeter,
        currentMeter: dto.currentMeter,
        consumption,
        tariffPerKwh,
        amount,
        dueDate: new Date(dto.dueDate),
        status: 'UNPAID',
      },
      include: {
        electricityAccount: {
          include: {
            electricityService: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async findAll(user: { id: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return this.prisma.billing.findMany({
        include: {
          electricityAccount: {
            include: {
              electricityService: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Customer: only billings for their electricity accounts
    const accounts = await this.prisma.electricityAccount.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const accountIds = accounts.map((acc) => acc.id);

    return this.prisma.billing.findMany({
      where: {
        electricityAccountId: { in: accountIds },
      },
      include: {
        electricityAccount: {
          include: {
            electricityService: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const billing = await this.prisma.billing.findUnique({
      where: { id },
      include: {
        electricityAccount: {
          include: {
            electricityService: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        payment: {
          include: {
            verifier: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!billing) {
      throw new NotFoundException('Tagihan tidak ditemukan');
    }

    if (
      user.role !== Role.ADMIN &&
      billing.electricityAccount.userId !== user.id
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke tagihan ini');
    }

    return billing;
  }

  async update(id: string, dto: UpdateBillingDto) {
    const billing = await this.prisma.billing.findUnique({
      where: { id },
      include: { electricityAccount: { include: { electricityService: true } } },
    });

    if (!billing) {
      throw new NotFoundException('Tagihan tidak ditemukan');
    }

    const previousMeter = dto.previousMeter ?? Number(billing.previousMeter);
    const currentMeter = dto.currentMeter ?? Number(billing.currentMeter);

    if (currentMeter < previousMeter) {
      throw new BadRequestException(
        'Meter saat ini harus lebih besar atau sama dengan meter sebelumnya',
      );
    }

    const consumption = currentMeter - previousMeter;
    const tariffPerKwh = Number(billing.tariffPerKwh);
    const amount = consumption * tariffPerKwh;

    return this.prisma.billing.update({
      where: { id },
      data: {
        electricityAccountId: dto.electricityAccountId ?? billing.electricityAccountId,
        periodMonth: dto.periodMonth ?? billing.periodMonth,
        periodYear: dto.periodYear ?? billing.periodYear,
        previousMeter,
        currentMeter,
        consumption,
        amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : billing.dueDate,
        status: dto.status ?? billing.status,
      },
      include: {
        electricityAccount: {
          include: {
            electricityService: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        payment: true,
      },
    });
  }

  async remove(id: string) {
    const billing = await this.prisma.billing.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!billing) {
      throw new NotFoundException('Tagihan tidak ditemukan');
    }

    if (billing.payment) {
      throw new BadRequestException(
        'Tagihan tidak dapat dihapus karena sudah memiliki data pembayaran terkait',
      );
    }

    return this.prisma.billing.delete({
      where: { id },
    });
  }
}
