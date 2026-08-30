"use client";

import { useState } from "react";
import { downloadDocument } from "@/lib/api/trips";
import { Download, Loader2, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocumentDownloadButton({
  bookingId,
  docType,
  label,
}: {
  bookingId: string;
  docType: "ticket" | "voucher" | "insurance";
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onDownload = async () => {
    setLoading(true);
    try {
      const blob = await downloadDocument(bookingId, docType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docType}-${bookingId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      className={cn(
        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2",
        done
          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
          : "border-slate-100 bg-slate-50 text-slate-700 hover:border-redmix/30 hover:bg-white hover:shadow-md",
      )}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-redmix" />
      ) : done ? (
        <FileCheck className="h-4 w-4 text-emerald-500" />
      ) : (
        <Download className="h-4 w-4 text-redmix" />
      )}
      {loading ? "Preparing..." : done ? "Downloaded" : label}
    </button>
  );
}
