import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PriceCheckerService } from './price-checker.service';
import { ScraperModule } from '../scraper/scraper.module';
import { PriceEvaluationService } from './price-evaluation.service';
import { ProductsModule } from '../products/products.module';
import { BullModule } from '@nestjs/bullmq';
import { ALERT_QUEUE } from '../queues/alert-notification.contract';
import { AlertRulesModule } from '../alert-rules/alert-rules.module';

@Module({
  imports: [
    HttpModule,
    ScraperModule,
    BullModule.registerQueue({
      name: ALERT_QUEUE,
    }),
    AlertRulesModule,
    ProductsModule,
  ],
  providers: [PriceCheckerService, PriceEvaluationService],
  exports: [PriceCheckerService, PriceEvaluationService],
})
export class PriceCheckerModule {}