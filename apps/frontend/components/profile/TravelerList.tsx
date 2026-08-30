'use client';

import { useState } from "react";
import { toast } from "@/lib/hooks/use-toast";
import { useTranslation } from "react-i18next";

export interface Traveler {
  id: string;
  fullName: string;
  passportNumber: string;
  dob: string;
  nationality: string;
  gender?: string;
}

export function TravelerList({ travelers, onDelete }: { travelers: Traveler[]; onDelete: (id: string) => Promise<void> }) {
  const { t } = useTranslation();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <ul className="space-y-3">
      {travelers.map((traveler) => (
        <li key={traveler.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
              <span className="text-sm font-bold">{traveler.fullName.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-foreground">{traveler.fullName}</p>
              <p className="text-xs text-muted-foreground">{traveler.passportNumber} • {traveler.nationality}</p>
            </div>
          </div>
          {confirmingId === traveler.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold mr-1">{t("Are you sure?")}</span>
              <button
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDelete(traveler.id);
                    toast({
                      variant: "success",
                      title: t("Deleted"),
                      description: t("{{name}} was successfully deleted.", { name: traveler.fullName }),
                    });
                  } catch (err) {
                    toast({
                      variant: "destructive",
                      title: t("Error"),
                      description: err instanceof Error ? err.message : t("Failed to delete traveler."),
                    });
                  } finally {
                    setIsDeleting(false);
                    setConfirmingId(null);
                  }
                }}
              >
                {isDeleting ? t("Deleting...") : t("Yes, Delete")}
              </button>
              <button
                disabled={isDeleting}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
                onClick={() => setConfirmingId(null)}
              >
                {t("Cancel")}
              </button>
            </div>
          ) : (
            <button
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 active:scale-95"
              onClick={() => setConfirmingId(traveler.id)}
            >
              {t("Delete")}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
