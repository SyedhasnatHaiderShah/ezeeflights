"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { cn } from "@/lib/utils";

export function WishlistButton({
  entityId,
  entityType,
  data,
  className,
}: {
  entityId: string;
  entityType: string;
  data: any;
  className?: string;
}) {
  const { data: session } = useAuthSession();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);

  const isSaved = wishlistItems.some(
    (item) => item.entityId === entityId && item.entityType === entityType
  );

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(
      {
        entityId,
        entityType,
        data,
      },
      session?.id
    );
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white backdrop-blur transition hover:bg-black/55 active:scale-95 shadow-sm",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isSaved ? "fill-redmix text-redmix" : "text-white"
        )}
      />
    </button>
  );
}
