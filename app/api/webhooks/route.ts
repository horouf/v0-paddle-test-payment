// app/api/paddle-webhook/route.ts

import { NextResponse } from "next/server";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import type { Readable } from "node:stream";

// 1. Turn **off** Next.js’s automatic body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// 2. Force the Node.js runtime (so we get Node streams)
export const runtime = "nodejs";

// 3. Helper to collect the raw bytes from NextRequest.body
async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Initialize Paddle once
const paddle = new Paddle(
  process.env.PADDLE_CLIENT_TOKEN!,
  {
    environment:
      process.env.NODE_ENV === "production"
        ? Environment.production
        : Environment.sandbox,
  }
);

export async function POST(req: Request) {
  console.log("📬 Received Paddle webhook");

  // 4. Get signature headers
  const signature = req.headers.get("paddle-signature") || "";
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || "";

  // 5. Read the raw body buffer, then stringify
  const rawBodyBuffer = await getRawBody(req.body as any);
  const rawBody = rawBodyBuffer.toString("utf-8");
  console.log("🔎 Raw webhook body:", rawBody);

  // 6. Attempt signature verification using raw payload
  let eventData: any;
  let verified = false;
  try {
    eventData = await paddle.webhooks.unmarshal(
      rawBody,
      webhookSecret,
      signature
    );
    verified = true;
    console.log("✅ Webhook signature verified");
  } catch (err) {
    console.warn("⚠️ Signature verification failed, parsing anyway", err);
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }
  }

  // 7. Finally, log the parsed event
  console.log("=== PADDLE WEBHOOK RECEIVED ===");
  console.log(`Event Type: ${eventData.eventType || eventData.event_type}`);
  console.log(`Verified: ${verified}`);
  console.log("Parsed payload:\n", JSON.stringify(eventData, null, 2));
  console.log("===============================");

  switch (eventType) {
      case EventName.SubscriptionActivated:
        console.log(`Subscription ${eventData.data?.id || "unknown"} was activated`)
        break
      case EventName.SubscriptionCanceled:
        console.log(`Subscription ${eventData.data?.id || "unknown"} was canceled`)
        break
      case EventName.TransactionPaid:
        console.log(`Transaction ${eventData.data?.id || "unknown"} was paid`)
        break
      case "checkout.completed":
        console.log(`Checkout ${eventData.data?.id || "unknown"} was completed`)
        break
      default:
        console.log(`Received ${eventType} event`)
    }

  return NextResponse.json({ success: true });
}
