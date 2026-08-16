import { DbClient } from '@app/shared/db';
import { AlertRule } from '../../entities/alert-rule.entity';

export abstract class IAlertRuleRepository {
  abstract create(rule: AlertRule, db?: DbClient): Promise<AlertRule>;
  abstract findAll(): Promise<AlertRule[]>;
  abstract findById(id: string): Promise<AlertRule | null>;
  abstract findActiveByProduct(
    productId: string,
    db?: DbClient,
  ): Promise<AlertRule | null>;
  abstract update(rule: AlertRule, db?: DbClient): Promise<AlertRule>;
  abstract delete(id: string): Promise<boolean>;
}
