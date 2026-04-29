# Hotel Module — Full Frontend Implementation

You are a senior frontend developer. Execute the following Hotel Module plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data & Types**: Define TypeScript interfaces (Hotel, Room, Review, SearchFilters, AI metadata) and create realistic mock data matching the Travelport+ Stays API shape.
- **Search Experience**: Enhance `HotelSearchContainer` with: location input (city / landmark / map area), a date picker with minimum-stay validation, and a guest/room selector popover.
- **Search Results Page**: Sidebar filters + main content area (list/map toggle). Filters: property type, star rating, free cancellation, breakfast included, price slider. Map view with marker clustering. `HotelCard` with price breakdown, AI "Best for your trip" badge, and a compare checkbox. Floating `CompareWidget` for up to 3 selected hotels.
- **Hotel Details Page**: Photo gallery with category tabs (Exterior, Room, Amenities). Review section with Verified Guest badges and an `AISentimentSummary` component.
- **Booking Flow**: Room upgrade selector with price diffs, early check-in / late check-out toggles, and "Pay now" vs "Pay at hotel" radio group with live total update.

## Quality Checklist (verify before shipping)

- [ ] All routes navigate correctly — no 404s or blank pages
- [ ] Dark/light mode renders correctly on every page
- [ ] Date picker enforces minimum stay (check-out ≥ check-in + 1 day)
- [ ] Filters correctly reduce the mock hotel list
- [ ] Compare widget disables the 4th selection when 3 hotels are already chosen
- [ ] Booking total updates reactively when upgrades or payment method change
- [ ] No console errors, no TypeScript errors

## User Review Required

> [!IMPORTANT]
>
> - Are there specific design references or a preferred UI library (e.g., Radix UI, Shadcn UI) to be used for complex components like the map clustering, photo gallery, and date pickers?
> - For the AI features (curated badges and review sentiment summaries), should we use hardcoded mock variations for now, or do you plan to connect these to an LLM service immediately?

## Open Questions

> [!NOTE]
>
> - Should the "Compare up to 3 hotels side-by-side" feature open a modal, redirect to a new route (e.g., `/hotels/compare`), or expand in a drawer?
> - What mapping provider (e.g., Google Maps, Mapbox, Leaflet) should we use for the map view and hotel clustering?

## Proposed Changes

---

### 1. Mock Data & Types

We will create structured mock data to power the new features before backend integration.

#### [NEW] `apps/frontend/data/mock-hotels.ts`

- Create mock data structures reflecting the Travelport+ Stays API docs, including hotel properties, rooms, reviews, AI sentiment summaries, and geolocations.

#### [NEW] `apps/frontend/types/hotels.ts`

- Define TypeScript interfaces for `Hotel`, `Room`, `Review`, `SearchFilters`, and AI-related metadata.

---

### 2. Search Experience

Enhancing the search bar and inputs on the landing and search pages.

#### [MODIFY] `apps/frontend/components/hotels/HotelSearchContainer.tsx`

- **Location Input:** Support searching by city, landmark, or map area.
- **Date Picker:** Implement minimum stay detection logic (e.g., forcing check-out to be at least 1 day after check-in, or specific hotel rules).
- **Guest/Room Selector:** Add a popover for selecting the number of adults, children, and rooms.

---

### 3. Search Results & Filtering

Updating the search results page to include advanced filtering and map views.

#### [MODIFY] `apps/frontend/app/hotels/search/page.tsx`

- Implement layout for a sidebar with filters and a main content area for the list/map.
- Add state management for active filters, sorting, and the compare list.

#### [NEW] `apps/frontend/components/hotels/HotelFilters.tsx`

- Add UI controls for:
  - Property types (Hotel, Apartment, Villa, Resort, Hostel, Riad, Boutique)
  - Star rating (1-5 stars)
  - Free cancellation & Breakfast included toggles
  - Price slider with budget phrasing (e.g., "Max AED 400/night")

#### [NEW] `apps/frontend/components/hotels/HotelMapView.tsx`

- Implement a map component with marker clustering for hotel locations.

#### [MODIFY] `apps/frontend/components/hotels/HotelCard.tsx`

- Add price breakdown (Price per night vs Total stay cost).
- Add the **AI-curated "Best for your trip" badge**.
- Add a "Compare" checkbox.

#### [NEW] `apps/frontend/components/hotels/CompareWidget.tsx`

- A floating bar that appears when 1-3 hotels are selected for comparison.

---

### 4. Hotel Details Page

Building out the rich media and review experience for individual properties.

#### [MODIFY] `apps/frontend/app/hotels/[id]/page.tsx`

- Integrate new components below into the layout.

#### [NEW] `apps/frontend/components/hotels/PhotoGallery.tsx`

- Implement an interactive photo gallery with categories (e.g., Exterior, Room Type View, Amenities).

#### [NEW] `apps/frontend/components/hotels/ReviewSection.tsx`

- Display user reviews with "Verified Guest" badges.
- **AI Feature:** Add an `AISentimentSummary` component at the top of the reviews to summarize pros/cons from hundreds of reviews.

---

### 5. Booking Workflow

Adding required upsells and options to the booking checkout process.

#### [MODIFY] `apps/frontend/app/hotels/booking/page.tsx`

- **Room Upgrades:** Show available room upgrades with dynamic pricing diffs.
- **Special Requests:** Add toggles/inputs for Early check-in and Late check-out requests.
- **Payment Options:** Add radio group for "Pay at hotel" vs "Pay now".

---

## Verification Plan

### Manual Verification

- **Search UI:** Verify location autocomplete, date validation (min stay), and guest/room dropdown interactions.
- **Filtering:** Apply multiple filters (e.g., 4-star, free cancellation, < AED 400) and ensure the mock data list updates accordingly.
- **Map View:** Toggle map view and verify markers cluster correctly on zoom out.
- **Compare:** Select 3 hotels, verify the 4th cannot be selected, and view the comparison UI.
- **Details:** Click through the photo gallery and read the AI sentiment summary.
- **Booking:** Select a room upgrade, request early check-in, and toggle between "Pay now" and "Pay at hotel" to see total price updates.
