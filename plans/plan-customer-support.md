# Customer Support — Full Frontend Implementation

You are a senior frontend developer. Execute the following Customer Support plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **AI-Powered Chatbot**: Build a global floating `ChatWidget` with multi-channel routing (Human, WhatsApp) and simulated AI dialogue.
- **Help Center**: Redesign the support landing page with a premium aesthetic, multi-language knowledge base, and loyalty tier recognition.
- **Advanced Ticketing**: Implement a comprehensive ticketing system with issue categorization, file uploads, and proactive "AI Alert" support cards.

## Quality Checklist (verify before shipping)

- [ ] Floating chat widget persists correctly across navigation and handles escalation triggers
- [ ] Platinum Loyalty status correctly triggers priority SLA displays
- [ ] Simulated knowledge base correctly responds to language switching
- [ ] Proactive "AI Alert" tickets appear correctly in the user's ticket ledger
- [ ] Ticket creation form correctly handles file attachment states and category selection
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. AI-Powered Chatbot & Omni-channel Routing

- **[NEW] [ChatWidget.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/support/ChatWidget.tsx)**
  - Create a globally accessible floating chat widget.
  - Implement a simulated AI conversation flow for Tier-1 support (e.g., "Check Booking Status", "Request Refund", "FAQs").
  - Add quick-escalation buttons within the chat: "Talk to Human" and "Continue on WhatsApp".

### 2. Help Center Revamp

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/support/page.tsx)**
  - Redesign the `/support` landing page to match the premium, glossy aesthetic.
  - Add quick-access cards for common complaint categories (Flight Delay, Refund, Hotel Issue, Car Issue, Payment Problem).
  - Implement a visual indicator for **Platinum Loyalty Members** highlighting their priority SLA status.
  - Add a simulated language switcher (English, Arabic, Urdu) for the support knowledge base.

### 3. Advanced Ticketing System

- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/support/tickets/new/page.tsx)**
  - Enhance the ticket creation form to support specific issue categories and file attachments.
  - Display dynamic SLA expectations (e.g., "Expected response: 1 hour" for Platinum vs. "24 hours" for Standard).
- **[MODIFY] [page.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/app/support/tickets/page.tsx)**
  - Revamp the ticket list UI.
  - **Proactive Support Simulation**: Inject a mock "Proactive" ticket (e.g., "AI Alert: Flight Cancelled - Auto-rebooking options inside") to demonstrate the system's predictive capabilities.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Should the AI Chatbot widget be present on every single page of the app (global), or only within the `/support` and `My Account` sections?
> 2. For the WhatsApp support integration, should the button open `wa.me` links directly, or show a QR code for desktop users?

## Verification Plan

### Automated Tests

- Verify component rendering for the Chat Widget and Support Forms.

### Manual Verification

- Navigate to the `/support` page and review the premium UI updates and language toggle.
- Open the floating Chat Widget and interact with the simulated AI options.
- Go to `/support/tickets` and verify the presence of the simulated "Proactive Support" ticket.
- Create a new ticket and ensure the SLA tracking message appears correctly based on mock tier data.
