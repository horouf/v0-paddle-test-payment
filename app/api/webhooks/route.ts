import { type NextRequest, NextResponse } from "next/server"
import { getPaddleInstance } from "@/lib/paddle-utils"
import { saveWebhook } from "@/lib/webhook-store"
import crypto from "crypto"

// Use Node.js runtime for better compatibility with raw body access
export const runtime = "nodejs"

// Function to log webhook data with high visibility
function logWebhook(message: string, data?: any) {
  console.log(`\n${"=".repeat(80)}\nPADDLE WEBHOOK: ${message}\n${"=".repeat(80)}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
    console.log("=".repeat(80))
  }
}

export async function POST(req: NextRequest) {
  logWebhook("RECEIVED")

  try {
    // Extract signature from headers
    const signature = req.headers.get("paddle-signature") || ""

    // Get the webhook secret
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""

    // Check if API key is configured
    const apiKeyConfigured = !!process.env.PADDLE_API_KEY

    // Configuration status
    logWebhook("CONFIGURATION STATUS", {
      signaturePresent: !!signature,
      webhookSecretConfigured: !!webhookSecret,
      apiKeyConfigured: apiKeyConfigured,
    })

    // IMPORTANT: Clone the request before reading the body
    const clonedReq = req.clone()

    // Get the raw request body
    const rawBody = await clonedReq.text()

    // Log body info
    logWebhook(`BODY RECEIVED (${rawBody.length} characters)`)

    if (rawBody.length === 0) {
      logWebhook("EMPTY BODY RECEIVED")
      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    // Parse the body
    let eventData
    let verified = false

    try {
      // Try to parse as JSON
      eventData = JSON.parse(rawBody)

      // If we have signature and secret, verify the webhook
      if (signature && webhookSecret && apiKeyConfigured) {
        try {
          // Get Paddle instance
          const paddle = getPaddleInstance()

          // Verify the webhook
          const verifiedData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
          eventData = verifiedData // Use the verified data
          verified = true
          logWebhook("SIGNATURE VERIFIED SUCCESSFULLY")
        } catch (error) {
          logWebhook("SIGNATURE VERIFICATION FAILED", { error: String(error) })
        }
      } else {
        logWebhook("SKIPPING VERIFICATION - MISSING REQUIREMENTS")
      }
    } catch (error) {
      logWebhook("FAILED TO PARSE WEBHOOK BODY", { error: String(error) })
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    // Extract event type
    const eventType = eventData.eventType || eventData.event_type || "unknown"
    logWebhook(`EVENT TYPE: ${eventType}`, eventData)

    // Generate a unique ID for this webhook
    const webhookId = crypto.randomUUID()

    // Store the webhook in our enhanced store
    await saveWebhook({
      id: webhookId,
      eventType,
      receivedAt: new Date().toISOString(),
      verified,
      data: eventData,
    })

    logWebhook("WEBHOOK STORED SUCCESSFULLY", { id: webhookId })

    return NextResponse.json({
      success: true,
      message: "Webhook received and stored",
      eventType,
      webhookId,
      verified,
    })
  } catch (error) {
    logWebhook("UNHANDLED ERROR", { error: String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a GET handler for testing the endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is working. Send a POST request with a valid Paddle webhook payload to test.",
    configuration: {
      apiKeyConfigured: !!process.env.PADDLE_API_KEY,
      webhookSecretConfigured: !!process.env.PADDLE_WEBHOOK_SECRET,
    },
  })
}
