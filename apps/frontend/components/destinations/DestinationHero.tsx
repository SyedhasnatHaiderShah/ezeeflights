import { cn } from "@/lib/utils";

export function DestinationHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image?: string | null;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border p-8 md:p-12 transition-all duration-300",
        image
          ? "bg-slate-900 text-white border-transparent"
          : "bg-white text-slate-900 border-slate-200 dark:bg-slate-950 dark:text-white dark:border-slate-800"
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
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mt-3 text-lg md:text-xl",
              image
                ? "text-slate-200"
                : "text-slate-600 dark:text-slate-400 font-medium"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
