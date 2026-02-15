'use client'

import { useState } from 'react'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import {
  useTeamMembers,
  useUpdateTeamMemberRole,
  useDeactivateTeamMember,
} from '@/modules/settings/hooks/useTeamMembers'
import { useOrganization } from '@/modules/settings/hooks/useOrganization'

const ROLES = ['owner', 'admin', 'manager', 'operator', 'viewer'] as const

/**
 * Team settings tab.
 * Lists team members, allows role changes and deactivation.
 * Invite flow is placeholder — requires Supabase invite-by-email logic.
 */
export default function TeamTab() {
  const { user } = useAuth()
  const { data: org } = useOrganization()
  const { data: members, isLoading } = useTeamMembers()
  const updateRole = useUpdateTeamMemberRole()
  const deactivate = useDeactivateTeamMember()

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin'
  const activeMembers = members?.filter((m) => m.is_active) || []
  const inactiveMembers = members?.filter((m) => !m.is_active) || []

  const handleRoleChange = async (memberId: string, role: string) => {
    setMessage(null)
    try {
      await updateRole.mutateAsync({ memberId, role })
      setMessage({ type: 'success', text: 'Role updated.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update role.' })
    }
  }

  const handleDeactivate = async (memberId: string, memberName: string) => {
    if (!confirm(`Deactivate ${memberName || 'this member'}? They will lose access.`)) return
    setMessage(null)
    try {
      await deactivate.mutateAsync(memberId)
      setMessage({ type: 'success', text: 'Member deactivated.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to deactivate member.' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Team</h2>
          <p className="text-sm text-neutral-500">
            {activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''}
            {org ? ` of ${org.max_users} allowed` : ''}
          </p>
        </div>
        {isOwnerOrAdmin && (
          <button
            disabled
            title="Invite flow coming soon"
            className="px-4 py-2 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Invite member
          </button>
        )}
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Active members */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Member</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Joined</th>
              {isOwnerOrAdmin && (
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {activeMembers.map((member) => {
              const isSelf = member.user_id === user?.id
              return (
                <tr key={member.id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {member.display_name || 'Unknown'}
                        {isSelf && <span className="ml-1 text-xs text-neutral-400">(you)</span>}
                      </p>
                      {member.email && (
                        <p className="text-xs text-neutral-500">{member.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isOwnerOrAdmin && !isSelf ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-copper/50 outline-none"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-full text-xs capitalize">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {member.accepted_at
                      ? new Date(member.accepted_at).toLocaleDateString()
                      : member.created_at
                      ? new Date(member.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  {isOwnerOrAdmin && (
                    <td className="px-4 py-3 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleDeactivate(member.id, member.display_name || '')}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
            {activeMembers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inactive members */}
      {inactiveMembers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-3">
            Deactivated ({inactiveMembers.length})
          </h3>
          <div className="border border-neutral-200 rounded-lg overflow-hidden opacity-60">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {inactiveMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-2 text-neutral-500">
                      {member.display_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-2 text-neutral-400 capitalize">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
