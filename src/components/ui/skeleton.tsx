import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-skeleton bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200px_100%] rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
