import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@app/config';
import { DbService } from './db.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
  ],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
