# AI Trip Planner — Full Frontend Implementation

You are a senior frontend developer. Execute the following AI Trip Planner plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Mock Data Layer**: Define comprehensive itinerary structures including multi-destination support, Morning/Afternoon/Evening slots, and buffer times.
- **AI Prompt Interface**: Implement the "Magic Prompt" natural language input and a high-fidelity "AI Generating" shimmy/loading state.
- **Interactive Itinerary Builder**: Build a rich day-by-day planner with native HTML5 drag-and-drop, activity reordering, and a smart alerts panel (holidays, delays).
- **Group Coordination**: Implement itinerary sharing functionality with mock link generation.

## Quality Checklist (verify before shipping)

- [ ] "AI Generating" loading state feels fluid and responsive
- [ ] Itinerary activities can be reordered via drag-and-drop with state persistence
- [ ] Morning/Afternoon/Evening slots are visually distinct and correctly populated
- [ ] Smart alerts correctly identify holidays and flight delays from mock data
- [ ] Sharing modal generates and displays a copyable mock link
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Data Layer

- **[NEW]** `apps/frontend/data/mock-ai-planner.ts`
  - Create robust mock data structures representing an AI-generated itinerary.
  - Include data for:
    - Multi-destination support.
    - Day-by-day breakdown with **Morning**, **Afternoon**, and **Evening** slots.
    - Time estimates for activities.
    - Integrated restaurant suggestions.
    - Buffer times for airport transfers and check-ins.
    - Public holiday alerts.
    - Dynamic re-planning scenarios (e.g., flight delay state).

### 2. AI Prompt Interface & Generation

- **[MODIFY]** `apps/frontend/app/smart-travel-planner/page.tsx`
  - Redesign the landing state to feature a prominent "Magic Prompt" text area where users can type natural language (e.g., _"Plan my trip to Bali for 6 nights — I love beaches, temples, and local food"_).
  - Implement a visually engaging "AI Generating" loading state (shimmer effects, sequential step processing).

### 3. Interactive Itinerary Builder UI

- **[MODIFY]** `apps/frontend/app/smart-travel-planner/page.tsx`
  - After generation, display a rich, interactive day-by-day planner.
  - **Drag-and-Drop Capability**: Implement HTML5 drag-and-drop to allow users to reorder activities within or across days.
  - **Slot System**: Visually distinct sections for Morning, Afternoon, and Evening.
  - **Contextual Cards**: Activity cards showing time estimates, buffer times (e.g., "Allow 45m for security"), and restaurant recommendations.
  - **Smart Alerts Panel**: Display AI insights such as "Public Holiday Alert: Nyepi Day on Day 3" or dynamic re-planning alerts ("Flight delayed by 2 hours. Morning schedule adjusted").

### 4. Group Coordination & Export

- **[MODIFY]** `apps/frontend/app/smart-travel-planner/page.tsx`
  - Add a "Share Itinerary" feature that generates a mock shareable link for group coordination.

## User Review Required

> [!IMPORTANT]
>
> 1. **Drag and Drop**: I will implement the drag-and-drop functionality using native HTML5 drag events to avoid introducing heavy external dependencies (like `dnd-kit`). This ensures high performance and simplicity.
> 2. **AI Simulation**: Since the backend AI endpoints are pending, I will use a robust mock data layer to simulate the generation delay, the public holiday alerts, and the dynamic re-planning (flight delay) scenario.
>
> Does this approach meet your expectations for the frontend prototype?

## Verification Plan

### Manual Verification

- Navigate to `/smart-travel-planner`.
- Enter a natural language prompt and click Generate.
- Verify the loading state simulates AI processing.
- Verify the generated itinerary displays Morning/Afternoon/Evening slots, restaurants, and buffer times.
- Test dragging an activity from Morning to Afternoon to ensure state updates correctly.
- Verify the presence of the Public Holiday alert and the dynamic Flight Delay re-planning alert.
- Click "Share" and verify the mock share link modal appears.
