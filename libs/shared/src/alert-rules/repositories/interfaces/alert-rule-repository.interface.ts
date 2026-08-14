import { AlertRule } from '../../entities/alert-rule.entity';

export abstract class IAlertRuleRepository {
  abstract create(rule: AlertRule): Promise<AlertRule>;
  abstract findAll(): Promise<AlertRule[]>;
  abstract findById(id: string): Promise<AlertRule | null>;
  abstract findActiveByProduct(productId: string): Promise<AlertRule | null>;
  abstract update(rule: AlertRule): Promise<AlertRule>;
  abstract delete(id: string): Promise<boolean>;
}
