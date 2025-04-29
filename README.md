# Simple Paddle Checkout

A minimal implementation of Paddle checkout using Next.js.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Required environment variables
PADDLE_CLIENT_TOKEN=pt_your_client_token
PADDLE_PRICE_ID=pri_your_price_id

# For webhook verification
PADDLE_WEBHOOK_SECRET=your_webhook_secret
\`\`\`

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

This implementation simply logs webhook payloads to the console. When a webhook is received:

1. The signature is verified using the Paddle SDK
2. The webhook payload is logged to the console
3. A success response is returned to Paddle

To view webhook logs, check your server console or deployment logs.
\`\`\`

Let's also update the paddle-actions.ts file to remove any references to the webhook store:
