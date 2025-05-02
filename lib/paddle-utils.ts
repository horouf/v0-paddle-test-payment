import { Environment, LogLevel, Paddle, type PaddleOptions } from "@paddle/paddle-node-sdk"

/**
 * Creates and returns a configured Paddle instance
 */
export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  }

  // Use PADDLE_API_KEY as the primary key (this is what Paddle expects)
  const apiKey = process.env.PADDLE_API_KEY

  if (!apiKey) {
    console.error("Paddle API key is missing - webhook verification will fail")
    throw new Error("PADDLE_API_KEY environment variable is not set")
  }

  return new Paddle(apiKey, paddleOptions)
}
