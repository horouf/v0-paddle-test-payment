import PaymentButton from "@/components/payment-button"
import WebhookStatus from "@/components/webhook-status"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Paddle Payment Test</h1>
          <p className="mt-2 text-gray-600">This page demonstrates Paddle's checkout in sandbox mode.</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 border border-blue-200">
          <p className="font-medium">Sandbox Mode Active</p>
          <p className="mt-1">
            Use test card: 4242 4242 4242 4242
            <br />
            Any future expiry date and any 3-digit CVV
          </p>
        </div>

        <PaymentButton />

        <WebhookStatus />

        <div className="text-xs text-gray-500 text-center mt-8">
          <p>© 2023 Test Store. All rights reserved.</p>
          <p className="mt-2">Webhook events are logged in the terminal console.</p>
        </div>
      </div>
    </main>
  )
}
