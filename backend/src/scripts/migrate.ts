import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

export const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('[Migration] Checking migrations status...');

    // 1. Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch already applied migrations
    const { rows: appliedRows } = await client.query<{ name: string }>(
      'SELECT name FROM _migrations'
    );
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 3. Read migration files
    const migrationsDir = path.resolve(__dirname, '../../db/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[Migration] Directory not found: ${migrationsDir}`);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const pending = files.filter((file) => !appliedSet.has(file));

    if (pending.length === 0) {
      console.log('[Migration] Database is up to date. No pending migrations.');
      return;
    }

    console.log(`[Migration] Found ${pending.length} pending migration(s)...`);

    // 4. Run each migration in a transaction
    for (const file of pending) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`[Migration] Applying: ${file}...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[Migration] Successfully applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Migration] Failed applying ${file}:`, err);
        throw err;
      }
    }

    console.log('[Migration] All migrations completed successfully.');
  } finally {
    client.release();
  }
};

// If run directly from CLI
if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Migration] Migration process failed:', err);
      await pool.end();
      process.exit(1);
    });
}
