import { DbClient } from '@app/shared/db';
import { PriceSnapshot } from '../../entities/price-snapshot.entity';

export abstract class IPriceSnapshotRepository {
  abstract create(
    snapshot: PriceSnapshot,
    db?: DbClient,
  ): Promise<PriceSnapshot>;
  abstract findAll(): Promise<PriceSnapshot[]>;
  abstract findById(id: string): Promise<PriceSnapshot | null>;
  abstract findLatestPerProduct(): Promise<
    Array<{ productId: string; price: number; timestamp: Date }>
  >;
  abstract findByProduct(
    productId: string,
    limit: number,
  ): Promise<PriceSnapshot[]>;
  abstract update(snapshot: PriceSnapshot): Promise<PriceSnapshot | null>;
  abstract delete(id: string): Promise<boolean>;
}
