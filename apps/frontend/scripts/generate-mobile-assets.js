/**
 * Builds square Capacitor source assets (icon + splash) from EzeeFlights branding,
 * then @capacitor/assets populates all Android/iOS density variants.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const LOGO_SOURCE = path.join(ROOT, "public", "icons", "icon-512.webp");
const BRAND_BG = { r: 13, g: 35, b: 83, alpha: 1 }; // #0d2353

async function writeBrandAsset(outputPath, size, logoScale) {
  const logoSize = Math.round(size * logoScale);
  const logo = await sharp(LOGO_SOURCE)
    .resize(logoSize, logoSize, { fit: "contain", background: BRAND_BG })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(LOGO_SOURCE)) {
    console.error(`[MobileAssets] Logo not found: ${LOGO_SOURCE}`);
    process.exit(1);
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  console.log("[MobileAssets] Generating 1024×1024 app icon...");
  await writeBrandAsset(path.join(ASSETS_DIR, "icon.png"), 1024, 0.72);

  console.log("[MobileAssets] Generating 2732×2732 splash screen...");
  await writeBrandAsset(path.join(ASSETS_DIR, "splash.png"), 2732, 0.42);

  console.log("[MobileAssets] Running @capacitor/assets for Android/iOS...");
  execSync(
    "npx @capacitor/assets generate --iconBackgroundColor #0d2353 --splashBackgroundColor #0d2353 --iconBackgroundColorDark #0d2353 --splashBackgroundColorDark #0d2353",
    { cwd: ROOT, stdio: "inherit" },
  );

  console.log("[MobileAssets] Done — launcher icons and splash screens updated.");
}

main().catch((error) => {
  console.error("[MobileAssets] Failed:", error);
  process.exit(1);
});
