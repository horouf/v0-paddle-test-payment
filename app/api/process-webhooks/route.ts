import { NextResponse } from "next/server"
import { processUnprocessedWebhooks } from "@/lib/webhook-processor"

export async function POST() {
  try {
    const result = await processUnprocessedWebhooks()

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} webhooks`,
      ...result,
    })
  } catch (error) {
    console.error("Error processing webhooks:", error)
    return NextResponse.json({ error: "Failed to process webhooks" }, { status: 500 })
  }
}
