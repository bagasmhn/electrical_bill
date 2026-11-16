import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectricityServiceDto } from './dto/create-electricity-service.dto';
import { UpdateElectricityServiceDto } from './dto/update-electricity-service.dto';

@Injectable()
export class ElectricityServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateElectricityServiceDto) {
    const existing = await this.prisma.electricityService.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('Kode layanan listrik sudah terdaftar');
    }

    return this.prisma.electricityService.create({
      data: {
        code: dto.code,
        name: dto.name,
        powerVa: dto.powerVa,
        pricePerKwh: dto.pricePerKwh,
        isActive: dto.isActive ?? true,
      },
    });
  }

  findAll(onlyActive = false) {
    const where = onlyActive ? { isActive: true } : {};
    return this.prisma.electricityService.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.electricityService.findUnique({
      where: { id },
    });
    if (!service) {
      throw new NotFoundException('Layanan listrik tidak ditemukan');
    }
    return service;
  }

  async update(id: string, dto: UpdateElectricityServiceDto) {
    await this.findOne(id);
    if (dto.code) {
      const existing = await this.prisma.electricityService.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException('Kode layanan listrik sudah digunakan');
      }
    }

    return this.prisma.electricityService.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.electricityService.delete({
        where: { id },
      });
    } catch {
      throw new BadRequestException(
        'Layanan listrik tidak dapat dihapus karena sudah digunakan oleh akun pelanggan',
      );
    }
  }
}
