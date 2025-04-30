import { type NextRequest, NextResponse } from "next/server"
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk"

// Required for raw body access in Vercel / App Router
export const config = {
  api: {
    bodyParser: false,
  },
}

// Vercel edge runtimes don't support req.text(), so stick with node
export const runtime = "nodejs"

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_CLIENT_TOKEN!, {
  environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
})

export async function POST(req: NextRequest) {
  console.log("📬 Received Paddle webhook")

  try {
    const signature = req.headers.get("paddle-signature") || ""
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""

    const rawBody = await req.text()
    console.log("Raw webhook body:", rawBody)

    let eventData
    let verified = false

    if (signature && webhookSecret && rawBody) {
      try {
        eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
        verified = true
        console.log("✅ Webhook signature verified")
      } catch (error) {
        console.error("❌ Signature verification failed:", error)
        try {
          eventData = JSON.parse(rawBody)
        } catch (parseError) {
          return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
        }
      }
    } else {
      console.warn("⚠️ Missing signature or secret - skipping verification")
      try {
        eventData = JSON.parse(rawBody)
      } catch (parseError) {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
      }
    }

    const eventType = eventData.eventType || eventData.event_type || "unknown"

    console.log("=== PADDLE WEBHOOK RECEIVED ===")
    console.log(`Event Type: ${eventType}`)
    console.log(`Verified: ${verified ? "Yes" : "No"}`)
    console.log("Payload:", JSON.stringify(eventData, null, 2))
    console.log("===============================")

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
