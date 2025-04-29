import PaymentButton from "@/components/payment-button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Paddle Checkout</h1>
          <p className="mt-2 text-gray-600">Click the button below to start checkout.</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 border border-blue-200">
          <p className="font-medium">Sandbox Mode Active</p>
          <p className="mt-1">
            Use test card: 4000 0566 5566 5556
            <br />
            Any future expiry date and any 3-digit CVV (100)
          </p>
        </div>

        <PaymentButton />
      </div>
    </main>
  )
}
