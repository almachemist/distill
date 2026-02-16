'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useOrganization } from '@/modules/settings/hooks/useOrganization'
import { createClient } from '@/lib/supabase/client'

/**
 * Profile settings tab.
 * Allows updating display name and changing password.
 * Email is read-only (managed by Supabase Auth).
 */
export default function ProfileTab() {
  const { user } = useAuth()
  const { data: org } = useOrganization()
  const [displayName, setDisplayName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName)
  }, [user?.displayName])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    setChangingPassword(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password changed successfully.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Profile</h2>
        <p className="text-sm text-neutral-500">Manage your personal account settings.</p>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Display name */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-700">General</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-neutral-600 mb-1">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500 cursor-not-allowed"
            />
            <p className="text-xs text-neutral-400 mt-1">Email cannot be changed here.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Role</label>
            <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full capitalize">
              {user?.role || 'viewer'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Organization</label>
            <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">
              {org?.name || '—'}
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving || !displayName.trim()}
            className="px-5 py-2 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>

      <hr className="border-neutral-200" />

      {/* Password change */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-700">Change password</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="sm:col-span-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-600 mb-1">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-600 mb-1">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {changingPassword ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </section>
    </div>
  )
}
