import { registerPlugin } from "@capacitor/core";
import { isAndroid, isIOS, isNative } from "./platform";
import { useMicrophonePermissionStore } from "@/lib/store/microphone-permission-store";

export interface MicrophonePlugin {
  checkPermissions(): Promise<{
    microphone: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  }>;
  requestPermissions(): Promise<{
    microphone: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  }>;
}

const Microphone = registerPlugin<MicrophonePlugin>("Microphone");

export type MicrophonePermissionStatus = "granted" | "denied" | "unsupported";

export function getMicrophonePermissionMessage(
  status: MicrophonePermissionStatus,
): string {
  if (status === "unsupported") {
    return "Microphone is not available on this device.";
  }

  if (isNative() && isAndroid()) {
    return "EzeeFlights needs microphone access for voice search. Tap Allow below, or open Settings → Apps → EzeeFlights → Permissions → Microphone.";
  }

  if (isNative() && isIOS()) {
    return "EzeeFlights needs microphone access for voice search. Tap Allow below, or open Settings → EzeeFlights → Microphone.";
  }

  return "EzeeFlights needs microphone access for voice search. Allow the microphone when prompted, or enable it in your browser settings.";
}

async function queryMicrophonePermissionOnWeb(): Promise<
  MicrophonePermissionStatus | "prompt"
> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "unsupported";
  }

  try {
    if (navigator.permissions?.query) {
      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (result.state === "granted") return "granted";
      if (result.state === "denied") return "denied";
      return "prompt";
    }
  } catch {
    // Permissions API may not support microphone on this browser.
  }

  return "prompt";
}

/**
 * Requests microphone access via getUserMedia.
 * On native Android/iOS we skip navigator.permissions.query — it often reports
 * "denied" even when the OS permission is already granted.
 */
export async function ensureMicrophonePermission(): Promise<MicrophonePermissionStatus> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "unsupported";
  }

  if (!isNative()) {
    const current = await queryMicrophonePermissionOnWeb();
    if (current === "granted") return "granted";
    if (current === "unsupported") return "unsupported";
  } else if (isAndroid()) {
    try {
      let permStatus = await Microphone.checkPermissions();
      if (permStatus.microphone !== "granted") {
        permStatus = await Microphone.requestPermissions();
      }
      if (permStatus.microphone === "granted") {
        return "granted";
      }
      return "denied";
    } catch (e) {
      console.warn("[EzeeFlights] Microphone native permission error:", e);
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (
      name === "NotAllowedError" ||
      name === "PermissionDeniedError" ||
      name === "SecurityError"
    ) {
      return "denied";
    }
    console.warn("[EzeeFlights] Microphone request failed:", error);
    return "denied";
  }
}

/**
 * Ensures mic access; if not granted, opens the permission modal.
 * Always re-checks on each call (no cached "blocked" state).
 */
export async function requestMicrophoneAccess(options?: {
  onGranted?: () => void;
}): Promise<boolean> {
  const status = await ensureMicrophonePermission();
  if (status === "granted") {
    options?.onGranted?.();
    return true;
  }

  useMicrophonePermissionStore
    .getState()
    .open(status, options?.onGranted ?? null);
  return false;
}
