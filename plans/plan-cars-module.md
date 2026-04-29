# Cars Module — Full Frontend Implementation

You are a senior frontend developer. Execute the following Cars Module plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data Layer**: Define complex car rental structures including partner networks, insurance options, and surcharge logic.
- **Search & Discovery**: Implement a rich filtering system (categories, partners, mileage) and a redesigned search interface.
- **Configuration & Booking**: Build a premium details page with interactive selection panels for insurance, equipment add-ons, and dynamic pricing updates.

## Quality Checklist (verify before shipping)

- [ ] "Unlimited Mileage" and "Partner Network" filters function correctly on the client side
- [ ] `CarCard` UI correctly displays badges for cancellation and partner logos
- [ ] Dynamic Booking Summary reflects all selected insurance and equipment add-ons
- [ ] "Under 25 Surcharge" applies automatically based on the entered driver age
- [ ] All routes for search and configuration navigate correctly
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Data Layer

- **[NEW]** `apps/frontend/data/mock-cars.ts`
  - Define complex mock data for car rentals.
  - Include fields for: `partnerNetwork` (e.g., Hertz, Avis), `pickupType` (airport/city), `unlimitedMileage`, `freeCancellation`, and detailed pricing structures for insurance and extras.

### 2. Search & Discovery UI

- **[MODIFY]** `apps/frontend/app/cars/page.tsx`
  - Redesign the main search interface to include date/time selection and location type.
  - Implement a rich sidebar filtering system:
    - Vehicle categories (Economy, SUV, Luxury, Electric).
    - Partner networks.
    - Toggles for "Free Cancellation" and "Unlimited Mileage".
- **[MODIFY]** `apps/frontend/components/cars/CarCard.tsx`
  - Update the card design to prominently display partner logos, cancellation policies, and mileage limits.

### 3. Car Configuration & Booking UI

- **[MODIFY]** `apps/frontend/app/cars/[id]/page.tsx`
  - Overhaul the car details page for a premium booking experience.
  - Add interactive selection panels for:
    - **Insurance Options**: Basic, Comprehensive, CDW (Collision Damage Waiver).
    - **Driver Details**: Driver age input (with under-25 surcharge logic) and "Additional Driver" add-on.
    - **Equipment Add-ons**: GPS, Child Seats.
  - Implement a dynamic Booking Summary sidebar that recalculates the total price instantly based on all selected configurations.

## User Review Required

> [!IMPORTANT]
>
> 1. **Data Integration**: To fulfill the requirement of using mock data while the backend is pending, I will bypass the current `searchCars` API call in `page.tsx` and directly use the new `mock-cars.ts` file. This ensures all the complex filtering logic can be demonstrated immediately.
> 2. **Filtering Logic**: I will implement the filtering logic (e.g., filtering by unlimited mileage or partner network) entirely on the client side for this prototype.
>
> Does this approach align with your expectations for the frontend build?

## Verification Plan

### Manual Verification

- Navigate to `/cars`.
- **Filters**: Check the "Unlimited Mileage" and "Electric" filters to verify the grid updates instantly.
- **Card UI**: Verify that Car Cards display the partner network (e.g., Hertz) and the "Free Cancellation" badge.
- Navigate to a specific car details page (e.g., `/cars/car-1`).
- **Configuration**: Select "Comprehensive" insurance and add a "Child Seat".
- **Pricing Logic**: Enter a driver age of 22 and verify that an "Under 25 Surcharge" is applied to the dynamic Booking Summary.
- Click "Book now" and verify the mock confirmation appears.
