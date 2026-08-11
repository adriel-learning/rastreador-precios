import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const name = process.env.DB_NAME;
const pass = process.env.DB_PASS;
const user = process.env.DB_USER;
const port = process.env.DB_PORT;
const host = process.env.DB_HOST;
const url = `postgresql://${user}:${pass}@${host}:${port}/${name}`;

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./libs/shared/src/db/schema.ts'],
  out: './drizzle',
  dbCredentials: {
    url,
  },
});
