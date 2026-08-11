export interface NotificationLogCreateInput {
  ruleId: string;
  productId: string;
  priceQueDisparo: number;
  timestamp?: Date;
}

export class NotificationLog {
  readonly id: string;
  readonly ruleId: string;
  readonly productId: string;
  readonly priceQueDisparo: number;
  readonly timestamp: Date;

  private constructor(input: NotificationLogCreateInput & { id: string }) {
    this.id = input.id;
    this.ruleId = input.ruleId;
    this.productId = input.productId;
    this.priceQueDisparo = input.priceQueDisparo;
    this.timestamp = input.timestamp ?? new Date();
  }

  static create(input: NotificationLogCreateInput): NotificationLog {
    return new NotificationLog({ ...input, id: crypto.randomUUID() });
  }
}
