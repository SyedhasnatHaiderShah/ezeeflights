/** Minimum characters for a review to appear publicly. */
export const MIN_PUBLIC_REVIEW_LENGTH = 50;

/**
 * SQL fragment appended to tbl_review queries.
 * Keeps pagination/counts aligned with {@link isPublicReviewEligible}.
 */
export function publicReviewQualitySql(alias = ""): string {
  const col = (field: string) => `${alias}${field}`;

  return `
    AND CHAR_LENGTH(TRIM(${col("message")})) >= ${MIN_PUBLIC_REVIEW_LENGTH}
    AND LOWER(${col("message")}) NOT LIKE '%alert(%'
    AND LOWER(${col("message")}) NOT LIKE '%<script%'
    AND LOWER(${col("message")}) NOT LIKE '%javascript:%'
    AND LOWER(${col("message")}) NOT LIKE '%onerror=%'
    AND LOWER(${col("message")}) NOT LIKE '%onclick=%'
    AND LOWER(${col("message")}) NOT LIKE '%eval(%'
    AND LOWER(${col("message")}) NOT LIKE '%xss%'
    AND LOWER(${col("name")}) NOT LIKE '%xss%'
    AND LOWER(${col("message")}) NOT LIKE '%pay id%'
    AND LOWER(${col("message")}) NOT LIKE '%paid id%'
    AND LOWER(${col("message")}) NOT LIKE '%please send me flight%'
    AND LOWER(${col("message")}) NOT LIKE '%send me flight information%'
    AND LOWER(${col("message")}) NOT LIKE '%dbms_pipe%'
    AND LOWER(${col("message")}) NOT LIKE '%pg_sleep%'
    AND LOWER(${col("message")}) NOT LIKE '%waitfor delay%'
    AND LOWER(${col("message")}) NOT LIKE '%union select%'
    AND LOWER(${col("message")}) NOT LIKE '%pg_sleep(%'
  `;
}

const MALICIOUS_RE =
  /alert\s*\(|<script|javascript:|onerror\s*=|onclick\s*=|eval\s*\(|xss|document\.cookie|dbms_pipe|pg_sleep|waitfor\s+delay|union\s+select/i;

const SPAM_RE =
  /pay\s*id|paid\s*id|please\s+send\s+me\s+flight|send\s+me\s+flight\s+information/i;

/** Runtime guard — mirrors SQL rules plus regex checks. */
export function isPublicReviewEligible(
  message: string,
  name = "",
): boolean {
  const text = String(message ?? "").trim();
  const author = String(name ?? "").trim();

  if (text.length < MIN_PUBLIC_REVIEW_LENGTH) {
    return false;
  }

  const combined = `${text}\n${author}`;
  if (MALICIOUS_RE.test(combined)) {
    return false;
  }

  if (SPAM_RE.test(text)) {
    return false;
  }

  return true;
}

/** Strip HTML tags and decode HTML entities from stored review text before sending to clients. */
export function sanitizeReviewText(message: string): string {
  let text = String(message ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");

  return text;
}
