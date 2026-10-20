import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

const tableCellWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-5/6', 'w-1/2']

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-slate-200/80 motion-reduce:animate-none',
        className,
      )}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} />
}

export function SkeletonStatus({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function SkeletonTable({
  columns = 5,
  rows = 6,
  showHeader = true,
  className,
}: {
  columns?: number
  rows?: number
  showHeader?: boolean
  className?: string
}) {
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`

  return (
    <div
      aria-hidden="true"
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      {showHeader && (
        <div
          className="grid gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3"
          style={{ gridTemplateColumns }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-1/2" />
          ))}
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-4 py-4"
            style={{ gridTemplateColumns }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn(
                  'h-4',
                  tableCellWidths[columnIndex % tableCellWidths.length],
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton({
  actions = false,
  eyebrow = true,
}: {
  actions?: boolean
  eyebrow?: boolean
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="w-full max-w-2xl space-y-3">
        {eyebrow && <Skeleton className="h-3 w-24" />}
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      {actions && <Skeleton className="h-10 w-32" />}
    </div>
  )
}

export function RouteSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SkeletonStatus label="Loading page">
        <PageHeaderSkeleton />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Skeleton className="h-44 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function PdfPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex min-h-[280px] items-center justify-center rounded-lg bg-slate-100 p-4',
        className,
      )}
    >
      <div className="w-full max-w-sm rounded-sm bg-white p-6 shadow-sm">
        <Skeleton className="h-5 w-1/3" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn('h-3', index % 3 === 2 ? 'w-2/3' : 'w-full')}
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  )
}
