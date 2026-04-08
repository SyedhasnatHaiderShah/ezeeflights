'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const categories = ['all', 'museum', 'beach', 'hiking', 'nightlife', 'shopping', 'food'];

export function CategoryFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get('category') ?? 'all';

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`rounded-full border px-3 py-1 text-sm ${current === category ? 'bg-slate-900 text-white' : 'bg-white'}`}
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            if (category === 'all') next.delete('category');
            else next.set('category', category);
            router.push(`?${next.toString()}`);
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
