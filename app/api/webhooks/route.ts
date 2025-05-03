import { NextResponse } from "next/server"
import { getWebhooks, clearWebhooks } from "@/lib/webhook-store"

export async function GET() {
  try {
    const webhooks = await getWebhooks()
    return NextResponse.json(webhooks)
  } catch (error) {
    console.error("Error getting webhooks:", error)
    return NextResponse.json({ error: "Failed to get webhooks" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearWebhooks()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing webhooks:", error)
    return NextResponse.json({ error: "Failed to clear webhooks" }, { status: 500 })
  }
}
