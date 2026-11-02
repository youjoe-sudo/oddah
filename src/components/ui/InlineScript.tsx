/**
 * سكربت مضمّن يعمل أثناء تحليل HTML (قبل أول رسم) على الخادم،
 * ويُعطَّل على العميل لتجنّب تحذير React عند إعادة الرسم.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
