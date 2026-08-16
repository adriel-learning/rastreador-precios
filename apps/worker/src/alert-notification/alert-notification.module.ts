import { Module } from '@nestjs/common';
import { AlertProcessor } from './alert.processor';
import { AlertDlqProcessor } from './alert-dlq.processor';
import { BullModule } from '@nestjs/bullmq';
import {
  ALERT_DLQ,
  ALERT_QUEUE,
} from '@app/shared/queues/alert-notification.contract';
import { AlertRulesModule } from '@app/shared/alert-rules/alert-rules.module';
import { ProductsModule } from '@app/shared/products/products.module';
import { NotificationsModule } from '@app/shared/notifications';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: ALERT_QUEUE,
      },
      {
        name: ALERT_DLQ,
      },
    ),
    AlertRulesModule,
    ProductsModule,
    NotificationsModule,
  ],
  providers: [AlertProcessor, AlertDlqProcessor],
})
export class AlertNotificationModule {}
