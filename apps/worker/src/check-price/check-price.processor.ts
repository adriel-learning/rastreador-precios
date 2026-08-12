import {
  CHECK_PRICE_DLQ,
  CHECK_PRICE_DLQ_JOB,
  CHECK_PRICE_QUEUE,
  CheckPriceContract,
} from '@app/shared/queues/check-price.contract';
import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PriceCheckerService } from '@app/shared/price-checker/price-checker.service';

@Processor(CHECK_PRICE_QUEUE)
export class CheckPriceProcessor extends WorkerHost {
  constructor(
    private readonly priceCheckerService: PriceCheckerService,
    @InjectQueue(CHECK_PRICE_DLQ)
    private readonly checkPriceDlq: Queue,
  ) {
    super();
  }

  async process(job: Job<CheckPriceContract>) {
    const snapshot = await this.priceCheckerService.execute(job.data.productId);
    console.log(snapshot);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<CheckPriceContract>, error: Error) {
    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade >= attempts)
      await this.checkPriceDlq.add(CHECK_PRICE_DLQ_JOB, {
        originalJobId: job.id,
        data: job.data,
        error: error.message,
      });
  }
}
