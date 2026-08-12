import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env, envSchema } from '../config/env.schema';
import { CheckPriceModule } from './check-price/check-price.module';
import { MegatoneScraper } from './scraping/strategies/megatone.scraper';
import { HttpModule } from '@nestjs/axios';
import { ProductsModule } from '@app/shared/products/products.module';
import { DbModule } from '@app/shared/db';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    DbModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', { infer: true }),
          port: configService.get<number>('REDIS_PORT', { infer: true }),
        },
      }),
    }),
    HttpModule, // Actualmente lo necesitamos para ./scraping/megatone.scraper ya que no tiene su propio modulo
    CheckPriceModule,
  ],
  controllers: [],
  providers: [MegatoneScraper],
})
export class WorkerModule {}
