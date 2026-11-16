import { Module } from '@nestjs/common';
import { ElectricityAccountService } from './electricity-account.service';
import { ElectricityAccountController } from './electricity-account.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElectricityAccountController],
  providers: [ElectricityAccountService],
  exports: [ElectricityAccountService],
})
export class ElectricityAccountModule {}
