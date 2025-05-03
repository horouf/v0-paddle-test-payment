import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { saveWebhookData } from "@/lib/webhook-store"

// ⚠️ WARNING: TESTING ONLY - DO NOT USE IN PRODUCTION ⚠️
// This hard-coded secret is only for testing purposes
// In production, always use environment variables
const TEST_WEBHOOK_SECRET = "pdl_ntfset_01jsmeedxzygybd33gwak9rbaw_KrWV17WiZyPNuXRwAMemZPLJQ9v9tpLn"

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook received at:", new Date().toISOString())

    // Get the request body as text
    const rawBody = await request.text()
    let body

    try {
      body = JSON.parse(rawBody)
    } catch (e) {
      console.error("❌ Failed to parse webhook body:", e)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Log headers for debugging
    console.log("📋 Webhook Headers:")
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
      console.log(`   ${key}: ${value}`)
    })

    // Log the webhook body in a structured way
    console.log("📦 Webhook Body:")
    console.log(JSON.stringify(body, null, 2))

    // Get the Paddle-Signature header
    const signatureHeader = request.headers.get("paddle-signature")

    // Check for webhook secret - use environment variable first, fall back to test secret
    // ⚠️ WARNING: Using hard-coded secret for testing only
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || TEST_WEBHOOK_SECRET

    if (process.env.PADDLE_WEBHOOK_SECRET) {
      console.log("✅ Using PADDLE_WEBHOOK_SECRET from environment variables")
    } else {
      console.warn("⚠️ Using hard-coded TEST_WEBHOOK_SECRET - NOT SECURE FOR PRODUCTION")
    }

    // Detailed diagnostics for missing components
    if (!signatureHeader) {
      console.warn("⚠️ Missing paddle-signature header in the webhook request")
    }

    let isVerified = false
    let isMockSignature = false

    // Store webhook data regardless of verification
    const webhookData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType: body.event_type || body.eventType || "unknown",
      data: body,
      verified: false, // We'll update this if verification succeeds
    }

    // Check if this is a mock signature (for testing)
    if (signatureHeader && signatureHeader.includes("mock_signature_for_testing_only")) {
      console.log("🧪 Detected mock signature for testing")
      isMockSignature = true

      // For test webhooks with mock signatures, we'll consider them verified
      // but only in development/testing environments
      if (process.env.NODE_ENV !== "production") {
        isVerified = true
        webhookData.verified = true
        console.log("✅ Mock signature accepted in development environment")
      } else {
        console.warn("⚠️ Mock signature rejected in production environment")
      }
    }
    // Try to verify the signature if we have what we need and it's not a mock signature
    else if (signatureHeader && webhookSecret && !isMockSignature) {
      try {
        isVerified = verifyWebhookSignature(rawBody, signatureHeader, webhookSecret)
        webhookData.verified = isVerified
        console.log(`🔐 Signature verification: ${isVerified ? "✅ Valid" : "❌ Invalid"}`)

        if (!isVerified) {
          console.warn("⚠️ Signature verification failed - possible causes:")
          console.warn("   1. Incorrect webhook secret")
          console.warn("   2. Tampered webhook payload")
          console.warn("   3. Signature format mismatch")

          // Log more details about the signature for debugging
          console.log("🔍 Debugging signature verification:")
          console.log("   Signature header:", signatureHeader)
          // Don't log the full secret, just a hint
          console.log("   Secret used (first 4 chars):", webhookSecret.substring(0, 4) + "...")
        }
      } catch (error) {
        console.error("❌ Error verifying signature:", error)
      }
    } else if (!isMockSignature) {
      // More specific message about what's missing
      const missingItems = []
      if (!signatureHeader) missingItems.push("paddle-signature header")
      if (!webhookSecret) missingItems.push("webhook secret")

      console.warn(`⚠️ Cannot verify webhook: missing ${missingItems.join(" and ")}`)

      // For test webhooks, provide additional guidance
      if (request.headers.get("X-Test-Webhook")) {
        console.log("ℹ️ This appears to be a test webhook. For test webhooks:")
        console.log("   1. Make sure PADDLE_WEBHOOK_SECRET is set in your environment")
        console.log("   2. For local testing, you can add a mock signature header")
      }
    }

    // Save the webhook data
    await saveWebhookData(webhookData)

    // Process the webhook based on event type
    const eventType = body.event_type || body.eventType
    console.log(`📣 Event Type: ${eventType || "unknown"}`)

    if (eventType === "checkout.completed" || eventType === "checkout.complete") {
      console.log("✅ Checkout completed!")

      // Extract transaction data - handle both Paddle v1 and v2 formats
      const transactionData = {
        id: body.data?.id || body.checkout?.id || "unknown",
        customer: body.data?.customer?.email || body.checkout?.customer?.email || "unknown",
        total: body.data?.total?.amount || body.checkout?.total || "unknown",
      }

      console.log("💰 Transaction Details:")
      console.log(JSON.stringify(transactionData, null, 2))

      return NextResponse.json({
        success: true,
        message: "Webhook processed successfully",
        data: transactionData,
        redirectUrl: "/results",
      })
    }

    console.log("✓ Webhook processed")
    return NextResponse.json({ success: true, message: "Webhook received" })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    console.log("🔍 Verifying webhook signature...")

    // Parse the signature header
    const signatureParts = signature.split(";").reduce((acc: Record<string, string>, part: string) => {
      const [key, value] = part.split("=")
      if (key && value) acc[key.trim()] = value.trim()
      return acc
    }, {})

    console.log("🔑 Signature parts:", signatureParts)

    // Get timestamp and signature from header
    const timestamp = signatureParts.ts || signatureParts.t
    const providedSignature = signatureParts.h1 || signatureParts.v1

    if (!timestamp || !providedSignature) {
      console.error("❌ Invalid signature format: missing timestamp or signature")
      throw new Error("Invalid signature format: missing timestamp or signature")
    }

    // Create the signature
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(`${timestamp}:${payload}`)
    const calculatedSignature = hmac.digest("hex")

    console.log("🔐 Provided signature:", providedSignature)
    console.log("🔐 Calculated signature:", calculatedSignature)

    // Compare signatures
    return calculatedSignature === providedSignature
  } catch (error) {
    console.error("❌ Signature verification error:", error)
    return false
  }
}
