# Dark & Light Mode Theme Guide

This guide explains how to manage and customize the theme for Ezee Flights. Your app uses **Next-Themes** and **Tailwind CSS v4** with CSS Variables for seamless, high-performance theme switching.

---

## 1. How it Works (The Concept)
Instead of fixed colors (like `white`), we use **Semantic Classes**. These classes point to a variable name that automatically changes its value when you toggle the theme.

- **HTML Class**: When you click the toggle, `next-themes` adds or removes the `.dark` class on the `<html>` element.
- **CSS Variables**: Your `globals.css` tells the browser: *"If the root is `.dark`, make the background dark slate; otherwise, make it white."*

---

## 2. Core Theme Classes
Use these "Magic Classes" to build components that naturally adapt to any theme without using the `dark:` prefix everywhere.

| Tailwind Class | Purpose | Light Mode | Dark Mode |
| :--- | :--- | :--- | :--- |
| `bg-background` | Whole page background | Pure White | Deep Navy/Slate |
| `bg-card` | Cards, Sections, Modals | White | Dark Gray/Charcoal |
| `bg-muted` | Sidebars, icon boxes, light fills | Very Light Gray | Dark Slate |
| `bg-accent` | Hover states, subtle buttons | Ultra-Light Gray | Medium Dark Slate |
| `text-foreground` | Primary text, Headings | Black/Dark Blue | Off-White |
| `text-muted-foreground` | Secondary text, Labels, Placeholders | Gray | Light Slate Gray |
| `border-border` | Dividers, input borders | Soft Gray | Dark Slate Border |

---

## 3. When to use `dark:` vs. Semantic Classes
Strictly follow these rules for a consistent UI:

### ✅ Use Semantic Classes for Layout
- **Correct**: `<div className="bg-card text-foreground border-border">`
- **Why**: It's automatic. You only write it once, and it works for both.

### ✅ Use `dark:` only for Brand Overrides
Sometimes you want a specific color to change radically (e.g., a branded blue becoming a branded red in dark mode).
- **Example**: `<h1 className="text-brand-blue dark:text-brand-red-light">`

### ❌ Avoid Hardcoded Fixed Colors
- **Incorrect**: `<div className="bg-white">` — This will stay white in dark mode, which looks broken.
- **Incorrect**: `<p className="text-gray-900">` — This will be invisible in dark mode.

---

## 4. How to Customize Colors
To change any of these colors (e.g., make Dark Mode even darker), open **`styles/globals.css`**.

### The HSL Format
All colors use the `HSL` (Hue, Saturation, Lightness) format. This allows Tailwind to control opacity (e.g., `bg-card/50`).

```css
/* LIGHT MODE DEFINITIONS */
:root {
  --background: 0 0% 100%;       /* 100% Lightness = White */
  --foreground: 222 47% 11%;     /* Darker value */
  --card: 0 0% 100%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
}

/* DARK MODE DEFINITIONS */
.dark {
  --background: 223 32% 9%;    /* ~9% Lightness = Close to Black */
  --foreground: 210 40% 98%;   /* High Lightness = Close to White */
  --card: 222 47% 11.2%;       /* Slightly lighter than background */
  --muted: 219 23% 12%;
  --border: 219 23% 15%;
}
```

---

## 5. Summary Cheat Sheet

| Task | Where to go / What to do |
| :--- | :--- |
| **Add a new card** | Use `bg-card border-border shadow-sm` |
| **Add secondary text** | Use `text-muted-foreground` |
| **Pick a new dark background** | Change `--background` in `styles/globals.css` (.dark block) |
| **Change the button theme** | Use `bg-primary` or custom brand colors like `bg-brand-red` |

> [!TIP]
> **Pro Tip**: Always use the "Automatic" classes like `bg-background` and `text-foreground` first. Only use `dark:` for colors that are specific to your branding!
