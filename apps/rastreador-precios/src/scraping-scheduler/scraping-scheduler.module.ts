import { Module } from '@nestjs/common';
import { ScrapingSchedulerService } from './scraping-scheduler.service';
import { ProductsModule } from '@app/shared/products/products.module';
import { BullModule } from '@nestjs/bullmq';
import { CHECK_PRICE_QUEUE } from '@app/shared/queues/check-price.contract';

@Module({
  imports: [
    ProductsModule,
    BullModule.registerQueue({
      name: CHECK_PRICE_QUEUE,
    }),
  ],
  providers: [ScrapingSchedulerService],
})
export class ScrapingSchedulerModule {}
