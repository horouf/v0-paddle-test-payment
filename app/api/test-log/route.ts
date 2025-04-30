import { NextResponse } from "next/server"

export async function GET() {
  console.log("\n\n")
  console.log("*".repeat(80))
  console.log("*****                      TEST LOG ENDPOINT                         *****")
  console.log("*".repeat(80))

  console.log("This is a test log message")
  console.log("If you can see this in your logs, logging is working correctly")

  console.log("*".repeat(80))
  console.log("\n\n")

  return NextResponse.json({
    success: true,
    message: "Test log message sent to console. Check your server logs.",
  })
}
