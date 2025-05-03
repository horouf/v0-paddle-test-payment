"use client"

import { useEffect, useState } from "react"
import { checkWebhookSecretConfigured } from "@/lib/paddle-actions"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

export default function WebhookStatus() {
  const [status, setStatus] = useState<{
    checked: boolean
    configured: boolean
    usingTestSecret: boolean
  }>({
    checked: false,
    configured: false,
    usingTestSecret: false,
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkWebhookSecretConfigured()
        setStatus({
          checked: true,
          configured: result.configured,
          usingTestSecret: result.usingTestSecret,
        })
      } catch (error) {
        console.error("Error checking webhook configuration:", error)
        setStatus({
          checked: true,
          configured: false,
          usingTestSecret: false,
        })
      }
    }

    checkStatus()
  }, [])

  if (!status.checked) {
    return null
  }

  if (status.usingTestSecret) {
    return (
      <div className="mt-4">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Using Test Webhook Secret</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p>Using the hard-coded test webhook secret. This is fine for testing but not secure for production.</p>
            <p className="mt-2 font-medium">For production, set the PADDLE_WEBHOOK_SECRET environment variable.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {status.configured ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Webhook Secret Configured</AlertTitle>
          <AlertDescription className="text-green-700">
            Your webhook secret is properly configured. Webhook signature verification should work correctly.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Webhook Secret Not Configured</AlertTitle>
          <AlertDescription className="text-amber-700">
            The PADDLE_WEBHOOK_SECRET environment variable is not set. Webhook signature verification will not work.
            Please add this environment variable to enable secure webhook verification.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
