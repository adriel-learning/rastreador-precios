import { Injectable } from '@nestjs/common';
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
  ) {}

  async execute(productId: string): Promise<PriceSnapshot> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new Error(`El producto del id ${productId} no existe`);

    const scraper = this.scraperRegistry.resolve(product.site);
    const price = await scraper.getPrice(product.url);
    const snapshot = PriceSnapshot.create({
      productId,
      price,
    });
    await this.priceEvaluationService.evaluate(product, snapshot);
    return this.priceSnapshotRepository.create(snapshot);
  }
}
