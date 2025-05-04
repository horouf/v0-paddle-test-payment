import { NextResponse } from "next/server"
import { clearWebhooks } from "@/lib/webhook-store"

export async function POST() {
  try {
    await clearWebhooks()
    return NextResponse.json({
      success: true,
      message: "All webhooks cleared",
    })
  } catch (error) {
    console.error("Error clearing webhooks:", error)
    return NextResponse.json({ error: "Failed to clear webhooks" }, { status: 500 })
  }
}
