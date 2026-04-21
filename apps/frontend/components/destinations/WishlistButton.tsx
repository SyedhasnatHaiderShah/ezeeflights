'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { addWishlist, removeWishlist } from '@/lib/api/destinations-api';

export function WishlistButton({ attractionId, defaultSaved = false }: { attractionId: string; defaultSaved?: boolean }) {
  const [saved, setSaved] = useState(defaultSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await removeWishlist(attractionId);
        setSaved(false);
      } else {
        await addWishlist(attractionId);
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white backdrop-blur transition hover:bg-black/55 disabled:opacity-60"
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-brand-red text-brand-red' : ''}`} />
    </button>
  );
}
