"use server"

import fs from "fs"
import path from "path"

// Define webhook data type
export type WebhookData = {
  id: string
  eventType: string
  receivedAt: string
  verified: boolean
  data: any
  processed: boolean
  processedAt?: string
}

// In-memory storage for webhooks (will reset on deployment)
// For production, replace this with a database
let webhooks: WebhookData[] = []
const MAX_WEBHOOKS = 50 // Store more webhooks

// Event listeners for different webhook types
type WebhookListener = (data: any) => Promise<void>
const eventListeners: Record<string, WebhookListener[]> = {}

/**
 * Save a webhook to the store
 */
export async function saveWebhook(webhook: Omit<WebhookData, "processed" | "processedAt">): Promise<WebhookData> {
  const newWebhook: WebhookData = {
    ...webhook,
    processed: false,
  }

  console.log(`Saving webhook: ${webhook.eventType} (ID: ${webhook.id})`)

  // Add to the beginning of the array (newest first)
  webhooks.unshift(newWebhook)

  // Keep only the most recent webhooks
  if (webhooks.length > MAX_WEBHOOKS) {
    webhooks = webhooks.slice(0, MAX_WEBHOOKS)
  }

  // Write to log file if in development
  if (process.env.NODE_ENV !== "production") {
    try {
      const logDir = path.join(process.cwd(), "logs")
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      const logFile = path.join(logDir, "webhooks.json")
      fs.writeFileSync(logFile, JSON.stringify(webhooks, null, 2))
    } catch (error) {
      console.error("Failed to write webhooks to file:", error)
    }
  }

  // Trigger any registered event listeners
  await triggerEventListeners(newWebhook)

  return newWebhook
}

/**
 * Mark a webhook as processed
 */
export async function markWebhookProcessed(id: string, success = true): Promise<WebhookData | null> {
  const index = webhooks.findIndex((webhook) => webhook.id === id)

  if (index === -1) {
    return null
  }

  webhooks[index] = {
    ...webhooks[index],
    processed: true,
    processedAt: new Date().toISOString(),
  }

  return webhooks[index]
}

/**
 * Get all webhooks from the store
 */
export async function getWebhooks() {
  return webhooks
}

/**
 * Get webhooks by event type
 */
export async function getWebhooksByType(eventType: string) {
  return webhooks.filter((webhook) => webhook.eventType === eventType)
}

/**
 * Get unprocessed webhooks
 */
export async function getUnprocessedWebhooks() {
  return webhooks.filter((webhook) => !webhook.processed)
}

/**
 * Get a webhook by ID
 */
export async function getWebhookById(id: string) {
  return webhooks.find((webhook) => webhook.id === id) || null
}

/**
 * Clear all webhooks from the store
 */
export async function clearWebhooks() {
  webhooks = []
  return { success: true }
}

/**
 * Register an event listener for a specific webhook event type
 */
export async function registerWebhookListener(eventType: string, listener: WebhookListener) {
  if (!eventListeners[eventType]) {
    eventListeners[eventType] = []
  }

  eventListeners[eventType].push(listener)
  console.log(`Registered listener for webhook event: ${eventType}`)
}

/**
 * Trigger event listeners for a webhook
 */
async function triggerEventListeners(webhook: WebhookData) {
  const { eventType, data } = webhook

  // Call specific event listeners
  if (eventListeners[eventType]) {
    console.log(`Triggering ${eventListeners[eventType].length} listeners for event: ${eventType}`)

    for (const listener of eventListeners[eventType]) {
      try {
        await listener(data)
      } catch (error) {
        console.error(`Error in webhook listener for ${eventType}:`, error)
      }
    }
  }

  // Call wildcard listeners
  if (eventListeners["*"]) {
    console.log(`Triggering ${eventListeners["*"].length} wildcard listeners`)

    for (const listener of eventListeners["*"]) {
      try {
        await listener(webhook)
      } catch (error) {
        console.error(`Error in wildcard webhook listener:`, error)
      }
    }
  }
}
