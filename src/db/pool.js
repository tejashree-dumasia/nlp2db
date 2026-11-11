import pg from 'pg';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import { config } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('[DB EXCEPTION] Unexpected error on idle database client', err);
  process.exit(-1);
});

// Cross-platform check to see if this file is run directly
const isMain = process.argv[1] === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  (async () => {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() AS current_time');
      console.log('✅ Successfully connected to PostgreSQL:', res.rows[0].current_time);
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    } finally {
      await pool.end();
    }
  })();
}