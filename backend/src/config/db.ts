import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import env from './env';

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error('[Database] Unexpected error on idle PostgreSQL client:', err.message);
});

export const testDbConnection = async (): Promise<boolean> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time');
    console.log(`[Database] PostgreSQL connected successfully. Server time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Database] PostgreSQL connection failed: ${message}`);
    console.error('[Database] Please verify DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.');
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const query = <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export default pool;
