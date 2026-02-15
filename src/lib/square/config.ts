/**
 * Square API configuration.
 * Centralizes environment detection and URL construction for Square OAuth and API calls.
 *
 * @see https://developer.squareup.com/docs/oauth-api/overview
 */

export function getSquareConfig() {
  const env = (process.env.SQUARE_ENVIRONMENT || 'sandbox').toLowerCase()
  const isSandbox = env === 'sandbox'

  return {
    applicationId: process.env.SQUARE_APPLICATION_ID || '',
    applicationSecret: process.env.SQUARE_APPLICATION_SECRET || '',
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
    isSandbox,
    /** Base URL for Square OAuth endpoints */
    oauthBaseUrl: isSandbox
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com',
    /** Base URL for Square REST API */
    apiBaseUrl: isSandbox
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com',
    /** OAuth scopes required for sales/CRM sync */
    scopes: [
      'ORDERS_READ',
      'CUSTOMERS_READ',
      'ITEMS_READ',
      'MERCHANT_PROFILE_READ',
    ],
  }
}
