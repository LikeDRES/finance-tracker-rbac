import { createAuthClient } from "better-auth/client"

const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

export const authClient = createAuthClient({
  baseURL,
})