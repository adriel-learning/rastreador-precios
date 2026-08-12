export const CHECK_PRICE_QUEUE = 'check-price';
export const CHECK_PRICE_JOB = 'check-price-job';

export const CHECK_PRICE_DLQ = 'check-price-dead-letter-queue';
export const CHECK_PRICE_DLQ_JOB = 'check-price-dead-letter-job';

export interface CheckPriceContract {
  productId: string;
}

export interface CheckPriceDlqContract<T> {
  originalJobId: string;
  data: T;
  error: string;
}
