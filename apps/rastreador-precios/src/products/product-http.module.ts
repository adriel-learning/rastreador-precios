import { IProductRepository, ProductRepository } from '@app/shared/products';
import { ProductService } from '@app/shared/products/product.service';
import { ProductsModule } from '@app/shared/products/products.module';
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';

@Module({
  imports: [ProductsModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
  ],
})
export class ProductHttpModule {}
