/** يجمع أسماء CSS بأمان دون تكرار الشروط. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
