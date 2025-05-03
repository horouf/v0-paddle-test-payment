import { type NextRequest, NextResponse } from "next/server"
import { getPaddleInstance } from "@/lib/paddle-utils"
import { ProcessWebhook } from "@/lib/process-webhook"
import fs from "fs"
import path from "path"

// Use Node.js runtime for better compatibility with raw body access
export const runtime = "nodejs"

// Create webhook processor instance
const webhookProcessor = new ProcessWebhook()

// Function to log webhook data with high visibility
function logWebhook(message: string, data?: any) {
  // Create a very visible log entry
  const logEntry = `
${"=".repeat(100)}
PADDLE WEBHOOK: ${message}
${"=".repeat(100)}
${data ? JSON.stringify(data, null, 2) : ""}
${"=".repeat(100)}
  `

  // Log to console with high visibility
  console.log(logEntry)

  // Try to write to a log file if running locally
  try {
    if (process.env.NODE_ENV !== "production") {
      const logDir = path.join(process.cwd(), "logs")

      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      const logFile = path.join(logDir, "webhook-logs.txt")
      fs.appendFileSync(logFile, `${new Date().toISOString()} - ${logEntry}\n\n`)
    }
  } catch (error) {
    console.error("Failed to write to log file:", error)
  }
}

export async function POST(req: NextRequest) {
  logWebhook("RECEIVED")

  try {
    // Log request details
    const requestInfo = {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    }
    logWebhook("REQUEST DETAILS", requestInfo)

    // Extract signature from headers
    const signature = req.headers.get("paddle-signature") || ""

    // Get the webhook secret
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ""

    // Check if API key is configured
    const apiKeyConfigured = !!process.env.PADDLE_API_KEY

    // Configuration status
    const configStatus = {
      signaturePresent: !!signature,
      webhookSecretConfigured: !!webhookSecret,
      apiKeyConfigured: apiKeyConfigured,
    }
    logWebhook("CONFIGURATION STATUS", configStatus)

    // IMPORTANT: Clone the request before reading the body
    const clonedReq = req.clone()

    // Get the raw request body
    const rawBody = await clonedReq.text()

    // Log body info
    logWebhook(`BODY RECEIVED (${rawBody.length} characters)`)

    if (rawBody.length > 0) {
      try {
        // Try to parse as JSON for prettier logging
        const jsonBody = JSON.parse(rawBody)
        logWebhook("PARSED BODY", jsonBody)
      } catch (e) {
        // If not valid JSON, log as is
        logWebhook("RAW BODY (not valid JSON)", { rawText: rawBody })
      }
    } else {
      logWebhook("EMPTY BODY RECEIVED")

      // Try alternative method to get body
      try {
        const bodyBuffer = await new Response(req.body).arrayBuffer()
        const bodyText = new TextDecoder().decode(bodyBuffer)

        if (bodyText.length > 0) {
          logWebhook(`ALTERNATIVE BODY (${bodyText.length} characters)`)
          try {
            const jsonBody = JSON.parse(bodyText)
            logWebhook("PARSED ALTERNATIVE BODY", jsonBody)

            // If this worked, use this body instead
            return await processWebhook(bodyText, signature, webhookSecret, apiKeyConfigured)
          } catch (e) {
            logWebhook("ALTERNATIVE BODY (not valid JSON)", { rawText: bodyText })
          }
        } else {
          logWebhook("ALTERNATIVE BODY ALSO EMPTY")
        }
      } catch (e) {
        logWebhook("ALTERNATIVE BODY ACCESS FAILED", { error: String(e) })
      }

      return NextResponse.json({ error: "Empty request body" }, { status: 400 })
    }

    return await processWebhook(rawBody, signature, webhookSecret, apiKeyConfigured)
  } catch (error) {
    logWebhook("UNHANDLED ERROR", { error: String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Separate function to process the webhook once we have the body
async function processWebhook(rawBody: string, signature: string, webhookSecret: string, apiKeyConfigured: boolean) {
  if (!signature) {
    logWebhook("MISSING SIGNATURE")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  if (!webhookSecret) {
    logWebhook("MISSING WEBHOOK SECRET")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (!apiKeyConfigured) {
    logWebhook("MISSING API KEY")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  try {
    // Get Paddle instance
    const paddle = getPaddleInstance()

    // Unmarshal and verify the webhook
    logWebhook("ATTEMPTING SIGNATURE VERIFICATION")
    const eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
    logWebhook("SIGNATURE VERIFIED SUCCESSFULLY")

    // Log the event type and data
    const eventType = eventData.eventType
    logWebhook(`EVENT TYPE: ${eventType}`, eventData)

    // Process the event using our ProcessWebhook class
    const result = await webhookProcessor.processEvent(eventData)
    logWebhook("EVENT PROCESSED SUCCESSFULLY", result)

    return NextResponse.json({
      success: true,
      message: "Webhook received and processed",
      eventType: eventType,
    })
  } catch (error) {
    logWebhook("ERROR PROCESSING WEBHOOK", { error: String(error) })
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Add a GET handler for testing the endpoint
export async function GET() {
  logWebhook("GET REQUEST RECEIVED")

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
