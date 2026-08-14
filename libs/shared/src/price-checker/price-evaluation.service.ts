import { Injectable } from '@nestjs/common';
import { IProductRepository, Product } from '../products';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';
import { ConfigService } from '@nestjs/config';
import { BaseEnv } from '../config';
import { InjectQueue } from '@nestjs/bullmq';
import { ALERT_JOB, ALERT_QUEUE } from '../queues/alert-notification.contract';
import { Queue } from 'bullmq';
import { AlertRulesService } from '../alert-rules/alert-rules.service';

@Injectable()
export class PriceEvaluationService {
  constructor(
    @InjectQueue(ALERT_QUEUE)
    private readonly alertQueue: Queue,
    private readonly productRepository: IProductRepository,
    private readonly configService: ConfigService<BaseEnv>,
    private readonly alertRulesService: AlertRulesService,
  ) {}

  async evaluate(product: Product, snapshot: PriceSnapshot) {
    if (!product.highestPrice) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product);
      return;
    }

    if (product.highestPrice < snapshot.price) {
      product.updateHighestPrice(snapshot.price);
      await this.productRepository.update(product);
      console.log('Nuevo precio máximo histórico para:\n', product.name);
    }

    const TARGET_PERCENT = this.configService.get('TARGET_PERCENT', {
      infer: true,
    })!;

    const umbralPrice = (product.highestPrice * (100 - TARGET_PERCENT)) / 100;
    const priceIsLow = snapshot.price < umbralPrice;
    const alert = await this.alertRulesService.handleEvaluationPrice(
      product,
      snapshot,
      priceIsLow,
    );

    if (alert) {
      await this.alertQueue.add(ALERT_JOB, {
        alertId: alert.id,
        triggerPrice: snapshot.price,
      });
    }
  }
}
