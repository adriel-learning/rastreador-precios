import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, IProductRepository } from '@app/shared/products';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { PriceSnapshot } from './entities/price-snapshot.entity';
import { MegatoneScraper } from 'src/scraping/strategies/megatone.scraper';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly megatoneScraper: MegatoneScraper,
  ) {}

  create(dto: CreateProductDto): Promise<Product> {
    const product = Product.create(dto);
    return this.productRepository.create(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    product.updateDetails(dto);

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

  async check(id: string): Promise<PriceSnapshot> {
    const product = await this.findById(id);
    const price = await this.megatoneScraper.getPrice(product.url);
    return PriceSnapshot.create({
      price,
      productId: id,
    });
  }
}
