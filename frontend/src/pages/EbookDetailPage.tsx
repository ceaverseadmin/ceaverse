import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, Spinner } from '../components/Feedback'
import PdfPreview from '../components/PdfPreview'
import { categoryLabel, formatDate } from '../lib/format'
import { fetchBook } from '../lib/services'

export default function EbookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchBook(id!),
    enabled: Boolean(id),
  })

  if (isLoading) return <Spinner />
  if (isError || !data) {
    return <ErrorState message="This material is not available." />
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to="/library"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Back to library
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 to-slate-100">
            {data.cover ? (
              <img
                src={data.cover}
                alt={data.title}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <span className="text-7xl font-bold text-brand-200">
                {data.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {categoryLabel(data.category)}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{data.title}</h1>
          {data.author && <p className="mt-2 text-slate-600">by {data.author}</p>}
          {data.description && (
            <p className="mt-4 text-slate-700">{data.description}</p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {data.pages != null && (
              <>
                <dt className="text-slate-500">Pages</dt>
                <dd className="text-slate-900">{data.pages}</dd>
              </>
            )}
            {data.year_level && (
              <>
                <dt className="text-slate-500">Year Level</dt>
                <dd className="text-slate-900">{data.year_level}</dd>
              </>
            )}
            {data.course && (
              <>
                <dt className="text-slate-500">Course</dt>
                <dd className="text-slate-900">{data.course}</dd>
              </>
            )}
            <dt className="text-slate-500">Added</dt>
            <dd className="text-slate-900">{formatDate(data.created_at)}</dd>
          </dl>
          <a
            href={data.file}
            download
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Download PDF
          </a>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">Preview</h2>
        <div className="mt-4">
          <PdfPreview url={data.file} label="material" />
        </div>
      </div>
    </div>
  )
}
