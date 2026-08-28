import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/Feedback'
import { fetchMe } from '../lib/auth'
import { formatDate } from '../lib/format'
import { api, unwrap } from '../lib/api'
import type { ApiEnvelope } from '../lib/types'
import type { AuthUser } from '../lib/auth'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  })

  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const profileMutation = useMutation({
    mutationFn: (data: { full_name?: string }) => {
      return api.patch<ApiEnvelope<AuthUser>>('/auth/me/', data).then(res => unwrap(res.data))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    },
    onError: () => {
      setMessage({ type: 'error', text: 'Failed to update profile.' })
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: { password: string }) => {
      return api.patch<ApiEnvelope<AuthUser>>('/auth/me/', data).then(res => unwrap(res.data))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(null), 3000)
    },
    onError: () => {
      setMessage({ type: 'error', text: 'Failed to change password.' })
    },
  })

  if (isLoading) return <Spinner />

  const displayUser = currentUser || user

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    profileMutation.mutate({ full_name: fullName })
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    passwordMutation.mutate({ password: newPassword })
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/admin/login'
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-slate-500">Manage your account settings and preferences.</p>

      {message && (
        <div
          className={`mt-4 rounded-md px-4 py-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-brand-50 text-brand-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={displayUser?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={fullName || displayUser?.full_name || ''}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <input
                type="text"
                value={displayUser?.role?.replace('_', ' ') || ''}
                disabled
                className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {profileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Account Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Account Details</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Account Status</span>
              <span className={`font-medium ${displayUser?.is_active ? 'text-emerald-600' : 'text-amber-600'}`}>
                {displayUser?.is_active ? 'Active' : 'Pending Approval'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Member Since</span>
              <span className="font-medium text-slate-900">
                {displayUser?.created_at ? formatDate(displayUser.created_at) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Last Updated</span>
              <span className="font-medium text-slate-900">
                {displayUser?.updated_at ? formatDate(displayUser.updated_at) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}