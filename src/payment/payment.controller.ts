import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `payment-${uniqueSuffix}${ext}`);
  },
});

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':billingId/upload')
  @UseInterceptors(
    FileInterceptor('paymentProof', {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return callback(
            new BadRequestException(
              'Hanya file gambar (jpg, jpeg, png) atau PDF yang diizinkan!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Customer mengunggah bukti pembayaran untuk tagihan' })
  @ApiConsumes('multipart/form-data')
  uploadPayment(
    @Param('billingId') billingId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.paymentService.uploadPayment(userId, billingId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar pembayaran (Admin semua, Customer miliknya)' })
  findAll(@Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.paymentService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail pembayaran' })
  findOne(@Param('id') id: string, @Req() req) {
    const user = {
      id: req.user.sub || req.user.id,
      role: req.user.role,
    };
    return this.paymentService.findOne(id, user);
  }

  @Post(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin memverifikasi pembayaran (Approved / Rejected)' })
  verify(
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
    @Req() req,
  ) {
    const adminId = req.user.sub || req.user.id;
    return this.paymentService.verify(adminId, id, dto);
  }
}
