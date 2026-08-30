/**
 * EzeeFlights — Push Notifications Setup
 *
 * Handles push notification registration and event listeners for
 * flight deal alerts, booking confirmations, and price drop notifications.
 *
 * Platform requirements:
 *   Android: google-services.json in android/app/ (for FCM)
 *   iOS:     Push Notification capability enabled in Xcode + Apple Developer Portal
 */
import { isNative, isIOS } from "./platform";

export interface PushNotificationPayload {
  id: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

/**
 * Register the device for push notifications.
 * Requests permission and returns the FCM/APNS device token.
 *
 * @returns The device push token, or null if denied/unavailable.
 */
export async function registerPushNotifications(): Promise<string | null> {
  if (!isNative()) return null;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Check and request permission
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("[EzeeFlights] Push notification permission denied");
      return null;
    }

    // Register with the OS / FCM / APNS
    await PushNotifications.register();

    // Return a promise that resolves with the token
    return new Promise((resolve, reject) => {
      PushNotifications.addListener("registration", (token) => {
        console.log("[EzeeFlights] Push token:", token.value);
        resolve(token.value);
      });

      PushNotifications.addListener("registrationError", (error) => {
        console.error("[EzeeFlights] Push registration error:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.warn("[EzeeFlights] Push Notifications plugin unavailable:", error);
    return null;
  }
}

/**
 * Set up listeners for incoming push notifications.
 * Call this once on app mount.
 *
 * @param onNotification — callback for foreground notifications
 * @param onAction — callback when user taps a notification
 */
export async function addPushListeners(
  onNotification?: (notification: PushNotificationPayload) => void,
  onAction?: (notification: PushNotificationPayload) => void,
): Promise<void> {
  if (!isNative()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    // Foreground notification received
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("[EzeeFlights] Push received in foreground:", notification);
        onNotification?.({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          data: notification.data as Record<string, string>,
        });
      },
    );

    // User tapped on a notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        console.log("[EzeeFlights] Push action performed:", action);
        onAction?.({
          id: action.notification.id,
          title: action.notification.title,
          body: action.notification.body,
          data: action.notification.data as Record<string, string>,
        });
      },
    );
  } catch (error) {
    console.warn("[EzeeFlights] Push listener setup error:", error);
  }
}

/**
 * Get all pending (delivered) notifications from the notification tray.
 */
export async function getDeliveredNotifications(): Promise<
  PushNotificationPayload[]
> {
  if (!isNative()) return [];

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      data: n.data as Record<string, string>,
    }));
  } catch {
    return [];
  }
}

/**
 * Clear all delivered notifications from the notification tray.
 */
export async function clearAllNotifications(): Promise<void> {
  if (!isNative()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.removeAllDeliveredNotifications();
  } catch {
    // Silently ignore
  }
}
