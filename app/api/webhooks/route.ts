import { type NextRequest, NextResponse } from "next/server"

// Force Node.js runtime for better compatibility with raw body access
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  console.log("\n=== PADDLE WEBHOOK RECEIVED ===")

  try {
    // Get the raw request body
    const arr = await req.arrayBuffer()
    const rawBody = Buffer.from(arr).toString("utf8")

    // Log the raw payload with high visibility
    console.log("\nRAW WEBHOOK PAYLOAD:")
    console.log("=".repeat(80))
    console.log(rawBody)
    console.log("=".repeat(80))

    // Try to parse and log as JSON for better readability
    try {
      const jsonData = JSON.parse(rawBody)
      console.log("\nPARSED JSON:")
      console.log(JSON.stringify(jsonData, null, 2))
    } catch (e) {
      console.log("Could not parse payload as JSON")
    }

    // Log request headers
    console.log("\nREQUEST HEADERS:")
    const headers = Object.fromEntries(req.headers.entries())
    console.log(JSON.stringify(headers, null, 2))

    console.log("\n=== END WEBHOOK PAYLOAD ===")

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Simple GET handler for testing the endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is working. Send a POST request with a Paddle webhook payload to test.",
  })
}
