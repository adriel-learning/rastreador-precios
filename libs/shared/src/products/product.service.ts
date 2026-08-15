import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, IProductRepository } from '@app/shared/products';
import { CreateProductInput } from './schemas/create-product.schema';
import { UpdateProductInput } from './schemas/update-product.schema';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  create(input: CreateProductInput): Promise<Product> {
    const product = Product.create(input);
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
