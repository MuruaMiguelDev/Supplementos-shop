"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile, Discount } from "@/types/user"

interface UserStore {
  profile: UserProfile | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  applyDiscount: (code: string) => Discount | null
  updateProfile: (updates: Partial<UserProfile>) => void
}

// Mock user data for development
const MOCK_USER: UserProfile = {
  id: "1",
  name: "Usuario Demo",
  email: "demo@suplementos.com",
  favorites: [],
  discounts: [
    {
      code: "BIENVENIDO10",
      value: 10,
      type: "percent",
      description: "Descuento de bienvenida del 10%",
    },
    {
      code: "ENVIOGRATIS",
      value: 5,
      type: "amount",
      description: "Envío gratis en compras mayores a $50",
    },
  ],
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoggedIn: false,

      login: async (email, password) => {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (email && password) {
          set({ profile: MOCK_USER, isLoggedIn: true })
          return true
        }
        return false
      },

      register: async (name, email, password) => {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (name && email && password) {
          const newUser: UserProfile = {
            id: Date.now().toString(),
            name,
            email,
            favorites: [],
            discounts: [MOCK_USER.discounts![0]], // Welcome discount
          }
          set({ profile: newUser, isLoggedIn: true })
          return true
        }
        return false
      },

      logout: () => {
        set({ profile: null, isLoggedIn: false })
      },

      applyDiscount: (code) => {
        const profile = get().profile
        if (!profile?.discounts) return null

        const discount = profile.discounts.find((d) => d.code.toUpperCase() === code.toUpperCase())
        return discount || null
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }))
      },
    }),
    {
      name: "user-storage",
    },
  ),
)
