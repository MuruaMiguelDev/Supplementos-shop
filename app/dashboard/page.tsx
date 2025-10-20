// app/dashboard/page.tsx
import 'server-only'
import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { FavoritesTab } from "@/components/dashboard/favorites-tab"
import { ReferralsTab } from "@/components/dashboard/referrals-tab"
import { CouponsTab } from "@/components/dashboard/coupons-tab"

export const dynamic = "force-dynamic" // opcional, útil con cookies/sesión

export default async function DashboardPage() {
  const supabase = await getServerSupabase() // ✅ AWAIT

  // usuario actual (SSR)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // si es admin, redirigir
  if (profile?.is_admin) {
    redirect("/admin")
  }

  // conteo de favoritos
  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // cupones del usuario
  const { data: userCoupons } = await supabase
    .from("user_coupons")
    .select(`*, coupon:coupons(*)`)
    .eq("user_id", user.id)

  // referidos del usuario
  const { data: referrals } = await supabase
    .from("referrals")
    .select(`*, referee:profiles!referrals_referee_id_fkey(full_name, created_at)`)
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* …tu UI tal cual… */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="favorites">
            Favoritos{typeof favoritesCount === "number" && favoritesCount > 0 ? (
              <span className="ml-2 text-xs">({favoritesCount})</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="coupons">
            Cupones{userCoupons?.length ? <span className="ml-2 text-xs">({userCoupons.length})</span> : null}
          </TabsTrigger>
          <TabsTrigger value="referrals">
            Referidos{referrals?.length ? <span className="ml-2 text-xs">({referrals.length})</span> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab user={user} profile={profile ?? null} />
        </TabsContent>
        <TabsContent value="favorites">
          <FavoritesTab userId={user.id} />
        </TabsContent>
        <TabsContent value="coupons">
          <CouponsTab coupons={userCoupons ?? []} />
        </TabsContent>
        <TabsContent value="referrals">
          <ReferralsTab referralCode={profile?.referral_code ?? ""} referrals={referrals ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}