import { Environment, LogLevel, Paddle, type PaddleOptions } from "@paddle/paddle-node-sdk"

/**
 * Creates and returns a configured Paddle instance
 */
export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  }

  // Use PADDLE_SECRET_TOKEN or fallback to PADDLE_CLIENT_TOKEN if not available
  const apiKey = process.env.PADDLE_SECRET_TOKEN || process.env.PADDLE_CLIENT_TOKEN

  if (!apiKey) {
    console.error("Paddle API key is missing")
  }

  return new Paddle(apiKey!, paddleOptions)
}
