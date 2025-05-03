/**
 * Paddle Payment Integration - Environment Variables
 *
 * This file documents all environment variables used in the application.
 * Make sure to set these in your .env.local file or in your hosting environment.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * Paddle Client Token - Required for frontend initialization
     * Format: "pt_..." (Paddle token format)
     * Used server-side and securely passed to client via server actions
     */
    PADDLE_CLIENT_TOKEN: string

    /**
     * Paddle Price ID - Required for checkout
     * Format: "pri_..." (Paddle price ID format)
     * Used server-side and securely passed to client via server actions
     */
    PADDLE_PRICE_ID: string

    /**
     * Paddle Webhook Secret - Required for webhook signature verification
     * This is used server-side only
     */
    PADDLE_WEBHOOK_SECRET: string

    /**
     * Paddle Seller ID - Optional, used for API calls
     * This is used server-side only
     */
    PADDLE_SELLER_ID?: string

    /**
     * Paddle API Key - Optional, used for API calls
     * This is used server-side only
     */
    PADDLE_API_KEY?: string
  }
}
