import { getLatestWebhook } from "@/lib/webhook-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const dynamic = "force-dynamic" // Make sure the page is not cached

export default async function ResultsPage() {
  const webhook = await getLatestWebhook()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Payment Results</h1>
          <Link href="/" passHref>
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Webhook Event</CardTitle>
          </CardHeader>
          <CardContent>
            {webhook ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{webhook.eventType}</span>
                    <span className="ml-2 text-xs text-gray-500">{new Date(webhook.timestamp).toLocaleString()}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      webhook.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {webhook.verified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="text-sm font-medium mb-2">Event Data:</h3>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-96 border">
                    {JSON.stringify(webhook.data, null, 2)}
                  </pre>
                </div>

                {webhook.data?.data?.customer && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Customer Information:</h3>
                    <p>
                      <span className="font-medium">Email:</span> {webhook.data.data.customer.email}
                    </p>
                    {webhook.data.data.customer.name && (
                      <p>
                        <span className="font-medium">Name:</span> {webhook.data.data.customer.name}
                      </p>
                    )}
                  </div>
                )}

                {webhook.data?.data?.total && (
                  <div className="bg-green-50 p-4 rounded-md border border-green-100">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Payment Information:</h3>
                    <p>
                      <span className="font-medium">Amount:</span> {webhook.data.data.total.amount}{" "}
                      {webhook.data.data.total.currency_code}
                    </p>
                    <p>
                      <span className="font-medium">Transaction ID:</span> {webhook.data.data.id}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span className="text-green-600 font-medium">{webhook.data.data.status || "completed"}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No webhook data available.</p>
                <p className="text-sm mt-2">
                  Complete a checkout to see webhook data here, or use the "Send Test Webhook" button.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/" passHref>
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
