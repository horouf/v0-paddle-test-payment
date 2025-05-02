"use server"

/**
 * Server action to securely fetch the Paddle client token
 */
export async function getPaddleClientToken() {
  return process.env.PADDLE_CLIENT_TOKEN || ""
}

/**
 * Server action to securely fetch the Paddle price ID
 */
export async function getPaddlePriceId() {
  return process.env.PADDLE_PRICE_ID || ""
}

/**
 * Server action to check if the webhook secret is configured
 */
export async function checkWebhookSecretConfigured() {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""
  const apiKey = process.env.PADDLE_SECRET_TOKEN || process.env.PADDLE_CLIENT_TOKEN || ""

  return {
    webhookConfigured: !!webhookSecret,
    apiKeyConfigured: !!apiKey,
  }
}
