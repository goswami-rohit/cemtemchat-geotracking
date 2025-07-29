// backend/src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless'; // Make sure to install this if you're using Neon's serverless driver
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// For Neon Serverless Driver (recommended for serverless environments, or simple Node.js apps)
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

// If you prefer the standard 'pg' driver:
/*
import { Pool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/pg';

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzlePg(pool, { schema });
*/