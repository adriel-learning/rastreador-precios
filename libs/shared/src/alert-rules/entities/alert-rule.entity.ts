import { NotificationLog } from './notification-log.entity';

const oneDayInMilisecond = 24 * 60 * 60 * 1000;

export type AlertStateName = 'threshold_crossed' | 'notified' | 'resolved';

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

  private constructor(
    input: AlertCreateInput & {
      id: string;
      lastNotifiedPrice: number | null;
      lastNotifiedAt: Date | null;
      createdAt: Date | null;
      state: AlertStateName;
    },
  ) {
    this.id = input.id;
    this.productId = input.productId;
    this.priceSnapshotId = input.priceSnapshotId;
    this.umbral = input.umbral;
    this.state = input.state;
    this.lastNotifiedPrice = input.lastNotifiedPrice;
    this.lastNotifiedAt = input.lastNotifiedAt;
    this.createdAt = input.createdAt;
  }

  static create(input: AlertCreateInput): AlertRule {
    return new AlertRule({
      ...input,
      id: crypto.randomUUID(),
      state: 'threshold_crossed',
      lastNotifiedPrice: null,
      lastNotifiedAt: null,
      createdAt: new Date(),
    });
  }

  static fromPersistence(
    input: AlertCreateInput & {
      id: string;
      state: AlertStateName;
      lastNotifiedPrice: number | null;
      lastNotifiedAt: Date | null;
      createdAt: Date | null;
    },
  ): AlertRule {
    return new AlertRule(input);
  }

  notify(price: number, at: Date): NotificationLog {
    if (this.state !== 'threshold_crossed')
      throw new Error(`No se puede notificar desde ${this.state}`);

    this.state = 'notified';
    this.lastNotifiedPrice = price;
    this.lastNotifiedAt = at;
    return NotificationLog.create({
      alertId: this.id,
      triggerPrice: price,
      timestamp: at,
    });
  }

  resolve(): void {
    if (this.state !== 'notified')
      throw new Error(
        `La alerta no se puede resolver desde el estado ${this.state}`,
      );

    this.state = 'resolved';
  }

  reCross(): void {
    if (this.state !== 'notified')
      throw new Error(
        `La alerta no se puede resolver desde el estado ${this.state}`,
      );

    if (!this.notificationExpired())
      throw new Error('La última notificacion aún no expiró');

    this.state = 'threshold_crossed';
  }

  private notificationExpired(): boolean {
    if (!this.lastNotifiedAt)
      throw new Error('Esta alerta nunca fue notificada');

    return Date.now() - this.lastNotifiedAt.getTime() >= oneDayInMilisecond;
  }
}
