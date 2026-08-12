import {
  CHECK_PRICE_DLQ,
  CheckPriceContract,
  CheckPriceDlqContract,
} from '@app/shared/queues/check-price.contract';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(CHECK_PRICE_DLQ)
export class CheckPriceDlqProcessor extends WorkerHost {
  async process(job: Job<CheckPriceDlqContract<CheckPriceContract>>) {
    await new Promise((res) => {
      console.log(job.data);
      res(null);
    });
  }
}
