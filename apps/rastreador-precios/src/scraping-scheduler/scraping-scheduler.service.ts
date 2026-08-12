import { ProductService } from '@app/shared/products/product.service';
import { CHECK_PRICE_JOB } from '@app/shared/queues/check-price.contract';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class ScrapingSchedulerService {
  constructor(
    private readonly productService: ProductService,
    @InjectQueue('check-price')
    private readonly checkPriceQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async scrapingProducts() {
    const products = await this.productService.findAll();
    await this.checkPriceQueue.addBulk(
      products.map((p) => ({
        name: CHECK_PRICE_JOB,
        data: { productId: p.id },
        opts: {
          attempts: 3,
          backoff: {
            delay: 5000,
            type: 'exponential',
          },
        },
      })),
    );
  }
}
