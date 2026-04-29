# Feedback & Reviews — Full Frontend Implementation

You are a senior frontend developer. Execute the following Feedback & Reviews plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Data Layer Enhancement**: Extend the review model to support multi-category ratings and supplier interaction simulation.
- **Engagement Triggers**: Implement "Pending Review" banners and loyalty point incentive notifications within the trips dashboard.
- **Interactive Review UI**: Build a multi-step Star Rating modal with photo upload capabilities and specific category breakdowns.
- **Moderation & Display**: Revamp `ReviewCard` to include category-specific scores, supplier replies, and reporting workflows.

## Quality Checklist (verify before shipping)

- [ ] "Pending Review" banner correctly calculates and awards simulated loyalty points
- [ ] Star rating inputs for Flight, Hotel, and Car categories function independently
- [ ] Photo upload component correctly handles file selection and removal states
- [ ] Supplier responses and breakdown ratings render correctly on service details pages
- [ ] Reporting/Flagging a review triggers the simulated moderation notification
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Mock Data Enhancement

- **[MODIFY] [reviews.ts](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/data/reviews.ts)**
  - Expand the existing `Review` interface to support multi-category ratings (e.g., `flightRating`, `hotelRating`, `carRating`).
  - Add fields for simulated `supplierResponse` (string or null) and `flaggedCount` (number).

### 2. Post-Trip Review Prompt

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/my-trips/page.tsx)** (or the relevant trips component)
  - Introduce a "Pending Review" banner for a mocked completed trip (simulating the 24-hr post-checkout trigger).
  - Add a clear call-to-action highlighting the incentive: "Complete your review to earn 250 Loyalty Points!"

### 3. Interactive Review Form

- **[NEW] [PostTripReviewModal.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/reviews/PostTripReviewModal.tsx)**
  - Create a multi-step or segmented modal allowing users to rate individual components of their trip (Flight experience, Hotel quality, Car condition) using interactive stars.
  - Include a text area for the written review and an upload component for optional photos.

### 4. Enhanced Review Display & Moderation

- **[NEW/MODIFY] [ReviewCard.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/reviews/ReviewCard.tsx)**
  - Update the review rendering to show breakdown ratings (Flight/Hotel/Car) instead of just an overall score.
  - Render the simulated `supplierResponse` clearly distinguished from the user's review.
  - Add a "Report / Flag" button with a simulated moderation workflow (e.g., a toast notification confirming the review has been flagged for manual review).

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Should the Review Form Modal enforce a minimum character limit for the written review to qualify for the loyalty points incentive?
> 2. Where should the Enhanced Review Cards be displayed primarily? On the Hotel/Flight details page, or on a dedicated "Community Reviews" page? (The plan assumes on the individual service details pages).

## Verification Plan

### Automated Tests

- Ensure TypeScript interfaces for the expanded `Review` type are strictly typed and errors are resolved.

### Manual Verification

- Navigate to "My Trips" and interact with the "Pending Review" banner.
- Complete the multi-category review form in the modal and verify the success state (points awarded simulation).
- View a listing page (e.g., a specific hotel) and examine the updated `ReviewCard` to ensure supplier responses and the "Flag" button render and function correctly.
