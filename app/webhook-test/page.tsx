import Link from "next/link"

export default function WebhookTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Webhook Test Page</h1>
          <p className="mt-2 text-gray-600">Use this page to test and troubleshoot webhook functionality.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 border border-blue-200">
            <p className="font-medium">Webhook Endpoints</p>
            <p className="mt-1">
              Main webhook endpoint: <code className="bg-blue-100 px-1 rounded">/api/webhooks</code>
              <br />
              Test body endpoint: <code className="bg-blue-100 px-1 rounded">/api/test-body</code>
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md text-sm text-yellow-700 border border-yellow-200">
            <p className="font-medium">Troubleshooting Tips</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Use the test body endpoint to verify request body handling</li>
              <li>Check Vercel logs immediately after webhook events</li>
              <li>Verify webhook URL in Paddle dashboard</li>
              <li>Ensure PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET are set correctly</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 text-center"
            >
              Back to Checkout
            </Link>

            <Link
              href="/api/webhooks"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 text-center"
              target="_blank"
            >
              Test Webhook Endpoint
            </Link>

            <Link
              href="/api/test-body"
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 text-center"
              target="_blank"
            >
              Test Body Handling
            </Link>

            <Link
              href="/config-check"
              className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-center"
            >
              Check Configuration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
