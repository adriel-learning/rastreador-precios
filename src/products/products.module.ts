import { Module } from '@nestjs/common';
import { ProductRepository, IProductRepository } from '@app/shared/products';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MegatoneScraper } from 'src/scraping/strategies/megatone.scraper';
import { HttpModule } from '@nestjs/axios';
import { IPriceSnapshotRepository } from '@app/shared/products/repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotRepository } from '@app/shared/products/repositories/price-snapshot.repository';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: IProductRepository, useClass: ProductRepository },
    { provide: IPriceSnapshotRepository, useClass: PriceSnapshotRepository },
    MegatoneScraper,
  ],
  exports: [ProductService],
})
export class ProductsModule {}
