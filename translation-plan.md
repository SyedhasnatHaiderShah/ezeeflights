# App Translation Architecture (react-i18next)

Currently, the application does not support multi-language translations (i18n). You have requested to use `react-i18next` so you can use the `useTranslation` hook across your components.

## User Review Required

> [!WARNING]
> You specifically requested to use `import { useTranslation } from 'react-i18next';`.
> Because this app uses Next.js App Router (Server Components by default), `useTranslation` (which uses React Context under the hood) **can only be used in Client Components**.
> This means any component where you use this exact import will need `"use client";` at the very top of the file.
> I will set up a universal `I18nextProvider` wrapper so this hook works perfectly anywhere you use `"use client";`.

> [!IMPORTANT]
> To avoid breaking all of your existing URL paths (like `/flights/result`), I propose a **cookie-based** or **local-storage** locale strategy rather than **path-based** (like `/en/flights/result`). The language will be determined by the user's saved preference or browser language.

## Supported Languages

We will set up JSON translation files for all the requested languages:

- English (`en`) - Default
- Turkish (`tr`)
- Arabic (`ar`)
- French (`fr`)
- Hindi (`hi`)
- Spanish (`es`)
- Estonian (`et`)
- German (`de`)
- Chinese (`zh`)
- Urdu (`ur`)
- Tagalog/Philippines (`tl`)

## Proposed Technologies

