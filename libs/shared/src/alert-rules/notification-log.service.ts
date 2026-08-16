import { Injectable } from '@nestjs/common';
import { DbClient } from '@app/shared/db';
import { INotificationLogRepository } from './repositories/interfaces/notification-log-repository.interface';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    private readonly notificationLogRepository: INotificationLogRepository,
  ) {}

  async create(notificationLog: NotificationLog, db?: DbClient) {
    return this.notificationLogRepository.create(notificationLog, db);
  }
}
