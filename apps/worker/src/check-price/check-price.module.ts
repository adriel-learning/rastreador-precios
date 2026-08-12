import { Module } from '@nestjs/common';
import { CheckPriceProcessor } from './check-price.processor';
import { BullModule } from '@nestjs/bullmq';
import {
  CHECK_PRICE_QUEUE,
  CHECK_PRICE_DLQ,
} from '@app/shared/queues/check-price.contract';
import { PriceCheckerModule } from '@app/shared/price-checker/price-checker.module';
import { CheckPriceDlqProcessor } from './check-price-dlq.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: CHECK_PRICE_QUEUE,
      },
      {
        name: CHECK_PRICE_DLQ,
      },
    ),
    PriceCheckerModule,
  ],
  providers: [CheckPriceProcessor, CheckPriceDlqProcessor],
})
export class CheckPriceModule {}
