import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';
import { getDatabaseUrl, getEnv } from './env';
import { logger } from './logger';

// BIGCOUNTS تعود كنصوص افتراضيًا — نحوّلها إلى أرقام.
types.setTypeParser(20, (value) => parseInt(value, 10));

let pool: Pool | null = null;

/**
 * ينشئ اتصالًا واحدًا للمحصول (pool).
 *
 * ملاحظات Supabase:
 * - ضع `?sslmode=require` في DATABASE_URL.
 * - فضّل **Session pooler (5432)** أو الاتصال المباشر (5432) لأن الجلسات
 *   تعتمد `BEGIN/COMMIT` و`SET LOCAL ROLE`.
 * - لا تُمرر مفتاح service_role هنا إطلاقًا: هذا المسار Postgres مباشر فقط.
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl(), max: 10 });
    pool.on('error', (err) => logger.error('db.pool.error', { message: err.message }));
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export type Queryable = Pick<PoolClient, 'query'>;

export type DbSession = {
  /** معرّف المستخدم الحالي؛ `null` لقراءات عامة (زائر). */
  userId?: string | null;
  /** الدور التطبيق (user/reviewer/admin) — تُستخدم قراءته سياسات RLS. */
  role?: string | null;
};

export type SessionOptions = {
  /**
   * دور PostgreSQL الذي يُنفَّذ الاستعلام. الافتراضي من `DB_CLIENT_ROLE`.
   * الاستخدام بدور المالك استثناء مقصود (مصادقة/تشغيل) ويجب أن يكون محدودًا ومُسجَّلًا.
   */
  dbRole?: string;
};

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/i;

function assertIdentifier(value: string, what: string): string {
  if (!IDENTIFIER.test(value)) {
    throw new Error(`Unsafe ${what}: "${value}"`);
  }
  return value;
}

/**
 * المدخل الوحيد للاستعلامات المحمية بـ RLS:
 * 1. يفتح معاملة.
 * 2. ينفّذ `SET LOCAL ROLE` بدور غير مالك — وإلا تتجاوز RLS (المالك لا يخضع لها).
 * 3. يضبط سياق المستخدم/الدور لتطبّق فيه سياسات RLS.
 *
 * بدون هذه الثلاثة يكون العزل وهميًا على أي قاعدة مُدارة (Supabase وغيره).
 */
export async function withSession<T>(
  session: DbSession,
  fn: (db: Queryable) => Promise<T>,
  options: SessionOptions = {},
): Promise<T> {
  const role = assertIdentifier(options.dbRole ?? getEnv().DB_CLIENT_ROLE, 'database role');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE ${role}`);
    await client.query('SELECT set_config($1, $2, true)', ['app.user_id', session.userId ?? '']);
    await client.query('SELECT set_config($1, $2, true)', ['app.user_role', session.role ?? 'user']);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function query<R extends QueryResultRow = QueryResultRow>(
  session: DbSession,
  text: string,
  params: unknown[] = [],
): Promise<R[]> {
  return withSession(session, async (db) => (await db.query<R>(text, params)).rows);
}
