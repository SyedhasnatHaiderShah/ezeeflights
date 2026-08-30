# App Icons & Splash Screens

This folder contains the **source images** for native app icons and splash screens.

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App icon (iOS + Android) |
| `splash.png` | 2732×2732 | Launch screen background |

## Regenerating native icons

After replacing either source file, run on your Mac/PC:

```bash
./scripts/generate-app-icons.sh
```

This auto-generates every required size for iOS (`Assets.xcassets/AppIcon.appiconset/`) and Android (`mipmap-*` folders), then runs `npx cap sync`.

## Replacing the icon

Drop a new **1024×1024 PNG** at `resources/icon.png` and re-run the script.
For best results: square, no transparency, logo well-centered with ~10% padding.
