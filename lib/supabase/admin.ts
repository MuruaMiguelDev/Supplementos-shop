import { createServerClient } from "./server"

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  return profile?.is_admin === true
}

export async function requireAdmin() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    throw new Error("Unauthorized: Admin access required")
  }

  return true
}
