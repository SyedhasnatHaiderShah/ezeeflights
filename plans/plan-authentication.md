# Authentication — Full Frontend Implementation

You are a senior frontend developer. Execute the following Authentication plan end-to-end, covering all pages and flows without any broken UI, missing states, or navigation dead-ends.

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

- **Enhanced Login Options**: Implement Passwordless OTP (SMS/WhatsApp), Biometric Login simulation, and a fraud detection system with reCAPTCHA.
- **Social Login Expansion**: Add Facebook login alongside Google and Apple integrations.
- **Global Security**: Build a `SessionTimeoutModal` for inactivity and a `PostBookingAccountPrompt` to incentivize guest registrations.

## Quality Checklist (verify before shipping)

- [ ] Toggle between Email and OTP login modes functions correctly
- [ ] Fraud detection warning appears after 3 consecutive failed login attempts
- [ ] Biometric login simulation modal triggers and finishes with a success state
- [ ] Session timeout warning and automatic logout simulate correctly
- [ ] Post-booking prompt correctly captures guest intent for account creation
- [ ] No console errors, no TypeScript errors

## Proposed Changes

### 1. Enhanced Login Options

- **[MODIFY] [login-form.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/auth/login-form.tsx)**
  - Add a toggle/tab system to switch between "Email & Password" and "Passwordless OTP".
  - Build out the Passwordless OTP UI: Input for Phone Number, options to send OTP via SMS or WhatsApp, and the OTP verification input.
  - Implement **Fraud Detection Simulation**: If the user attempts to login incorrectly 3 times, show a "Too many attempts" warning and a simulated reCAPTCHA checkbox.
  - Integrate a **Biometric Login Button**: A "Use Face ID / Fingerprint" button that triggers a simulated biometric scanning animation modal.

### 2. Social Login Expansion

- **[MODIFY] [oauth-buttons.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/auth/oauth-buttons.tsx)**
  - Add a "Facebook" login button alongside the existing Google and Apple buttons to fulfill the social login requirements.

### 3. Registration & Verification

- **[MODIFY] [register-form.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/auth/register-form.tsx)**
  - Add a post-registration state: "Verify your email". This will simulate an email verification requirement before allowing the user to proceed.

### 4. Global Security & Session Management

- **[NEW] [SessionTimeoutModal.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/auth/SessionTimeoutModal.tsx)**
  - A global component that simulates auto-logout after inactivity. It will display a warning modal (e.g., "Your session will expire in 60 seconds due to inactivity. Click to stay signed in.") and clear the simulated auth state if ignored.
- **[NEW] [PostBookingAccountPrompt.tsx](file:///d:/syed%20hasnat/ezeeflights/apps/frontend/components/auth/PostBookingAccountPrompt.tsx)**
  - A component designed for the "Booking Confirmation" page that prompts guest users to create an account to save their booking and earn rewards.

---

> [!IMPORTANT]
> **User Review Required**
>
> 1. Should the Biometric Login button be visible on all viewport sizes, or exclusively on mobile views?
> 2. For the Passwordless OTP, should we default to SMS or WhatsApp based on a selected region, or always show both buttons explicitly?

## Verification Plan

### Automated Tests

- Verify component rendering and ensure TypeScript types align.

### Manual Verification

- Open the Auth modal/page.
- Toggle to Passwordless OTP and click "Send via WhatsApp".
- Trigger the Fraud Detection state by simulating 3 failed logins.
- Test the Biometric Login simulation modal.
- Verify the Session Timeout modal appears (with a shortened timeout for testing purposes, e.g., 5 seconds).
- View the Post-Booking Account Prompt component.
