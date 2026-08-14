import { Module } from '@nestjs/common';
import { AlertProcessor } from './alert.processor';
import { BullModule } from '@nestjs/bullmq';
import { ALERT_QUEUE } from '@app/shared/queues/alert-notification.contract';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ALERT_QUEUE,
    }),
  ],
  providers: [AlertProcessor],
})
export class AlertNotificationModule {}
