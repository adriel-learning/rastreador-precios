import {
  CHECK_PRICE_QUEUE,
  CheckPriceContract,
} from '@app/shared/queues/check-price.contract';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PriceCheckerService } from '@app/shared/price-checker/price-checker.service';

@Processor(CHECK_PRICE_QUEUE)
export class CheckPriceProcessor extends WorkerHost {
  constructor(private readonly priceCheckerService: PriceCheckerService) {
    super();
  }

  async process(job: Job<CheckPriceContract>) {
    const snapshot = await this.priceCheckerService.execute(job.data.productId);
    console.log(snapshot);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<CheckPriceContract>, error: Error) {
    console.log(job.data, job.attemptsMade, job.id);
    console.log(error.message);
  }
}
