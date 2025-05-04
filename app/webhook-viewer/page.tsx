"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { WebhookData } from "@/lib/webhook-store"

export default function WebhookViewerPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingWebhooks, setProcessingWebhooks] = useState(false)

  useEffect(() => {
    fetchWebhooks()

    // Refresh every 10 seconds
    const interval = setInterval(fetchWebhooks, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchWebhooks() {
    try {
      setLoading(true)
      const response = await fetch("/api/webhooks/list")
      const data = await response.json()

      if (data.success) {
        setWebhooks(data.webhooks)
      } else {
        setError(data.error || "Failed to load webhooks")
      }
    } catch (err) {
      setError("Error fetching webhooks")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleProcessWebhooks() {
    try {
      setProcessingWebhooks(true)
      const response = await fetch("/api/process-webhooks", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        alert(`Successfully processed ${data.processed} webhooks`)
        fetchWebhooks()
      } else {
        alert(`Error: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      alert("Error processing webhooks")
      console.error(err)
    } finally {
      setProcessingWebhooks(false)
    }
  }

  async function handleClearWebhooks() {
    if (!confirm("Are you sure you want to clear all webhooks?")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/webhooks/clear", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setWebhooks([])
      } else {
        setError(data.error || "Failed to clear webhooks")
      }
    } catch (err) {
      setError("Error clearing webhooks")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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
              <button
                onClick={handleProcessWebhooks}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={processingWebhooks || webhooks.filter((w) => !w.processed).length === 0}
              >
                {processingWebhooks ? "Processing..." : "Process Webhooks"}
              </button>
              <button
                onClick={handleClearWebhooks}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loading || webhooks.length === 0}
              >
                Clear Webhooks
              </button>
            </div>
          </div>

          {loading && webhooks.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading webhooks...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : webhooks.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Showing {webhooks.length} webhooks (refreshes automatically every 10 seconds)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 border border-blue-200">
                  <p className="font-medium">Webhook Stats</p>
                  <p className="mt-1">
                    Total: {webhooks.length}
                    <br />
                    Processed: {webhooks.filter((w) => w.processed).length}
                    <br />
                    Unprocessed: {webhooks.filter((w) => !w.processed).length}
                    <br />
                    Verified: {webhooks.filter((w) => w.verified).length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-md text-sm text-green-700 border border-green-200">
                  <p className="font-medium">Event Types</p>
                  <p className="mt-1">
                    {Object.entries(
                      webhooks.reduce(
                        (acc, webhook) => {
                          acc[webhook.eventType] = (acc[webhook.eventType] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([type, count]) => (
                      <span key={type} className="mr-2">
                        {type}: {count}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`border rounded-md p-4 ${
                    webhook.processed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{webhook.eventType}</span>
                      {webhook.verified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                      {webhook.processed && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Processed
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{new Date(webhook.receivedAt).toLocaleString()}</span>
                  </div>
                  <pre className="bg-white p-3 rounded-md overflow-auto text-sm">
                    {JSON.stringify(webhook.data, null, 2)}
                  </pre>
                  {webhook.processed && webhook.processedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Processed at: {new Date(webhook.processedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md border border-yellow-200">
              <p className="font-medium">No webhooks found</p>
              <p>No webhook data has been received yet. Try making a purchase or sending a test webhook.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Using Webhook Data in Your Code</h2>
          <p className="mb-4">There are several ways to use the webhook data in your application:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Event Listeners:</strong> Register listeners for specific event types in{" "}
              <code className="bg-gray-100 px-1 rounded">lib/webhook-processor.ts</code>
            </li>
            <li>
              <strong>Webhook Store:</strong> Access stored webhooks using functions in{" "}
              <code className="bg-gray-100 px-1 rounded">lib/webhook-store.ts</code>
            </li>
            <li>
              <strong>Process Webhooks:</strong> Process unprocessed webhooks using the "Process Webhooks" button above
            </li>
            <li>
              <strong>Database Integration:</strong> Modify the webhook store to use a database for persistence
            </li>
          </ol>

          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Example: Registering a Webhook Listener</h3>
            <pre className="bg-white p-3 rounded-md overflow-auto text-sm">
              {`// In lib/webhook-processor.ts
import { registerWebhookListener } from "./webhook-store"
import { EventName } from "@paddle/paddle-node-sdk"

// Register a listener for subscription created events
registerWebhookListener(EventName.SubscriptionCreated, async (data) => {
  console.log("Processing subscription created webhook:", data.id)
  
  // Your business logic here
  // For example, update user subscription status in your database
  await updateUserSubscription(data.customerId, data.id, "active")
  
  // Or send a welcome email
  await sendWelcomeEmail(data.customer.email)
})`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
