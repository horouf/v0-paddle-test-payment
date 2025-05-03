import { checkPaddleConfiguration } from "@/lib/paddle-actions"

export default async function ConfigCheckPage() {
  const config = await checkPaddleConfiguration()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Paddle Configuration Check</h1>
          <p className="mt-2 text-gray-600">Checking your environment variables</p>
        </div>

        <div className="space-y-4">
          <div
            className={`p-4 rounded-md text-sm border ${config.checkoutConfigured ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            <p className="font-medium">Checkout Configuration</p>
            <p className="mt-1">
              {config.checkoutConfigured
                ? "✅ Checkout is properly configured"
                : "❌ Checkout configuration is incomplete"}
            </p>
            {!config.checkoutConfigured && (
              <ul className="mt-2 list-disc list-inside">
                {config.missingKeys.clientToken && <li>Missing PADDLE_CLIENT_TOKEN</li>}
                {config.missingKeys.priceId && <li>Missing PADDLE_PRICE_ID</li>}
              </ul>
            )}
          </div>

          <div
            className={`p-4 rounded-md text-sm border ${config.webhooksConfigured ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            <p className="font-medium">Webhook Configuration</p>
            <p className="mt-1">
              {config.webhooksConfigured
                ? "✅ Webhooks are properly configured"
                : "❌ Webhook configuration is incomplete"}
            </p>
            {!config.webhooksConfigured && (
              <ul className="mt-2 list-disc list-inside">
                {config.missingKeys.apiKey && <li>Missing PADDLE_API_KEY</li>}
                {config.missingKeys.webhookSecret && <li>Missing PADDLE_WEBHOOK_SECRET</li>}
              </ul>
            )}
          </div>

          <a
            href="/"
            className="block w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 text-center"
          >
            Back to Checkout
          </a>
        </div>
      </div>
    </div>
  )
}
