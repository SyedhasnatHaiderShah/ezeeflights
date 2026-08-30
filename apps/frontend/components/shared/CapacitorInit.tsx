"use client";

import { useEffect } from "react";
import {
  isNative,
  setupCapacitorAuthListener,
  setupBackButtonHandler,
  addPushListeners,
  registerPushNotifications,
} from "@/lib/capacitor";
import { useNativeNavChrome } from "@/lib/hooks/use-native-nav-chrome";

/**
 * CapacitorInit — Client-side component to initialize Capacitor plugins
 * and native event listeners on mobile.
 */
export function CapacitorInit() {
  useNativeNavChrome();

  useEffect(() => {
    if (!isNative()) return;

    console.log("[EzeeFlights] Initializing Capacitor Native Bridge...");

    setupCapacitorAuthListener(
      () => {
        console.log("[EzeeFlights] Auth success via deep link");
      },
      () => {
        console.log("[EzeeFlights] 2FA required via deep link");
      },
      (error) => {
        console.error("[EzeeFlights] Auth deep-link error:", error);
      },
    );

    setupBackButtonHandler();

    const initPush = async () => {
      const token = await registerPushNotifications();
      if (token) {
        console.log("[EzeeFlights] Push token registered:", token);
      }
    };

    addPushListeners(
      (notification) => {
        console.log("[EzeeFlights] Foreground notification:", notification);
      },
      (action) => {
        console.log("[EzeeFlights] Notification action:", action);
      },
    );

    void initPush();
  }, []);

  return null;
}
