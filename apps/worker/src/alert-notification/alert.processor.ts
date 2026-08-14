import {
  ALERT_QUEUE,
  AlertContract,
} from '@app/shared/queues/alert-notification.contract';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(ALERT_QUEUE)
export class AlertProcessor extends WorkerHost {
  async process(job: Job<AlertContract>): Promise<any> {
    await new Promise((res) => {
      console.log(`BAJARON LOS PRECIOS DE:\n`, { job: job.data });
      res(null);
    });
  }
}
