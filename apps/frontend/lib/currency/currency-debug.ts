/** Enable verbose currency logs in the browser console */
export function isCurrencyDebugEnabled(): boolean {
  if (typeof process !== "undefined") {
    if (process.env.NEXT_PUBLIC_CURRENCY_DEBUG === "true") return true;
    if (process.env.NEXT_PUBLIC_CURRENCY_DEBUG === "false") return false;
    if (process.env.NODE_ENV === "development") return true;
  }
  return false;
}

export function logCurrencyDebug(
  phase: string,
  payload: Record<string, unknown>,
): void {
  if (!isCurrencyDebugEnabled()) return;
  console.log(
    `%c[Currency][Frontend] ${phase}`,
    "color:#0ea5e9;font-weight:bold",
    payload,
  );
}
