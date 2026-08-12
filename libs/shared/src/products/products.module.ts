import { Module } from '@nestjs/common';
import { ProductRepository, IProductRepository } from '@app/shared/products';
import { ProductService } from './product.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ProductService,
    { provide: IProductRepository, useClass: ProductRepository },
  ],
  exports: [ProductService],
})
export class ProductsModule {}
