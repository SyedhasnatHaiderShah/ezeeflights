# Travel Insurance Module — Full Frontend Implementation

You are a senior frontend developer. Execute the following Travel Insurance Module plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data**: Create robust mock data for policy types (Single/Annual), coverage levels (Basic/Standard/Premium), and add-ons (Covid-19, Adventure Sports) including partner insurer data (AXA, Allianz, QIC).
- **Insurance Landing Page**: Revamp with a dynamic quote form, partner branding strip, and interactive plan comparison section.
- **Interactive Components**: Implement `InsuranceQuoteForm`, `PlanComparison` (with dynamic price recalculation), and a `ClaimsSection` for filing claims directly.
- **Policy Generation**: Simulate instant policy document generation and download flow using a success modal.

## Quality Checklist (verify before shipping)

- [ ] All routes navigate correctly — no 404s or blank pages
- [ ] Dark/light mode renders correctly on every page
- [ ] Premium calculator updates in real-time when add-ons are toggled
- [ ] Claim form validation enforces required fields and file uploads
- [ ] Policy generation modal triggers correctly after plan selection
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Mock Data Integration

- **[NEW] [mock-insurance.ts](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/data/mock-insurance.ts)**
  Create robust mock data including:
  - Policy types: "Single Trip", "Annual Multi-trip".
  - Coverage levels: Basic, Standard, Premium with specific limits (Medical, Cancellation, Baggage).
  - Add-on pricing: Covid-19 coverage, Adventure Sports.
  - Partner Insurers: AXA, Allianz, QIC.

### 2. Insurance Landing Page Revamp

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/insurance/page.tsx)**
  Transform the existing basic page into a glossy, interactive experience:
  - **Hero Section**: A dynamic search form to get a quote. Includes fields for Destination, Trip Dates (or Annual duration), Traveler ages, and a toggle for Single vs. Multi-trip.
  - **Partner Strip**: Display logos/names of partner insurers (AXA, Allianz, QIC).
  - **Results/Comparison Section**: Once a quote is generated, display the Basic, Standard, and Premium plans side-by-side with clear pricing that updates dynamically based on the selected add-ons.

### 3. Interactive Components

- **[NEW] [InsuranceQuoteForm.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/insurance/InsuranceQuoteForm.tsx)**
  Client-side form managing the state of the quote (dates, passenger count, trip type).
- **[NEW] [PlanComparison.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/insurance/PlanComparison.tsx)**
  Displays the 3 tiers. Includes checkboxes for add-ons (Covid-19, Adventure Sports) that dynamically recalculate the premium. Features a "Generate Policy" button.
- **[NEW] [ClaimsSection.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/insurance/ClaimsSection.tsx)**
  A dedicated tab/section on the insurance page containing a form to file a claim directly within the app (Policy Number, Incident Type, Description, Upload Documents button).

### 4. Policy Generation

- **Simulated Document Generation**: When a user selects a plan and clicks "Generate Policy", trigger a success modal simulating instant policy document generation with a "Download PDF" button.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Should the "File a Claim" feature be a section on the main `/insurance` page, or a separate route like `/insurance/claims`? The plan assumes it will be a section/tab on the main page for easier access, but it can be separated if preferred.
> 2. For the partner insurers (AXA, Allianz, QIC), should we randomly assign an insurer to the generated quote, or let the user choose the provider? (Plan assumes random assignment per quote for simplicity).

## Verification Plan

### Automated Tests

- Verify component rendering and state updates for the premium calculator.

### Manual Verification

- Navigate to `/insurance`.
- Fill out the quote form and verify the plans appear.
- Toggle the "Adventure Sports" and "Covid-19" add-ons and verify the plan prices update in real-time.
- Test the "File a Claim" form validation.
- Click "Generate Policy" and ensure the success modal appears.
