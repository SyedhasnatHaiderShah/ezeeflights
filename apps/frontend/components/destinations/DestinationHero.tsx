export function DestinationHero({ title, subtitle, image }: { title: string; subtitle?: string; image?: string | null }) {
  return (
    <section className="rounded-2xl border bg-slate-900 p-8 text-white" style={image ? { backgroundImage: `linear-gradient(rgba(15,23,42,.75), rgba(15,23,42,.75)), url(${image})`, backgroundSize: 'cover' } : undefined}>
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle ? <p className="mt-2 text-slate-200">{subtitle}</p> : null}
    </section>
  );
}
