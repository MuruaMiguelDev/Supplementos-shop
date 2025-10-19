import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { FavoritesTab } from "@/components/dashboard/favorites-tab"
import { ReferralsTab } from "@/components/dashboard/referrals-tab"
import { CouponsTab } from "@/components/dashboard/coupons-tab"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.is_admin) {
    redirect("/admin")
  }

  // Fetch favorites count
  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch user coupons
  const { data: userCoupons } = await supabase
    .from("user_coupons")
    .select(
      `
      *,
      coupon:coupons(*)
    `,
    )
    .eq("user_id", user.id)
    .eq("is_used", false)

  const { data: referrals } = await supabase
    .from("referrals")
    .select(
      `
      *,
      referee:profiles!referrals_referee_id_fkey(full_name, created_at)
    `,
    )
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Referrals data:", referrals)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mi Cuenta</h1>
        <p className="text-muted-foreground">Gestiona tu perfil, favoritos y referidos</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="favorites">
            Favoritos
            {favoritesCount ? <span className="ml-2 text-xs">({favoritesCount})</span> : null}
          </TabsTrigger>
          <TabsTrigger value="coupons">
            Cupones
            {userCoupons?.length ? <span className="ml-2 text-xs">({userCoupons.length})</span> : null}
          </TabsTrigger>
          <TabsTrigger value="referrals">
            Referidos
            {referrals?.length ? <span className="ml-2 text-xs">({referrals.length})</span> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab user={user} profile={profile} />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoritesTab userId={user.id} />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponsTab coupons={userCoupons || []} />
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralsTab referralCode={profile?.referral_code} referrals={referrals || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
