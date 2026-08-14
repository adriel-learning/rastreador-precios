import { NotificationLog } from '@app/shared/alert-rules';
import { AlertRulesService } from '@app/shared/alert-rules/alert-rules.service';
import { NotificationLogService } from '@app/shared/alert-rules/notification-log.service';
import { ProductService } from '@app/shared/products/product.service';
import {
  ALERT_QUEUE,
  AlertContract,
} from '@app/shared/queues/alert-notification.contract';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(ALERT_QUEUE)
export class AlertProcessor extends WorkerHost {
  constructor(
    private readonly alertRulesService: AlertRulesService,
    private readonly notificationLogService: NotificationLogService,
    private readonly productsService: ProductService,
  ) {
    super();
  }

  async process(job: Job<AlertContract>): Promise<any> {
    const alert = await this.alertRulesService.findById(job.data.alertId);

    alert.notify(job.data.triggerPrice, new Date());
    const alertUpdated = await this.alertRulesService.update(alert);

    const product = await this.productsService.findById(alertUpdated.productId);

    const notification = NotificationLog.create({
      alertId: alertUpdated.id,
      triggerPrice: job.data.triggerPrice,
    });
    await this.notificationLogService.createAndLog(notification, product.name);
  }
}
