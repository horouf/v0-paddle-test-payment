"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function WebhookViewerPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [logContent, setLogContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string>("")

  useEffect(() => {
    async function fetchWebhooks() {
      try {
        setLoading(true)
        const response = await fetch("/api/recent-webhooks")
        const data = await response.json()

        if (data.success) {
          setSource(data.source)
          if (data.source === "memory") {
            setWebhooks(data.webhooks)
          } else if (data.source === "file") {
            setLogContent(data.logContent)
          }
        } else {
          setError(data.message || "Failed to load webhooks")
        }
      } catch (err) {
        setError("Error fetching webhooks")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWebhooks()

    // Refresh every 10 seconds
    const interval = setInterval(fetchWebhooks, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Paddle Webhook Viewer</h1>
            <div className="space-x-2">
              <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Home
              </Link>
              <Link href="/webhook-test" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Webhook Test
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading webhooks...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : source === "memory" && webhooks.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Showing {webhooks.length} recent webhooks (refreshes automatically every 10 seconds)
              </p>
              {webhooks.map((webhook, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{webhook.data.eventType || "Unknown Event Type"}</span>
                    <span className="text-sm text-gray-500">{webhook.timestamp}</span>
                  </div>
                  <pre className="bg-gray-50 p-3 rounded-md overflow-auto text-sm">
                    {JSON.stringify(webhook.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : source === "file" && logContent ? (
            <div className="space-y-4">
              <p className="text-gray-600">Showing webhook logs from file (refreshes automatically every 10 seconds)</p>
              <pre className="bg-gray-50 p-3 rounded-md overflow-auto text-sm h-[600px]">{logContent}</pre>
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md border border-yellow-200">
              <p className="font-medium">No webhooks found</p>
              <p>No webhook data has been received yet. Try making a purchase or sending a test webhook.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Webhook Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure your webhook URL is configured in Paddle Dashboard (Developer Tools &gt; Notifications)</li>
            <li>
              Ensure your webhook URL points to:{" "}
              <code className="bg-gray-100 px-1 rounded">https://your-domain.com/api/webhooks</code>
            </li>
            <li>Make a test purchase using the checkout button on the home page</li>
            <li>Check this page after a few seconds to see if the webhook was received and processed</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
