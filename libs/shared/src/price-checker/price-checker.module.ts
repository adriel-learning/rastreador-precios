import { Module } from '@nestjs/common';
import { IPriceSnapshotRepository } from '../products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotRepository } from '../products/repositories/price-snapshot.repository';
import { HttpModule } from '@nestjs/axios';
import { PriceCheckerService } from './price-checker.service';
import { ScraperModule } from '../scraper/scraper.module';
import { PriceEvaluationService } from './price-evaluation.service';
import { IProductRepository, ProductRepository } from '../products';
import { BullModule } from '@nestjs/bullmq';
import { ALERT_QUEUE } from '../queues/alert-notification.contract';

@Module({
  imports: [
    HttpModule,
    ScraperModule,
    BullModule.registerQueue({
      name: ALERT_QUEUE,
    }),
  ],
  providers: [
    {
      provide: IPriceSnapshotRepository,
      useClass: PriceSnapshotRepository,
    },
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
    PriceCheckerService,
    PriceEvaluationService,
  ],
  exports: [PriceCheckerService, PriceEvaluationService],
})
export class PriceCheckerModule {}
