import { Injectable } from '@nestjs/common';
import { IProductRepository, Product } from '../products';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';

@Injectable()
export class PriceEvaluationService {
  constructor(private readonly productRepository: IProductRepository) {}

  async evaluate(product: Product, snapshot: PriceSnapshot) {
    if (product.highestPrice && product.highestPrice < snapshot.price) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product);
      console.log('Nuevo precio para:\n', product);
    }
  }
}
