import { Container } from '@/components/ui/Container';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/** هيكل تحميل موحد يحافظ على إيقاع الصفحة دون قفزات. */
export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="border-b border-line bg-surface">
        <Container className="space-y-3 py-8 md:py-10">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </Container>
      </div>

      <Container className="py-8 md:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-line bg-surface p-5 shadow-card"
            >
              <Skeleton className="h-5 w-40" />
              <SkeletonText lines={3} className="mt-4" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
