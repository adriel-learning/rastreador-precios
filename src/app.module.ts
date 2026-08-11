import { Module } from '@nestjs/common';
import { DbModule } from '@app/shared/db';
import { ProductsModule } from './products/products.module';
import { AlertRulesModule } from './alert-rules/alert-rules.module';

@Module({
  imports: [DbModule, ProductsModule, AlertRulesModule],
})
export class AppModule {}
