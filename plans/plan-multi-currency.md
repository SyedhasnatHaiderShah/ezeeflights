# Multi-Currency & Budget Tools — Full Frontend Implementation

You are a senior frontend developer. Execute the following Multi-Currency & Budget Tools plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

## Scope

Implement all pages and components described in the plan below. Every page must be fully wired into the app's routing — no orphaned pages, no broken links.

## Design & Theming Rules

- Support both dark and light mode using the app's existing theme system (CSS variables / Tailwind dark class).
- UI must be clean, compact, and purposeful — no excessive padding, unnecessary whitespace, or decorative clutter.
- Typography scale (strictly follow this):
  - Labels, captions, helper text → text-xs, text-sm
  - Body, descriptions → text-sm, text-base
  - Section headings → text-lg
  - Page titles, prominent headings → text-xl, text-2xl (go higher only where it genuinely warrants it)
- Do not use uppercase, leading-tight, or any overrides that break the app's typographic rhythm.
- Follow the existing app theme — color tokens, border radii, spacing scale, component variants — consistently across every new file.

## Implementation Requirements

- **State Management**: Implement a global `currency-store` (Zustand) to manage primary/comparison currencies and mock exchange rates.
- **UI Components**: Build a `CurrencySelector` for the global header and a `CurrencyDisplay` utility for price rendering.
- **Budget Tools**: Implement a standalone Budget Planner page with a total trip cost calculator and a functional nightly budget filter for results.

## Quality Checklist (verify before shipping)

- [ ] Primary currency changes propagate instantly across all cards and pages
- [ ] Comparison currency "pills" render correctly alongside primary prices when active
- [ ] Budget Planner correctly calculates fitting travel combos based on mock data
- [ ] Nightly budget slider correctly filters hotel/flight results in real-time
- [ ] Currency selector correctly persists the user's base selection
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. State Management (Zustand)

- **[NEW] [currency-store.ts](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/lib/store/currency-store.ts)**
  Create a global store to handle:
  - `baseCurrency`: The primary currency selected by the user (default: USD).
  - `comparisonCurrencies`: An array of up to 2 additional currencies to show simultaneously.
  - `exchangeRates`: A mock mapping of rates (PKR, USD, EUR, AED, GBP, SAR, CAD, AUD) relative to USD.
  - `lastUpdated`: Timestamp representing the last 15-minute refresh.

### 2. UI Components

- **[NEW] [CurrencySelector.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/shared/CurrencySelector.tsx)**
  A dropdown component allowing users to select their base currency and toggle comparison currencies.
- **[NEW] [CurrencyDisplay.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/shared/CurrencyDisplay.tsx)**
  A utility component that takes a base amount and displays the formatted primary price, along with smaller pills for any active comparison currencies.

### 3. Layout & Card Integration

- **[MODIFY] [Header.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/sections/Header.tsx)**
  Integrate the `CurrencySelector` into the global header (next to the theme toggle).
- **[MODIFY] [FlightCard.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/flights/FlightCard.tsx)**
  Replace the existing static price display with the new `CurrencyDisplay` component.
- **[MODIFY] [HotelCard.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/hotels/HotelCard.tsx)**
  Integrate the `CurrencyDisplay` component for the nightly rates.

### 4. Budget Planner Page

- **[NEW] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/budget-planner/page.tsx)**
  A new interactive tool where users can input a total trip budget, duration, and passenger count. The tool will display "fitting" combos (using mock data from flights and hotels). It will also feature a detailed Total Trip Cost Calculator with toggleable taxes, transfers, and insurance options.

### 5. Nightly Budget Filter

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/hotels/results/page.tsx)**
  Extract the sidebar filters into an interactive client component (`HotelFilterSidebar.tsx`) to make the nightly budget slider functional. Filtering will be applied to the mock results in real-time.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Is adding the Budget Planner as a standalone page (`/budget-planner`) acceptable, or would you prefer it as a widget on the homepage?
> 2. For the "Total Trip Cost Calculator", should it be placed inside the Budget Planner, or should we enhance the existing package booking summary?

## Verification Plan

### Automated Tests

- Verify that `eslint` and TypeScript compiler pass.

### Manual Verification

- Test selecting different base currencies in the header and ensure all prices update instantly.
- Select 1-2 comparison currencies and verify they render correctly on Flight and Hotel cards.
- Test the Budget Planner functionality by setting varied budgets and confirming results fit within the limit.
- Move the nightly budget slider on the hotel results page and confirm hotels exceeding the limit are hidden.
