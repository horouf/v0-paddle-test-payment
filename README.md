# Simple Paddle Checkout

A minimal implementation of Paddle checkout using Next.js with comprehensive webhook handling.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Required for checkout
PADDLE_CLIENT_TOKEN=pt_your_client_token
PADDLE_PRICE_ID=pri_your_price_id

# Required for webhook handling
PADDLE_API_KEY=your_paddle_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret
\`\`\`

### About Paddle API Keys

- **PADDLE_CLIENT_TOKEN**: Used for the checkout frontend. This is a public token that starts with `pt_`.
- **PADDLE_API_KEY**: Used for server-side API calls and webhook verification. This is a secret key that starts with `pk_` (for sandbox) or `pk_prod_` (for production).
- **PADDLE_WEBHOOK_SECRET**: Used to verify incoming webhooks. This is set in your Paddle dashboard.

You can find these keys in your [Paddle Dashboard](https://vendors.paddle.com/authentication):
1. Go to Developer Tools > Authentication
2. Generate API keys if you don't have them
3. Set up webhook endpoints and secrets in the Notifications section

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
# or
yarn
# or
pnpm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Paddle Checkout

1. Use the "Purchase for $9" button to test the Paddle checkout flow.
2. Use the test card (4000 0566 5566 5556) with any future expiry date and any 3-digit CVV.

## Webhook Setup

Set up a webhook in your Paddle dashboard pointing to:
\`\`\`
https://your-domain.com/api/webhooks
\`\`\`

Make sure to set the same webhook secret in your Paddle dashboard and in your environment variables.

## Webhook Handling

This implementation provides comprehensive webhook handling for Paddle events:

1. Verifies the webhook signature using the Paddle SDK
2. Processes different event types (subscriptions, customers, transactions)
3. Logs detailed information about the events
4. Can be extended to store data in a database

### Supported Event Types

- Subscription Created/Updated
- Customer Created/Updated
- Transaction Completed
- And other Paddle webhook events

### Extending for Database Storage

The webhook processing code includes commented sections for database integration.
To store webhook data in a database, uncomment and implement the database methods in `lib/process-webhook.ts`.
\`\`\`

Let's update paddle-actions.ts to check for the API key as well:
