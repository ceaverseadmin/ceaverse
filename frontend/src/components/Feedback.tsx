export function Spinner() {
  return (
    <div
      className="flex items-center justify-center py-16"
      role="status"
      aria-label="Loading"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  )
}

export function ErrorState({
  message = 'Something went wrong.',
}: {
  message?: string
}) {
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
      {message}
    </div>
  )
}
