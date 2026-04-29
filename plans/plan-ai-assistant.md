# Conversational AI Agent — Full Frontend Implementation

You are a senior frontend developer. Execute the following Conversational AI Agent plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Data & Logic**: Build a mock intent engine capable of parsing natural language and returning structured responses for booking, QA, and document verification.
- **Conversational UI**: Implement a premium chat interface featuring interactive "Rich Cards," "Alert Cards," and animated typing indicators.
- **Integration**: Redesign the AI landing page to feature the conversational agent as the flagship experience.

## Quality Checklist (verify before shipping)

- [ ] Chat interface correctly handles plain text, rich cards, and budget tables
- [ ] Intent parsing correctly triggers mock search results for "Booking" queries
- [ ] "AI is thinking..." indicators use smooth, sophisticated animations
- [ ] Document verification alerts display correctly when mock criteria are met
- [ ] Multi-language response simulation correctly updates the UI
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Data & Logic Layer

- **[NEW]** `apps/frontend/data/mock-ai-agent.ts`
  - Create a robust mock engine that simulates AI "intents":
    - **INTENT_BOOKING**: Parses natural language (e.g., "return flight to London under AED 3,000") and returns mock search results.
    - **INTENT_QA**: Answers trip-specific questions (e.g., hospitals in Bangkok).
    - **INTENT_DOC_CHECK**: Simulates passport/visa verification logic and returns alerts.
    - **INTENT_BUDGET**: Generates a total trip cost breakdown.
    - **INTENT_GROUP**: Manages group preferences (meals, seats).
  - Include multi-language response variations (Arabic, Urdu, English, French).

### 2. Conversational UI Component

- **[NEW]** `apps/frontend/components/ai/ConversationalAgent.tsx`
  - Implement a premium chat interface featuring:
    - **Interactive Message Types**: Support for plain text, "Rich Cards" (flights/hotels), "Alert Cards" (document warnings), and "Budget Tables."
    - **Multi-language Support**: A language toggle or automatic detection simulation.
    - **Animated Typing States**: "AI is thinking..." indicators with sophisticated motion.
    - **Voice Integration Simulation**: A visual representation of mic input.

### 3. Integration & Landing Page

- **[MODIFY]** `apps/frontend/app/ai/page.tsx`
  - Redesign the AI Assistant page to prioritize the Conversational Agent as the "flagship" experience.
  - Add a full-screen or prominent layout for the chat interface.

## User Review Required

> [!IMPORTANT]
>
> 1. **Embedded vs. Page**: The requirements suggest the AI should be "embedded directly in the search and booking flow." For this prototype, I will build it as a primary experience on the `/ai` page, but I can also make it a floating component available globally if you prefer.
> 2. **Mock Logic**: The natural language parsing will be simulated via keyword matching and predefined scenarios (e.g., typing "London" triggers a booking result card).
>
> Does this approach work for the frontend demonstration?

## Verification Plan

### Manual Verification

- Navigate to `/ai`.
- **Test Natural Language Booking**: Type "Book me a return flight to London under AED 3,000" and verify the AI presents a flight result card.
- **Test Itinerary Q&A**: Ask "What's the nearest hospital in Bangkok?" and verify a helpful response.
- **Test Document Check**: Ask "Check my passport for UAE" and verify an alert card if mock expiry is near.
- **Test Budget Planning**: Ask "Give me a budget for 7 days in Paris" and verify a cost breakdown table.
- **Test Language**: Switch to Arabic/French and verify response language changes.
