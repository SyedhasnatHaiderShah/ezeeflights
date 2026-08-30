/**
 * Patches Capacitor Android plugins for Gradle 9+ / AGP 9+ compatibility.
 * Run automatically before mobile builds and cap sync.
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const frontendRoot = path.resolve(__dirname, "..");

const biometricGradle = path.join(
  repoRoot,
  "node_modules/capacitor-native-biometric/android/build.gradle",
);

const pluginBuildDirs = [
  path.join(frontendRoot, "node_modules/@capacitor"),
  path.join(repoRoot, "node_modules/@capacitor"),
  path.join(repoRoot, "node_modules/@capawesome"),
  path.join(repoRoot, "node_modules/capacitor-native-biometric"),
];

function rmDirSafe(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch (error) {
    console.warn(`[patch-capacitor-plugins] Could not remove ${dir}:`, error.message);
  }
}

/** Remove stale Kotlin/Gradle caches inside node_modules (fixes Windows Access denied). */
function cleanCapacitorPluginBuildCaches() {
  for (const base of pluginBuildDirs) {
    if (!fs.existsSync(base)) continue;

    const entries = fs.readdirSync(base, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const androidBuild = path.join(base, entry.name, "android", "build");
      rmDirSafe(androidBuild);
      // capacitor-android lives at android/capacitor/build
      const nestedBuild = path.join(base, entry.name, "android", "capacitor", "build");
      rmDirSafe(nestedBuild);
    }
  }

  const localCapBuild = path.join(frontendRoot, "android/build/cap-plugins");
  rmDirSafe(localCapBuild);

  console.log("[patch-capacitor-plugins] Cleared stale Capacitor plugin build caches.");
}

function patchNativeBiometricGradle() {
  if (!fs.existsSync(biometricGradle)) {
    console.warn(
      "[patch-capacitor-plugins] capacitor-native-biometric not found, skipping.",
    );
    return;
  }

  let source = fs.readFileSync(biometricGradle, "utf8");
  const original = source;

  // Gradle 9 removed jcenter().
  source = source.replace(/\s*jcenter\(\)\n/g, "\n");

  // AGP 9 evaluates proguardFiles at configure time even when minify is off.
  source = source.replace(
    /(\s+release\s*\{\s*\n\s*minifyEnabled false)\s*\n\s*proguardFiles[^\n]+\n/s,
    "$1\n",
  );

  // Root project supplies AGP — plugin buildscript is unnecessary and can pin old tooling.
  source = source.replace(
    /buildscript\s*\{[\s\S]*?\}\s*\n\napply plugin:/,
    "apply plugin:",
  );

  // lintOptions is deprecated on newer AGP.
  source = source.replace(/lintOptions\s*\{/, "lint {");

  // Capacitor 8 / AGP 9 — NativeBiometric uses ActivityResult API.
  if (!source.includes("androidx.activity:activity")) {
    source = source.replace(
      /implementation 'androidx\.biometric:biometric:1\.0\.1'/,
      "implementation 'androidx.biometric:biometric:1.0.1'\n    implementation 'androidx.activity:activity:1.9.2'",
    );
  }

  if (source === original) {
    console.log("[patch-capacitor-plugins] capacitor-native-biometric already patched.");
    return;
  }

  fs.writeFileSync(biometricGradle, source, "utf8");
  console.log("[patch-capacitor-plugins] Patched capacitor-native-biometric/android/build.gradle");
}

cleanCapacitorPluginBuildCaches();
patchNativeBiometricGradle();
