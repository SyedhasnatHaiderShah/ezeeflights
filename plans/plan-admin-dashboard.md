# Admin Dashboard — Full Frontend Implementation

You are a senior frontend developer. Execute the following Admin Dashboard plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Navigation & Shell**: Revamp the admin shell with a sleek, collapsible sidebar, Lucide icons, and a comprehensive multi-module navigation structure.
- **Dashboard Analytics**: Implement KPI cards with growth indicators and sophisticated Recharts visualizations (Conversion Funnel, Top Routes).
- **Core Module Wireframes**: Build out functional UI for Booking Management (filtered tables), User Management, AI Configuration, and Support Triage.
- **Admin Mock Data**: Create a comprehensive `mock-admin.ts` to power all visualizations, tables, and feeds.

## Quality Checklist (verify before shipping)

- [ ] Sidebar transitions smoothly between collapsed and expanded states
- [ ] KPI cards and Recharts visualizations update based on mock data
- [ ] Booking and User management tables support real-time filtering and status changes
- [ ] AI Configuration toggles correctly reflect simulated backend state
- [ ] All routes within the admin suite navigate correctly without 404s
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Navigation & Shell Architecture Revamp

- **[MODIFY] [admin-shell.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/admin/admin-shell.tsx)**
  - Redesign the sidebar to a sleek, modern UI with collapsible states and tooltips.
  - Expand the `groupedMenu` to cover all required modules:
    - **Overview**: Dashboard, Analytics, AI Configuration
    - **Operations**: Bookings, Finance, Support
    - **Inventory**: Flights, Hotels, Packages
    - **Marketing**: Promotions, Rewards, Campaigns
    - **System**: Users, Settings, Logs
  - Integrate Lucide icons for every menu item for a premium feel.

### 2. Comprehensive Dashboard Analytics

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/admin/dashboard/page.tsx)**
  - Upgrade the KPI cards to show percentage growth indicators (e.g., "+12% this week").
  - Add sophisticated Recharts visualizations:
    - Conversion Funnel Bar Chart.
    - Top Routes Doughnut Chart.
  - Add a "Real-time Bookings Feed" widget that updates dynamically.

### 3. Core Module Wireframes & UI

We will build out the frontend views for the highest-priority operational modules:

- **[NEW] Booking Management (`/admin/bookings/page.tsx`)**: A data table view allowing filtering, status updates (manual refunds, issue travel credits), and viewing booking details.
- **[NEW] User Management (`/admin/users/page.tsx`)**: A user ledger showing profiles, loyalty tiers, and account suspension toggles.
- **[NEW] AI Configuration (`/admin/ai-config/page.tsx`)**: A specialized control panel to toggle AI features (e.g., "Predictive Churn Detection", "Smart Recommendations") and review AI decision logs.
- **[NEW] Support Management (`/admin/support/page.tsx`)**: A ticket triage interface showing SLA tracking and agent assignment.

### 4. Admin Mock Data Provider

- **[NEW] [mock-admin.ts](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/data/mock-admin.ts)**
  - Create a robust dataset simulating thousands of bookings, user profiles, revenue charts, and support tickets to make the admin interface fully demonstrable.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. With so many modules (13 total), should we focus the initial build exclusively on the **Dashboard, Bookings, and AI Configuration** panels, providing "Coming Soon" states for the others, or wireframe all 13 pages?
> 2. Should the Admin Dashboard inherit the global dark/light theme, or remain strictly in a specialized "Professional Light" mode? (The plan assumes an independent theme layout).

## Verification Plan

### Automated Tests

- Ensure Recharts dependencies resolve and render correctly.
- Verify Admin role routing constraints logic remains intact.

### Manual Verification

- Navigate to `/admin/dashboard` (bypassing login via mock token if necessary) and review the new comprehensive layout and sidebar.
- Test the sidebar collapse/expand functionality.
- Navigate to the new `/admin/bookings` and `/admin/ai-config` pages to verify the interactive tables and toggle states function correctly with the mock data.
