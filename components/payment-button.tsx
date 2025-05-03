"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getPaddleClientToken, getPaddlePriceId } from "@/lib/paddle-actions"

declare global {
  interface Window {
    Paddle: any
  }
}

export default function PaymentButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load Paddle script
    const script = document.createElement("script")
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"
    script.async = true

    script.onload = () => {
      console.debug("[Paddle] script loaded")
      initializePaddle()
    }
    script.onerror = (err) => {
      console.error("[Paddle] failed to load paddle.js", err)
    }

    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initializePaddle = async () => {
    if (!window.Paddle) {
      console.error("[Paddle] window.Paddle is undefined")
      return
    }

    // Set sandbox mode
    console.debug("[Paddle] setting sandbox mode")
    window.Paddle.Environment.set("sandbox")

    try {
      // Get client token from server action
      const token = await getPaddleClientToken()
      console.debug("[Paddle] initializing with token")

      if (!token) {
        console.error("[Paddle] Client token is not available")
        return
      }

      window.Paddle.Initialize({
        token,
        eventCallback: (event: any) => {
          console.debug("[Paddle event]", event)
          if (event.name === "checkout.completed") {
            setPaymentStatus("✅ Payment completed!")
            setIsLoading(false)

            // Send checkout data to our webhook endpoint for verification
            fetch("/api/paddle/webhook", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Paddle-Event": "checkout.completed",
                "X-Paddle-Time": new Date().toISOString(),
                "paddle-signature": createMockSignature(event.data), // Add mock signature for testing
              },
              body: JSON.stringify({
                event_type: "checkout.completed",
                data: event.data,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.redirectUrl) {
                  // Redirect to the results page
                  router.push(data.redirectUrl)
                }
              })
              .catch((error) => {
                console.error("[Webhook] Error sending checkout data:", error)
              })
          }
        },
      })

      setIsInitialized(true)
    } catch (error) {
      console.error("[Paddle] Error initializing:", error)
    }
  }

  const handlePurchase = async () => {
    setIsLoading(true)
    setPaymentStatus(null)

    if (!window.Paddle) {
      console.error("[Paddle] not yet loaded")
      setIsLoading(false)
      return
    }

    try {
      // Get price ID from server action
      const priceId = await getPaddlePriceId()

      if (!priceId) {
        console.error("[Paddle] Price ID is not available")
        setIsLoading(false)
        return
      }

      console.debug("[Paddle] opening checkout with price ID:", priceId)
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1,
          },
        ],
        customer: {
          email: "test@example.com", // Optional: Pre-fill customer email
        },
        successCallback: (data: any) => {
          console.log("[Paddle] Checkout success:", data)
        },
        closeCallback: () => {
          console.debug("[Paddle] Checkout closed by user")
          setIsLoading(false)
          setPaymentStatus("⏸️ Checkout was closed")
        },
      })
    } catch (error) {
      console.error("[Paddle] Error opening checkout:", error)
      setIsLoading(false)
    }
  }

  // Helper function to create a mock signature for testing
  const createMockSignature = (data: any) => {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    // This is just a mock signature for testing - not a real signature
    return `ts=${timestamp};h1=mock_signature_for_testing_only`
  }

  // Function to send a test webhook (for development only)
  const sendTestWebhook = async () => {
    setIsLoading(true)
    try {
      // Create the webhook payload
      const webhookPayload = {
        event_type: "checkout.completed",
        data: {
          id: `test-${Date.now()}`,
          customer: {
            email: "test@example.com",
            name: "Test User",
          },
          items: [
            {
              price: {
                description: "Test Product",
                unit_price: {
                  amount: "9.00",
                  currency_code: "USD",
                },
              },
              quantity: 1,
            },
          ],
          total: {
            amount: "9.00",
            currency_code: "USD",
          },
          status: "completed",
        },
      }

      // Convert to string for signature creation
      const payloadString = JSON.stringify(webhookPayload)

      // Create a timestamp for the mock signature
      const timestamp = Math.floor(Date.now() / 1000).toString()

      console.log("[Test Webhook] Sending test webhook data:", webhookPayload)

      const response = await fetch("/api/paddle/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Test-Webhook": "true",
          "X-Paddle-Time": new Date().toISOString(),
          // Add a mock paddle-signature header for testing
          "paddle-signature": `ts=${timestamp};h1=mock_signature_for_testing_only`,
        },
        body: payloadString,
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentStatus("✅ Test webhook sent!")
        console.log("[Test Webhook] Test webhook sent successfully")

        // Redirect to results page
        if (data.redirectUrl) {
          router.push(data.redirectUrl)
        }
      } else {
        setPaymentStatus("❌ Failed to send test webhook")
        console.error("[Test Webhook] Failed to send test webhook:", data)
      }
    } catch (error) {
      console.error("[Test Webhook] Error sending test webhook:", error)
      setPaymentStatus("❌ Error sending test webhook")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-4">
        <Button onClick={handlePurchase} disabled={isLoading || !isInitialized} className="w-full">
          {!isInitialized ? "Loading..." : isLoading ? "Processing…" : "Purchase for $9"}
        </Button>

        {process.env.NODE_ENV !== "production" && (
          <Button onClick={sendTestWebhook} variant="outline" disabled={isLoading} className="w-full">
            Send Test Webhook
          </Button>
        )}

        {paymentStatus && <div className="mt-4 p-2 bg-green-50 text-green-700 rounded">{paymentStatus}</div>}
      </div>
    </Card>
  )
}
