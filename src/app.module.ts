import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AlertRulesModule } from './alert-rules/alert-rules.module';

@Module({
  imports: [ProductsModule, AlertRulesModule],
})
export class AppModule {}
