"use client";

import { MessageSquare, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Review } from "@/lib/types/hotels";
import { RatingStars } from "@/components/ui/rating-stars";
import { useTranslation } from "react-i18next";

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
  variant?: "page" | "carousel";
}

const iosCardShell = cn(
  "relative overflow-hidden",
  "rounded-[22px]",
  "bg-white/92 dark:bg-neutral-900/80",
  "backdrop-blur-2xl backdrop-saturate-150",
  "border border-black/[0.05] dark:border-white/[0.08]",
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.07)]",
  "transition-[transform,box-shadow] duration-300 ease-out",
  "hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_36px_rgba(0,0,0,0.09)]",
  "active:scale-[0.985]",
);

function formatReviewDate(date: string, short = false) {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      short
        ? { month: "short", year: "numeric" }
        : { month: "long", year: "numeric" },
    ).format(new Date(date));
  } catch {
    return date;
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReviewAvatar({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar?: string;
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-10 w-10" : "h-12 w-12";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn(
          dimensions,
          "rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/10",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        dimensions,
        "flex items-center justify-center rounded-full bg-gradient-to-br from-redmix/90 to-orange-500/90 text-sm font-semibold text-white shadow-sm",
      )}
    >
      {getInitials(name)}
    </div>
  );
}

function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
      <ShieldCheck className="h-3 w-3" />
      {label}
    </span>
  );
}

function RatingPill({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-3 py-1.5 text-sm font-semibold text-foreground dark:bg-white/[0.08]">
      {rating.toFixed(1)}
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
    </div>
  );
}

export function ReviewCard({
  review,
  compact = false,
  variant = "page",
}: ReviewCardProps) {
  const { t } = useTranslation();
  const comment = t(review.comment);
  const displayComment =
    variant === "carousel" && comment.length > 200
      ? `${comment.slice(0, 200)}...`
      : comment;

  const categories = [
    { label: t("Flight"), score: review.flightRating },
    { label: t("Hotel"), score: review.hotelRating },
    { label: t("Car"), score: review.carRating },
  ].filter((category) => category.score !== undefined);

  if (variant === "carousel") {
    return (
      <article
        className={cn(

          iosCardShell,
          "flex h-full min-h-[280px] flex-col p-3 sm:p-5",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/[0.02] dark:from-white/[0.04] dark:to-black/25" />

        <div className="relative z-10 flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <RatingStars rating={review.rating} size="sm" showCount={false} />
            {review.isVerified ? (
              <VerifiedBadge label={t("Verified")} />
            ) : (
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground dark:bg-white/[0.08]">
                {t("Guest")}
              </span>
            )}
          </div>

          <p className="line-clamp-4 flex-1 text-xs md:text-sm leading-[1.5] tracking-[-0.01em] text-foreground/85">
            {displayComment}
          </p>

          <div className="mt-auto flex items-center gap-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
            <ReviewAvatar
              name={review.userName}
              avatar={review.userAvatar}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                {review.userName}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">
                {formatReviewDate(review.date, true)}
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(iosCardShell, "p-5 sm:p-6", compact && "p-4")}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/[0.02] dark:from-white/[0.03] dark:to-black/20" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <ReviewAvatar name={review.userName} avatar={review.userAvatar} />
              {review.isVerified ? (
                <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 p-1 ring-2 ring-white dark:ring-neutral-900">
                  <ShieldCheck className="h-3 w-3 text-white" />
                </div>
              ) : null}
            </div>

            <div className="min-w-0 space-y-1">
              <p className="truncate text-xs font-semibold tracking-[-0.02em] text-foreground">
                {review.userName}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                <span>{formatReviewDate(review.date)}</span>
                {review.isVerified ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {t("Verified Traveler")}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <RatingPill rating={review.rating} />
            {categories.length > 0 && !compact ? (
              <div className="flex flex-wrap justify-end gap-1.5">
                {categories.map((category) => (
                  <span
                    key={category.label}
                    className="rounded-full bg-black/[0.04] px-0 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/[0.08]"
                  >
                    {category.label}{" "}
                    <span className="text-foreground">{category.score}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

        <div className="space-y-4">
          <p className="text-[15px] leading-[1.55] tracking-[-0.01em] text-foreground/85">
            {comment}
          </p>

          {review.photos && review.photos.length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {review.photos.map((photo, index) => (
                <div
                  key={index}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/[0.06] dark:ring-white/10"
                >
                  <img
                    src={photo}
                    alt={t("Review photo")}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {review.supplierResponse ? (
          <div className="overflow-hidden rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/[0.06]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Supplier Response")}
              </p>
            </div>
            <div className="flex gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-redmix/10">
                <MessageSquare className="h-4 w-4 text-redmix" />
              </div>
              <p className="text-[14px] leading-[1.5] text-foreground/80">
                {t(review.supplierResponse)}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
