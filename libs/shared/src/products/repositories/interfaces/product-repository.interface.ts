import { DbClient } from '@app/shared/db';
import { Product } from '../../entities/product.entity';

export abstract class IProductRepository {
  abstract create(product: Product): Promise<Product>;
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract update(product: Product, db?: DbClient): Promise<Product | null>;
  abstract delete(id: string): Promise<boolean>;
}
