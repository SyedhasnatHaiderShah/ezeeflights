/**
 * EzeeFlights — Biometric Authentication Utility
 *
 * Provides fingerprint / Face ID authentication for:
 *   - Quick sign-in after initial login
 *   - Confirming high-value booking actions
 *   - Accessing the Wallet section
 *
 * Plugin: capacitor-native-biometric
 */
import { isNative } from "./platform";

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Check whether biometric authentication is available on this device.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNative()) return false;

  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

/**
 * Prompt the user for biometric authentication.
 *
 * @param reason — Shown to the user explaining why auth is needed
 *
 * @example
 * const result = await authenticateWithBiometric('Confirm booking payment');
 * if (result.success) { proceed(); }
 */
export async function authenticateWithBiometric(
  reason = "Authenticate to continue",
): Promise<BiometricResult> {
  if (!isNative()) return { success: false, error: "Not on native platform" };

  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");

    await NativeBiometric.verifyIdentity({
      reason,
      title: "EzeeFlights",
      subtitle: "Use biometrics to authenticate",
      description: reason,
      maxAttempts: 3,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Biometric authentication failed",
    };
  }
}

/**
 * Save credentials to the device's secure keystore.
 * Used to store the user's refresh token for biometric quick-login.
 */
export async function saveCredentials(
  server: string,
  username: string,
  password: string,
): Promise<void> {
  if (!isNative()) return;

  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.setCredentials({ server, username, password });
  } catch (error) {
    console.error("[EzeeFlights] Failed to save credentials:", error);
  }
}

/**
 * Retrieve stored credentials from the device's secure keystore.
 */
export async function getCredentials(
  server: string,
): Promise<{ username: string; password: string } | null> {
  if (!isNative()) return null;

  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    return await NativeBiometric.getCredentials({ server });
  } catch {
    return null;
  }
}

/**
 * Delete stored credentials (called on logout).
 */
export async function deleteCredentials(server: string): Promise<void> {
  if (!isNative()) return;

  try {
    const { NativeBiometric } = await import("capacitor-native-biometric");
    await NativeBiometric.deleteCredentials({ server });
  } catch {
    // Silently ignore
  }
}

// Keystore server identifier for EzeeFlights
export const EZEEFLIGHTS_KEYSTORE_SERVER = "com.ezeeflights.app.auth";
