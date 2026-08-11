export interface PriceSnapshotCreateInput {
  productId: string;
  price: number;
  timestamp?: Date;
}

export class PriceSnapshot {
  readonly id: string;
  readonly productId: string;
  readonly price: number;
  readonly timestamp: Date;

  private constructor(input: PriceSnapshotCreateInput & { id: string }) {
    this.id = input.id;
    this.productId = input.productId;
    this.price = input.price;
    this.timestamp = input.timestamp ?? new Date();
  }

  static create(input: PriceSnapshotCreateInput): PriceSnapshot {
    return new PriceSnapshot({ ...input, id: crypto.randomUUID() });
  }

  static fromPersistence(
    input: PriceSnapshotCreateInput & { id: string },
  ): PriceSnapshot {
    return new PriceSnapshot(input);
  }
}
