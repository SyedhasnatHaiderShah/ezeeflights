export function buildSessionTranscript(event: {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0?: { transcript?: string };
    };
  };
}): string {
  let fullTranscript = "";

  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    const piece = result[0]?.transcript ?? "";
    if (!piece) continue;

    fullTranscript = mergeCommittedTranscript(fullTranscript, piece);
  }

  return normalizeTranscript(fullTranscript);
}

/** Merge text kept across mic restarts (Chrome stops ~every 5–10s on mobile). */
export function mergeCommittedTranscript(
  committed: string,
  session: string,
): string {
  const base = normalizeTranscript(committed);
  const current = normalizeTranscript(session);
  if (!base) return current;
  if (!current) return base;

  const baseLower = base.toLowerCase();
  const curLower = current.toLowerCase();

  if (curLower.startsWith(baseLower)) return current;
  if (baseLower.endsWith(curLower)) return base;

  const maxOverlap = Math.min(base.length, current.length);
  for (let len = maxOverlap; len > 2; len--) {
    if (baseLower.slice(-len) === curLower.slice(0, len)) {
      return normalizeTranscript(`${base}${current.slice(len)}`);
    }
  }

  return normalizeTranscript(`${base} ${current}`);
}

export function normalizeTranscript(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
