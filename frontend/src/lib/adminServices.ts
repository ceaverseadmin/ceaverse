import { api, unwrap } from './api'
import type { AuthUser } from './auth'
import type {
  ApiEnvelope,
  Book,
  Building,
  BuildingDetail,
  DownloadableLink,
  Paginated,
  RoomLocation,
  ServiceCard,
} from './types'

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface ActivityLogEntry {
  id: string
  user: AuthUser | null
  action: string
  model_name: string
  object_id: string
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface DashboardSummary {
  counts: {
    users: { total: number; super_admins: number; admins: number; officers: number }
    books: number
    buildings: number
    locations: number
    lost_found: { total: number; open: number; matched: number; resolved: number }
    voice: { total: number; pending: number; published: number; rejected: number }
  }
  recent_activity: ActivityLogEntry[]
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await api.get<ApiEnvelope<DashboardSummary>>('/dashboard/summary/')
  return unwrap(data)
}

// ---------------------------------------------------------------------------
// Users (super admin)
// ---------------------------------------------------------------------------

export interface UserPayload {
  email: string
  full_name: string
  role: string
  is_active: boolean
  password?: string
}

export async function fetchUsers(): Promise<Paginated<AuthUser>> {
  const { data } = await api.get<ApiEnvelope<Paginated<AuthUser>>>('/users/')
  return unwrap(data)
}

export async function createUser(payload: UserPayload): Promise<AuthUser> {
  const { data } = await api.post<ApiEnvelope<AuthUser>>('/users/', payload)
  return unwrap(data)
}

export async function updateUser(
  id: string,
  payload: Partial<UserPayload>,
): Promise<AuthUser> {
  const { data } = await api.patch<ApiEnvelope<AuthUser>>(`/users/${id}/`, payload)
  return unwrap(data)
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}/`)
}

export async function resetPassword(id: string, new_password: string): Promise<void> {
  await api.post(`/users/${id}/reset_password/`, { new_password })
}

// ---------------------------------------------------------------------------
// Landing content
// ---------------------------------------------------------------------------

export async function fetchSection<T>(path: string): Promise<T> {
  const { data } = await api.get<ApiEnvelope<T>>(`/landing/sections/${path}/`)
  return unwrap(data)
}

export async function updateSection<T>(path: string, payload: FormData): Promise<T> {
  const { data } = await api.patch<ApiEnvelope<T>>(
    `/landing/sections/${path}/`,
    payload,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return unwrap(data)
}

export type ServiceCardPayload = Partial<ServiceCard>

export async function fetchServiceCards(): Promise<Paginated<ServiceCard>> {
  const { data } = await api.get<ApiEnvelope<Paginated<ServiceCard>>>(
    '/landing/service-cards/',
  )
  return unwrap(data)
}

export async function createServiceCard(
  payload: ServiceCardPayload,
): Promise<ServiceCard> {
  const { data } = await api.post<ApiEnvelope<ServiceCard>>(
    '/landing/service-cards/',
    payload,
  )
  return unwrap(data)
}

export async function updateServiceCard(
  id: string,
  payload: ServiceCardPayload,
): Promise<ServiceCard> {
  const { data } = await api.patch<ApiEnvelope<ServiceCard>>(
    `/landing/service-cards/${id}/`,
    payload,
  )
  return unwrap(data)
}

export async function deleteServiceCard(id: string): Promise<void> {
  await api.delete(`/landing/service-cards/${id}/`)
}

export async function fetchDownloadableLinks(): Promise<Paginated<DownloadableLink>> {
  const { data } = await api.get<ApiEnvelope<Paginated<DownloadableLink>>>(
    '/landing/downloadable-links/',
  )
  return unwrap(data)
}

export async function createDownloadableLink(
  payload: FormData,
): Promise<DownloadableLink> {
  const { data } = await api.post<ApiEnvelope<DownloadableLink>>(
    '/landing/downloadable-links/',
    payload,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return unwrap(data)
}

export async function updateDownloadableLink(
  id: string,
  payload: FormData,
): Promise<DownloadableLink> {
  const { data } = await api.patch<ApiEnvelope<DownloadableLink>>(
    `/landing/downloadable-links/${id}/`,
    payload,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return unwrap(data)
}

export async function deleteDownloadableLink(id: string): Promise<void> {
  await api.delete(`/landing/downloadable-links/${id}/`)
}

// ---------------------------------------------------------------------------
// Ebooks
// ---------------------------------------------------------------------------

export interface BookPayload {
  title: string
  author?: string
  description?: string
  category?: string
  pages?: number | null
  is_active?: boolean
  order?: number
  cover?: File | string | null
  file?: File | string | null
}

export async function fetchBooksAdmin(): Promise<Paginated<Book>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Book>>>('/ebooks/')
  return unwrap(data)
}

export async function createBook(payload: FormData): Promise<Book> {
  const { data } = await api.post<ApiEnvelope<Book>>('/ebooks/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(data)
}

export async function updateBook(id: string, payload: FormData): Promise<Book> {
  const { data } = await api.patch<ApiEnvelope<Book>>(`/ebooks/${id}/`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(data)
}

export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/ebooks/${id}/`)
}

// ---------------------------------------------------------------------------
// Lost & Found (admin)
// ---------------------------------------------------------------------------

export interface AdminLostFoundItem {
  id: string
  tracking_code: string
  item_type: string
  category: string
  title: string
  description: string
  location: string
  date: string | null
  image: string | null
  contact_name: string
  contact_email: string
  status: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface LostFoundPayload {
  item_type: string
  category: string
  title: string
  description?: string
  location?: string
  date?: string | null
  status?: string
  is_public?: boolean
}

export async function fetchLostFoundAdmin(): Promise<Paginated<AdminLostFoundItem>> {
  const { data } = await api.get<ApiEnvelope<Paginated<AdminLostFoundItem>>>(
    '/lost-found/admin/items/',
  )
  return unwrap(data)
}

export async function updateLostFoundItem(
  id: string,
  payload: Partial<LostFoundPayload>,
): Promise<AdminLostFoundItem> {
  const { data } = await api.patch<ApiEnvelope<AdminLostFoundItem>>(
    `/lost-found/admin/items/${id}/`,
    payload,
  )
  return unwrap(data)
}

export async function deleteLostFoundItem(id: string): Promise<void> {
  await api.delete(`/lost-found/admin/items/${id}/`)
}

// ---------------------------------------------------------------------------
// Student Voice (admin)
// ---------------------------------------------------------------------------

export interface AdminVoiceSubmission {
  id: string
  category: string
  content: string
  name: string
  display_name: string
  status: string
  created_at: string
  updated_at: string
}

export async function fetchVoiceSubmissions(): Promise<
  Paginated<AdminVoiceSubmission>
> {
  const { data } = await api.get<ApiEnvelope<Paginated<AdminVoiceSubmission>>>(
    '/voice/admin/submissions/',
  )
  return unwrap(data)
}

export async function updateVoiceSubmission(
  id: string,
  payload: Partial<Pick<AdminVoiceSubmission, 'status' | 'category'>>,
): Promise<AdminVoiceSubmission> {
  const { data } = await api.patch<ApiEnvelope<AdminVoiceSubmission>>(
    `/voice/admin/submissions/${id}/`,
    payload,
  )
  return unwrap(data)
}

export async function deleteVoiceSubmission(id: string): Promise<void> {
  await api.delete(`/voice/admin/submissions/${id}/`)
}

// ---------------------------------------------------------------------------
// Floor plans (admin)
// ---------------------------------------------------------------------------

export interface BuildingPayload {
  name: string
  code?: string
  description?: string
  image?: File | string | null
  order?: number
  is_active?: boolean
}

export interface FloorPlanPayload {
  building: string
  floor_label: string
  file?: File | string | null
  order?: number
  is_active?: boolean
}

export interface AdminFloorPlan {
  id: string
  building: string
  floor_label: string
  file: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function fetchBuildingsAdmin(): Promise<Paginated<Building>> {
  const { data } = await api.get<ApiEnvelope<Paginated<Building>>>(
    '/floorplans/buildings/',
  )
  return unwrap(data)
}

export async function createBuilding(payload: FormData): Promise<Building> {
  const { data } = await api.post<ApiEnvelope<Building>>(
    '/floorplans/buildings/',
    payload,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return unwrap(data)
}

export async function updateBuilding(
  id: string,
  payload: FormData,
): Promise<BuildingDetail> {
  const { data } = await api.patch<ApiEnvelope<BuildingDetail>>(
    `/floorplans/buildings/${id}/`,
    payload,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return unwrap(data)
}

export async function deleteBuilding(id: string): Promise<void> {
  await api.delete(`/floorplans/buildings/${id}/`)
}

export async function fetchFloorPlansAdmin(): Promise<Paginated<AdminFloorPlan>> {
  const { data } = await api.get<ApiEnvelope<Paginated<AdminFloorPlan>>>(
    '/floorplans/floor-plans/',
  )
  return unwrap(data)
}

export async function createFloorPlan(payload: FormData): Promise<AdminFloorPlan> {
  const { data } = await api.post<ApiEnvelope<AdminFloorPlan>>(
    '/floorplans/floor-plans/',
    payload,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return unwrap(data)
}

export async function updateFloorPlan(
  id: string,
  payload: FormData,
): Promise<AdminFloorPlan> {
  const { data } = await api.patch<ApiEnvelope<AdminFloorPlan>>(
    `/floorplans/floor-plans/${id}/`,
    payload,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return unwrap(data)
}

export async function deleteFloorPlan(id: string): Promise<void> {
  await api.delete(`/floorplans/floor-plans/${id}/`)
}

// ---------------------------------------------------------------------------
// Wayfinding (admin)
// ---------------------------------------------------------------------------

export interface LocationPayload {
  building: string
  name: string
  code?: string
  category?: string
  floor?: string
  description?: string
  is_active?: boolean
}

export async function fetchLocationsAdmin(): Promise<Paginated<RoomLocation>> {
  const { data } = await api.get<ApiEnvelope<Paginated<RoomLocation>>>(
    '/wayfinding/locations/',
  )
  return unwrap(data)
}

export async function createLocation(payload: LocationPayload): Promise<RoomLocation> {
  const { data } = await api.post<ApiEnvelope<RoomLocation>>(
    '/wayfinding/locations/',
    payload,
  )
  return unwrap(data)
}

export async function updateLocation(
  id: string,
  payload: Partial<LocationPayload>,
): Promise<RoomLocation> {
  const { data } = await api.patch<ApiEnvelope<RoomLocation>>(
    `/wayfinding/locations/${id}/`,
    payload,
  )
  return unwrap(data)
}

export async function deleteLocation(id: string): Promise<void> {
  await api.delete(`/wayfinding/locations/${id}/`)
}
