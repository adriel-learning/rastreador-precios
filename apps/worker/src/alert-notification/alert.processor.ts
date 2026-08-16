import { NotificationLog } from '@app/shared/alert-rules';
import { AlertRulesService } from '@app/shared/alert-rules/alert-rules.service';
import { NotificationLogService } from '@app/shared/alert-rules/notification-log.service';
import { ProductService } from '@app/shared/products/product.service';
import {
  ALERT_DLQ,
  ALERT_DLQ_JOB,
  ALERT_QUEUE,
  AlertContract,
} from '@app/shared/queues/alert-notification.contract';
import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { DbService } from '@app/shared/db';
import { TelegramNotifierService } from '@app/shared/notifications';
import { Logger } from 'nestjs-pino';

@Processor(ALERT_QUEUE)
export class AlertProcessor extends WorkerHost {
  constructor(
    private readonly alertRulesService: AlertRulesService,
    private readonly notificationLogService: NotificationLogService,
    private readonly productsService: ProductService,
    private readonly dbService: DbService,
    private readonly telegramNotifierService: TelegramNotifierService,
    private readonly logger: Logger,
    @InjectQueue(ALERT_DLQ)
    private readonly alertDlq: Queue,
  ) {
    super();
  }

  async process(job: Job<AlertContract>): Promise<void> {
    const alert = await this.alertRulesService.findById(job.data.alertId);
    const product = await this.productsService.findById(alert.productId);

    try {
      await this.telegramNotifierService.sendPriceDrop({
        productName: product.name,
        price: job.data.triggerPrice,
        url: product.url,
      });
    } catch (error) {
      this.logger.error(error, 'No se pudo enviar la notificación de Telegram');
      throw error;
    }

    const nowDate = new Date();
    alert.notify(job.data.triggerPrice, nowDate);
    const notification = NotificationLog.create({
      alertId: alert.id,
      triggerPrice: job.data.triggerPrice,
      timestamp: nowDate,
    });

    await this.dbService.transaction(async (tx) => {
      await this.alertRulesService.update(alert, tx);
      await this.notificationLogService.create(notification, tx);
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<AlertContract>, error: Error) {
    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade >= attempts)
      await this.alertDlq.add(ALERT_DLQ_JOB, {
        originalJobId: job.id,
        data: job.data,
        error: error.message,
      });
  }
}
