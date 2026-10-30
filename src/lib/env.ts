import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  /**
   * دور PostgreSQL الذي يُنفَّذ فيه كل استعلام تطبيقي (بعد `SET LOCAL ROLE`).
   * على Supabase: دور مخصص يُنشأ من الترحيل (`app_client`) — راجع docs/08-supabase-setup.md
   */
  DB_CLIENT_ROLE: z
    .string()
    .regex(/^[a-z_][a-z0-9_]*$/i, 'must be a plain identifier')
    .default('app_client'),
  /**
   * مصدر البيانات الحالي. `json` = ملفات محلية (الافتراضي حتى أمر التبديل)،
   * و`postgres` = مسار Supabase الجاهز وغير المفعّل بعد.
   * راجع docs/09-local-json-storage.md
   */
  DATA_PROVIDER: z.enum(['json', 'postgres']).default('json'),
  /** مجلد بيانات المحتوى المحلية (نسبي إلى جذر المشروع). */
  JSON_DATA_DIR: z.string().min(1).default('src/data'),
  /** مجلد حالة المستخدم المحلية (علامات القراءة وغيرها) — غير مُتتبَّع في git. */
  JSON_RUNTIME_DIR: z.string().min(1).default('data/runtime'),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/**
 * يقرأ متغيّرات البيئة مرة واحدة ويتحقق منها.
 * الإخفاء إلزامي: لا تُسجَّل القيم السرية أبدًا (انظر logger.ts).
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function getDatabaseUrl(): string {
  const url = getEnv().DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured. Copy .env.example to .env first.');
  }
  return url;
}

/** لإعادة التهيئة في الاختبارات فقط. */
export function resetEnvCache(): void {
  cached = null;
}
