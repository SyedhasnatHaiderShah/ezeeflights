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
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 space-y-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.name} className="rounded-xl border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {item.name} <span className="text-xs text-muted-foreground">({item.category})</span>
                </p>
                {item.reason ? <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p> : null}
                {item.bestTime ? <p className="mt-1 text-xs font-medium text-redmix">Best time: {item.bestTime}</p> : null}
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {item.score.toFixed(0)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
