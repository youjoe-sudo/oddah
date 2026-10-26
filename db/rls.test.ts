import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * اختبارات RLS لترحيل مرحلة صفر.
 *
 * تُشغَّل على Postgres حقيقي مدمج (PGlite) افتراضيًا، أو على قاعدة حقيقية
 * (بما فيها Supabase) عند ضبط TEST_DATABASE_URL:
 *
 *   TEST_DATABASE_URL="postgresql://...?sslmode=require" npm test
 *
 * تتحقق من المعايير في docs/07-data-model.md §4:
 *  1) مستخدم لا يقرأ بيانات مستخدم آخر
 *  2) العزل لا يعتمد على قيمة يتحكم بها المتصفح
 *  3) لا وصول دور عادي لسجل التدقيق أو الأدوار
 *  4) كل سياسة مفعّلة فعلًا (لا RLS معطّل صامتًا)
 */

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const SOURCE_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const PUBLISHED_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const DRAFT_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

const migrationSql = readFileSync(new URL('./migrations/0001_phase0.sql', import.meta.url), 'utf8');
const liveUrl = process.env.TEST_DATABASE_URL;

type Rows = Record<string, unknown>[];

type TestDb = {
  kind: 'embedded' | 'live';
  query(sql: string, params?: unknown[]): Promise<Rows>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
};

async function openDb(): Promise<TestDb> {
  if (liveUrl) {
    const client = new Client({ connectionString: liveUrl });
    await client.connect();
    return {
      kind: 'live',
      query: async (sql, params) =>
        (await client.query(sql, params as never[])).rows as Rows,
      exec: async (sql) => {
        await client.query(sql);
      },
      close: async () => {
        await client.end();
      },
    };
  }

  const embedded = new PGlite({ extensions: { citext } });
  return {
    kind: 'embedded',
    query: async (sql, params) =>
      (await embedded.query(sql, params as never[])).rows as Rows,
    exec: async (sql) => {
      await embedded.exec(sql);
    },
    close: async () => {
      await embedded.close();
    },
  };
}

let db: TestDb;

/** ينفّذ استعلامًا كأنه مستخدم معيّن عبر دور `app_client` وسياق RLS. */
async function asUser<T>(userId: string, role: string, run: () => Promise<T>): Promise<T> {
  await db.query('SET ROLE app_client');
  await db.query("SELECT set_config('app.user_id', $1, false)", [userId]);
  await db.query("SELECT set_config('app.user_role', $1, false)", [role]);
  try {
    return await run();
  } finally {
    await db.query('RESET ROLE');
    await db.query("SELECT set_config('app.user_id', '', false)");
    await db.query("SELECT set_config('app.user_role', '', false)");
  }
}

async function rows(sql: string): Promise<Rows> {
  return db.query(sql);
}

beforeAll(async () => {
  db = await openDb();

  // على قاعدة حقيقية يكون الترحيل مطبَّقًا مسبقًا عبر `npm run db:migrate`
  const applied = await db.query(`SELECT to_regclass('public.users') AS name`);
  if (!applied[0].name) {
    await db.exec(migrationSql);
  }

  await db.exec(`
    INSERT INTO users (id, email) VALUES
      ('${USER_A}', 'rls-test-a@example.com'),
      ('${USER_B}', 'rls-test-b@example.com')
    ON CONFLICT DO NOTHING;

    INSERT INTO profiles (user_id, display_name) VALUES
      ('${USER_A}', 'مستخدم أ'),
      ('${USER_B}', 'مستخدم ب')
    ON CONFLICT DO NOTHING;

    INSERT INTO content_sources (id, name, license, verification_status, allows_processing)
    VALUES ('${SOURCE_ID}', 'Tanzil', 'CC BY 3.0', 'verified', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO content_items (id, type, slug, title_ar, source_id, status, created_by)
    VALUES
      ('${PUBLISHED_ID}', 'quran_surah', 'rls-al-fatiha', 'الفاتحة', '${SOURCE_ID}', 'published', '${USER_A}'),
      ('${DRAFT_ID}', 'article', 'rls-draft-note', 'مسودة', '${SOURCE_ID}', 'draft', '${USER_A}')
    ON CONFLICT DO NOTHING;

    INSERT INTO audit_logs (actor_user_id, action) VALUES ('${USER_A}', 'seed')
    ON CONFLICT DO NOTHING;
  `);
});

