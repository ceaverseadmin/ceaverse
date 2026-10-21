import { QueryClient } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const PERSISTED_QUERY_ROOTS = new Set([
  'landing',
  'library',
  'book',
  'buildings',
  'building',
  'locations',
  'lost-found',
  'voice',
])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 24 * 60 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function getPersistStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export const queryPersister = createSyncStoragePersister({
  storage: getPersistStorage(),
  key: 'ea-query-cache',
  throttleTime: 1_000,
})

export function shouldPersistQuery(query: Query): boolean {
  const root = query.queryKey[0]
  return (
    query.state.status === 'success' &&
    typeof root === 'string' &&
    PERSISTED_QUERY_ROOTS.has(root)
  )
}
