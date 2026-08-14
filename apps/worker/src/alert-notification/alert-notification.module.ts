import { Module } from '@nestjs/common';
import { AlertProcessor } from './alert.processor';
import { BullModule } from '@nestjs/bullmq';
import { ALERT_QUEUE } from '@app/shared/queues/alert-notification.contract';
import { AlertRulesModule } from '@app/shared/alert-rules/alert-rules.module';
import { ProductsModule } from '@app/shared/products/products.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ALERT_QUEUE,
    }),
    AlertRulesModule,
    ProductsModule,
  ],
  providers: [AlertProcessor],
})
export class AlertNotificationModule {}
