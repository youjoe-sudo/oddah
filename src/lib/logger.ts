const SENSITIVE = /(password|secret|token|authorization|cookie|api[-_]?key)/i;

/** يُخفي القيم الحساسة قبل التسجيل حتى لو وصلت بالخطأ. */
export function redact<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE.test(key) ? '[redacted]' : redact(val);
  }
  return out as T;
}

type Level = 'debug' | 'info' | 'warn' | 'error';

/**
 * تسجيل منظّم (JSON) — يُستخدم لسجلات التشغيل.
 * سجل التدقيق للعمليات الحساسة يذهب إلى `audit_logs` في قاعدة البيانات.
 */
export function log(level: Level, message: string, context: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    level,
    message,
    time: new Date().toISOString(),
    ...redact(context),
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => log('debug', m, c),
  info: (m: string, c?: Record<string, unknown>) => log('info', m, c),
  warn: (m: string, c?: Record<string, unknown>) => log('warn', m, c),
  error: (m: string, c?: Record<string, unknown>) => log('error', m, c),
};
