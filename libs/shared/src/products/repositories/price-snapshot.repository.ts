import { Injectable } from '@nestjs/common';
import { DbService, DbClient } from '@app/shared/db';
import { desc, eq, sql } from 'drizzle-orm';
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

  async findLatestPerProduct(): Promise<
    Array<{ productId: string; price: number; timestamp: Date }>
  > {
    const rows = await this.dbService.db
      .select()
      .from(priceSnapshots)
      .where(
        sql`(${priceSnapshots.productId}, ${priceSnapshots.timestamp}) IN (
          SELECT product_id, MAX(timestamp)
          FROM ${priceSnapshots}
          GROUP BY product_id
        )`,
      );

    return rows.map((row) => ({
      productId: row.productId,
      price: row.price,
      timestamp: row.timestamp,
    }));
  }

  async findByProduct(
    productId: string,
    limit: number,
  ): Promise<PriceSnapshot[]> {
    const rows = await this.dbService.db
      .select()
      .from(priceSnapshots)
      .where(eq(priceSnapshots.productId, productId))
      .orderBy(desc(priceSnapshots.timestamp))
      .limit(limit);

    return rows.map((row) => PriceSnapshot.fromPersistence(row));
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