afterAll(async () => {
  if (db) {
    await db.exec(`
      DELETE FROM bookmarks WHERE user_id = '${USER_A}';
      DELETE FROM reading_progress WHERE user_id = '${USER_A}';
      DELETE FROM daily_goals WHERE user_id = '${USER_A}';
      DELETE FROM content_items WHERE id IN ('${PUBLISHED_ID}', '${DRAFT_ID}');
      DELETE FROM content_sources WHERE id = '${SOURCE_ID}';
      DELETE FROM users WHERE id IN ('${USER_A}', '${USER_B}');
    `).catch(() => undefined);
    await db.close();
  }
});

describe(`RLS — العزل بين المستخدمين`, () => {
  it('الملف الشخصي لا يُرى إلا من صاحبه', async () => {
    const own = await asUser(USER_A, 'user', () => rows('SELECT user_id FROM profiles'));
    expect(own).toHaveLength(1);
    expect(own[0].user_id).toBe(USER_A);

    // المستخدم ب يرى ملفه فقط — وليس ملف المستخدم أ (العزل الفعلي)
    const seenByB = await asUser(USER_B, 'user', () => rows('SELECT user_id FROM profiles'));
    expect(seenByB).toHaveLength(1);
    expect(seenByB[0].user_id).toBe(USER_B);
    expect(seenByB.map((r) => r.user_id)).not.toContain(USER_A);
  });

  it('العلامات لا تُقرأ ولا تُكتب لمستخدم آخر', async () => {
    await asUser(USER_A, 'user', async () => {
      await db.query(
        `INSERT INTO bookmarks (user_id, content_item_id, anchor)
         VALUES ($1, $2, '1:1') ON CONFLICT DO NOTHING`,
        [USER_A, PUBLISHED_ID],
      );
    });

    const seenByA = await asUser(USER_A, 'user', () => rows('SELECT user_id FROM bookmarks'));
    expect(seenByA).toHaveLength(1);

    const seenByB = await asUser(USER_B, 'user', () => rows('SELECT user_id FROM bookmarks'));
    expect(seenByB).toHaveLength(0);

    // محاولة الكتابة باسم المستخدم الآخر تُرفض بسياسة WITH CHECK
    await expect(
      asUser(USER_B, 'user', () =>
        db.query(
          `INSERT INTO bookmarks (user_id, content_item_id, anchor)
           VALUES ($1, $2, '1:2')`,
          [USER_A, PUBLISHED_ID],
        ),
      ),
    ).rejects.toThrow();
  });
});

describe('RLS — المحتوى والأدوار', () => {
  it('الدور العادي يرى المنشور فقط دون المسودات', async () => {
    const visible = await asUser(USER_B, 'user', () =>
      rows(`SELECT id FROM content_items WHERE created_by = '${USER_A}'`),
    );
    expect(visible.map((r) => r.id)).toEqual([PUBLISHED_ID]);
  });

  it('دور المراجعة يرى المحتوى قيد العمل', async () => {
    const visible = await asUser(USER_A, 'reviewer', () =>
      rows(`SELECT id FROM content_items WHERE created_by = '${USER_A}'`),
    );
    expect(visible).toHaveLength(2);
  });

  it('لا يقرأ المستخدم العادي سجل التدقيق ولا الأدوار', async () => {
    const audit = await asUser(USER_A, 'user', () => rows('SELECT id FROM audit_logs'));
    expect(audit).toHaveLength(0);

    const roles = await asUser(USER_A, 'user', () => rows('SELECT role FROM user_roles'));
    expect(roles).toHaveLength(0);

    const adminAudit = await asUser(USER_A, 'admin', () => rows('SELECT id FROM audit_logs'));
    expect(adminAudit.length).toBeGreaterThan(0);
  });

  it('سجل التدقيق إضافي فقط: لا تعديل ولا حذف', async () => {
    await expect(
      asUser(USER_A, 'admin', () => db.query("UPDATE audit_logs SET action = 'tampered'")),
    ).rejects.toThrow(/permission denied/i);

    await expect(
      asUser(USER_A, 'admin', () => db.query('DELETE FROM audit_logs')),
    ).rejects.toThrow(/permission denied/i);
  });

  it('المحتوى المنشور لا يُنشأ دون مصدر موثّق', async () => {
    await expect(
      asUser(USER_A, 'user', () =>
        db.query(
          `INSERT INTO content_items (type, slug, title_ar, status, created_by)
           VALUES ('article', 'rls-no-source', 'بدون مصدر', 'published', $1)`,
          [USER_A],
        ),
      ),
    ).rejects.toThrow(/content_published_needs_source/);
  });

  it('السياسة فعّلة فعلًا: بدون سياق مستخدم لا يُرى شيء خاص', async () => {
    await db.query('SET ROLE app_client');
    try {
      const profiles = await rows('SELECT user_id FROM profiles');
      expect(profiles).toHaveLength(0);
    } finally {
      await db.query('RESET ROLE');
    }
  });
});
