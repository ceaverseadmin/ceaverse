import { useCallback, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface PdfPreviewProps {
  url: string
  label: string
}

export default function PdfPreview({ url, label }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages)
    },
    [],
  )

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-2">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => setError('Could not load this PDF in the browser.')}
          className="rounded bg-white shadow"
        >
          <Page pageNumber={1} width={520} renderTextLayer={false} />
        </Document>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500">
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
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          Download {label}
        </a>
      </div>
    </div>
  )
}
