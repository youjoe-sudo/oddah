import { redirect } from 'next/navigation';
import { defaultLocale, isLocale, type Locale } from './config';
import { getDictionary, type Dictionary } from './get-dictionary';

/**
 * يقرأ لغة المسار ويتحقّق منها، ويُرجع القاموس الجاهز.
 * أي لغة غير مدعومة تُعاد توجيهها للغة الافتراضية.
 */
export async function resolvePage(params: Promise<{ locale: string }>): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const { locale } = await params;
  if (!isLocale(locale)) redirect(`/${defaultLocale}`);
  return { locale, dict: await getDictionary(locale) };
}
