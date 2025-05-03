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
 * Server action to check if required Paddle configuration is available
 */
export async function checkPaddleConfiguration() {
  const clientToken = process.env.PADDLE_CLIENT_TOKEN || ""
  const priceId = process.env.PADDLE_PRICE_ID || ""
  const apiKey = process.env.PADDLE_API_KEY || ""
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""

  return {
    checkoutConfigured: !!clientToken && !!priceId,
    webhooksConfigured: !!apiKey && !!webhookSecret,
    missingKeys: {
      clientToken: !clientToken,
      priceId: !priceId,
      apiKey: !apiKey,
      webhookSecret: !webhookSecret,
    },
  }
}
