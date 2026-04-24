# EzeeFlights Design System & UI Implementation Guide

This document serves as a reference for maintaining UI consistency across the EzeeFlights application, specifically for the "Redmix" and "Glassmorphism" aesthetics.

## 1. Typography & Colors

### Hero Titles
Use a bold red-to-yellow gradient for primary headlines in Hero sections.
- **Classes**: `bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent font-black`
- **Example**:
  ```tsx
  <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent font-black">
    Journey
  </span>
  ```

### Key Colors
- `redmix`: The primary brand red.
- `yellow`: The secondary accent color.
- `text-white`: Default for hero and glass components.
- `text-white/70` or `text-white/60`: Used for secondary text or labels on dark backgrounds.

---

## 2. Glassmorphism (Glass Mode)

When components are placed on top of gradients or images (like in the Hero section), use the "Glass" effect.

### Glass Container
- **Classes**: `bg-white/10 backdrop-blur-2xl border border-white/20 shadow-hero`
- **Example**:
  ```tsx
  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-4">
    Content
  </div>
  ```

### Glass Popovers (DatePickers, LocationInputs, etc.)
Popovers in glass mode should follow these rules:
- **Background**: `bg-white/10 backdrop-blur-2xl`
- **Border**: `border-white/20`
- **Text Color**: `text-white`
- **Hover State**: `hover:bg-white/20`
- **Disabled State**: `text-white/20 opacity-30 cursor-not-allowed` (Dim white)

---

## 3. Form Component Standards

### Tabs (Booking Form & Filters)
- **Inactive**: `text-white/70 hover:text-white hover:bg-white/5`
- **Active**: `bg-white text-redmix shadow-lg`
- **Classes**: `data-[state=active]:bg-white data-[state=active]:text-redmix`

### DatePicker & LocationInput
Always pass the `glassPopover` prop when using these in a Hero or dark section.
- **DatePicker**:
  - Active/Selected: `bg-redmix text-white`
  - Today: White indicator dot.
  - Disabled: Dim white (`text-white/20`).
- **LocationInput**:
  - Suggestions: White text with white-70% subtitles.
  - Hover: `hover:bg-white/10`.

### CounterInput
- When `glass={true}` is passed:
  - Buttons: `border-white/30 text-white/70 hover:border-white hover:text-white`
  - Value: `text-white`

---

## 4. Implementation Checklist for AI Agents

When updating new routes or components:
1. [ ] Check if the component is in a Hero/Dark section.
2. [ ] If yes, apply `glassPopover` or `heroMode` props.
3. [ ] Ensure all text inside popovers is explicitly set to `text-white` or `text-white/X`.
4. [ ] Verify that disabled states use "Dim White" (`text-white/20`).
5. [ ] Update active tabs to use `bg-white` and `text-redmix`.
6. [ ] Use the `redmix` to `yellow` gradient for branding accents.
