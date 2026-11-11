import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card as="article" className="flex h-full flex-col" aria-hidden="true">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-5 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-lg" />
    </Card>
  );
}
