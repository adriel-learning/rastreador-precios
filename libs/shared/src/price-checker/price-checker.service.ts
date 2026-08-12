import { Injectable } from '@nestjs/common';
import { ProductService } from '../products/product.service';
import { IPriceSnapshotRepository } from '../products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';
import { ScraperRegistry } from 'apps/worker/src/scraper/scraper-registry.service';

@Injectable()
export class PriceCheckerService {
  constructor(
    private readonly productsService: ProductService,
    private readonly scraperRegistry: ScraperRegistry,
    private readonly priceSnapshotRepository: IPriceSnapshotRepository,
  ) {}

  async execute(productId: string): Promise<PriceSnapshot> {
    const product = await this.productsService.findById(productId);
    const scraper = this.scraperRegistry.resolve(product.site);
    const price = await scraper.getPrice(product.url);
    const snapshot = PriceSnapshot.create({
      productId,
      price,
    });
    return this.priceSnapshotRepository.create(snapshot);
  }
}
