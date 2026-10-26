import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * اختبارات RLS على ترحيل مرحلة صفر داخل Postgres حقيقي (PGlite).
 * تتحقق من المعايير المذكورة في docs/07-data-model.md §4:
 *  1) مستخدم لا يقرأ بيانات مستخدم آخر
 *  2) عدم اعتماد الصلاحية على قيمة يتحكم بها المتصفح
 *  3) عدم وصول دور عادي لسجل التدقيق أو الأدوار
 *  4) كل سياسة مفعّلة فعليًا (لا RLS معطّل صامتًا)
 */

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const SOURCE_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const PUBLISHED_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const DRAFT_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

const migrationSql = readFileSync(new URL('./migrations/0001_phase0.sql', import.meta.url), 'utf8');

let db: PGlite;

/** ينفّذ استعلامًا كأنه مستخدم معيّن عبر دور `app_client` وسياق RLS. */
async function asUser<T>(
  userId: string,
  role: string,
  run: () => Promise<T>,
): Promise<T> {
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

async function rows(sql: string): Promise<Record<string, unknown>[]> {
  return (await db.query(sql)).rows as Record<string, unknown>[];
}

beforeAll(async () => {
  db = new PGlite({ extensions: { citext } });
  await db.exec(migrationSql);

  await db.exec(`
    INSERT INTO users (id, email) VALUES
      ('${USER_A}', 'a@example.com'),
      ('${USER_B}', 'b@example.com');

    INSERT INTO profiles (user_id, display_name) VALUES
      ('${USER_A}', 'مستخدم أ'),
      ('${USER_B}', 'مستخدم ب');

    INSERT INTO content_sources (id, name, license, verification_status, allows_processing)
    VALUES ('${SOURCE_ID}', 'Tanzil', 'CC BY 3.0', 'verified', true);

    INSERT INTO content_items (id, type, slug, title_ar, source_id, status, created_by)
    VALUES
      ('${PUBLISHED_ID}', 'quran_surah', 'al-fatiha', 'الفاتحة', '${SOURCE_ID}', 'published', '${USER_A}'),
      ('${DRAFT_ID}', 'article', 'draft-note', 'مسودة', '${SOURCE_ID}', 'draft', '${USER_A}');

    INSERT INTO audit_logs (actor_user_id, action) VALUES ('${USER_A}', 'seed');
  `);
});

afterAll(async () => {
  await db.close();
});

describe('RLS — العزل بين المستخدمين', () => {
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
         VALUES ($1, $2, '1:1')`,
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
      rows('SELECT id FROM content_items ORDER BY created_at'),
    );
    expect(visible.map((r) => r.id)).toEqual([PUBLISHED_ID]);
  });

  it('دور المراجعة يرى المحتوى قيد العمل', async () => {
    const visible = await asUser(USER_A, 'reviewer', () =>
      rows('SELECT id FROM content_items ORDER BY slug'),
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
           VALUES ('article', 'no-source', 'بدون مصدر', 'published', $1)`,
          [USER_A],
        ),
      ),
    ).rejects.toThrow(/content_published_needs_source/);
  });

  it('السياسة فعّالة فعلًا: بدون سياق مستخدم لا يُرى شيء خاص', async () => {
    await db.query('SET ROLE app_client');
    try {
      const profiles = await rows('SELECT user_id FROM profiles');
      expect(profiles).toHaveLength(0);
    } finally {
      await db.query('RESET ROLE');
    }
  });
});
