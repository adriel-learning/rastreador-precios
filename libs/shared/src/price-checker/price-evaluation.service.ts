import { Injectable } from '@nestjs/common';
import { DbClient } from '@app/shared/db';
import { IProductRepository, Product } from '../products';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';
import { ConfigService } from '@nestjs/config';
import { BaseEnv } from '../config';
import { AlertRulesService } from '../alert-rules/alert-rules.service';
import { AlertRule } from '../alert-rules/entities/alert-rule.entity';

@Injectable()
export class PriceEvaluationService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly configService: ConfigService<BaseEnv>,
    private readonly alertRulesService: AlertRulesService,
  ) {}

  async evaluate(
    product: Product,
    snapshot: PriceSnapshot,
    db?: DbClient,
  ): Promise<AlertRule | null> {
    if (!product.highestPrice) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product, db);
      return null;
    }

    if (product.highestPrice < snapshot.price) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product, db);
    }

    const TARGET_PERCENT = this.configService.get('TARGET_PERCENT', {
      infer: true,
    })!;

    const umbralPrice = (product.highestPrice * (100 - TARGET_PERCENT)) / 100;
    const priceIsLow = snapshot.price < umbralPrice;

    return await this.alertRulesService.handleEvaluationPrice(
      product,
      snapshot,
      priceIsLow,
      db,
    );
  }
}
