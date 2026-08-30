#!/usr/bin/env bash
# =============================================================
# EzeeFlights — One-shot Android APK builder
# =============================================================
# Does EVERYTHING from a fresh `git pull`:
#   1. Installs npm deps
#   2. Builds the web app (Next.js static export)
#   3. Adds Android platform if missing
#   4. Generates app icons + splash
#   5. Syncs to native project
#   6. Builds a debug APK with Gradle
#   7. Copies the APK to ./build-output/ezeeflights-debug.apk
#
# Usage (Mac/Linux/WSL):
#   chmod +x scripts/build-android-apk.sh
#   ./scripts/build-android-apk.sh             # debug APK (default)
#   ./scripts/build-android-apk.sh release     # signed release APK
# =============================================================

set -euo pipefail

BUILD_TYPE="${1:-debug}"   # debug | release
OUTPUT_DIR="build-output"
SKIP_PULL="${SKIP_PULL:-0}"

echo ""
echo "======================================================"
echo " 🏗  EzeeFlights Android APK Builder  (mode: $BUILD_TYPE)"
echo "======================================================"
echo ""

# ---------- 0. Pull latest code ----------
if [ "$SKIP_PULL" = "1" ]; then
  echo "⏭  [0/8] Skipping git pull."
elif [ -d ".git" ]; then
  echo "⬇️  [0/8] Pulling latest code..."
  git pull --ff-only || echo "⚠️  git pull failed."
fi

# ---------- 1. Install dependencies ----------
echo ""
echo "📦 [1/8] Installing npm dependencies..."
npm install

# ---------- 2. Build web app (Next.js Mobile Export) ----------
echo ""
echo "🔨 [2/8] Building Next.js mobile export..."
npm run build:mobile

# ---------- 3. Add Android platform if missing ----------
if [ ! -d "android" ]; then
  echo ""
  echo "📱 [3/8] Adding Android platform..."
  npx cap add android
else
  echo ""
  echo "✅ [3/8] Android platform already present."
fi

# ---------- 4. Generate app icons + splash ----------
echo ""
echo "🎨 [4/8] Generating app icons + splash..."
npm run cap:assets || echo "⚠️  Icon generation skipped."

# ---------- 5. Sync to native ----------
echo ""
echo "🔄 [5/8] Syncing web build to native..."
npx cap sync android

# ---------- 6. Gradle build ----------
echo ""
echo "🤖 [6/8] Building Android APK ($BUILD_TYPE)..."
cd android
chmod +x ./gradlew

if [ "$BUILD_TYPE" = "release" ]; then
  ./gradlew assembleRelease
  APK_SRC="app/build/outputs/apk/release/app-release-unsigned.apk"
else
  ./gradlew assembleDebug
  APK_SRC="app/build/outputs/apk/debug/app-debug.apk"
fi
cd ..

# ---------- 7. Copy APK to output folder ----------
echo ""
echo "📤 [7/8] Copying APK to ./$OUTPUT_DIR/ ..."
mkdir -p "$OUTPUT_DIR"
DEST="$OUTPUT_DIR/ezeeflights-$BUILD_TYPE.apk"
cp "android/$APK_SRC" "$DEST"

echo ""
echo "======================================================"
echo " ✅ BUILD COMPLETE"
echo "======================================================"
echo " APK ready at:  $DEST"
echo "======================================================"
