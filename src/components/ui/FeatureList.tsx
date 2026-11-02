import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge, type StatusTone } from './StatusBadge';

export type FeatureItem = {
  title: string;
  body: string;
  tone: StatusTone;
  label: string;
  icon?: LucideIcon;
};

/** قائمة ميزات تعرض حالة كل ميزة صراحةً (لا تُعرض قيد التحقق كأنها جاهزة). */
export function FeatureList({ items }: { items: FeatureItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title}>
            <Card className="h-full" padding="md">
              <div className="flex items-start gap-3.5">
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-forest"
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-heading-sm font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <StatusBadge tone={item.tone} label={item.label} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{item.body}</p>
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
