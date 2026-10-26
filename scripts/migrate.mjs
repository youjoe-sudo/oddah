// مُطبّق الترحيلات: يشغّل ملفات db/migrations/*.sql بالترتيب ويسجّلها.
// الاستخدام: npm run db:migrate
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(join(root, file));
    break;
  } catch {
    /* الملف غير موجود — نكمل */
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL غير معرّف. انسخ .env.example إلى .env وعدّل القيم.');
  process.exit(1);
}

const migrationsDir = join(root, 'db', 'migrations');
const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

const pool = new Pool({ connectionString: url });

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  let applied = 0;
  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE id = $1', [file]);
    if (rows.length) {
      console.log(`تخطّي (مطبَّق سابقًا): ${file}`);
      continue;
    }
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`تطبيق: ${file}`);
      applied += 1;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  console.log(applied ? `تم تطبيق ${applied} ترحيل.` : 'لا ترحيلات جديدة.');
} finally {
  await pool.end();
}
