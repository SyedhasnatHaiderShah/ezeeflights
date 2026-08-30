import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "../api/api-client";
import { useCurrencyStore } from "./currency-store";

export interface WishlistItem {
  id: string;
  entityType: string;
  entityId: string;
  data: any;
  createdAt: string;
}

interface WishlistState {
  sessionId: string;
  items: WishlistItem[];
  isLoading: boolean;

  initialize: (userId?: string) => Promise<void>;
  toggleWishlist: (
    payload: { entityId: string; entityType: string; data: any },
    userId?: string,
  ) => Promise<void>;
  fetchItems: (params: {
    userId?: string;
    sessionId?: string;
  }) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      sessionId: "",
      items: [],
      isLoading: false,

      initialize: async (userId) => {
        let sid = get().sessionId;
        if (!sid) {
          sid = uuidv4();
          set({ sessionId: sid });
        }
        await get().fetchItems({ userId, sessionId: sid });
      },

      fetchItems: async (params) => {
        // Don't fetch if no identifiers provided
        if (!params.userId && !params.sessionId) return;

        set({ isLoading: true });
        try {
          const query = new URLSearchParams();
          if (params.userId) query.append("userId", params.userId);
          if (params.sessionId) query.append("sessionId", params.sessionId);

          // const items = await apiClient<WishlistItem[]>(
          //   `/wishlists?${query.toString()}`,
          // );
          const items: WishlistItem[] = [];
          set({ items: items || [] });
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (payload, userId) => {
        const { sessionId, items } = get();
        const existing = items.find(
          (i) =>
            i.entityId === payload.entityId &&
            i.entityType === payload.entityType,
        );

        const currencyState = useCurrencyStore.getState();
        const baseCurrency = currencyState.baseCurrency;

        let updatedPayload = { ...payload };
        if (updatedPayload.data && !existing) {
          updatedPayload.data = { ...updatedPayload.data };
          const originalCost =
            updatedPayload.data.totalCost || updatedPayload.data.basePrice || updatedPayload.data.price || updatedPayload.data.entryFee || 0;
          const originalCurrency = updatedPayload.data.currency || "USD";
          const convertedCost = currencyState.getConvertedAmount(
            originalCost,
            originalCurrency as any,
            baseCurrency,
          );

          updatedPayload.data.userSelectedCurrency = baseCurrency;
          updatedPayload.data.userConvertedCost = convertedCost;
        }

        // Optimistic UI update
        if (existing) {
          set({ items: items.filter((i) => i.id !== existing.id) });
        } else {
          const tempId = "temp-" + Date.now();
          set({
            items: [
              ...items,
              {
                ...updatedPayload,
                id: tempId,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }

        try {
          // await apiClient<{ action: "added" | "removed"; item?: WishlistItem }>(
          //   "/wishlists/toggle",
          //   {
          //     method: "POST",
          //     body: {
          //       ...updatedPayload,
          //       userId,
          //       sessionId,
          //     },
          //   },
          // );

          // Re-sync with server to get real IDs
          await get().fetchItems({ userId, sessionId });
        } catch (error) {
          console.error("Failed to toggle wishlist:", error);
          // Sync back to server state on error
          await get().fetchItems({ userId, sessionId });
        }
      },
    }),
    {
      name: "ezee-wishlist-storage",
      partialize: (state) => ({ sessionId: state.sessionId }), // Only persist sessionId across reloads
    },
  ),
);
