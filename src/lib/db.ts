import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';
import { getDatabaseUrl } from './env';
import { logger } from './logger';

// BIGCOUNTS تعود كنصوص افتراضيًا — نحوّلها إلى أرقام.
types.setTypeParser(20, (value) => parseInt(value, 10));

let pool: Pool | null = null;

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
  /** الدور المُعلن للطلب — يُستخدم فحصه داخل سياسات RLS، لا يُصدَّق من المتصفح. */
  role?: string | null;
};

/**
 * يفتح معاملة ويضبط سياق المستخدم/الدور محليًا (`SET LOCAL`).
 * هذا هو المدخل الوحيد للاستعلامات المحمية بـ RLS:
 * السياسات تقرأ `current_setting('app.user_id')` ولا تقبل أي قيمة من العميل.
 */
export async function withSession<T>(
  session: DbSession,
  fn: (db: Queryable) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
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
