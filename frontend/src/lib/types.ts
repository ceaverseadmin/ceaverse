export interface ApiEnvelope<T> {
  success: boolean
  message: string | null
  data: T
  errors: Record<string, string[]> | null
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ---------------------------------------------------------------------------
// Landing content
// ---------------------------------------------------------------------------

export interface Hero {
  title: string
  subtitle: string
  background_image: string | null
  cta_label: string
  cta_url: string
  is_active: boolean
  updated_at: string
}

export interface AboutSection {
  title: string
  content: string
  image: string | null
  updated_at: string
}

export interface SimpleSection {
  content: string
  updated_at: string
}

export interface ContactSection {
  email: string
  phone: string
  address: string
  map_link: string
  working_hours: string
  updated_at: string
}

export interface ServiceCard {
  id: string
  icon: string
  title: string
  description: string
  order: number
  is_active: boolean
}

export interface DownloadableLink {
  id: string
  label: string
  description: string
  file: string | null
  external_url: string
  order: number
  is_active: boolean
}

export interface LandingContent {
  hero: Hero
  about: AboutSection
  mission: SimpleSection
  vision: SimpleSection
  contact: ContactSection
  service_cards: ServiceCard[]
  downloadable_links: DownloadableLink[]
}

// ---------------------------------------------------------------------------
// Ebooks
// ---------------------------------------------------------------------------

export interface Book {
  id: string
  title: string
  author: string
  description: string
  cover: string | null
  file: string
  category: string
  pages: number | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface BookFilters {
  category?: string
  search?: string
  page?: number
}

// ---------------------------------------------------------------------------
// Lost & Found
// ---------------------------------------------------------------------------

export type LostFoundType = 'lost' | 'found'

export interface LostFoundItem {
  id: string
  item_type: LostFoundType
  category: string
  title: string
  description: string
  location: string
  date: string | null
  image: string | null
  status: string
  created_at: string
}

export interface LostFoundSubmission extends Omit<LostFoundItem, 'status'> {
  tracking_code: string
  contact_name: string
  contact_email: string
}

export interface TrackResult {
  tracking_code: string
  item_type: LostFoundType
  category: string
  title: string
  description: string
  location: string
  date: string | null
  image: string | null
  contact_name: string
  contact_email: string
  status: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Student Voice
// ---------------------------------------------------------------------------

export interface VoicePost {
  id: string
  category: string
  content: string
  name: string
  status: string
  created_at: string
}

export interface VoiceWallItem {
  id: string
  category: string
  content: string
  display_name: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Floor plans
// ---------------------------------------------------------------------------

export interface FloorPlan {
  id: string
  floor_label: string
  file: string
  order: number
}

export interface Building {
  id: string
  name: string
  code: string
  description: string
  image: string | null
  order: number
  is_active: boolean
}

export interface BuildingDetail extends Building {
  floor_plans: FloorPlan[]
}

// ---------------------------------------------------------------------------
// Wayfinding
// ---------------------------------------------------------------------------

export interface RoomLocation {
  id: string
  building: string
  building_name: string
  name: string
  code: string
  category: string
  floor: string
  description: string
  is_active: boolean
}

export interface LocationFilters {
  building?: string
  category?: string
  floor?: string
  search?: string
  page?: number
}
