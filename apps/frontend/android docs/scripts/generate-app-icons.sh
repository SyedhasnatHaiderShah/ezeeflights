#!/usr/bin/env bash
# =============================================================
# Rentolic — Generate native iOS & Android app icons + splash
# =============================================================
# Usage (run on your Mac/PC after `git pull`):
#   chmod +x scripts/generate-app-icons.sh
#   ./scripts/generate-app-icons.sh
#
# Requirements:
#   - You've already run: npx cap add ios   and/or   npx cap add android
#   - Node + npm installed
# =============================================================

set -e

echo "🎨 Installing @capacitor/assets..."
npm install --save-dev @capacitor/assets --legacy-peer-deps

echo ""
echo "🖼  Generating all icon + splash sizes from resources/icon.png ..."
npx capacitor-assets generate \
  --iconBackgroundColor '#ffffff' \
  --iconBackgroundColorDark '#0F172A' \
  --splashBackgroundColor '#ffffff' \
  --splashBackgroundColorDark '#0F172A'

echo ""
echo "🔄 Syncing to native projects..."
npx cap sync

echo ""
echo "✅ Done! Rebuild your app:"
echo "   Android:  npx cap open android   →  Build → Build APK(s)"
echo "   iOS:      npx cap open ios       →  Product → Archive"
