# Paddle Payment Test

This is a test application for Paddle payment integration using Next.js.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Server-side environment variables
PADDLE_CLIENT_TOKEN=pt_your_client_token
PADDLE_PRICE_ID=pri_your_price_id
PADDLE_WEBHOOK_SECRET=your_webhook_secret

# Optional for API calls (server-side only)
PADDLE_SELLER_ID=your_seller_id
PADDLE_API_KEY=your_api_key
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

## Testing Paddle Integration

1. Use the "Purchase for $9" button to test the Paddle checkout flow.
2. Use the "Send Test Webhook" button to simulate a webhook event.
3. View webhook events on the results page after checkout or test webhook.

## Webhook Setup

Set up a webhook in your Paddle dashboard pointing to:
\`\`\`
https://your-domain.com/api/paddle/webhook
\`\`\`

Make sure to set the same webhook secret in your Paddle dashboard and in your environment variables.

## Sandbox Testing

This application is configured to use Paddle's sandbox environment. Use the following test card for payments:

- Card Number: 4242 4242 4242 4242
- Expiry Date: Any future date
- CVV: Any 3 digits
