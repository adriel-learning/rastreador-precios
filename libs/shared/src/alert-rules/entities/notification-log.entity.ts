export interface NotificationLogCreateInput {
  alertId: string;
  triggerPrice: number;
  timestamp?: Date;
}

export class NotificationLog {
  readonly id: string;
  readonly alertId: string;
  readonly triggerPrice: number;
  readonly timestamp: Date;

  private constructor(input: NotificationLogCreateInput & { id: string }) {
    this.id = input.id;
    this.alertId = input.alertId;
    this.triggerPrice = input.triggerPrice;
    this.timestamp = input.timestamp ?? new Date();
  }

  static create(input: NotificationLogCreateInput): NotificationLog {
    return new NotificationLog({ ...input, id: crypto.randomUUID() });
  }

  static fromPersistence(
    input: NotificationLogCreateInput & {
      id: string;
      timestamp: Date;
    },
  ): NotificationLog {
    return new NotificationLog(input);
  }
}
