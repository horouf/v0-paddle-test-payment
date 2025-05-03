"use server"

// ⚠️ WARNING: TESTING ONLY - DO NOT USE IN PRODUCTION ⚠️
// This is just to check if we're using the test secret
const TEST_WEBHOOK_SECRET = "pdl_ntfset_01jsmeedxzygybd33gwak9rbaw_KrWV17WiZyPNuXRwAMemZPLJQ9v9tpLn"

/**
 * Server action to securely fetch the Paddle client token
 * This prevents exposing the token directly in client-side code
 */
export async function getPaddleClientToken() {
  // Return the token from server-side environment variables
  return process.env.PADDLE_CLIENT_TOKEN || ""
}

/**
 * Server action to securely fetch the Paddle price ID
 * This prevents exposing the price ID directly in client-side code
 */
export async function getPaddlePriceId() {
  return process.env.PADDLE_PRICE_ID || ""
}

/**
 * Server action to check if the webhook secret is configured
 * This helps diagnose webhook verification issues
 */
export async function checkWebhookSecretConfigured() {
  const hasEnvSecret = !!process.env.PADDLE_WEBHOOK_SECRET

  return {
    configured: hasEnvSecret,
    usingTestSecret: !hasEnvSecret, // If no env secret, we'll use the test secret
    // Don't return the actual secret, just whether it's configured
  }
}
