import { Link } from 'react-router-dom'
import type { Book } from '../lib/types'
import { categoryLabel } from '../lib/format'

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/library/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="h-full w-full rounded object-cover"
          />
        ) : (
          <span className="text-5xl font-bold text-brand-200">
            {book.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-600">
          {categoryLabel(book.category)}
        </span>
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">
          {book.title}
        </h3>
        {book.author && <p className="mt-1 text-sm text-slate-500">{book.author}</p>}
        {book.pages != null && (
          <p className="mt-2 text-xs text-slate-400">{book.pages} pages</p>
        )}
      </div>
    </Link>
  )
}
