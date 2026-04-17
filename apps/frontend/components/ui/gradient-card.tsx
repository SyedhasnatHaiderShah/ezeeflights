import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  href: string;
  image: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function GradientCard({ href, image, title, children, className }: GradientCardProps) {
  return (
    <Link
      href={href as any}
      className={cn("group relative overflow-hidden rounded-3xl border border-border/40", className)}
    >
      <div className="relative h-full min-h-[260px] w-full">
        <AppImage src={image} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end">{children}</div>
      </div>
    </Link>
  );
}
