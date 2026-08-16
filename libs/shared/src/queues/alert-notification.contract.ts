export const ALERT_QUEUE = 'alert-queue';
export const ALERT_JOB = 'alert-job';

export const ALERT_DLQ = 'alert-dead-letter-queue';
export const ALERT_DLQ_JOB = 'alert-dead-letter-job';

export interface AlertContract {
  alertId: string;
  triggerPrice: number;
}

export interface AlertDlqContract {
  originalJobId: string;
  data: AlertContract;
  error: string;
}
