import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, IProductRepository } from '@app/shared/products';
import { PricePoint, PriceSnapshotService } from './price-snapshot.service';
import { CreateProductInput } from './schemas/create-product.schema';
import { UpdateProductInput } from './schemas/update-product.schema';

export type ProductWithPrice = Omit<
  Product,
  'updateDetails' | 'updateHighestPrice'
> & {
  currentPrice: number | null;
  lastCheckedAt: Date | null;
};

export type ProductDetails = ProductWithPrice & {
  priceHistory: PricePoint[];
};

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly priceSnapshotService: PriceSnapshotService,
  ) {}

  create(input: CreateProductInput): Promise<Product> {
    const product = Product.create(input);
    return this.productRepository.create(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findAllWithPrice(): Promise<ProductWithPrice[]> {
    const [products, latestSnapshots] = await Promise.all([
      this.productRepository.findAll(),
      this.priceSnapshotService.findLatestPerProduct(),
    ]);
    const latestByProduct = new Map(
      latestSnapshots.map((snapshot) => [snapshot.productId, snapshot]),
    );

    return products.map((product) => {
      const latest = latestByProduct.get(product.id);
      return {
        ...product,
        currentPrice: latest?.price ?? null,
        lastCheckedAt: latest?.timestamp ?? null,
      };
    });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  async findByIdWithDetails(
    id: string,
    limit: number,
  ): Promise<ProductDetails> {
    const [product, priceHistory] = await Promise.all([
      this.findById(id),
      this.priceSnapshotService.findByProduct(id, limit),
    ]);

    const latest = priceHistory[priceHistory.length - 1];

    return {
      ...product,
      currentPrice: latest?.price ?? null,
      lastCheckedAt: latest?.timestamp ?? null,
      priceHistory,
    };
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.findById(id);
    product.updateDetails(input);

    const updated = await this.productRepository.update(product);
    if (!updated) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ id: string }> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return { id };
  }
}
