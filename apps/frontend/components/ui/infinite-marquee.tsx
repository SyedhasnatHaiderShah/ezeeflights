import { cn } from "@/lib/utils";

export function InfiniteMarquee({
  children,
  reverse = false,
  speed = "50s",
  pauseOnHover = true,
  className,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  speed?: string;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max gap-6 py-2 [animation:marquee_var(--speed)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{ ["--speed" as string]: speed }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
