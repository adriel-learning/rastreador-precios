import { BaseEnv } from '@app/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DbService {
  readonly db: NodePgDatabase;

  private readonly pool: Pool;

  constructor(config: ConfigService<BaseEnv>) {
    this.pool = new Pool({
      host: config.get('DATABASE_HOST', { infer: true }),
      port: config.get('DATABASE_PORT', { infer: true }),
      user: config.get('DATABASE_USER', { infer: true }),
      password: config.get('DATABASE_PASS', { infer: true }),
      database: config.get('DATABASE_NAME', { infer: true }),
    });

    this.db = drizzle({ client: this.pool });
  }
}
