import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Document, Page } from 'react-pdf'
import { PdfPageSkeleton, Skeleton, SkeletonStatus } from './Skeleton'
import '../lib/pdfjs'

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
const MIN_PAGE_WIDTH = 120
const PAGE_GUTTER = 24

const controlClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-40'

interface PdfViewerProps {
  url: string
  title: string
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [baseWidth, setBaseWidth] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setBaseWidth(element.clientWidth))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    setPageNumber(1)
    setZoom(1)
    setError(null)
  }, [url])

  const zoomOut = () =>
    setZoom((current) => {
      const next = [...ZOOM_STEPS].reverse().find((step) => step < current - 0.001)
      return next ?? ZOOM_STEPS[0]
    })

  const zoomIn = () =>
    setZoom(
      (current) =>
        ZOOM_STEPS.find((step) => step > current + 0.001) ??
        ZOOM_STEPS[ZOOM_STEPS.length - 1],
    )

  const pageWidth = Math.max(
    MIN_PAGE_WIDTH,
    Math.floor((baseWidth - PAGE_GUTTER) * zoom),
  )

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 bg-white px-2 py-2 sm:gap-2 sm:px-3">
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className={controlClass}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="flex min-w-12 shrink-0 items-center justify-center text-center text-[11px] text-slate-600 tabular-nums sm:min-w-20 sm:text-sm">
            {numPages > 0 ? (
              <>
                <span className="sm:hidden">
                  {pageNumber}/{numPages}
                </span>
                <span className="hidden sm:inline">
                  Page {pageNumber} / {numPages}
                </span>
              </>
            ) : (
              <Skeleton className="h-4 w-12 sm:w-20" />
            )}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.min(numPages, page + 1))}
            disabled={numPages === 0 || pageNumber >= numPages}
            aria-label="Next page"
            className={controlClass}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_STEPS[0]}
            aria-label="Zoom out"
            className={controlClass}
          >
            <ZoomOut className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-10 shrink-0 text-center text-[11px] tabular-nums text-slate-600 sm:min-w-12 sm:text-sm">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
            aria-label="Zoom in"
            className={controlClass}
          >
            <ZoomIn className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="shrink-0 rounded-md px-1.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 sm:px-2 sm:text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[50svh] min-h-[240px] max-h-[480px] overflow-auto p-2 [scrollbar-gutter:stable] sm:h-[65vh] sm:min-h-[360px] sm:max-h-[680px] sm:p-3"
      >
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-xs text-slate-600 sm:text-sm">
            <p>{error}</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 sm:px-4"
            >
              Open PDF in new tab
            </a>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}
            onLoadError={() => setError('Could not load this PDF in the viewer.')}
            loading={
              <SkeletonStatus label={`Loading ${title}`}>
                <PdfPageSkeleton className="min-h-[240px] w-full sm:min-h-[320px]" />
              </SkeletonStatus>
            }
            aria-label={`${title} PDF`}
          >
            {baseWidth > 0 && (
              <div className="mx-auto w-fit">
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-md"
                />
              </div>
            )}
          </Document>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-200 bg-white px-2 py-2 sm:gap-2 sm:px-3">
        <p className="text-[11px] text-slate-500 sm:text-xs">
          Zoom in, then scroll to pan the plan.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            Open full screen
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2 py-1.5 text-[11px] font-medium text-white transition hover:bg-brand-700 sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}
