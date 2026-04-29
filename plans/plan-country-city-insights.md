# Country & City Insights — Full Frontend Implementation

You are a senior frontend developer. Execute the following Country & City Insights plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data Layer**: Define comprehensive destination structures including visa/health entry rules, practical guides, cost estimates, and climate data.
- **UI Components**: Build interactive cards for Practical Info, Cost Guides, and a visual `ClimateChart`.
- **Insights Dashboard**: Transform the city landing page into a grid-based dashboard featuring an AI Travel Alert banner and a 10-parameter comparison tool.

## Quality Checklist (verify before shipping)

- [ ] AI Travel Alert banner triggers correctly based on mock flags
- [ ] Practical info cards display currency, language, and emergency data accurately
- [ ] Climate Chart renders temperature and rainfall trends correctly
- [ ] AI Comparison Tool shows side-by-side data for all 10 comparison parameters
- [ ] Dashboard layout maintains a clean, masonry-style aesthetic across devices
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Data Layer

- **[NEW]** `apps/frontend/data/mock-insights.ts`
  - Create a robust mock data structure for a destination (e.g., "Dubai") encompassing all required fields:
    - Visa & Entry requirements.
    - Health requirements & Travel Advisories.
    - Practical info (Currency exchange, Language, Religion, Emergency contacts, Connectivity/SIM).
    - Cost guides (Daily average for meals, accommodation, transport, plus tipping culture).
    - Climate data (Month-by-month temperature/rainfall).
  - Create mock data for the "AI Comparison" feature (comparing two destinations across 10 parameters).

### 2. UI Components

- **[NEW]** `apps/frontend/components/insights/VisaHealthCard.tsx` (Entry & Health info)
- **[NEW]** `apps/frontend/components/insights/PracticalInfoCard.tsx` (Currency, Comms, Emergency, Culture)
- **[NEW]** `apps/frontend/components/insights/CostGuideCard.tsx` (Daily averages, Tipping)
- **[NEW]** `apps/frontend/components/insights/ClimateChart.tsx` (Visual representation of best time to visit)
- **[NEW]** `apps/frontend/components/insights/AIComparisonTool.tsx` (Side-by-side parameter comparison)
- **[NEW]** `apps/frontend/components/insights/AITravelAlert.tsx` (Dynamic banner for warnings/health alerts)

### 3. Page Integration

- **[MODIFY]** `apps/frontend/app/cities/[slug]/page.tsx`
  - Transform the existing city landing page into a premium "Insights Dashboard."
  - Integrate the new components in a clean, masonry or grid layout.
  - Add the AI Travel Alert banner at the top of the page.
  - Include the AI Comparison Tool section at the bottom.

## User Review Required

> [!IMPORTANT]
>
> 1. **Data Source:** Since the backend is not yet available, all data (including the complex month-by-month climate data and exchange rates) will be mocked in a dedicated TypeScript file.
> 2. **Charts:** For the climate chart, I will build a lightweight CSS/SVG-based visualization or use a very simple custom component to avoid introducing heavy charting libraries (like Chart.js or Recharts) unless you explicitly want me to install one.
>
> Do you approve this approach for the frontend prototype?

## Verification Plan

### Manual Verification

- Navigate to `/cities/dubai`.
- Verify the **AI Travel Alert** banner appears at the top if the mock data flags an issue.
- Verify the **Visa & Entry** and **Health Requirements** sections display correctly.
- Check the **Practical Info** section for accurate rendering of Currency, Connectivity, and Emergency contacts.
- Review the **Cost Guide** for daily averages and the tipping culture breakdown.
- Verify the **Climate Chart** visually represents the best time to visit.
- Test the **AI Comparison Tool** by viewing the side-by-side comparison of 10 parameters against another destination.
