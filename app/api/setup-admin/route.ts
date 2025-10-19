import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if admin user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const adminExists = existingUser?.users.some((u) => u.email === "Admin@supple.com")

    if (adminExists) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
      })
    }

    // Create admin user with email confirmed
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "Admin@supple.com",
      password: "Admin123",
      email_confirm: true,
      user_metadata: {
        full_name: "Super Admin",
      },
    })

    if (createError) {
      console.error("[v0] Error creating admin user:", createError)
      return NextResponse.json(
        {
          success: false,
          error: createError.message,
        },
        { status: 500 },
      )
    }

    // Update profile to set is_admin = true
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        is_admin: true,
        full_name: "Super Admin",
      })
      .eq("id", user.user.id)

    if (updateError) {
      console.error("[v0] Error updating profile:", updateError)
      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      email: "Admin@supple.com",
    })
  } catch (error: any) {
    console.error("[v0] Setup admin error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
