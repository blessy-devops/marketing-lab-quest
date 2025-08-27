import { PageHeaderSkeleton, StatsRowSkeleton, CardGridSkeleton, ListItemSkeleton, ChartSkeleton, TableSkeleton, FormSkeleton } from "./loading-skeleton";
import { AnimatedWrapper } from "./animated-wrapper";

export function DashboardShellSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Carregando dashboard">
      <PageHeaderSkeleton />
      <StatsRowSkeleton />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded animate-skeleton" />
          <ChartSkeleton />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted rounded animate-skeleton" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ListItemSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperimentsListShellSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Carregando lista de experimentos">
      <PageHeaderSkeleton />
      
      {/* Filters */}
      <AnimatedWrapper delay={0.1}>
        <div className="flex gap-4 p-4 border rounded-lg">
          <div className="h-10 w-48 bg-muted rounded animate-skeleton" />
          <div className="h-10 w-32 bg-muted rounded animate-skeleton" />
          <div className="h-10 w-28 bg-muted rounded animate-skeleton" />
        </div>
      </AnimatedWrapper>
      
      <CardGridSkeleton columns={3} rows={3} />
    </div>
  );
}

export function ExperimentDetailsShellSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Carregando detalhes do experimento">
      {/* Header */}
      <AnimatedWrapper>
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-muted rounded-full animate-skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-96 bg-muted rounded animate-skeleton" />
            <div className="h-4 w-64 bg-muted rounded animate-skeleton" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted rounded animate-skeleton" />
              <div className="h-6 w-16 bg-muted rounded animate-skeleton" />
            </div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-skeleton" />
        </div>
      </AnimatedWrapper>
      
      {/* Tabs */}
      <AnimatedWrapper delay={0.1}>
        <div className="flex gap-1 border-b">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded-t animate-skeleton" />
          ))}
        </div>
      </AnimatedWrapper>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListItemSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NewExperimentShellSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Carregando formulário">
      <PageHeaderSkeleton />
      
      {/* Stepper */}
      <AnimatedWrapper delay={0.1}>
        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-skeleton" />
                {i < 6 && <div className="h-px w-12 bg-muted animate-skeleton" />}
              </div>
            ))}
          </div>
        </div>
      </AnimatedWrapper>
      
      <FormSkeleton />
    </div>
  );
}

export function ReportsShellSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Carregando relatórios">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-skeleton" />
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
}

export function GalleryShellSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Carregando galeria">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimatedWrapper key={i} delay={i * 0.05}>
            <div className="aspect-video bg-muted rounded-lg animate-skeleton" />
          </AnimatedWrapper>
        ))}
      </div>
    </div>
  );
}