import { lazy } from 'react'

export const EbooksPage = lazy(() => import('./pages/EbooksPage'))
export const EbookDetailPage = lazy(() => import('./pages/EbookDetailPage'))
export const LostFoundPage = lazy(() => import('./pages/LostFoundPage'))
export const LostFoundSubmitPage = lazy(() => import('./pages/LostFoundSubmitPage'))
export const VoicePage = lazy(() => import('./pages/VoicePage'))
export const NavigatePage = lazy(() => import('./pages/NavigatePage'))
export const EbooksAdminPage = lazy(() => import('./admin/EbooksAdminPage'))
export const LostFoundAdminPage = lazy(() => import('./admin/LostFoundAdminPage'))
export const VoiceAdminPage = lazy(() => import('./admin/VoiceAdminPage'))
export const ContentPage = lazy(() => import('./admin/ContentPage'))
export const NavigateAdminPage = lazy(() => import('./admin/NavigateAdminPage'))
export const UsersPage = lazy(() => import('./admin/UsersPage'))
