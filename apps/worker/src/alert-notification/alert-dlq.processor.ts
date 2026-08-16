import {
  ALERT_DLQ,
  AlertDlqContract,
} from '@app/shared/queues/alert-notification.contract';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from 'nestjs-pino';
import { Job } from 'bullmq';

@Processor(ALERT_DLQ)
export class AlertDlqProcessor extends WorkerHost {
  constructor(private readonly logger: Logger) {
    super();
  }

  process(job: Job<AlertDlqContract>): Promise<void> {
    this.logger.error(job.data, `Job ${job.data.originalJobId} movido a DLQ`);
    return Promise.resolve();
  }
}
