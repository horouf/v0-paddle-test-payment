import { NextResponse } from "next/server"
import { getWebhooks } from "@/lib/webhook-store"

export async function GET() {
  try {
    const webhooks = await getWebhooks()
    return NextResponse.json({
      success: true,
      webhooks,
    })
  } catch (error) {
    console.error("Error retrieving webhooks:", error)
    return NextResponse.json({ error: "Failed to retrieve webhooks" }, { status: 500 })
  }
}
