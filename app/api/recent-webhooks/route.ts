import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Use Node.js runtime
export const runtime = "nodejs"

// In-memory storage for recent webhooks (for Vercel deployments)
const recentWebhooks: any[] = []

// Maximum number of webhooks to store
const MAX_WEBHOOKS = 10

// Add a webhook to the in-memory storage
export function storeWebhook(webhook: any) {
  // Add to the beginning of the array
  recentWebhooks.unshift({
    timestamp: new Date().toISOString(),
    data: webhook,
  })

  // Keep only the most recent webhooks
  if (recentWebhooks.length > MAX_WEBHOOKS) {
    recentWebhooks.pop()
  }
}

export async function GET() {
  try {
    // First check in-memory storage
    if (recentWebhooks.length > 0) {
      return NextResponse.json({
        success: true,
        source: "memory",
        webhooks: recentWebhooks,
      })
    }

    // If no webhooks in memory, try to read from log file (local development only)
    if (process.env.NODE_ENV !== "production") {
      const logFile = path.join(process.cwd(), "logs", "webhook-logs.txt")

      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, "utf-8")

        return NextResponse.json({
          success: true,
          source: "file",
          logContent: logContent,
        })
      }
    }

    // No webhooks found
    return NextResponse.json({
      success: false,
      message: "No recent webhooks found",
    })
  } catch (error) {
    console.error("Error retrieving recent webhooks:", error)
    return NextResponse.json({ error: "Failed to retrieve webhooks" }, { status: 500 })
  }
}
