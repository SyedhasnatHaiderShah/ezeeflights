import { isAndroid } from "../capacitor";

let deviceChecked = false;
let isVirtualDevice = false;

/**
 * Checks at runtime if the app is running on a virtual device (emulator)
 * vs a real physical device using the Capacitor Device plugin.
 */
export async function initializeDeviceOrigin() {
  if (typeof window === "undefined") return;
  if (deviceChecked) return;
  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getInfo();
    isVirtualDevice = info.isVirtual;
  } catch (e) {
    console.warn("Failed to retrieve device virtual status:", e);
  }
  deviceChecked = true;
}

/** Origin of the Nest API (no /v1). Server-side only in production when possible. */
export function internalApiOrigin(): string {
  const explicit = process.env.INTERNAL_API_BASE_URL;
  let raw =
    explicit ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000/api";

  if (isAndroid()) {
    if (deviceChecked && !isVirtualDevice) {
      return raw.replace(/\/api\/?$/, "").replace(/\/v1\/?$/, "").replace(/\/$/, "");
    }
    raw = raw.replace("127.0.0.1", "10.0.2.2").replace("localhost", "10.0.2.2");
  }

  return (
    raw.replace(/\/api\/?$/, "").replace(/\/v1\/?$/, "").replace(/\/$/, "") || "http://localhost:4000"
  );
}

/** Full URL for an API path, e.g. `auth/login` -> `http://host:4000/api/auth/login` */
export function internalV1Url(path: string): string {
  const base = internalApiOrigin();
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${base}/api/${p}`;
}

/** Origin of the Next.js frontend API proxy, resolves to 10.0.2.2 on Android Emulators */
export function nextApiOrigin(): string {
  let raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (isAndroid()) {
    if (deviceChecked && !isVirtualDevice) {
      return raw.replace(/\/$/, "");
    }
    raw = raw.replace("127.0.0.1", "10.0.2.2").replace("localhost", "10.0.2.2");
  }
  return raw.replace(/\/$/, "");
}
