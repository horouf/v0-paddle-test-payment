import { type NextRequest, NextResponse } from "next/server"
import { getPaddleInstance } from "@/lib/paddle-utils"
import { ProcessWebhook } from "@/lib/process-webhook"

// Required for raw body access in Next.js / Vercel
export const config = {
  api: {
    bodyParser: false,
  },
}

// Use Node.js runtime for better compatibility
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

    // Get the raw request body
    const rawBody = await req.text()

    // Log the raw body length to verify we're getting data
    console.log(`Raw body length: ${rawBody.length} characters`)

    if (!rawBody || rawBody.length === 0) {
      console.error("❌ Empty request body received")
      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    if (!signature || !webhookSecret) {
      console.error("❌ Missing signature or webhook secret")
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
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

// Add a GET handler for testing the endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is working. Send a POST request with a valid Paddle webhook payload to test.",
  })
}
