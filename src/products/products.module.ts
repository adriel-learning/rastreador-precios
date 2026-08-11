import { Module } from '@nestjs/common';
import { ProductRepository, IProductRepository } from '@app/products';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: IProductRepository, useClass: ProductRepository },
  ],
  exports: [ProductService],
})
export class ProductsModule {}
