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
import '../lib/pdfjs'

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]

const controlClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-40 sm:h-9 sm:w-9'

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

    const measure = () => setBaseWidth(element.clientWidth)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
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

  const pageWidth = Math.max(240, Math.floor((baseWidth - 24) * zoom))

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className={controlClass}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-20 text-center text-xs text-slate-600 tabular-nums sm:min-w-24 sm:text-sm">
            {numPages > 0 ? `Page ${pageNumber} / ${numPages}` : 'Loading…'}
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

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_STEPS[0]}
            aria-label="Zoom out"
            className={controlClass}
          >
            <ZoomOut className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-12 text-center text-xs tabular-nums text-slate-600 sm:text-sm">
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
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 sm:text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[60svh] min-h-[360px] overflow-auto p-3 sm:h-[70vh]"
      >
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
            <p>{error}</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
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
              <p className="p-8 text-center text-sm text-slate-500">Loading PDF…</p>
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">Zoom in, then scroll to pan the plan.</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Open full screen
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}
