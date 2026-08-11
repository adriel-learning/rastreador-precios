import { NotificationLog } from './notification-log.entity';

const oneDayInMilisecond = 24 * 60 * 60 * 1000;

export type AlertStateName =
  'threshold_crossed' | 'notified' | 'cooldown' | 'resolved';

export type AlertEvaluationResult = 'notification_needed' | 'resolved';

export interface AlertCreateInput {
  productId: string;
  priceSnapshotId: string;
  umbral: number;
}

export class AlertRule {
  readonly id: string;
  readonly productId: string;
  readonly priceSnapshotId: string;
  readonly umbral: number;

  state: AlertStateName;
  lastNotifiedPrice: number | null;
  lastNotifiedAt: Date | null;
  createdAt: Date | null;

  private constructor(input: AlertCreateInput & { id: string }) {
    this.id = input.id;
    this.productId = input.productId;
    this.priceSnapshotId = input.priceSnapshotId;
    this.umbral = input.umbral;
    this.state = 'threshold_crossed';
    this.lastNotifiedPrice = null;
    this.lastNotifiedAt = null;
    this.createdAt = new Date();
  }

  static create(input: AlertCreateInput): AlertRule {
    return new AlertRule({ ...input, id: crypto.randomUUID() });
  }

  onNewPrice(price: number, at: Date): AlertEvaluationResult | null {
    if (this.lastNotifiedPrice === null) {
      this.lastNotifiedPrice = price;
      return null;
    }

    const target = this.calculateTarget();

    switch (this.state) {
      case 'threshold_crossed':
        if (price > target) {
          this.state = 'resolved';
          return null;
        }
        return 'notification_needed';

      case 'notified':
        if (price > target) {
          this.state = 'cooldown';
        }
        return null;

      case 'cooldown':
        if (price > target) this.state = 'resolved';
        else if (this.cooldownExpired(at) && price < target)
          this.state = 'threshold_crossed';
        return null;

      default:
        return null;
    }
  }

  private cooldownExpired(at: Date): boolean {
    return at.getTime() - this.lastNotifiedAt!.getTime() >= oneDayInMilisecond;
  }

  private calculateTarget(): number {
    if (this.lastNotifiedPrice === null)
      throw new Error('lastNotifiedPrice no definida');
    return this.lastNotifiedPrice - this.umbral;
  }

  private notify(price: number, at: Date): NotificationLog {
    this.state = 'notified';
    this.lastNotifiedPrice = price;
    this.lastNotifiedAt = at;
    return NotificationLog.create({
      ruleId: this.id,
      productId: this.productId,
      priceQueDisparo: price,
      timestamp: at,
    });
  }
}
