export function AIRecommendationsPanel({
  items,
  title = 'AI personalized recommendations',
  subtitle,
}: {
  items: Array<{ name: string; score: number; category: string; reason?: string; bestTime?: string }>;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 space-y-1">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>

      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.name} className="rounded-xl border p-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {item.name} <span className="text-xs text-slate-500 dark:text-slate-400">({item.category})</span>
                </p>
                {item.reason ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.reason}</p> : null}
                {item.bestTime ? <p className="mt-1 text-xs font-medium text-brand-red">Best time: {item.bestTime}</p> : null}
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {item.score.toFixed(0)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
