import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const { auth } = await import("../lib/auth")

  const result = await auth.api.signUpEmail({
    body: {
      email: "james@wakili.local",
      password: "Admin123!",
      name: "Admin User",
    },
  })

  console.log("[v0] Admin account created:", result)
}

main().catch((err) => {
  console.error("[v0] Failed to create admin:", err)
  process.exit(1)
})