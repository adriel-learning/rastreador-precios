import { Injectable } from '@nestjs/common';
import { DbService, DbClient } from '@app/shared/db';
import { eq } from 'drizzle-orm';
import { IPriceSnapshotRepository } from './interfaces/price-snapshot.interface';
import { PriceSnapshot } from '../entities/price-snapshot.entity';
import { priceSnapshots } from '@app/shared/db/schema';

@Injectable()
export class PriceSnapshotRepository extends IPriceSnapshotRepository {
  constructor(private readonly dbService: DbService) {
    super();
  }

  async create(
    priceSnapshot: PriceSnapshot,
    db: DbClient = this.dbService.db,
  ): Promise<PriceSnapshot> {
    const [row] = await db
      .insert(priceSnapshots)
      .values({
        price: priceSnapshot.price,
        productId: priceSnapshot.productId,
      })
      .returning();

    return PriceSnapshot.fromPersistence(row);
  }

  async findAll(): Promise<PriceSnapshot[]> {
    const rows = await this.dbService.db.select().from(priceSnapshots);

    return rows.map((row) => PriceSnapshot.fromPersistence(row));
  }

  async findById(id: string): Promise<PriceSnapshot | null> {
    const [row] = await this.dbService.db
      .select()
      .from(priceSnapshots)
      .where(eq(priceSnapshots.id, id));

    return row ? PriceSnapshot.fromPersistence(row) : null;
  }

  async update(priceSnapshot: PriceSnapshot): Promise<PriceSnapshot | null> {
    const [row] = await this.dbService.db
      .update(priceSnapshots)
      .set({
        price: priceSnapshot.price,
      })
      .where(eq(priceSnapshots.id, priceSnapshot.id))
      .returning();

    return row ? PriceSnapshot.fromPersistence(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.dbService.db
      .delete(priceSnapshots)
      .where(eq(priceSnapshots.id, id))
      .returning({ id: priceSnapshots.id });

    return rows.length > 0;
  }
}
