import { Injectable } from '@nestjs/common';
import { DbService, DbClient } from '@app/shared/db';
import { and, eq, ne } from 'drizzle-orm';
import { alertRules } from '@app/shared/db/schemas/alert-rule.schema';
import { AlertRule } from '../entities/alert-rule.entity';
import { IAlertRuleRepository } from './interfaces/alert-rule-repository.interface';

@Injectable()
export class AlertRuleRepository extends IAlertRuleRepository {
  constructor(private readonly dbService: DbService) {
    super();
  }

  async create(
    rule: AlertRule,
    db: DbClient = this.dbService.db,
  ): Promise<AlertRule> {
    const [row] = await db
      .insert(alertRules)
      .values({
        productId: rule.productId,
        priceSnapshotId: rule.priceSnapshotId,
        state: rule.state,
        lastNotifiedPrice: rule.lastNotifiedPrice,
        lastNotifiedAt: rule.lastNotifiedAt,
      })
      .returning();

    return AlertRule.fromPersistence(row);
  }

  async findAll(): Promise<AlertRule[]> {
    const rows = await this.dbService.db.select().from(alertRules);

    return rows.map((row) => AlertRule.fromPersistence(row));
  }

  async findById(id: string): Promise<AlertRule | null> {
    const [row] = await this.dbService.db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, id));

    return row ? AlertRule.fromPersistence(row) : null;
  }

  async findActiveByProduct(
    productId: string,
    db: DbClient = this.dbService.db,
  ): Promise<AlertRule | null> {
    const [row] = await db
      .select()
      .from(alertRules)
      .where(
        and(
          eq(alertRules.productId, productId),
          ne(alertRules.state, 'resolved'),
        ),
      );

    return row ? AlertRule.fromPersistence(row) : null;
  }

  async update(
    rule: AlertRule,
    db: DbClient = this.dbService.db,
  ): Promise<AlertRule> {
    const [row] = await db
      .update(alertRules)
      .set({
        state: rule.state,
        lastNotifiedPrice: rule.lastNotifiedPrice,
        lastNotifiedAt: rule.lastNotifiedAt,
      })
      .where(eq(alertRules.id, rule.id))
      .returning();

    return AlertRule.fromPersistence(row);
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.dbService.db
      .delete(alertRules)
      .where(eq(alertRules.id, id))
      .returning({ id: alertRules.id });

    return rows.length > 0;
  }
}
