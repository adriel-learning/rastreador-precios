import { Injectable } from '@nestjs/common';
import { IPriceSnapshotRepository } from './repositories/interfaces/price-snapshot.interface';

export interface PricePoint {
  price: number;
  timestamp: Date;
}

@Injectable()
export class PriceSnapshotService {
  constructor(
    private readonly priceSnapshotRepository: IPriceSnapshotRepository,
  ) {}

  findLatestPerProduct() {
    return this.priceSnapshotRepository.findLatestPerProduct();
  }

  async findByProduct(productId: string, limit: number): Promise<PricePoint[]> {
    const snapshots = await this.priceSnapshotRepository.findByProduct(
      productId,
      limit,
    );

    return snapshots.reverse().map((snapshot) => ({
      price: snapshot.price,
      timestamp: snapshot.timestamp,
    }));
  }
}
