import { Injectable } from '@nestjs/common';
import { DbClient } from '@app/shared/db';
import { IAlertRuleRepository } from './repositories/interfaces/alert-rule-repository.interface';
import { Product } from '../products';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';
import { AlertRule } from './entities/alert-rule.entity';

@Injectable()
export class AlertRulesService {
  constructor(private readonly alertRuleRepository: IAlertRuleRepository) {}

  async findById(id: string): Promise<AlertRule> {
    const alert = await this.alertRuleRepository.findById(id);
    if (!alert) throw new Error(`No existe una alerta con el ID ${id}`);
    return alert;
  }

  async update(alertRule: AlertRule, db?: DbClient) {
    return this.alertRuleRepository.update(alertRule, db);
  }

  async handleEvaluationPrice(
    product: Product,
    snapshot: PriceSnapshot,
    priceIsLow: boolean,
    db?: DbClient,
  ): Promise<AlertRule | null> {
    const activeAlert = await this.alertRuleRepository.findActiveByProduct(
      product.id,
      db,
    );

    if (priceIsLow && !activeAlert) {
      const alert = AlertRule.create({
        productId: product.id,
        priceSnapshotId: snapshot.id,
      });
      return await this.alertRuleRepository.create(alert, db);
    }

    if (priceIsLow && activeAlert?.state === 'threshold_crossed')
      return activeAlert;

    if (activeAlert?.state === 'notified' && !priceIsLow) {
      activeAlert.resolve();
      await this.alertRuleRepository.update(activeAlert, db);
      return null;
    }

    if (activeAlert?.state === 'notified' && priceIsLow) {
      const priceImproved =
        activeAlert.lastNotifiedPrice !== null &&
        snapshot.price < activeAlert.lastNotifiedPrice;

      if (priceImproved || activeAlert.canReCross()) {
        activeAlert.reCross();
        return await this.alertRuleRepository.update(activeAlert, db);
      }
    }

    return null;
  }
}
