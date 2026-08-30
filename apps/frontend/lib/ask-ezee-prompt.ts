/** Shared copy and helpers for Ask Ezee voice search. */

export function getExamplePromptDate(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

export function formatExampleDate(date = getExamplePromptDate()): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function getExampleFlightPrompt(): string {
  return `Delhi to Dubai on ${formatExampleDate()}`;
}

export function buildIncompletePromptMessage(
  opts: {
    missing?: string[];
    apiQuestion?: string;
  },
  t: (k: string) => string = (k) => k,
): string {
  const example = `Delhi to Dubai on ${formatExampleDate()}`;
  const missing = opts.missing?.filter(Boolean) ?? [];
  const missingLine =
    missing.length > 0
      ? ` ${t("I still need:")} ${missing.map((m) => {
          if (m === "destination (say “to Dubai”)") return t("destination (say “to Dubai”)");
          if (m === "origin (say “from Delhi” or “Delhi to …”") return t("origin (say “from Delhi” or “Delhi to …”");
          if (m === "your voice input") return t("your voice input");
          return m;
        }).join(", ")}.`
      : "";

  const question = opts.apiQuestion?.trim()
    ? ` ${opts.apiQuestion.trim()}`
    : "";

  return (
    `${t("Your voice prompt isn't complete yet.")}${missingLine}${question}\n\n` +
    `${t("Please say the full trip in one sentence, for example:")}\n"${example}"`
  );
}

/** Quick client-side check before calling the AI. */
export function detectMissingFlightParts(transcript: string): string[] {
  const text = transcript.trim();
  if (!text) return ["origin", "destination"];

  const missing: string[] = [];
  const lower = text.toLowerCase();

  const hasTo =
    /\bto\b/i.test(text) ||
    /\binto\b/i.test(text) ||
    /\bgoing\s+to\b/i.test(text);
  const hasFrom = /\bfrom\b/i.test(text) || /\bdepart(?:ing)?\s+from\b/i.test(text);

  const cityToCity = /^[a-z\s]{2,}\s+to\s+[a-z\s]{2,}/i.test(text);
  if (!hasTo && !cityToCity) {
    missing.push("destination (say “to Dubai”)");
  }
  if (!hasFrom && !cityToCity) {
    missing.push("origin (say “from Delhi” or “Delhi to …”");
  }

  // Note: Travel date is optional! If omitted, it will automatically search for flights 1 week from today.

  return missing;
}

export const ASK_EZEE_LISTENING_HINT =
  `Say where you fly from and where to — e.g. "Delhi to Dubai" (date is optional, defaults to 1 week from today).`;

export const ASK_EZEE_SILENCE_MS = 2000;
export const ASK_EZEE_MAX_LISTEN_MS = 10000; // 10 seconds max listening duration
export const ASK_EZEE_MIN_TRANSCRIPT_CHARS = 10;
