import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { INotificationLogRepository } from './repositories/interfaces/notification-log-repository.interface';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    private readonly notificationLogRepository: INotificationLogRepository,
    private readonly logger: Logger,
  ) {}

  async createAndLog(notificationLog: NotificationLog, productName: string) {
    const created =
      await this.notificationLogRepository.create(notificationLog);
    this.logger.log(
      { alertId: created.alertId, triggerPrice: created.triggerPrice },
      `El producto ${productName} tuvo una baja de precio`,
    );
  }
}