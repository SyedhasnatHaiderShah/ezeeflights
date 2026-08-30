import * as React from "react";
import { AppImage } from "@/components/ui/app-image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  imageSrc: string;
  imageAlt: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  aspectRatio?: "4/3" | "3/4" | "16/9" | "1/1";
}

const ratioClassMap: Record<NonNullable<GradientCardProps["aspectRatio"]>, string> = {
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
};

export function GradientCard({
  imageSrc,
  imageAlt,
  href,
  children,
  className,
  aspectRatio = "4/3",
}: GradientCardProps) {
  const hasCustomAspect = className?.includes("aspect-");
  const hasCustomHeight = className?.includes("h-");

  const commonClassName = cn(
    "group relative block overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg",
    !hasCustomAspect && !hasCustomHeight && ratioClassMap[aspectRatio],
    className,
  );

  const content = (
    <>
      <AppImage
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-500 group-hover:via-black/60" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">{children}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href as never} className={commonClassName}>
        {content}
      </Link>
    );
  }

  return <div className={commonClassName}>{content}</div>;
}
