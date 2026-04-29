# Search Experience — Full Frontend Implementation

You are a senior frontend developer. Execute the following Search Experience plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Global Search Elements**: Integrate and refine `RecentSearches` on the Hero section with a premium glossy aesthetic.
- **Flexible Dates & Heat-map**: Create a `FlexibleDateMatrix` carousel with a color-coded price heat-map (green for cheap, red for expensive).
- **Flight Card Enhancements**: Add animated wishlist functionality and an expandable "Fare Class Breakdown" (Basic, Standard, Flex).
- **Advanced Search Controls**: Implement price alerts and a simultaneous multi-currency comparison tooltip (USD, EUR, AED).

## Quality Checklist (verify before shipping)

- [ ] Recent searches populate correctly on return visits
- [ ] Flexible date matrix correctly displays mock prices with heat-map colors
- [ ] Wishlist "Heart" icon triggers micro-animations and mock toast notifications
- [ ] Fare breakdown correctly details inclusions for each tier
- [ ] Price alert dialog and multi-currency tooltips function correctly
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Global Search Elements

- **[MODIFY]** `apps/frontend/components/sections/Hero.tsx`
  - Uncomment and integrate the `RecentSearches` component to ensure it populates automatically on return visits.
  - Refine `RecentSearches` UI to match the new premium glossy aesthetic.

### 2. Flexible Dates & Heat-map

- **[NEW]** `apps/frontend/components/flights/FlexibleDateMatrix.tsx`
  - Create a horizontal date carousel to sit above search results.
  - Implement the **Calendar heat-map**: Dates will display mock prices and use color coding (green for cheapest days, red for most expensive).

### 3. Flight Card Enhancements (Wishlist & Fare Breakdown)

- **[MODIFY]** `apps/frontend/components/flights/FlightCard.tsx`
  - **Save for Later**: Add an interactive "Heart" icon to wishlist flights (with micro-animations and a mock toast notification).
  - **Fare Class Breakdown**: Add an expandable section or popover that displays mock fare tiers (e.g., Basic, Standard, Flex) detailing what is included (baggage, seat selection, cancellation fees).

### 4. Advanced Search Controls

- **[MODIFY]** `apps/frontend/app/flights/result/StickySearchPanel.tsx` (or create a new control bar)
  - **Price Alerts**: Add a "Track Prices" toggle/button that opens a mock dialog allowing the user to set a target price for the route.
  - **Currency Comparison**: Add a tooltip or dropdown to the price display that shows the equivalent cost in multiple popular currencies (e.g., USD, EUR, AED) simultaneously.

## User Review Required

> [!IMPORTANT]
>
> 1. **Data Source**: Since backend APIs are pending, I will use hardcoded mock data for the Flexible Dates Matrix (generating a spread of dates around the searched date with varying prices) and Fare Breakdowns.
> 2. **State Management**: Features like "Recent Searches" and "Save for later" will be managed via local state or local storage for this prototype.
>
> Do you approve this approach for the Search UX frontend features?

## Verification Plan

### Manual Verification

- **Recent Searches**: Go to the homepage and verify the recent search chips appear above the form.
- **Flexible Dates**: Go to the flight results page and verify the date matrix appears at the top, showing prices with heat-map color coding.
- **Price Alerts**: Click the "Track Prices" button and verify the alert dialog appears.
- **Wishlist**: Click the Heart icon on a flight card and verify the animation/state change.
- **Fare Breakdown**: Expand a flight card to view the tiered fare inclusions.
- **Multi-currency**: Hover over a price to see the multi-currency breakdown tooltip.
