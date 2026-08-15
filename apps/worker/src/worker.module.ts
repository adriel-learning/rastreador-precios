import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env, envSchema } from '../config/env.schema';
import { CheckPriceModule } from './check-price/check-price.module';
import { DbModule } from '@app/shared/db';
import { LoggerModule } from '@app/shared/logger';
import { AlertNotificationModule } from './alert-notification/alert-notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    LoggerModule,
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
    AlertNotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class WorkerModule {}
