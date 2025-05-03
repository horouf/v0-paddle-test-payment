import { type NextRequest, NextResponse } from "next/server"
import { getPaddleInstance } from "@/lib/paddle-utils"
import { ProcessWebhook } from "@/lib/process-webhook"

// For App Router, we need to use a different approach
// The bodyParser: false config doesn't work the same way as in Pages Router

// Use Node.js runtime for better compatibility with raw body access
export const runtime = "nodejs"

// Create webhook processor instance
const webhookProcessor = new ProcessWebhook()

export async function POST(req: NextRequest) {
  console.log("\n\n")
  console.log("*".repeat(80))
  console.log("*****                      WEBHOOK RECEIVED                           *****")
  console.log("*".repeat(80))

  try {
    // Extract signature from headers
    const signature = req.headers.get("paddle-signature") || ""
    console.log("Paddle signature:", signature ? "Present" : "Missing")

    // Get the webhook secret
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""
    console.log("Webhook secret configured:", !!webhookSecret)

    // Check if API key is configured
    const apiKeyConfigured = !!process.env.PADDLE_API_KEY
    console.log("API key configured:", apiKeyConfigured)

    // IMPORTANT: Clone the request before reading the body
    // This prevents the body from being consumed before we can read it
    const clonedReq = req.clone()

    // Get the raw request body
    const rawBody = await clonedReq.text()

    // Log the raw body length to verify we're getting data
    console.log(`Raw body length: ${rawBody.length} characters`)

    if (rawBody.length > 0) {
      console.log("First 100 chars of body:", rawBody.substring(0, 100))
    }

    if (!rawBody || rawBody.length === 0) {
      console.error("❌ Empty request body received")

      // Try an alternative approach to get the body
      try {
        const bodyBuffer = await new Response(req.body).arrayBuffer()
        const bodyText = new TextDecoder().decode(bodyBuffer)
        console.log("Alternative body access - length:", bodyText.length)

        if (bodyText.length > 0) {
          console.log("First 100 chars:", bodyText.substring(0, 100))
          // If this worked, use this body instead
          return await processWebhook(bodyText, signature, webhookSecret, apiKeyConfigured)
        }
      } catch (e) {
        console.error("Alternative body access failed:", e)
      }

      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    return await processWebhook(rawBody, signature, webhookSecret, apiKeyConfigured)
  } catch (error) {
    console.error("❌ Unhandled error in webhook handler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    console.log("*".repeat(80))
    console.log("*****                      WEBHOOK PROCESSING COMPLETE              *****")
    console.log("*".repeat(80))
    console.log("\n\n")
  }
}

// Separate function to process the webhook once we have the body
async function processWebhook(rawBody: string, signature: string, webhookSecret: string, apiKeyConfigured: boolean) {
  if (!signature) {
    console.error("❌ Missing signature in request headers")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  if (!webhookSecret) {
    console.error("❌ Missing webhook secret in environment variables")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (!apiKeyConfigured) {
    console.error("❌ Missing Paddle API key in environment variables")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  try {
    // Get Paddle instance
    const paddle = getPaddleInstance()

    // Unmarshal and verify the webhook
    const eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
    console.log("✅ Webhook signature verified successfully")

    // Log the event type
    const eventType = eventData.eventType
    console.log(`Event Type: ${eventType}`)

    // Process the event using our ProcessWebhook class
    const result = await webhookProcessor.processEvent(eventData)

    console.log("✅ Event processed successfully:", result)

    return NextResponse.json({
      success: true,
      message: "Webhook received and processed",
      eventType: eventType,
    })
  } catch (error) {
    console.error("❌ Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Add a GET handler for testing the endpoint
export async function GET() {
  const apiKeyConfigured = !!process.env.PADDLE_API_KEY
  const webhookSecretConfigured = !!process.env.PADDLE_WEBHOOK_SECRET

  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is working. Send a POST request with a valid Paddle webhook payload to test.",
    configuration: {
      apiKeyConfigured,
      webhookSecretConfigured,
    },
  })
}
