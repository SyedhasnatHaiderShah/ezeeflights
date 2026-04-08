export function AIRecommendationsPanel({ items }: { items: Array<{ name: string; score: number; category: string }> }) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">AI personalized recommendations</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between rounded-md border p-2">
            <span>{item.name} <span className="text-xs text-slate-500">({item.category})</span></span>
            <span className="font-medium">{item.score.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
