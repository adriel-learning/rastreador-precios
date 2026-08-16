import { BaseEnv } from '@app/shared/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmptyRelations } from 'drizzle-orm';
import {
  drizzle,
  NodePgDatabase,
  NodePgTransaction,
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export type DbClient = NodePgDatabase | NodePgTransaction<EmptyRelations>;

@Injectable()
export class DbService {
  readonly db: NodePgDatabase;

  private readonly pool: Pool;

  constructor(config: ConfigService<BaseEnv>) {
    this.pool = new Pool({
      host: config.get('DB_HOST', { infer: true }),
      port: config.get('DB_PORT', { infer: true }),
      user: config.get('DB_USER', { infer: true }),
      password: config.get('DB_PASS', { infer: true }),
      database: config.get('DB_NAME', { infer: true }),
    });

    this.db = drizzle({ client: this.pool });
  }

  async transaction<T>(
    fn: (tx: NodePgTransaction<EmptyRelations>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(fn);
  }
}
