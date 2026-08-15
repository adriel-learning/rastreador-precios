import {
  CHECK_PRICE_DLQ,
  CheckPriceContract,
  CheckPriceDlqContract,
} from '@app/shared/queues/check-price.contract';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from 'nestjs-pino';
import { Job } from 'bullmq';

@Processor(CHECK_PRICE_DLQ)
export class CheckPriceDlqProcessor extends WorkerHost {
  constructor(private readonly logger: Logger) {
    super();
  }

  async process(job: Job<CheckPriceDlqContract<CheckPriceContract>>) {
    this.logger.error(job.data, `Job ${job.data.originalJobId} movido a DLQ`);
  }
}