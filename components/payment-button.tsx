"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    // Load Paddle script
    const script = document.createElement("script")
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"
    script.async = true

    script.onload = () => {
      console.log("Paddle script loaded")
      initializePaddle()
    }
    script.onerror = (err) => {
      console.error("Failed to load paddle.js", err)
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
      console.error("window.Paddle is undefined")
      return
    }

    // Set sandbox mode
    console.log("Setting sandbox mode")
    window.Paddle.Environment.set("sandbox")

    try {
      // Get client token from server action
      const token = await getPaddleClientToken()
      console.log("Initializing with token")

      if (!token) {
        console.error("Client token is not available")
        return
      }

      window.Paddle.Initialize({
        token,
        eventCallback: (event: any) => {
          console.log("Paddle event:", event)
          if (event.name === "checkout.completed") {
            setPaymentStatus("✅ Payment completed!")
            setIsLoading(false)
          }
        },
      })

      setIsInitialized(true)
    } catch (error) {
      console.error("Error initializing:", error)
    }
  }

  const handlePurchase = async () => {
    setIsLoading(true)
    setPaymentStatus(null)

    if (!window.Paddle) {
      console.error("Paddle not yet loaded")
      setIsLoading(false)
      return
    }

    try {
      // Get price ID from server action
      const priceId = await getPaddlePriceId()

      if (!priceId) {
        console.error("Price ID is not available")
        setIsLoading(false)
        return
      }

      console.log("Opening checkout with price ID:", priceId)
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
          console.log("Checkout success:", data)
        },
        closeCallback: () => {
          console.log("Checkout closed by user")
          setIsLoading(false)
          setPaymentStatus("⏸️ Checkout was closed")
        },
      })
    } catch (error) {
      console.error("Error opening checkout:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 w-full max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-4">
        <button
          onClick={handlePurchase}
          disabled={isLoading || !isInitialized}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
        >
          {!isInitialized ? "Loading..." : isLoading ? "Processing…" : "Purchase for $9"}
        </button>

        {paymentStatus && <div className="mt-4 p-2 bg-green-50 text-green-700 rounded">{paymentStatus}</div>}
      </div>
    </div>
  )
}
