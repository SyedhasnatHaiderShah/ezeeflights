export function TrustStrip() {
  const items = ['IATA Accredited', '24/7 Global Support', 'Secure Payments', '4.8★ Traveler Rating'];

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
      <ul className="grid gap-2 text-sm text-white/90 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-white/10 px-3 py-2 text-center font-medium">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
