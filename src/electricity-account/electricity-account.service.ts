import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectricityAccountDto } from './dto/create-electricity-account.dto';
import { UpdateElectricityAccountDto } from './dto/update-electricity-account.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ElectricityAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateElectricityAccountDto) {
    const service = await this.prisma.electricityService.findUnique({
      where: { id: dto.electricityServiceId },
    });
    if (!service || !service.isActive) {
      throw new BadRequestException('Layanan listrik tidak valid atau tidak aktif');
    }

    const existingNumber = await this.prisma.electricityAccount.findUnique({
      where: { customerNumber: dto.customerNumber },
    });
    if (existingNumber) {
      throw new BadRequestException('Nomor pelanggan listrik sudah terdaftar');
    }

    return this.prisma.electricityAccount.create({
      data: {
        userId,
        electricityServiceId: dto.electricityServiceId,
        customerNumber: dto.customerNumber,
        customerName: dto.customerName,
        address: dto.address,
        status: dto.status ?? 'ACTIVE',
      },
      include: {
        electricityService: true,
      },
    });
  }

  findAll(user: { id: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return this.prisma.electricityAccount.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          electricityService: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.electricityAccount.findMany({
      where: { userId: user.id },
      include: {
        electricityService: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const account = await this.prisma.electricityAccount.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        electricityService: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Akun listrik tidak ditemukan');
    }

    if (user.role !== Role.ADMIN && account.userId !== user.id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke akun listrik ini');
    }

    return account;
  }

  async update(id: string, dto: UpdateElectricityAccountDto, user: { id: string; role: Role }) {
    const account = await this.findOne(id, user);

    if (dto.customerNumber && dto.customerNumber !== account.customerNumber) {
      const existing = await this.prisma.electricityAccount.findUnique({
        where: { customerNumber: dto.customerNumber },
      });
      if (existing) {
        throw new BadRequestException('Nomor pelanggan listrik sudah digunakan');
      }
    }

    if (dto.electricityServiceId) {
      const service = await this.prisma.electricityService.findUnique({
        where: { id: dto.electricityServiceId },
      });
      if (!service) {
        throw new BadRequestException('Layanan listrik tidak ditemukan');
      }
    }

    return this.prisma.electricityAccount.update({
      where: { id },
      data: dto,
      include: {
        electricityService: true,
      },
    });
  }

  async remove(id: string, user: { id: string; role: Role }) {
    await this.findOne(id, user);
    try {
      return await this.prisma.electricityAccount.delete({
        where: { id },
      });
    } catch {
      throw new BadRequestException(
        'Akun listrik tidak dapat dihapus karena memiliki data tagihan atau transaksi terkait',
      );
    }
  }
}
