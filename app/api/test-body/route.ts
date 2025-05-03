import { type NextRequest, NextResponse } from "next/server"

// Use Node.js runtime for better compatibility
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  console.log("Test body endpoint received a POST request")

  try {
    // Clone the request to avoid consuming the body
    const clonedReq = req.clone()

    // Try to get the body as text
    const bodyText = await clonedReq.text()
    console.log(`Body text length: ${bodyText.length}`)

    if (bodyText.length > 0) {
      console.log("First 100 chars:", bodyText.substring(0, 100))
    } else {
      console.log("Body text is empty")
    }

    // Try alternative method
    try {
      const bodyBuffer = await new Response(req.body).arrayBuffer()
      const altBodyText = new TextDecoder().decode(bodyBuffer)
      console.log(`Alternative body length: ${altBodyText.length}`)

      if (altBodyText.length > 0) {
        console.log("Alt first 100 chars:", altBodyText.substring(0, 100))
      }
    } catch (e) {
      console.error("Alternative body access failed:", e)
    }

    // Get headers
    const headers = Object.fromEntries(req.headers.entries())

    return NextResponse.json({
      success: true,
      bodyReceived: bodyText.length > 0,
      bodyLength: bodyText.length,
      headers: headers,
    })
  } catch (error) {
    console.error("Error in test body endpoint:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send a POST request to this endpoint to test body handling",
    example: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "data" }),
    },
  })
}
