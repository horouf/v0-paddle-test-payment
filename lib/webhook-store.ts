"use server"

// Store for the latest webhook (in a real app, use a database)
let latestWebhook: WebhookData | null = null
let webhooks: WebhookData[] = []

export type WebhookData = {
  id: string
  timestamp: string
  eventType: string
  data: any
  verified: boolean
}

export async function saveWebhookData(data: WebhookData) {
  try {
    // Store the latest webhook
    latestWebhook = data
    webhooks.push(data)
    return data
  } catch (error) {
    console.error("Error saving webhook data:", error)
    return data
  }
}

export async function getLatestWebhook() {
  return latestWebhook
}

export async function getWebhooks() {
  return webhooks
}

export async function clearWebhooks() {
  webhooks = []
  latestWebhook = null
  return { success: true }
}
