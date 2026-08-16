import { Injectable } from '@nestjs/common';
import { DbService, DbClient } from '@app/shared/db';
import { eq } from 'drizzle-orm';
import { notificationLogs } from '@app/shared/db/schemas/notification-log.schema';
import { NotificationLog } from '../entities/notification-log.entity';
import { INotificationLogRepository } from './interfaces/notification-log-repository.interface';

@Injectable()
export class NotificationLogRepository extends INotificationLogRepository {
  constructor(private readonly dbService: DbService) {
    super();
  }

  async create(
    log: NotificationLog,
    db: DbClient = this.dbService.db,
  ): Promise<NotificationLog> {
    const [row] = await db
      .insert(notificationLogs)
      .values({
        alertId: log.alertId,
        triggerPrice: log.triggerPrice,
      })
      .returning();

    return NotificationLog.fromPersistence(row);
  }

  async findAll(): Promise<NotificationLog[]> {
    const rows = await this.dbService.db.select().from(notificationLogs);

    return rows.map((row) => NotificationLog.fromPersistence(row));
  }

  async findById(id: string): Promise<NotificationLog | null> {
    const [row] = await this.dbService.db
      .select()
      .from(notificationLogs)
      .where(eq(notificationLogs.id, id));

    return row ? NotificationLog.fromPersistence(row) : null;
  }

  async update(log: NotificationLog): Promise<NotificationLog | null> {
    const [row] = await this.dbService.db
      .update(notificationLogs)
      .set({
        alertId: log.alertId,
        triggerPrice: log.triggerPrice,
      })
      .where(eq(notificationLogs.id, log.id))
      .returning();

    return row ? NotificationLog.fromPersistence(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.dbService.db
      .delete(notificationLogs)
      .where(eq(notificationLogs.id, id))
      .returning({ id: notificationLogs.id });

    return rows.length > 0;
  }
}
