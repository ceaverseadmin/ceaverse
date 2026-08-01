import { api, unwrap } from './api'
import type {
  ApiEnvelope,
  Book,
  BookFilters,
  Building,
  BuildingDetail,
  DownloadableLink,
  LandingContent,
  LocationFilters,
  LostFoundItem,
  LostFoundSubmission,
  Paginated,
  RoomLocation,
  TrackResult,
  VoicePost,
  VoiceWallItem,
} from './types'

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

export async function fetchLandingContent(): Promise<LandingContent> {
  const { data } = await api.get<ApiEnvelope<LandingContent>>('/landing/content/')
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Ebooks
// ---------------------------------------------------------------------------

export async function fetchBooks(filters: BookFilters = {}): Promise<Paginated<Book>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Book>>>('/ebooks/', {
    params: filters,
  })
  return unwrap(data)
}

export async function fetchBook(id: string): Promise<Book> {
  const { data } = await api.get<ApiEnvelope<Book>>(`/ebooks/${id}/`)
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Lost & Found
// ---------------------------------------------------------------------------

export async function fetchLostFound(
  filters: {
    item_type?: string
    category?: string
  } = {},
): Promise<LostFoundItem[]> {
  const { data } = await api.get<ApiEnvelope<LostFoundItem[]>>('/lost-found/items/', {
    params: filters,
  })
  return unwrap(data)
}

export async function submitLostFound(payload: FormData): Promise<LostFoundSubmission> {
  const { data } = await api.post<ApiEnvelope<LostFoundSubmission>>(
    '/lost-found/items/',
    payload,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return unwrap(data)
}

export async function trackLostFound(code: string): Promise<TrackResult> {
  const { data } = await api.get<ApiEnvelope<TrackResult>>(
    `/lost-found/track/${encodeURIComponent(code)}/`,
  )
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Student Voice
// ---------------------------------------------------------------------------

export async function fetchVoiceWall(category?: string): Promise<VoiceWallItem[]> {
  const { data } = await api.get<ApiEnvelope<VoiceWallItem[]>>('/voice/', {
    params: category ? { category } : {},
  })
  return unwrap(data)
}

export async function submitVoice(payload: {
  category: string
  content: string
  name?: string
}): Promise<VoicePost> {
  const { data } = await api.post<ApiEnvelope<VoicePost>>('/voice/', payload)
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Floor plans
// ---------------------------------------------------------------------------

export async function fetchBuildings(): Promise<Paginated<Building>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Building>>>(
    '/floorplans/buildings/',
  )
  return unwrap(data)
}

export async function fetchBuilding(id: string): Promise<BuildingDetail> {
  const { data } = await api.get<ApiEnvelope<BuildingDetail>>(
    `/floorplans/buildings/${id}/`,
  )
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Wayfinding
// ---------------------------------------------------------------------------

export async function fetchLocations(
  filters: LocationFilters = {},
): Promise<Paginated<RoomLocation>> {
  const { data } = await api.get<ApiEnvelope<Paginated<RoomLocation>>>(
    '/wayfinding/locations/',
    { params: filters },
  )
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Re-exports used by shared components
// ---------------------------------------------------------------------------

export type { DownloadableLink }
