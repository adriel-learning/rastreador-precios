import { AlertRule } from '../../entities/alert-rule.entity';

export abstract class IAlertRuleRepository {
  abstract create(rule: AlertRule): Promise<AlertRule>;
  abstract findAll(): Promise<AlertRule[]>;
  abstract findById(id: string): Promise<AlertRule | null>;
  abstract findActiveByProduct(productId: string): Promise<AlertRule[]>;
  abstract update(rule: AlertRule): Promise<AlertRule | null>;
  abstract delete(id: string): Promise<boolean>;
}
