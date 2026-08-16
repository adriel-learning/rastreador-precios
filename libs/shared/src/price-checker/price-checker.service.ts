import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DbService } from '@app/shared/db';
import { ALERT_JOB, ALERT_QUEUE } from '../queues/alert-notification.contract';
import { IPriceSnapshotRepository } from '../products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';
import { ScraperRegistry } from '../scraper/scraper-registry.service';
import { PriceEvaluationService } from './price-evaluation.service';
import { IProductRepository } from '../products';

@Injectable()
export class PriceCheckerService {
  constructor(
    private readonly scraperRegistry: ScraperRegistry,
    private readonly priceEvaluationService: PriceEvaluationService,
    private readonly productRepository: IProductRepository,
    private readonly priceSnapshotRepository: IPriceSnapshotRepository,
    private readonly dbService: DbService,
    @InjectQueue(ALERT_QUEUE)
    private readonly alertQueue: Queue,
  ) {}

  async execute(productId: string): Promise<PriceSnapshot> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new Error(`El producto del id ${productId} no existe`);

    const scraper = this.scraperRegistry.resolve(product.site);
    const price = await scraper.getPrice(product.url);

    const { snapshot, alert } = await this.dbService.transaction(async (tx) => {
      const snapshot = await this.priceSnapshotRepository.create(
        PriceSnapshot.create({
          productId,
          price,
        }),
        tx,
      );
      const alert = await this.priceEvaluationService.evaluate(
        product,
        snapshot,
        tx,
      );
      return { snapshot, alert };
    });

    if (alert) {
      await this.alertQueue.add(
        ALERT_JOB,
        {
          alertId: alert.id,
          triggerPrice: snapshot.price,
        },
        {
          attempts: 3,
          backoff: {
            delay: 5000,
            type: 'exponential',
          },
        },
      );
    }

    return snapshot;
  }
}
