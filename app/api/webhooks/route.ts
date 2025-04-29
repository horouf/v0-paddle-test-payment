import { type NextRequest, NextResponse } from "next/server"
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk"

// Set runtime to nodejs to ensure req.text() works properly
export const runtime = "nodejs"

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_CLIENT_TOKEN!, {
  environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
})

export async function POST(req: NextRequest) {
  console.log("📬 Received Paddle webhook")

  try {
    // Extract signature from headers
    const signature = req.headers.get("paddle-signature") || ""
    console.log("Signature:", signature)

    // Get the webhook secret
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""

    // Get the raw request body
    const rawBody = await req.text()
    console.log("Raw webhook body:", rawBody)

    let eventData
    let verified = false

    // Verify the webhook signature if we have both signature and secret
    if (signature && webhookSecret && rawBody) {
      try {
        // The `unmarshal` function will validate the integrity of the webhook
        eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
        verified = true
        console.log("✅ Webhook signature verified")
      } catch (error) {
        console.error("❌ Webhook signature verification failed:", error)
        // Continue processing even if verification fails, but mark as unverified
        try {
          eventData = JSON.parse(rawBody)
        } catch (parseError) {
          console.error("Failed to parse webhook body as JSON:", parseError)
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
        }
      }
    } else {
      // If we don't have signature or secret, just parse the JSON
      console.warn("⚠️ Missing signature or webhook secret - skipping verification")
      try {
        eventData = JSON.parse(rawBody)
      } catch (parseError) {
        console.error("Failed to parse webhook body as JSON:", parseError)
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
      }
    }

    // Extract event type
    const eventType = eventData.eventType || eventData.event_type || "unknown"

    // Log detailed information about the webhook
    console.log("=== PADDLE WEBHOOK RECEIVED ===")
    console.log(`Event Type: ${eventType}`)
    console.log(`Verified: ${verified ? "Yes" : "No"}`)
    console.log("Payload:", JSON.stringify(eventData, null, 2))
    console.log("===============================")

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

    // Return success response
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
