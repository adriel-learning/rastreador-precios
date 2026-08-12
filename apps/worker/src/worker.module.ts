import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env, envSchema } from '../config/env.schema';
import { CheckPriceModule } from './check-price/check-price.module';
import { DbModule } from '@app/shared/db';
import { ScraperModule } from './scraper/scraper.module';

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
    CheckPriceModule,
    ScraperModule,
  ],
  controllers: [],
  providers: [],
})
export class WorkerModule {}
