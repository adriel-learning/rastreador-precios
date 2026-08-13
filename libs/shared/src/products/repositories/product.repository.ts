import { Injectable } from '@nestjs/common';
import { DbService } from '@app/shared/db';
import { eq } from 'drizzle-orm';
import { products } from '@app/shared/db/schemas/product.schema';
import { Product } from '../entities/product.entity';
import { IProductRepository } from './interfaces/product-repository.interface';

@Injectable()
export class ProductRepository extends IProductRepository {
  constructor(private readonly dbService: DbService) {
    super();
  }

  async create(product: Product): Promise<Product> {
    const [row] = await this.dbService.db
      .insert(products)
      .values({ url: product.url, site: product.site, name: product.name })
      .returning();

    return Product.fromPersistence(row);
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.dbService.db.select().from(products);

    return rows.map((row) => Product.fromPersistence(row));
  }

  async findById(id: string): Promise<Product | null> {
    const [row] = await this.dbService.db
      .select()
      .from(products)
      .where(eq(products.id, id));

    return row ? Product.fromPersistence(row) : null;
  }

  async update(product: Product): Promise<Product | null> {
    const [row] = await this.dbService.db
      .update(products)
      .set({
        url: product.url,
        site: product.site,
        name: product.name,
        highestPrice: product.highestPrice,
      })
      .where(eq(products.id, product.id))
      .returning();

    return row ? Product.fromPersistence(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.dbService.db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return rows.length > 0;
  }
}
