import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Billings')
@ApiBearerAuth()
@Controller('billings')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin membuat tagihan dan pencatatan meter' })
  create(@Body() dto: CreateBillingDto) {
    return this.billingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar tagihan (Admin semua, Customer miliknya)' })
  findAll(@Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.billingService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail tagihan' })
  findOne(@Param('id') id: string, @Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.billingService.findOne(id, user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin mengubah tagihan' })
  update(@Param('id') id: string, @Body() dto: UpdateBillingDto) {
    return this.billingService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin menghapus tagihan' })
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }
}
