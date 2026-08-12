import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { IPriceSnapshotRepository } from '../products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotRepository } from '../products/repositories/price-snapshot.repository';
import { HttpModule } from '@nestjs/axios';
import { PriceCheckerService } from './price-checker.service';
import { ScraperModule } from 'apps/worker/src/scraper/scraper.module';

@Module({
  imports: [ProductsModule, HttpModule, ScraperModule],
  providers: [
    {
      provide: IPriceSnapshotRepository,
      useClass: PriceSnapshotRepository,
    },
    PriceCheckerService,
  ],
  exports: [PriceCheckerService],
})
export class PriceCheckerModule {}
