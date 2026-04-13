export function TripTimeline({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <ol className="relative ml-3 border-l border-slate-200 pl-4">
      {items.map((item) => (
        <li key={`${item.label}-${item.value}`} className="mb-4">
          <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-blue-600" />
          <p className="text-sm font-medium text-slate-900">{item.label}</p>
          <p className="text-sm text-slate-600">{new Date(item.value).toLocaleString()}</p>
        </li>
      ))}
    </ol>
  );
}
