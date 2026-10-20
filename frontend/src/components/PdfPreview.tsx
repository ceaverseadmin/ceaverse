import { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { PdfPageSkeleton, SkeletonStatus } from './Skeleton'
import '../lib/pdfjs'

const MAX_PAGE_WIDTH = 520
const MIN_PAGE_WIDTH = 120
const PAGE_GUTTER = 16

interface PdfPreviewProps {
  url: string
  label: string
}

export default function PdfPreview({ url, label }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [baseWidth, setBaseWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
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

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages)
    },
    [],
  )

  const pageWidth = Math.min(
    MAX_PAGE_WIDTH,
    Math.max(MIN_PAGE_WIDTH, baseWidth - PAGE_GUTTER),
  )

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {error}
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="w-full max-w-full max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-2 [scrollbar-gutter:stable]"
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => setError('Could not load this PDF in the browser.')}
          loading={
            <SkeletonStatus label={`Loading ${label}`} className="w-full">
              <PdfPageSkeleton className="min-h-[240px] w-full sm:min-h-[420px]" />
            </SkeletonStatus>
          }
          className="rounded bg-white shadow"
        >
          {baseWidth > 0 && (
            <Page pageNumber={1} width={pageWidth} renderTextLayer={false} />
          )}
        </Document>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 sm:gap-4 sm:text-sm">
        {numPages != null && (
          <span>
            {numPages} page{numPages === 1 ? '' : 's'}
          </span>
        )}
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 sm:px-4"
        >
          Download {label}
        </a>
      </div>
    </div>
  )
}
