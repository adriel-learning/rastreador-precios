import { Injectable } from '@nestjs/common';
import { ProductService } from '../products/product.service';
import { MegatoneScraper } from 'apps/worker/src/scraping/strategies/megatone.scraper';
import { IPriceSnapshotRepository } from '../products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshot } from '../products/entities/price-snapshot.entity';

@Injectable()
export class PriceCheckerService {
  constructor(
    private readonly productsService: ProductService,
    private readonly megatoneScraper: MegatoneScraper,
    private readonly priceSnapshotRepository: IPriceSnapshotRepository,
  ) {}

  async execute(productId: string): Promise<PriceSnapshot> {
    const product = await this.productsService.findById(productId);
    const price = await this.megatoneScraper.getPrice(product.url);
    const snapshot = PriceSnapshot.create({
      productId,
      price,
    });
    return this.priceSnapshotRepository.create(snapshot);
  }
}
