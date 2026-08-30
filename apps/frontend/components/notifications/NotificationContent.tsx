"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  Bell,
  Car,
  Gift,
  Hotel,
  Info,
  Plane,
  Sparkles,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkRead,
  useNotifications,
  useUnreadCount,
  useClearAllNotifications,
  useDeleteNotification,
} from "@/lib/api/notifications";

const heroInsetSurface =
  "bg-[#0e0e0e]/55 border-white/15 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]";
const heroInsetSurfaceMuted = "bg-white/5 border-white/10";

type NotificationDisplay = {
  typeLabel: string;
  routeLabel: string;
  origin?: string;
  destination?: string;
  dateLabel: string | null;
  iconType: string;
};

function formatTripDate(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getBookingType(notification: any): string | null {
  const payload = notification.payload;
  if (!payload) return null;
  if (payload.bookingType) return String(payload.bookingType).toUpperCase();
  if (notification.iconType === "flight") return "FLIGHT";
  if (notification.iconType === "hotel") return "HOTEL";
  if (notification.iconType === "car") return "CAR";
  return null;
}

function getReminderTypeLabel(
  templateName: string | undefined,
  notification: any,
  t: (key: string) => string,
): string {
  const labels: Record<string, string> = {
    "one-day-reminder": t("One day until trip"),
    "one-week-reminder": t("One week until trip"),
    "weekly-reminder": t("One week until trip"),
    "last-week-reminder": t("One week until trip"),
    "two-weeks-reminder": t("Two weeks until trip"),
    "one-month-reminder": t("One month until trip"),
    "check-in-reminder": t("Check-in reminder"),
    "visa-reminder": t("Visa reminder"),
    "booking-confirmation": t("Flight booking confirmed"),
    "hotel-booking-confirmation": t("Hotel booking confirmed"),
    "car-booking-confirmation": t("Car rental confirmed"),
    "loyalty-points-earned": t("Points earned"),
    "loyalty-tier-upgraded": t("Tier upgraded"),
    "welcome-user": t("Welcome"),
    "travel-document-share": t("Document shared"),
    "incomplete-profile": t("Complete your profile"),
  };

  if (templateName && labels[templateName]) {
    return labels[templateName];
  }

  return notification.title || t("Notification");
}

function getNotificationDisplay(
  notification: any,
  t: (key: string) => string,
): NotificationDisplay {
  const payload = notification.payload ?? {};
  const templateName = payload.templateName as string | undefined;
  const bookingType = getBookingType(notification);
  const typeLabel = getReminderTypeLabel(templateName, notification, t);

  if (bookingType === "FLIGHT") {
    const origin = payload.origin || "—";
    const destination = payload.destination || "—";
    const travelDate =
      payload.departureDateObj || payload.travelDate || payload.departureDate;

    return {
      typeLabel,
      routeLabel: `${origin} → ${destination}`,
      origin: String(origin),
      destination: String(destination),
      dateLabel: formatTripDate(travelDate),
      iconType: notification.iconType || "flight",
    };
  }

  if (bookingType === "HOTEL") {
    const travelDate = payload.checkInDate || payload.travelDate;
    return {
      typeLabel,
      routeLabel: String(payload.hotelName || t("Hotel stay")),
      dateLabel: formatTripDate(travelDate),
      iconType: "hotel",
    };
  }

  if (bookingType === "CAR") {
    const travelDate = payload.pickupDatetime || payload.travelDate;
    return {
      typeLabel,
      routeLabel: String(
        payload.pickupLocationName || payload.pickupLocation || t("Car rental"),
      ),
      dateLabel: formatTripDate(travelDate),
      iconType: "car",
    };
  }

  if (notification.iconType === "loyalty") {
    const points = payload.points || 0;
    const toTier = payload.toTier;
    return {
      typeLabel,
      routeLabel:
        points > 0
          ? `+${points} ${t("points")}`
          : toTier
            ? `${toTier} ${t("tier")}`
            : t("Loyalty update"),
      dateLabel: formatTripDate(notification.createdAt),
      iconType: "loyalty",
    };
  }

  return {
    typeLabel,
    routeLabel: notification.body || notification.title || "—",
    dateLabel: formatTripDate(notification.createdAt),
    iconType: notification.iconType || "default",
  };
}

function getNotificationIcon(iconType: string) {
  switch (iconType) {
    case "flight":
      return Plane;
    case "hotel":
      return Hotel;
    case "car":
      return Car;
    case "welcome":
      return Sparkles;
    case "loyalty":
      return Gift;
    case "document":
      return Info;
    default:
      return Bell;
  }
}

export const NotificationContent = ({
  isTransparent = false,
  isMobile = false,
}: {
  isTransparent?: boolean;
  isMobile?: boolean;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: notifications = [], isLoading } = useNotifications({
    page: 1,
    limit: 8,
  });
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const clearAll = useClearAllNotifications();
  const deleteNotif = useDeleteNotification();

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    let link = notification.payload?.link;
    if (link) {
      router.push(link);
    }
  };

  const renderNotificationSkeleton = () => (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-lg border p-3",
            isTransparent
              ? cn("border", heroInsetSurfaceMuted)
              : "border-border/40 bg-card/50",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton
              className={cn("h-4 w-2/3", isTransparent && "bg-white/10")}
            />
            <Skeleton
              className={cn(
                "h-4 w-10 shrink-0",
                isTransparent && "bg-white/10",
              )}
            />
          </div>
          <Skeleton
            className={cn("mt-2 h-3.5 w-3/4", isTransparent && "bg-white/10")}
          />
          <Skeleton
            className={cn("mt-1.5 h-3 w-1/2", isTransparent && "bg-white/10")}
          />
          <Skeleton
            className={cn("mt-1.5 h-3 w-1/3", isTransparent && "bg-white/10")}
          />
        </div>
      ))}
    </div>
  );

  const renderNotificationList = () => {
    if (isLoading) {
      return renderNotificationSkeleton();
    }

    if (notifications.length === 0) {
      return (
        <div
          className={cn(
            "flex h-full min-h-[220px] flex-col items-center justify-center p-5 text-center text-sm",
            isTransparent ? "text-white/60" : "text-foreground/80",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
            <Bell
              className={cn(
                "h-6 w-6",
                isTransparent ? "text-white/70" : "text-foreground/70",
              )}
            />
          </div>
          {t("All caught up! Check back later for new alerts.")}
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {notifications.map((notification: any) =>
          renderNotificationItem(notification),
        )}
      </div>
    );
  };

  const renderNotificationItem = (notification: any) => {
    const display = getNotificationDisplay(notification, t);
    const Icon = getNotificationIcon(display.iconType);
    const hasFlightRoute = Boolean(display.origin && display.destination);

    return (
      <div
        key={notification.id}
        role="button"
        tabIndex={0}
        onClick={() => handleNotificationClick(notification)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNotificationClick(notification);
          }
        }}
        className={cn(
          "group relative flex w-full max-w-full flex-col gap-1.5 overflow-hidden rounded-lg px-3 py-2.5 text-left transition-all duration-300 cursor-pointer",
          isTransparent
            ? notification.isRead
              ? cn("border opacity-60", heroInsetSurfaceMuted)
              : cn("border hover:bg-[#0e0e0e]/75", heroInsetSurface)
            : notification.isRead
              ? "bg-white dark:bg-card/50 border border-border/40 opacity-70 hover:bg-gray-50 dark:hover:bg-muted/30"
              : "bg-white dark:bg-card border border-border/60 hover:shadow-md shadow-sm",
        )}
      >
        {/* Row 1: reminder / booking type */}
        <div className="flex min-h-[16px] items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {!notification.isRead && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-redmix" />
            )}
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                isTransparent ? "bg-white/20" : "bg-redmix/10 text-redmix",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-xs font-semibold leading-none",
                isTransparent ? "text-white/95" : "text-foreground",
              )}
            >
              {display.typeLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotif.mutate(notification.id);
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-redmix/10 hover:text-redmix cursor-pointer"
            title={t("Delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Row 2: origin → destination (or booking summary) */}
        <div
          className={cn(
            "flex min-w-0 items-center gap-1.5 pl-[32px] text-[13px] font-bold leading-none tracking-wide",
            isTransparent ? "text-white" : "text-foreground",
          )}
        >
          {hasFlightRoute ? (
            <>
              <span className="shrink-0">{display.origin}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-redmix" />
              <span className="shrink-0">{display.destination}</span>
            </>
          ) : (
            <span className="truncate">{display.routeLabel}</span>
          )}
        </div>

        {/* Row 3: trip date only */}
        {display.dateLabel && (
          <p
            className={cn(
              "pl-[32px] text-xs font-medium leading-none",
              isTransparent ? "text-white/65" : "text-foreground/70",
            )}
          >
            {display.dateLabel}
          </p>
        )}
      </div>
    );
  };

  // ==========================================
  // MOBILE SCREEN LAYOUT
  // ==========================================
  if (isMobile) {
    return (
      <div
        className={cn(
          "flex flex-col transition-all duration-500 h-[75vh] rounded-md",
          isTransparent
            ? "bg-transparent text-white"
            : "bg-transparent text-foreground",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-3 transition-colors duration-500 rounded-t-md",
            isTransparent ? "border-white/10" : "border-border/40",
          )}
        >
          <h2 className="flex items-center gap-1 text-sm font-semibold">
            {t("Notifications")}
            {isLoading ? (
              <Skeleton
                className={cn(
                  "h-4 w-6 inline-block",
                  isTransparent && "bg-white/10",
                )}
              />
            ) : (
              <span>({unread?.count ?? 0})</span>
            )}
          </h2>
          <div className="flex gap-3">
            {!isLoading && notifications.length > 0 && (
              <button
                className={cn(
                  "text-xs font-semibold hover:underline cursor-pointer transition-colors",
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-redmix hover:text-redmix/80",
                )}
                onClick={() => clearAll.mutate()}
              >
                {t("Clear All")}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {renderNotificationList()}
        </div>
      </div>
    );
  }

  // ==========================================
  // DESKTOP SCREEN LAYOUT
  // ==========================================
  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-500 h-full max-h-[80vh] md:max-h-[min(500px,48vh)] w-full sm:min-w-[320px] max-w-[420px]",
        isTransparent
          ? "bg-transparent text-white"
          : "bg-transparent text-foreground",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-3 py-3 transition-colors duration-500",
          isTransparent ? "border-white/10" : "border-border/40",
        )}
      >
        <h2 className="flex items-center gap-1 text-sm font-semibold">
          {t("Notifications")}
          {isLoading ? (
            <Skeleton
              className={cn(
                "h-4 w-6 inline-block",
                isTransparent && "bg-white/10",
              )}
            />
          ) : (
            <span>({unread?.count ?? 0})</span>
          )}
        </h2>
        <div className="flex gap-2">
          {!isLoading && notifications.length > 0 && (
            <button
              className={cn(
                "text-[11px] font-semibold hover:underline cursor-pointer transition-colors",
                isTransparent
                  ? "text-white/80 hover:text-white"
                  : "text-redmix hover:text-redmix/80",
              )}
              onClick={() => clearAll.mutate()}
            >
              {t("Clear All")}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2.5">
        {renderNotificationList()}
      </div>
    </div>
  );
};
