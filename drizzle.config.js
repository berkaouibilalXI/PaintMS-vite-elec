import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/main/server/drizzle/schemas',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.M_VITE_DATABASE_URL,
  },
});
