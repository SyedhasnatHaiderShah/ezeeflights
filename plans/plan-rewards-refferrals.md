# Rewards & Referrals — Full Frontend Implementation

You are a senior frontend developer. Execute the following Rewards & Referrals plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data Setup**: Create a robust `mock-rewards.ts` covering loyalty tiers (Silver/Gold/Platinum), points history, and gamification metrics.
- **Rewards Dashboard**: Build the main `/rewards` hub featuring a points progress bar, tier badges, and a gamified milestones grid.
- **Referral Hub**: Implement a dedicated referral section with "Give $10, Get $10" logic and a copy-to-clipboard referral code tool.

## Quality Checklist (verify before shipping)

- [ ] Progress bar correctly reflects current points relative to next-tier thresholds
- [ ] Referral code copy-to-clipboard interaction is functional and provides feedback
- [ ] Points expiry alerts display correctly based on mock 12-month rolling data
- [ ] Gamification badges and leaderboard render correctly from mock data
- [ ] Navigation triggers in the Sidebar and Wallet correctly route to `/rewards`
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Mock Data Setup

- **[NEW] [mock-rewards.ts](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/data/mock-rewards.ts)**
  Create mock data for the rewards system, including:
  - User's current points, tier (Silver/Gold/Platinum), and progress to the next tier.
  - Points history (earned/redeemed) and expiring points (12-month rolling).
  - Referral code details and successful referral statistics.
  - Gamification data (milestone badges earned, leaderboard standings).
  - Partner earning opportunities (e.g., 2x points on partner hotels).

### 2. Rewards Dashboard UI

- **[NEW] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/rewards/page.tsx)**
  Create the main Rewards Dashboard featuring:
  - **Tier Status & Points**: A visually engaging header showing current points, tier badge, and a progress bar to the next loyalty tier.
  - **Points Expiry Alert**: A notice showing points expiring in the next 30/60 days.
  - **Referral Hub**: A section displaying the user's unique referral code with a "Copy to Clipboard" button and details on the "Give $10, Get $10" program.
  - **Gamification Section**: A grid displaying earned milestone badges (e.g., "Frequent Flyer", "Birthday Bonus") and a mini-leaderboard.
  - **Activity Feed**: A recent points transaction history list.
  - **Ways to Earn**: Promotional cards highlighting partner earn opportunities.

### 3. Navigation & Integration

- **[MODIFY] [navigation.ts](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/lib/navigation.ts)**
  Add a "Rewards" link to the "MY ACCOUNT" navigation group, using the `Award` or `Trophy` icon.
- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/wallet/page.tsx)**
  Update the existing "Explore Reward Center" button in the Wallet page to route correctly to `/rewards`.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Should the "Rewards" page be located at `/rewards` or nested under the dashboard (`/dashboard/rewards`)? The plan assumes `/rewards` for easier access.
> 2. For the Gamification Leaderboard, should we mock a global ranking, or just a "Friends & Family" ranking based on referrals?

## Verification Plan

### Automated Tests

- Verify that `eslint` and the TypeScript compiler pass without errors.

### Manual Verification

- Navigate to `/rewards` via the Sidebar and the Wallet page.
- Ensure the progress bar accurately reflects the mock points data relative to the tier thresholds.
- Test the "Copy Referral Code" interaction.
- Verify that the page is responsive and maintains the premium glossy UI design language.
