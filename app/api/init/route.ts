import { NextResponse } from "next/server"
import { initializeWebhookProcessors } from "@/lib/webhook-processor"

// Initialize webhook processors
let initialized = false

export async function GET() {
  if (!initialized) {
    try {
      await initializeWebhookProcessors()
      initialized = true
      return NextResponse.json({
        success: true,
        message: "Webhook processors initialized",
      })
    } catch (error) {
      console.error("Error initializing webhook processors:", error)
      return NextResponse.json({ error: "Failed to initialize webhook processors" }, { status: 500 })
    }
  } else {
    return NextResponse.json({
      success: true,
      message: "Webhook processors already initialized",
    })
  }
}
