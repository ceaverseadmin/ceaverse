import {
  PdfPageSkeleton,
  Skeleton,
  SkeletonCircle,
  SkeletonStatus,
  SkeletonText,
} from './Skeleton'

function BookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Skeleton className="h-44 rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <SkeletonText lines={2} />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <SkeletonStatus label="Loading portal content">
      <section className="relative overflow-hidden bg-brand-950">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="max-w-xl space-y-5">
            <Skeleton className="h-6 w-64 max-w-full rounded-full bg-white/10" />
            <Skeleton className="h-12 w-full max-w-lg bg-white/10" />
            <Skeleton className="h-12 w-4/5 bg-white/10" />
            <Skeleton className="h-5 w-full bg-white/10" />
            <Skeleton className="h-5 w-2/3 bg-white/10" />
            <div className="flex flex-wrap gap-3 pt-3">
              <Skeleton className="h-12 w-40 bg-white/15" />
              <Skeleton className="h-12 w-36 bg-white/10" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-7 w-20" />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[86px_1fr]">
                <Skeleton className="h-40" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/2" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-14" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <Skeleton className="mx-auto h-3 w-24" />
          <Skeleton className="mx-auto h-8 w-72 max-w-full" />
        </div>
        <div className="mt-10 flex justify-center gap-6 overflow-hidden px-4 sm:gap-10">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCircle key={index} className="h-14 w-14 shrink-0" />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3 md:py-20">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-5 w-40" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </SkeletonStatus>
  )
}

export function EbooksPageSkeleton() {
  return (
    <SkeletonStatus
      label="Loading library"
      className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </SkeletonStatus>
  )
}

export function BookDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SkeletonStatus label="Loading material">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <SkeletonText lines={4} className="max-w-xl" />
            <div className="grid max-w-lg grid-cols-2 gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-44" />
          </div>
        </div>
        <div className="mt-12 space-y-4">
          <Skeleton className="h-7 w-32" />
          <PdfPageSkeleton />
        </div>
      </SkeletonStatus>
    </div>
  )
}

export function LostFoundPageSkeleton() {
  return (
    <SkeletonStatus
      label="Loading lost and found reports"
      className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <SkeletonText lines={3} />
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </SkeletonStatus>
  )
}

export function VoicePageSkeleton() {
  return (
    <SkeletonStatus label="Loading student voice messages" className="mt-6 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <SkeletonText lines={2} />
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <SkeletonCircle className="h-8 w-8" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </SkeletonStatus>
  )
}

export function NavigatePageSkeleton() {
  return (
    <SkeletonStatus
      label="Loading campus navigation"
      className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"
    >
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="h-3 w-24" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </aside>
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <div className="mt-5 grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)]">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
            <PdfPageSkeleton className="min-h-[320px]" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SkeletonStatus>
  )
}

export function FloorPlanPanelSkeleton() {
  return (
    <SkeletonStatus
      label="Loading floor plans"
      className="mt-5 grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)]"
    >
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
      <PdfPageSkeleton className="min-h-[320px]" />
    </SkeletonStatus>
  )
}

export function RoomListSkeleton() {
  return (
    <SkeletonStatus label="Loading rooms" className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </SkeletonStatus>
  )
}
