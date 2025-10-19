"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoritesStore {
  ids: string[]
  toggle: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clear: () => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (productId) => {
        set((state) => {
          const isFavorite = state.ids.includes(productId)
          return {
            ids: isFavorite ? state.ids.filter((id) => id !== productId) : [...state.ids, productId],
          }
        })
      },

      isFavorite: (productId) => {
        return get().ids.includes(productId)
      },

      clear: () => {
        set({ ids: [] })
      },
    }),
    {
      name: "favorites-storage",
    },
  ),
)
