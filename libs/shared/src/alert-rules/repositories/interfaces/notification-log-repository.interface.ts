import { DbClient } from '@app/shared/db';
import { NotificationLog } from '../../entities/notification-log.entity';

export abstract class INotificationLogRepository {
  abstract create(
    log: NotificationLog,
    db?: DbClient,
  ): Promise<NotificationLog>;
  abstract findAll(): Promise<NotificationLog[]>;
  abstract findById(id: string): Promise<NotificationLog | null>;
  abstract update(log: NotificationLog): Promise<NotificationLog | null>;
  abstract delete(id: string): Promise<boolean>;
}
