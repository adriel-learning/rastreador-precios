import { Module } from '@nestjs/common';
import { ProductsModule } from '@app/shared/products/products.module';
import { ProductController } from './product.controller';

@Module({
  imports: [ProductsModule],
  controllers: [ProductController],
})
export class ProductHttpModule {}
