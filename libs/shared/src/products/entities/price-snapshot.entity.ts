export interface PriceSnapshotCreateInput {
  productId: string;
  price: number;
  timestamp?: Date;
}

export interface PriceSnapshotPersistenceInput extends PriceSnapshotCreateInput {
  id: string;
}

export class PriceSnapshot {
  readonly id: string;
  readonly productId: string;
  readonly price: number;
  readonly timestamp: Date;

  private constructor(input: PriceSnapshotPersistenceInput) {
    this.id = input.id;
    this.productId = input.productId;
    this.price = input.price;
    this.timestamp = input.timestamp ?? new Date();
  }

  static create(input: PriceSnapshotCreateInput): PriceSnapshot {
    return new PriceSnapshot({ ...input, id: crypto.randomUUID() });
  }

  static fromPersistence(input: PriceSnapshotPersistenceInput): PriceSnapshot {
    return new PriceSnapshot(input);
  }
}
