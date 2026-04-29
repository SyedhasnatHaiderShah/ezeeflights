"use client";

import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TripShareActions({
  confirmationCode,
  shareText,
}: {
  confirmationCode: string;
  shareText: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all shadow-sm",
          copied
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : "border-white/20 bg-white/10 text-white hover:bg-white/20",
        )}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4 text-brand-yellow" />
        )}
        {copied ? "Copied!" : "Copy Code"}
      </button>

      <a
        href={`https://wa.me/?text=${shareText}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
      >
        <Share2 className="h-4 w-4" />
        Share
      </a>
    </div>
  );
}
