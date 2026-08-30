import { registerPlugin } from "@capacitor/core";
import { isNative } from "./platform";

interface AppSettingsPlugin {
  open(): Promise<void>;
}

const AppSettings = registerPlugin<AppSettingsPlugin>("AppSettings");

export async function openAppSettings(): Promise<void> {
  if (!isNative()) return;

  try {
    await AppSettings.open();
  } catch (error) {
    console.warn("[EzeeFlights] Could not open app settings:", error);
  }
}
