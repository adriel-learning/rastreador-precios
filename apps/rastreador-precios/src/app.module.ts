import { Module } from '@nestjs/common';
import { DbModule } from '@app/shared/db';
import { AlertRulesModule } from './alert-rules/alert-rules.module';
import { ScrapingSchedulerModule } from './scraping-scheduler/scraping-scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductHttpModule } from './products/product-http.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env, envSchema } from '../config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    DbModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', { infer: true }),
          port: config.get<number>('REDIS_PORT', { infer: true }),
        },
      }),
    }),
    AlertRulesModule,
    ProductHttpModule,
    ScrapingSchedulerModule,
  ],
})
export class AppModule {}
