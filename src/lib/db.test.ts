import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { withSession } from './db';

/**
 * يتحقق من مسار الجلسة الإنتاجي في `src/lib/db.ts`:
 * - رفض أي اسم دور غير صالح (يمنع حقن SQL في `SET LOCAL ROLE`).
 * - عند ضبط TEST_DATABASE_URL: إثبات أن `SET LOCAL ROLE` يُنفَّذ فعلًا،
 *   وإلا تتجاوز RLS لأن دور المالك لا يخضع للسياسات.
 */

const liveUrl = process.env.TEST_DATABASE_URL;

describe('withSession — تحقّق الدخول', () => {
  it('يرفض اسم دور يحتوي على حقن SQL', async () => {
    await expect(
      withSession({ userId: null }, async () => [], {
        dbRole: 'app_client; DROP TABLE users',
      }),
    ).rejects.toThrow(/Unsafe database role/);
  });

  it('يرفض اسم دور فارغ أو بأحرف غير مسموحة', async () => {
    await expect(
      withSession({ userId: null }, async () => [], { dbRole: 'app client' }),
    ).rejects.toThrow(/Unsafe database role/);
  });
});

describe.runIf(Boolean(liveUrl))('withSession — ضد قاعدة حقيقية', () => {
  it('ينفّذ SET LOCAL ROLE ويضبط سياق المستخدم', async () => {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = liveUrl;
    }
    // يتطلب الترحيل مطبَّقًا: npm run db:migrate
    const migrationSql = readFileSync(
      new URL('../../db/migrations/0001_phase0.sql', import.meta.url),
      'utf8',
    );
    const { getPool } = await import('./db');
    const applied = await getPool().query(`SELECT to_regclass('public.users') AS name`);
    if (!applied.rows[0].name) {
      await getPool().query(migrationSql);
    }

    const rows = await withSession(
      { userId: '11111111-1111-1111-1111-111111111111', role: 'user' },
      async (db) =>
        (
          await db.query<{ role: string; uid: string }>(
            'SELECT current_user AS role, current_setting($1) AS uid',
            ['app.user_id'],
          )
        ).rows,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe(process.env.DB_CLIENT_ROLE ?? 'app_client');
    expect(rows[0].uid).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('بدون جلسة يكون المتصل بدور المالك (وهو بالضبط ما يتجاوز RLS)', async () => {
    const { getPool } = await import('./db');
    const rows = await getPool().query<{ role: string }>('SELECT current_user AS role');
    expect(rows.rows[0].role).not.toBe(process.env.DB_CLIENT_ROLE ?? 'app_client');
  });
});
