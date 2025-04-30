import { type NextRequest, NextResponse } from "next/server"
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk"

// IMPORTANT: This prevents Next.js from automatically consuming the request body
export const config = {
  api: {
    // Disable the default body parser
    bodyParser: false,
  },
}

// Use Node.js runtime for better compatibility
export const runtime = "nodejs"

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_CLIENT_TOKEN!, {
  environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
})

export async function POST(req: NextRequest) {
  console.log("\n\n")
  console.log("*".repeat(80))
  console.log("*****                      WEBHOOK RECEIVED                           *****")
  console.log("*".repeat(80))

  try {
    // Extract signature from headers
    const signature = req.headers.get("paddle-signature") || ""
    console.log("Paddle signature:", signature)

    // Get the webhook secret
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""
    console.log("Webhook secret configured:", !!webhookSecret)

    // Get the raw request body as a string
    // This will now work because we've disabled the body parser
    const rawBody = await req.text()

    // Log the raw body length to verify we're getting data
    console.log(`Raw body length: ${rawBody.length} characters`)

    if (!rawBody || rawBody.length === 0) {
      console.error("❌ Empty request body received")
      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    console.log("\n--- RAW WEBHOOK BODY START ---\n")
    console.log(rawBody)
    console.log("\n--- RAW WEBHOOK BODY END ---\n")

    let eventData
    let verified = false

    // Try to parse the body as JSON
    try {
      const parsedBody = JSON.parse(rawBody)
      console.log("Successfully parsed body as JSON")

      console.log("\n--- PARSED WEBHOOK BODY START ---\n")
      console.log(JSON.stringify(parsedBody, null, 2))
      console.log("\n--- PARSED WEBHOOK BODY END ---\n")

      eventData = parsedBody
    } catch (parseError) {
      console.error("❌ Failed to parse webhook body as JSON:", parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    // Try to verify the signature if we have all required data
    if (signature && webhookSecret && rawBody) {
      try {
        const verifiedData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
        verified = true
        console.log("✅ Webhook signature verified successfully")
        eventData = verifiedData
      } catch (error) {
        console.error("❌ Signature verification failed:", error)
      }
    } else {
      console.warn("⚠️ Missing signature or secret - skipping verification")
    }

    // Extract and log the event type
    const eventType = eventData.eventType || eventData.event_type || "unknown"
    console.log("\n=== WEBHOOK EVENT DETAILS ===")
    console.log(`Event Type: ${eventType}`)
    console.log(`Verified: ${verified ? "Yes" : "No"}`)

    // Process different event types
    switch (eventType) {
      case EventName.SubscriptionActivated:
        console.log(`Subscription ${eventData.data?.id || "unknown"} was activated`)
        break
      case EventName.SubscriptionCanceled:
        console.log(`Subscription ${eventData.data?.id || "unknown"} was canceled`)
        break
      case EventName.TransactionPaid:
        console.log(`Transaction ${eventData.data?.id || "unknown"} was paid`)
        break
      case "checkout.completed":
        console.log(`Checkout ${eventData.data?.id || "unknown"} was completed`)
        break
      default:
        console.log(`Received ${eventType} event`)
    }

    console.log("*".repeat(80))
    console.log("*****                      WEBHOOK PROCESSED                        *****")
    console.log("*".repeat(80))
    console.log("\n\n")

    return NextResponse.json({
      success: true,
      message: "Webhook received and processed",
      eventType: eventType,
      verified: verified,
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
