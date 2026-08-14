import { Injectable } from '@nestjs/common';
import { INotificationLogRepository } from './repositories/interfaces/notification-log-repository.interface';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    private readonly notificationLogRepository: INotificationLogRepository,
  ) {}

  async createAndLog(notificationLog: NotificationLog, productName: string) {
    const created =
      await this.notificationLogRepository.create(notificationLog);
    console.log(
      `El producto ${productName} tuvo una baja de precio a ${created.triggerPrice}`,
    );
  }
}
