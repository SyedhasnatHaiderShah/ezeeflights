import { cn } from "@/lib/utils";
import { HeroReadyNotifier } from "@/components/shared/HeroReadyNotifier";

export function DestinationHero({
  title,
  subtitle,
  image,
  badge,
}: {
  title: string;
  subtitle?: string;
  image?: string | null;
  badge?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative rounded-3xl border p-5 md:p-12 transition-all duration-300",
        image
          ? "bg-card text-white border-transparent"
          : "bg-card text-foreground border-border",
      )}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <HeroReadyNotifier />
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        {badge && <div className="mt-2.5">{badge}</div>}
        {subtitle ? (
          <p
            className={cn(
              "mt-3 text-lg md:text-xl",
              image ? "text-white/80" : "text-muted-foreground font-medium",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
