# Marketing & Communications — Full Frontend Implementation

You are a senior frontend developer. Execute the following Marketing & Communications plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Communication Preference Centre**: Revamp the profile notification settings with granular channel controls (WhatsApp, SMS, Email) and GDPR-compliant consent management.
- **Targeted Engagement**: Build dynamic re-engagement banners for the dashboard that simulate abandoned search recovery and itinerary reminders.
- **Mock Marketing Admin**: Implement a specialized `/admin/marketing` view to visualize A/B tests, campaign performance, and AI-driven predictive insights.

## Quality Checklist (verify before shipping)

- [ ] Channel-specific toggles (SMS, WhatsApp, Email) correctly persist state changes
- [ ] Universal "Unsubscribe from all" correctly resets all marketing consent toggles
- [ ] Targeted banners correctly display personalized content based on mock history
- [ ] Admin dashboard correctly renders Recharts for send-time and A/B test metrics
- [ ] AI Insights panel correctly displays churn flags and campaign triggers
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Communication Preference Centre

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/profile/page.tsx)**
  - Completely revamp the "Notifications" tab into a full "Communication Preferences Centre".
  - **Granular Controls**: Add specific toggles for Booking Confirmations, Price Alerts, Promotional Offers, and Newsletters.
  - **Channel Selection**: Allow users to explicitly enable/disable Email, SMS, WhatsApp, and Push Notifications independently.
  - **GDPR / PDPL Compliance**: Add clear consent text and a universal "Unsubscribe from all marketing communications" button.

### 2. In-App Targeted Engagement

- **[NEW] [TargetedBanner.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/marketing/TargetedBanner.tsx)**
  - Create a reusable banner component for the Dashboard/Home page that simulates abandoned search re-engagement (e.g., "You were looking at Bali — prices dropped! Finish booking now.").
  - Support different variants for "Deal of the Day" and "Itinerary Reminders".

### 3. Mock Marketing Admin Dashboard

- **[NEW] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/admin/marketing/page.tsx)**
  - Create a mock dashboard at `/admin/marketing` to demonstrate the backend capabilities visually.
  - **Campaign Manager**: A list of ongoing segmented campaigns (SMS, Email, WhatsApp) and their status.
  - **A/B Testing UI**: A visual representation comparing two subject lines or offer messages, showing simulated engagement metrics.
  - **AI Insights Panel**:
    - _Predictive Churn_: A widget flagging users who haven't booked in 90 days with a "Trigger Win-Back Campaign" action button.
    - _Optimal Send Time_: A chart showing when AI determines the best time to send emails based on user engagement history.
    - _Personalization Preview_: A simulated view of how an email looks when AI matches destination images to a user's specific search history.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Is the addition of a mock `/admin/marketing` dashboard acceptable to demonstrate the AI and A/B testing requirements, given this is purely frontend work?
> 2. Should the `TargetedBanner` (e.g., the Bali price drop alert) be a sticky notification at the top of the app, or a card injected into the user's Dashboard feed?

## Verification Plan

### Automated Tests

- Verify component rendering for the new Preference Centre layout.

### Manual Verification

- Navigate to Profile -> Notifications and verify the granular toggles and GDPR unsubscription flow.
- View the Home/Dashboard page to see the `TargetedBanner` simulation.
- Navigate to `/admin/marketing` and verify all mock AI insights and campaign management UI elements render beautifully.
