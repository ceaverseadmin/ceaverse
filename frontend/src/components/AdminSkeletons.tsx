import { cn } from '../lib/utils'
import {
  PageHeaderSkeleton,
  Skeleton,
  SkeletonCircle,
  SkeletonStatus,
  SkeletonTable,
  SkeletonText,
} from './Skeleton'

export function AdminBootSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <SkeletonStatus
        label="Checking administrator session"
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <SkeletonCircle className="h-12 w-12" />
          <Skeleton className="mt-5 h-6 w-40" />
          <SkeletonText lines={2} className="mt-3" />
          <Skeleton className="mt-6 h-10 w-full" />
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function AdminTableSkeleton({
  columns = 5,
  rows = 6,
  className,
}: {
  columns?: number
  rows?: number
  className?: string
}) {
  return <SkeletonTable columns={columns} rows={rows} className={className} />
}

export function AdminTablePageSkeleton({
  columns = 5,
  rows = 6,
  filters = 0,
  actions = false,
  className,
}: {
  columns?: number
  rows?: number
  filters?: number
  actions?: boolean
  className?: string
}) {
  return (
    <div className={cn('p-4 sm:p-8', className)}>
      <SkeletonStatus label="Loading admin page">
        <PageHeaderSkeleton actions={actions} eyebrow={false} />
        {filters > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: filters }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-36" />
            ))}
          </div>
        )}
        <SkeletonTable className="mt-6" columns={columns} rows={rows} />
      </SkeletonStatus>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-8">
      <SkeletonStatus label="Loading dashboard">
        <PageHeaderSkeleton eyebrow={false} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-11 w-11 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-5 w-40" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-5 w-32" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <SkeletonCircle className="h-9 w-9 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonCircle className="h-8 w-8 shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function PendingUsersSkeleton() {
  return (
    <div className="p-4 sm:p-8">
      <SkeletonStatus label="Loading pending administrator accounts">
        <PageHeaderSkeleton eyebrow={false} />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <SkeletonCircle className="h-11 w-11 shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56 max-w-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function VoiceSubmissionsSkeleton() {
  return (
    <div className="p-4 sm:p-8">
      <SkeletonStatus label="Loading student voice submissions">
        <PageHeaderSkeleton eyebrow={false} />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
              <SkeletonText lines={2} />
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="p-4 sm:p-8">
      <SkeletonStatus label="Loading profile">
        <PageHeaderSkeleton eyebrow={false} />
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-2 h-3 w-64 max-w-full" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 3 }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="mt-5 h-10 w-32" />
            </div>
          ))}
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function ContentFormSkeleton() {
  return (
    <SkeletonStatus
      label="Loading content form"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-3 w-72 max-w-full" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
      <Skeleton className="mt-5 h-10 w-32" />
    </SkeletonStatus>
  )
}

export function ServiceCardsSkeleton() {
  return (
    <SkeletonStatus
      label="Loading service cards"
      className="mt-4 grid gap-4 sm:grid-cols-2"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          <SkeletonText lines={2} className="mt-3" />
        </div>
      ))}
    </SkeletonStatus>
  )
}

export function DownloadableLinksSkeleton() {
  return (
    <SkeletonStatus
      label="Loading downloadable links"
      className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </SkeletonStatus>
  )
}
