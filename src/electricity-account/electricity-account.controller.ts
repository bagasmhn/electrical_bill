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
import { ElectricityAccountService } from './electricity-account.service';
import { CreateElectricityAccountDto } from './dto/create-electricity-account.dto';
import { UpdateElectricityAccountDto } from './dto/update-electricity-account.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Electricity Accounts')
@ApiBearerAuth()
@Controller('electricity-accounts')
@UseGuards(JwtAuthGuard)
export class ElectricityAccountController {
  constructor(
    private readonly electricityAccountService: ElectricityAccountService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Customer mendaftarkan akun listrik baru' })
  create(@Req() req, @Body() dto: CreateElectricityAccountDto) {
    const userId = req.user.sub || req.user.id;
    return this.electricityAccountService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar akun listrik (Admin semua, Customer miliknya sendiri)' })
  findAll(@Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.electricityAccountService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail akun listrik' })
  findOne(@Param('id') id: string, @Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.electricityAccountService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mengubah data akun listrik' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateElectricityAccountDto,
    @Req() req,
  ) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.electricityAccountService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus akun listrik' })
  remove(@Param('id') id: string, @Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.electricityAccountService.remove(id, user);
  }
}
