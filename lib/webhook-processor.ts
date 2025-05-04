import { registerWebhookListener, getUnprocessedWebhooks, markWebhookProcessed } from "./webhook-store"
import { EventName } from "@paddle/paddle-node-sdk"

/**
 * Example of how to use the webhook system in your application
 */
export async function initializeWebhookProcessors() {
  console.log("Initializing webhook processors...")

  // Register listeners for specific event types
  await registerWebhookListener(EventName.SubscriptionCreated, async (data) => {
    console.log("Processing subscription created webhook:", data.id)

    // Example: Update user subscription status in your database
    // await db.user.update({
    //   where: { customerId: data.customerId },
    //   data: { subscriptionStatus: "active", subscriptionId: data.id }
    // })

    // Example: Send welcome email to the customer
    // await sendEmail({
    //   to: data.customer.email,
    //   subject: "Welcome to our service!",
    //   body: `Your subscription ${data.id} is now active.`
    // })
  })

  await registerWebhookListener(EventName.SubscriptionCanceled, async (data) => {
    console.log("Processing subscription canceled webhook:", data.id)

    // Example: Update user subscription status in your database
    // await db.user.update({
    //   where: { subscriptionId: data.id },
    //   data: { subscriptionStatus: "canceled" }
    // })

    // Example: Send cancellation email
    // await sendEmail({
    //   to: data.customer.email,
    //   subject: "We're sorry to see you go",
    //   body: `Your subscription ${data.id} has been canceled.`
    // })
  })

  await registerWebhookListener(EventName.TransactionCompleted, async (data) => {
    console.log("Processing transaction completed webhook:", data.id)

    // Example: Record the transaction in your database
    // await db.transaction.create({
    //   data: {
    //     id: data.id,
    //     customerId: data.customerId,
    //     amount: data.details.totals.total,
    //     currency: data.details.totals.currency,
    //     status: data.status
    //   }
    // })

    // Example: Send receipt email
    // await sendEmail({
    //   to: data.customer.email,
    //   subject: "Receipt for your purchase",
    //   body: `Thank you for your purchase! Transaction ID: ${data.id}`
    // })
  })

  // Register a wildcard listener for all events
  await registerWebhookListener("*", async (webhook) => {
    console.log(`Received webhook of type: ${webhook.eventType}`)

    // Example: Log all webhooks to your analytics system
    // await analytics.logEvent("paddle_webhook", {
    //   eventType: webhook.eventType,
    //   timestamp: webhook.receivedAt
    // })
  })

  console.log("Webhook processors initialized")
}

/**
 * Process any unprocessed webhooks
 * This can be called on application startup or via a cron job
 */
export async function processUnprocessedWebhooks() {
  const unprocessedWebhooks = await getUnprocessedWebhooks()

  console.log(`Processing ${unprocessedWebhooks.length} unprocessed webhooks`)

  for (const webhook of unprocessedWebhooks) {
    try {
      // Trigger event listeners manually
      // This would normally happen automatically when the webhook is received
      // But this is useful for processing webhooks that were received while the app was down

      // Example: Process the webhook based on its type
      // await processWebhookByType(webhook.eventType, webhook.data)

      // Mark as processed
      await markWebhookProcessed(webhook.id)

      console.log(`Processed webhook ${webhook.id} of type ${webhook.eventType}`)
    } catch (error) {
      console.error(`Error processing webhook ${webhook.id}:`, error)
    }
  }

  return { processed: unprocessedWebhooks.length }
}
