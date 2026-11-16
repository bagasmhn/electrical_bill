import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ElectricityServiceModule } from './electricity-service/electricity-service.module';
import { ElectricityAccountModule } from './electricity-account/electricity-account.module';
import { BillingModule } from './billing/billing.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ElectricityServiceModule,
    ElectricityAccountModule,
    BillingModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
