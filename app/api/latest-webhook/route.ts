import { NextResponse } from "next/server"
import { getLatestWebhook } from "@/lib/webhook-store"

export async function GET() {
  try {
    const webhook = await getLatestWebhook()
    return NextResponse.json(webhook || { message: "No webhook data available" })
  } catch (error) {
    console.error("Error getting latest webhook:", error)
    return NextResponse.json({ error: "Failed to get latest webhook" }, { status: 500 })
  }
}
