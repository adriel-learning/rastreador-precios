import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductCreateInput } from './entities/product.entity';
import {
  PriceSnapshot,
  PriceSnapshotCreateInput,
} from './entities/price-snapshot.entity';

@Injectable()
export class ProductService {
  private readonly products = new Map<string, Product>();
  private readonly snapshotsByProduct = new Map<string, PriceSnapshot[]>();

  createProduct(input: ProductCreateInput): Product {
    const product = Product.create(input);
    this.products.set(product.id, product);
    return product;
  }

  getProduct(productId: string): Product {
    const product = this.products.get(productId);
    if (!product) {
      throw new NotFoundException(`Producto ${productId} no encontrado`);
    }
    return product;
  }

  registerSnapshot(input: PriceSnapshotCreateInput): PriceSnapshot {
    this.getProduct(input.productId);
    const snapshot = PriceSnapshot.create(input);
    const list = this.snapshotsByProduct.get(input.productId) ?? [];
    list.push(snapshot);
    this.snapshotsByProduct.set(input.productId, list);
    return snapshot;
  }

  getSnapshots(productId: string): PriceSnapshot[] {
    this.getProduct(productId);
    return this.snapshotsByProduct.get(productId) ?? [];
  }
}