1. **Translation Library:** `i18next` and `react-i18next`
2. **Backend Plugin:** `i18next-http-backend` (loads translations dynamically so they don't bloat the bundle) or static imports.
3. **Detector Plugin:** `i18next-browser-languagedetector` (automatically detects the user's language).

## Proposed Changes

### 1. Dependencies

#### [NEW] `package.json`

- Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`, and `i18next-http-backend`.

### 2. Flat Translation Key Pattern

**CRITICAL ARCHITECTURE DECISION:** This project utilizes a **Flat Key-Value Translation Structure** where the exact English phrase is used as the translation key instead of nested objects. This allows components to use the `t()` function seamlessly without needing to maintain complex, nested JSON paths.

**Example Setup (Correct):**

```json
{
  "Search Flights": "Uçuş Ara",
  "Not a member?": "لست عضوًا؟",
  "Open in full view": "Tam ekranda aç"
}
```

**Example Usage in Component:**

```typescript
"use client";
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  return <button title={t('Open in full view')}>{t('Not a member?')}</button>;
}
```

_Future AI Instructions:_ When adding new translations to this or similar projects, DO NOT use nested objects (e.g., `"Header": { "login": "Log in" }`). Use the exact English source string as the root key to ensure components can wrap strings in `t('String')` effortlessly.

### 3. Configuration & Dictionaries

#### [NEW] `apps/frontend/translations/`

- Create dictionary folders and `common.json` files for all 11 supported languages (e.g., `translations/en/common.json`, `translations/tr/common.json`).

#### [NEW] `apps/frontend/lib/i18n.ts`

- Setup the `i18next` initialization logic with all the supported languages and plugins.

### 3. Application Integration

#### [MODIFY] `apps/frontend/app/layout.tsx`

- Wrap the application with `I18nProvider` (a client component that initializes `react-i18next`) to pass translations down the React tree.

#### [MODIFY] Example Component (e.g., Header or Search Bar)

- Add `"use client";` (if not already present).
- Import `useTranslation` and implement the `t('key')` function as a proof of concept.

## Open Questions

1. **Server Components:** Are you okay with adding `"use client";` to components that need translations, or would you like me to also create a secondary server-side translation helper for components that must remain Server Components?
2. **Language Switcher:** I will set up the architecture first, but where would you like the Language Switcher dropdown to be located? (e.g., in the Navbar next to the Currency selector?)

## Verification Plan

1. We will verify that the app builds successfully.
2. We will test the `useTranslation` hook in a component and ensure it switches between languages (like English to Arabic) seamlessly.

# Translation Guide & System Prompts

This document serves as an instruction set and template for any AI assistant to implement internationalization (i18n) for any React component in this repository.

---

## AI Prompt: Translate Component Workflow

Use the following guidelines when asked to translate any React/Next.js component in the codebase:

### 1. Component File Modification

Modify the target React component (e.g. `[ComponentName].tsx`) as follows:

- **Import Statement**: Add `import { useTranslation } from "react-i18next";`
- **Hook Initialization**: Add `const { t } = useTranslation();` at the beginning of the component.
- **Text Wrapping**: Locate all hardcoded user-facing strings and wrap them with `t("Original String")`.

_Example Component modification_:

```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("Hello World")}</h1>
      <button>{t("Submit")}</button>
    </div>
  );
}
```

---

### 2. Update Translation Files

When you extract new translation keys from a component, add the translated values to the following files:

#### A. Root Translation Files (Loaded by `lib/i18n.ts`)

Add keys and translations to these files:

- `apps/frontend/translations/en.json`
- `apps/frontend/translations/ar.json`
- `apps/frontend/translations/tr.json`
- `apps/frontend/translations/fr.json`
- `apps/frontend/translations/hi.json`
- `apps/frontend/translations/es.json`
- `apps/frontend/translations/et.json`
- `apps/frontend/translations/de.json`
- `apps/frontend/translations/zh-hans.json`
- `apps/frontend/translations/zh-hant.json`
- `apps/frontend/translations/ur.json`
- `apps/frontend/translations/tl.json`

#### B. Nested Folder Translation Files (Loaded by `translations/translation.js`)

Add keys and translations to these files:

- `apps/frontend/translations/en/global.json`
- `apps/frontend/translations/ar/global.json`
- `apps/frontend/translations/jpn/global.json`
- `apps/frontend/translations/ko/global.json`
- `apps/frontend/translations/th/global.json`
- `apps/frontend/translations/zh-Hans/global.json`
- `apps/frontend/translations/zh-Hant/global.json`

---

## 3. Reference translation list template

For any new text key extracted:

- **English (`en`)**: Provide standard English translation.
- **Arabic (`ar`)**: Provide translated Arabic text.
- **Turkish (`tr`)**: Provide translated Turkish text.
- **French (`fr`)**: Provide translated French text.
- **Hindi (`hi`)**: Provide translated Hindi text.
- **Spanish (`es`)**: Provide translated Spanish text.
- **Estonian (`et`)**: Provide translated Estonian text.
- **German (`de`)**: Provide translated German text.
- **Chinese Simplified (`zh-hans`)**: Provide translated Simplified Chinese text.
- **Chinese Traditional (`zh-hant`)**: Provide translated Traditional Chinese text.
- **Urdu (`ur`)**: Provide translated Urdu text.
- **Tagalog (`tl`)**: Provide translated Tagalog text.
- **Japanese (`jpn`)**: Provide translated Japanese text.
- **Korean (`ko`)**: Provide translated Korean text.
- **Thai (`th`)**: Provide translated Thai text.

---

## Automating Translations

To prevent developers from manually translating hundreds of keys across all 11+ languages, an automated translation utility script is available at the project root: `auto-translate-all.js`.

### How It Works:

1. It compares all keys inside `apps/frontend/translations/en.json` (English) with each of the other language JSON files (`ar.json`, `de.json`, `es.json`, etc.).
2. It identifies keys that are missing or are still left in English (e.g. key equals value, such as `"Search" : "Search"`).
3. It calls the unauthenticated Google Translate API sequentially to translate these keys into their respective languages while preserving variables like `{{name}}` or `{{index}}`.
4. It updates all translation files in-place and saves them.

### How to Run:

```bash
node auto-translate-all.js
```

---

## Verification & Build

After updating the component and all JSON translation files:

- Validate JSON files for any syntax issues or missing commas.
- Run `npm run build` in `apps/frontend` to ensure the project builds correctly.

---

## Example: Implemented Translations Reference

Below is an example of the translation structure to provide to the JSON translation files (based on the `TopDestinations` component):

### English (`en`)

```json
{
  "Curated Escapes": "Curated Escapes",
  "Top Destinations": "Top Destinations",
  "Explore All": "Explore All",
  "Trending": "Trending",
  "Best Deals Available": "Best Deals Available",
  "No results in this region": "No results in this region",
  "ALL": "ALL",
  "OTHER": "OTHER",
  "Global": "Global"
}
```

### Arabic (`ar`)

```json
{
  "Curated Escapes": "رحلات منسقة",
  "Top Destinations": "أفضل الوجهات",
  "Explore All": "استكشف الكل",
  "Trending": "شائع",
  "Best Deals Available": "أفضل العروض المتاحة",
  "No results in this region": "لا توجد نتائج في هذه المنطقة",
  "ALL": "الكل",
  "OTHER": "أخرى",
  "Global": "عالمي"
}
```

### Turkish (`tr`)

```json
{
  "Curated Escapes": "Özel Seçilmiş Rotalar",
  "Top Destinations": "Popüler Destinasyonlar",
  "Explore All": "Hepsini Keşfet",
  "Trending": "Trend Olanlar",
  "Best Deals Available": "Mevcut En İyi Fırsatlar",
  "No results in this region": "Bu bölgede sonuç bulunamadı",
  "ALL": "HEPSİ",
  "OTHER": "DİĞER",
  "Global": "Küresel"
}
```

### French (`fr`)

```json
{
  "Curated Escapes": "Évasions Sur Mesure",
  "Top Destinations": "Meilleures Destinations",
  "Explore All": "Explorer Tout",
  "Trending": "Tendance",
  "Best Deals Available": "Meilleures Offres Disponibles",
  "No results in this region": "Aucun résultat dans cette région",
  "ALL": "TOUT",
  "OTHER": "AUTRE",
  "Global": "Mondial"
}
```

### Hindi (`hi`)

```json
{
  "Curated Escapes": "विशेष चुनिंदा यात्राएं",
  "Top Destinations": "शीर्ष गंतव्य",
  "Explore All": "सभी देखें",
  "Trending": "लोकप्रिय",
  "Best Deals Available": "सर्वोत्तम उपलब्ध डील",
  "No results in this region": "इस क्षेत्र में कोई परिणाम नहीं",
  "ALL": "सभी",
  "OTHER": "अन्य",
  "Global": "वैश्विक"
}
```

### Spanish (`es`)

```json
{
  "Curated Escapes": "Escapadas Seleccionadas",
  "Top Destinations": "Destinos Destacados",
  "Explore All": "Explorar Todo",
  "Trending": "Tendencia",
  "Best Deals Available": "Mejores Ofertas Disponibles",
  "No results in this region": "Sin resultados en esta región",
  "ALL": "TODO",
  "OTHER": "OTRO",
  "Global": "Global"
}
```

### Estonian (`et`)

```json
{
  "Curated Escapes": "Kuratooritud Põgenemised",
  "Top Destinations": "Populaarsed Sihtkohad",
  "Explore All": "Avasta Kõik",
  "Trending": "Populaarne",
  "Best Deals Available": "Parimad Saadaval Pakkumised",
  "No results in this region": "Selles piirkonnas tulemusi ei leitud",
  "ALL": "KÕIK",
  "OTHER": "MUU",
  "Global": "Globaalne"
}
```

### German (`de`)

```json
{
  "Curated Escapes": "Kuratierte Reisen",
  "Top Destinations": "Top-Reiseziele",
  "Explore All": "Alle Erkunden",
  "Trending": "Im Trend",
  "Best Deals Available": "Beste verfügbare Angebote",
  "No results in this region": "Keine Ergebnisse in dieser Region",
  "ALL": "ALLE",
  "OTHER": "ANDERE",
  "Global": "Global"
}
```

### Chinese Simplified (`zh-hans` / `zh-Hans`)

```json
{
  "Curated Escapes": "精选避世之旅",
  "Top Destinations": "热门目的地",
  "Explore All": "探索全部",
  "Trending": "趋势",
  "Best Deals Available": "最优惠价格",
  "No results in this region": "该地区无结果",
  "ALL": "全部",
  "OTHER": "其他",
  "Global": "全球"
}
```

### Chinese Traditional (`zh-hant` / `zh-Hant`)

```json
{
  "Curated Escapes": "精選避世之旅",
  "Top Destinations": "熱門目的地",
  "Explore All": "探索全部",
  "Trending": "趨勢",
  "Best Deals Available": "最優惠價格",
  "No results in this region": "該地區無結果",
  "ALL": "全部",
  "OTHER": "其他",
  "Global": "全球"
}
```

### Urdu (`ur`)

```json
{
  "Curated Escapes": "منتخب کردہ مقامات",
  "Top Destinations": "بہترین مقامات",
  "Explore All": "تمام تلاش کریں",
  "Trending": "مقبول",
  "Best Deals Available": "بہترین دستیاب ڈیلز",
  "No results in this region": "اس علاقے میں کوئی نتائج نہیں ملے",
  "ALL": "سب",
  "OTHER": "دیگر",
  "Global": "عالمی"
}
```

### Tagalog (`tl`)

```json
{
  "Curated Escapes": "Mga Piniling Destinasyon",
  "Top Destinations": "Mga Nangungunang Destinasyon",
  "Explore All": "Galugarin Lahat",
  "Trending": "Umuuso",
  "Best Deals Available": "Pinakamagandang Deal",
  "No results in this region": "Walang mga resulta sa rehiyong ito",
  "ALL": "LAHAT",
  "OTHER": "IBA PA",
  "Global": "Pangkalahatan"
}
```

### Japanese (`jpn`)

```json
{
  "Curated Escapes": "厳選された旅",
  "Top Destinations": "人気の目的地",
  "Explore All": "すべてを探索",
  "Trending": "トレンド",
  "Best Deals Available": "ベストプランあり",
  "No results in this region": "この地域には結果がありません",
  "ALL": "すべて",
  "OTHER": "その他",
  "Global": "グローバル"
}
```

### Korean (`ko`)

```json
{
  "Curated Escapes": "엄선된 여행지",
  "Top Destinations": "인기 여행지",
  "Explore All": "모두 보기",
  "Trending": "트렌딩",
  "Best Deals Available": "이용 가능한 최저가",
  "No results in this region": "이 지역에 결과가 없습니다",
  "ALL": "전체",
  "OTHER": "기타",
  "Global": "글로벌"
}
```

### Thai (`th`)

```json
{
  "Curated Escapes": "ทริปแนะนำพิเศษ",
  "Top Destinations": "จุดหมายปลายทางยอดนิยม",
  "Explore All": "สำรวจทั้งหมด",
  "Trending": "กำลังเป็นที่นิยม",
  "Best Deals Available": "ข้อเสนอที่ดีที่สุด",
  "No results in this region": "ไม่มีผลลัพธ์ในภูมิภาคนี้",
  "ALL": "ทั้งหมด",
  "OTHER": "อื่นๆ",
  "Global": "ทั่วโลก"
}
```
