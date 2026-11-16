import { Module } from '@nestjs/common';
import { ElectricityServiceService } from './electricity-service.service';
import { ElectricityServiceController } from './electricity-service.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ElectricityServiceController],
  providers: [ElectricityServiceService],
  exports: [ElectricityServiceService],
})
export class ElectricityServiceModule {}
