import { Card } from './Card';
import { StatusBadge, type StatusTone } from './StatusBadge';

export type FeatureItem = {
  title: string;
  body: string;
  tone: StatusTone;
  label: string;
};

/** قائمة ميزات تعرض حالة كل ميزة صراحةً (لا تُعرض قيد التحقق كأنها جاهزة). */
export function FeatureList({ items }: { items: FeatureItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title}>
          <Card className="h-full">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-900">{item.title}</h2>
              <StatusBadge tone={item.tone} label={item.label} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
