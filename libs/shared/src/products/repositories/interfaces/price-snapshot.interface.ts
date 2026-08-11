import { PriceSnapshot } from '../../entities/price-snapshot.entity';

export abstract class IPriceSnapshotRepository {
  abstract create(snapshot: PriceSnapshot): Promise<PriceSnapshot>;
  abstract findAll(): Promise<PriceSnapshot[]>;
  abstract findById(id: string): Promise<PriceSnapshot | null>;
  abstract update(snapshot: PriceSnapshot): Promise<PriceSnapshot | null>;
  abstract delete(id: string): Promise<boolean>;
}
