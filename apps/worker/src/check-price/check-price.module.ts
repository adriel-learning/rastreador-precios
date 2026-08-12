import { Module } from '@nestjs/common';
import { CheckPriceProcessor } from './check-price.processor';
import { BullModule } from '@nestjs/bullmq';
import { CHECK_PRICE_QUEUE } from '@app/shared/queues/check-price.contract';
import { PriceCheckerModule } from '@app/shared/price-checker/price-checker.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CHECK_PRICE_QUEUE,
    }),
    PriceCheckerModule,
  ],
  providers: [CheckPriceProcessor],
})
export class CheckPriceModule {}
