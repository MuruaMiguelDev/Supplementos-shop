// Base API client configuration
// TODO: Replace with actual API endpoint
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}
