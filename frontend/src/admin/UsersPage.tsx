import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { ErrorState, Spinner } from '../components/Feedback'
import { Modal } from '../components/Modal'
import type { AuthUser } from '../lib/auth'
import { formatDate, titleCase } from '../lib/format'
import {
  createUser,
  deleteUser,
  fetchUsers,
  resetPassword,
  updateUser,
} from '../lib/adminServices'
import type { UserPayload } from '../lib/adminServices'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Administrator' },
  { value: 'officer', label: 'Officer' },
]

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AuthUser | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setMessage('User created.')
    },
    onError: () => setMessage('Could not create user.'),
  })

  const removeMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setMessage('User deleted.')
    },
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setMessage('User updated.')
    },
  })

  if (isLoading) return <Spinner />
  if (isError || !data) return <ErrorState message="Could not load users." />

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">Manage admin and officer accounts.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          {showForm ? 'Cancel' : 'New user'}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {showForm && <UserForm onSubmit={mutation.mutate} error={mutation.isError} />}

      {editing && (
        <Modal title="Edit user" onClose={() => setEditing(null)}>
          <EditUserForm
            key={editing.id}
            user={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              setMessage('User updated.')
            }}
          />
        </Modal>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.results.map((user) => (
              <tr key={user.id} className={user.is_active ? '' : 'opacity-60'}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.full_name || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {titleCase(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => setEditing(user)}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        toggleActive.mutate({ id: user.id, is_active: !user.is_active })
                      }
                      className="rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${user.email}?`))
                          removeMutation.mutate(user.id)
                      }}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserForm({
  onSubmit,
  error,
}: {
  onSubmit: (payload: UserPayload) => void
  error: boolean
}) {
  const [form, setForm] = useState<UserPayload>({
    email: '',
    full_name: '',
    role: 'officer',
    is_active: true,
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
      className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-900">New user</h2>
      {error && (
        <p className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not create the user. Check the email is unique and the password is
          valid.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input
          required
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <select
          value={form.role}
          onChange={(e) => update('role', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Create user
      </button>
    </form>
  )
}

function EditUserForm({
  user,
  onCancel,
  onSaved,
}: {
  user: AuthUser
  onCancel: () => void
  onSaved: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { password, ...details } = payload
      const updated = await updateUser(user.id, details)
      if (password) await resetPassword(user.id, password)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSaved()
    },
  })

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate(form)
      }}
    >
      {mutation.isError && (
        <p className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not update the user. Check the email is unique and the password meets
          the requirements.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            required
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            className={`${inputClass} w-full`}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 accent-brand-600"
          />
          Active account
        </label>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Leave blank to keep the current password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={`${inputClass} w-full pr-10`}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Filled in? The password is reset when you save.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
