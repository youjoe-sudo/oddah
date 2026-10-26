import { describe, expect, it } from 'vitest';
import { redact } from './logger';

describe('logger redaction', () => {
  it('يخفي المفاتيح الحساسة في كل المستويات', () => {
    const input = {
      userId: 'u-1',
      sessionSecret: 'top-secret',
      nested: { accessToken: 'abc', apiKey: 'k', plain: 'ok' },
      list: [{ password: 'p' }],
    };

    const out = redact(input);

    expect(out.userId).toBe('u-1');
    expect(out.sessionSecret).toBe('[redacted]');
    expect(out.nested.accessToken).toBe('[redacted]');
    expect(out.nested.apiKey).toBe('[redacted]');
    expect(out.nested.plain).toBe('ok');
    expect(out.list[0].password).toBe('[redacted]');
  });

  it('لا يغيّر القيم غير الكائنة', () => {
    expect(redact('value')).toBe('value');
    expect(redact(null)).toBeNull();
    expect(redact(42)).toBe(42);
  });
});
