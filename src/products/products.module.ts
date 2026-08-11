import { Module } from '@nestjs/common';
import { ProductRepository, IProductRepository } from '@app/shared/products';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MegatoneScraper } from 'src/scraping/strategies/megatone.scraper';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: IProductRepository, useClass: ProductRepository },
    MegatoneScraper,
  ],
  exports: [ProductService],
})
export class ProductsModule {}
