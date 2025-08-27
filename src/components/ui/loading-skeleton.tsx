import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnimatedWrapper, StaggeredContainer } from "@/components/ui/animated-wrapper";

export function ExperimentCardSkeleton({ index = 0 }: { index?: number }) {
  const widths = ['w-3/4', 'w-2/3', 'w-4/5', 'w-5/6'];
  const heights = ['h-4', 'h-5'];
  
  return (
    <AnimatedWrapper delay={index * 0.1}>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className={`h-6 ${widths[index % widths.length]}`} />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className={`${heights[index % heights.length]} w-1/2`} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedWrapper>
  );
}

export function DashboardCardSkeleton({ index = 0 }: { index?: number }) {
  const titleWidths = ['w-24', 'w-28', 'w-20', 'w-32'];
  const valueWidths = ['w-16', 'w-20', 'w-14', 'w-18'];
  
  return (
    <AnimatedWrapper delay={index * 0.1}>
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className={`h-4 ${titleWidths[index % titleWidths.length]}`} />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className={`h-8 ${valueWidths[index % valueWidths.length]} mb-2`} />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    </AnimatedWrapper>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-fade-in space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-fade-in space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <AnimatedWrapper>
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export function ListItemSkeleton({ index = 0 }: { index?: number }) {
  const avatarSizes = ['h-10 w-10', 'h-8 w-8', 'h-12 w-12'];
  const titleWidths = ['w-48', 'w-40', 'w-56', 'w-44'];
  const subtitleWidths = ['w-32', 'w-28', 'w-36', 'w-24'];
  
  return (
    <AnimatedWrapper delay={index * 0.08}>
      <div className="flex items-center space-x-4 p-4 rounded-lg border">
        <Skeleton className={`${avatarSizes[index % avatarSizes.length]} rounded-full`} />
        <div className="flex-1 space-y-2">
          <Skeleton className={`h-4 ${titleWidths[index % titleWidths.length]}`} />
          <Skeleton className={`h-3 ${subtitleWidths[index % subtitleWidths.length]}`} />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </AnimatedWrapper>
  );
}

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ columns = 3, rows = 2 }: { columns?: number; rows?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: rows * columns }).map((_, i) => (
        <ExperimentCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 4, index = 0 }: { columns?: number; index?: number }) {
  const cellWidths = ['w-full', 'w-3/4', 'w-5/6', 'w-2/3', 'w-4/5'];
  
  return (
    <AnimatedWrapper delay={index * 0.05}>
      <div className="grid gap-4 p-4 border-b" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className={`h-4 ${cellWidths[(index + colIndex) % cellWidths.length]}`} 
          />
        ))}
      </div>
    </AnimatedWrapper>
  );
}

export function FormSkeleton() {
  return (
    <AnimatedWrapper>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <AnimatedWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
    </AnimatedWrapper>
  );
}