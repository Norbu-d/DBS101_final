import pg from 'pg';
import { config } from 'dotenv';

config();
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 20,          // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add connection health check
pool.on('connect', () => console.log('New client connected'));
pool.on('remove', () => console.log('Client disconnected'));

export default pool;