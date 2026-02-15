'use client'

import {
  useSquareConnection,
  useDisconnectSquare,
  useTriggerSquareSync,
} from '@/modules/settings/hooks/useSquareConnection'

/**
 * Integrations settings tab.
 * Manages Square POS connection: connect via OAuth, view status, trigger sync, disconnect.
 */
export default function IntegrationsTab() {
  const { data: connection, isLoading } = useSquareConnection()
  const disconnect = useDisconnectSquare()
  const triggerSync = useTriggerSquareSync()

  const isConnected = !!connection
  const squareEnv = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox'

  const handleConnect = () => {
    // Redirect to our OAuth initiation endpoint
    window.location.href = '/api/integrations/square/connect'
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Square POS? Synced data will remain but no new data will be pulled.')) return
    try {
      await disconnect.mutateAsync()
    } catch {
      // Error handled by React Query
    }
  }

  const handleSync = async () => {
    try {
      await triggerSync.mutateAsync()
    } catch {
      // Error handled by React Query
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
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Integrations</h2>
        <p className="text-sm text-neutral-500">Connect external services to sync data automatically.</p>
      </div>

      {/* Square POS */}
      <section className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                  <path d="M4.01 0C1.8 0 0 1.8 0 4.01v15.98C0 22.2 1.8 24 4.01 24h15.98C22.2 24 24 22.2 24 19.99V4.01C24 1.8 22.2 0 19.99 0H4.01zm11.91 7.13c0-.5.41-.91.91-.91h1.96c.5 0 .91.41.91.91v1.96c0 .5-.41.91-.91.91h-1.96c-.5 0-.91-.41-.91-.91V7.13zm-7.84 0c0-.5.41-.91.91-.91h1.96c.5 0 .91.41.91.91v1.96c0 .5-.41.91-.91.91H9c-.5 0-.91-.41-.91-.91V7.13zm7.84 7.84c0-.5.41-.91.91-.91h1.96c.5 0 .91.41.91.91v1.96c0 .5-.41.91-.91.91h-1.96c-.5 0-.91-.41-.91-.91v-1.96zm-7.84 0c0-.5.41-.91.91-.91h1.96c.5 0 .91.41.91.91v1.96c0 .5-.41.91-.91.91H9c-.5 0-.91-.41-.91-.91v-1.96z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Square POS</h3>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Sync sales transactions, customers, and product catalog from Square.
                </p>
              </div>
            </div>
            <div>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                  Not connected
                </span>
              )}
            </div>
          </div>

          {squareEnv === 'sandbox' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-800">
              Running in <strong>Sandbox</strong> mode. No real transactions will be synced.
            </div>
          )}
        </div>

        {/* Connection details or connect button */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Merchant ID</p>
                  <p className="font-mono text-neutral-700">{connection.merchant_id || '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Locations</p>
                  <p className="text-neutral-700">
                    {connection.location_ids?.length || 0} location{(connection.location_ids?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Last sync</p>
                  <p className="text-neutral-700">
                    {connection.last_sync_at
                      ? new Date(connection.last_sync_at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Never'}
                  </p>
                </div>
              </div>

              {connection.sync_status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-800">
                  Last sync encountered an error. Try syncing again or reconnect.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={triggerSync.isPending || connection.sync_status === 'syncing'}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {triggerSync.isPending || connection.sync_status === 'syncing' ? 'Syncing…' : 'Sync now'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnect.isPending}
                  className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Connect your Square account to start syncing sales data.
              </p>
              <button
                onClick={handleConnect}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Connect Square
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Placeholder for future integrations */}
      <section className="border border-dashed border-neutral-300 rounded-lg p-6 text-center">
        <p className="text-sm text-neutral-400">More integrations coming soon.</p>
      </section>
    </div>
  )
}
