import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { IPriceSnapshotRepository } from '../products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotRepository } from '../products/repositories/price-snapshot.repository';
import { MegatoneScraper } from 'apps/worker/src/scraping/strategies/megatone.scraper';
import { HttpModule } from '@nestjs/axios';
import { PriceCheckerService } from './price-checker.service';

@Module({
  imports: [ProductsModule, HttpModule],
  providers: [
    {
      provide: IPriceSnapshotRepository,
      useClass: PriceSnapshotRepository,
    },
    MegatoneScraper,
    PriceCheckerService,
  ],
  exports: [PriceCheckerService],
})
export class PriceCheckerModule {}
