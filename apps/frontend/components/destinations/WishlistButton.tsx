'use client';

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
    <button type="button" onClick={toggle} disabled={loading} className="rounded-lg border px-3 py-2 text-sm">
      {saved ? '✓ Saved to wishlist' : '♡ Save to wishlist'}
    </button>
  );
}
