import { Module } from '@nestjs/common';
import { ProductRepository, IProductRepository } from '@app/shared/products';
import { IPriceSnapshotRepository } from './repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotRepository } from './repositories/price-snapshot.repository';
import { DbModule } from '../db';
import { ProductService } from './product.service';
import { PriceSnapshotService } from './price-snapshot.service';

@Module({
  imports: [DbModule],
  controllers: [],
  providers: [
    ProductService,
    PriceSnapshotService,
    { provide: IProductRepository, useClass: ProductRepository },
    {
      provide: IPriceSnapshotRepository,
      useClass: PriceSnapshotRepository,
    },
  ],
  exports: [
    ProductService,
    PriceSnapshotService,
    IProductRepository,
    IPriceSnapshotRepository,
  ],
})
export class ProductsModule {}
