import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ElectricityServiceService } from './electricity-service.service';
import { CreateElectricityServiceDto } from './dto/create-electricity-service.dto';
import { UpdateElectricityServiceDto } from './dto/update-electricity-service.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Electricity Services')
@Controller('electricity-services')
export class ElectricityServiceController {
  constructor(
    private readonly electricityServiceService: ElectricityServiceService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin membuat layanan listrik baru' })
  create(@Body() dto: CreateElectricityServiceDto) {
    return this.electricityServiceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar layanan listrik (bisa filter active)' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  findAll(@Query('active') active?: string) {
    const onlyActive = active === 'true';
    return this.electricityServiceService.findAll(onlyActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail layanan listrik berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.electricityServiceService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mengubah layanan listrik' })
  update(@Param('id') id: string, @Body() dto: UpdateElectricityServiceDto) {
    return this.electricityServiceService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin menghapus layanan listrik' })
  remove(@Param('id') id: string) {
    return this.electricityServiceService.remove(id);
  }
}
