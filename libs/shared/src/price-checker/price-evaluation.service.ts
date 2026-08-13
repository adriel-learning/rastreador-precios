import { Injectable } from '@nestjs/common';
import { IProductRepository, Product } from '../products';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';
import { ConfigService } from '@nestjs/config';
import { BaseEnv } from '../config';

@Injectable()
export class PriceEvaluationService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly configService: ConfigService<BaseEnv>,
  ) {}

  async evaluate(product: Product, snapshot: PriceSnapshot) {
    const TARGET_PERCENT = this.configService.get('TARGET_PERCENT', {
      infer: true,
    })!;

    if (!product.highestPrice) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product);
    } else if (product.highestPrice < snapshot.price) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product);
      console.log('Nuevo precio máximo histórico para:\n', product);
    } else if ((snapshot.price * 100) / product.highestPrice > TARGET_PERCENT) {
      console.log('EL PRECIO ESTÁ EN REBAJA!');
    }
  }
}
