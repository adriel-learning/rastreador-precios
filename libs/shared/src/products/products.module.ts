import { Module } from '@nestjs/common';
import { ProductRepository, IProductRepository } from '@app/shared/products';
import { IPriceSnapshotRepository } from './repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotRepository } from './repositories/price-snapshot.repository';
import { DbModule } from '../db';
import { ProductService } from './product.service';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [
    ProductService,
    { provide: IProductRepository, useClass: ProductRepository },
    {
      provide: IPriceSnapshotRepository,
      useClass: PriceSnapshotRepository,
    },
  ],
  exports: [ProductService, IProductRepository, IPriceSnapshotRepository],
})
export class ProductsModule {}
