import { type NextRequest, NextResponse } from "next/server";

// 1. Turn off Next.js body parsing so we can read raw text if needed
export const config = {
  api: { bodyParser: false },
};

// 2. Force Node.js runtime (so req.text() works predictably)
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("📬 Webhook received");

  // 3. Grab raw payload (unparsed)
  const rawBody = await req.text();
  console.log("🔍 RAW WEBHOOK PAYLOAD:\n", rawBody);

  // 4. Try to parse the JSON
  let parsed: any;
  try {
    parsed = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Invalid JSON:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 5. Support either a single event object or an array of them
  const events = Array.isArray(parsed) ? parsed : [parsed];

  for (const evt of events) {
    const eventType = evt.event_type || evt.eventType || "unknown";
    const subscriptionId = evt.data?.id;

    console.log("=== EVENT ===");
    console.log(`Type: ${eventType}`);
    if (!subscriptionId) {
      console.warn("⚠️  No subscription id found in data");
    }

    // 6. Handle the main subscription events
    switch (eventType) {
      case "subscription.created":
        console.log(`➕ Subscription CREATED  — id=${subscriptionId}`);
        // … your creation logic here …
        break;

      case "subscription.canceled":
        console.log(`➖ Subscription CANCELED  — id=${subscriptionId}`);
        // … your cancellation logic here …
        break;

      default:
        console.log(`ℹ️  Unhandled event "${eventType}"  — id=${subscriptionId}`);
    }
  }

  return NextResponse.json({ success: true });
}

// (Optional) simple GET so you can browser‑test this endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is live; send a POST to test.",
  });
}
