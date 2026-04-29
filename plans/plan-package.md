# Holiday Packages — Full Frontend Implementation

You are a senior frontend developer. Execute the following Holiday Packages plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data Layer**: Build a comprehensive `mock-packages.ts` supporting themed bundles, agency tags, and customizable sub-components.
- **Discovery Experience**: Enhance `PackageCard` with live countdown timers for deals, theme badges, and agency/B2B indicators.
- **Customizable Details**: Implement a premium details page with hotel/flight "swap" functionality and itemised-vs-bundled savings breakdowns.
- **Booking Flow**: Build group discount logic (10+ travelers) and integrate a detailed `BookingSummary` highlighting total savings.

## Quality Checklist (verify before shipping)

- [ ] Countdown timers correctly track and display time remaining for limited deals
- [ ] Package customization UI (swapping hotels/flights) correctly updates totals
- [ ] Itemised savings breakdown displays clearly in the details sidebar and checkout
- [ ] Group booking discount applies automatically when traveler count >= 10
- [ ] All theme and agency badges render correctly across card and list views
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### Data Layer

- **[NEW]** `apps/frontend/data/mock-packages.ts`
  - Create a robust mock dataset encompassing package details, themes, itemised pricing, limited-time deals (deal ends at timestamp), agency tags, and customizable options (alternative hotels/flights).

### Package Discovery & List

- **[MODIFY]** `apps/frontend/components/packages/PackagesContent.tsx`
  - Switch from the API call to using `mock-packages.ts`.
  - Enhance `PackageCard` to display:
    - **Countdown Timers** for limited-time deals.
    - **Agency/B2B Badges** for agency-created packages.
    - Theme badges (Honeymoon, Adventure, etc.).

### Package Details

- **[MODIFY]** `apps/frontend/app/packages/[slug]/page.tsx`
  - Redesign the details page to be premium and modern.
  - **Itemised vs. Bundled Price Display**: Add a detailed price breakdown in the sticky sidebar comparing individual component costs vs. the bundled package cost to visually highlight savings (e.g., "Save up to 40%").
  - **Customizable Packages UI**: Implement an interactive section where users can conceptually "swap" the included hotel for an alternative or change flight times (using mock state).
  - **Group Booking Banner**: Display a prominent notice that bookings of 10+ travelers automatically receive a group discount.
  - Implement a dynamic **Limited-time Deal Countdown** component.

### Booking Flow

- **[MODIFY]** `apps/frontend/app/packages/book/page.tsx`
  - Refactor the booking page to use `mock-packages.ts`.
  - Implement the **Group Booking Discount** logic: dynamically apply and display a discount when the total passenger count reaches 10 or more.
  - Enhance the `BookingSummary` to display the itemised vs. bundled savings clearly during checkout.

## User Review Required

> [!IMPORTANT]
> Since the backend API integration is deferred, I will completely mock the data layer (`mock-packages.ts`) and temporarily bypass `lib/api/packages-api.ts` in the UI components so we can demonstrate all the required features seamlessly. Does this approach work for you?

## Verification Plan

### Manual Verification

- Navigate to `/packages` and verify countdown timers, theme badges, and agency tags render correctly on the package cards.
- Click into a package (`/packages/[slug]`) and verify the itemised savings breakdown and the customizable options (swap hotel/flight) are interactive.
- Proceed to the booking page (`/packages/book`) and add 10+ travelers to verify the group booking discount is automatically applied to the total price.
