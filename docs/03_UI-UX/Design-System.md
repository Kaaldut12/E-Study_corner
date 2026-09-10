# Design System & UI Architecture

E-Study Corner features an ultra-modern, glassmorphic design system powered by Tailwind CSS v4, dynamic CSS custom properties, hardware-accelerated animations, and responsive layout architectures.

---

## 1. Typography Hierarchy

The platform utilizes Google Fonts configured with subpixel anti-aliasing and tight letter spacing:

- **Display & Headings**: `Outfit` (`font-display`, weights 600, 700, 800, 900)
  - Applied to page titles, metric numbers, cards headers, modal titles, and primary action buttons.
  - Features high contrast, tight tracking (`tracking-tight` / `tracking-wider`), and futuristic curves.
- **Body & Data Points**: `Inter` (`font-sans`, weights 400, 500, 600, 700)
  - Applied to body text, form labels, data tables, code previews, and status pills.
  - Optimized for high legibility on dark backgrounds with standard tracking.

---

## 2. Dynamic 4-Color Theme Engine

The system supports real-time theme switching without page reloads via the `Navbar` theme selector, which sets the `data-theme` attribute on `document.documentElement` and persists the selection in `localStorage`:

| Theme ID | Primary Hue | Brand Gradient (`var(--brand-1)` → `var(--brand-3)`) | Glow Aura (`var(--brand-glow)`) |
| :--- | :--- | :--- | :--- |
| **Indigo** *(Default)* | Electric Indigo | `#4f46e5` → `#7c3aed` → `#9333ea` | `rgba(99, 102, 241, 0.25)` |
| **Emerald** | Cyber Emerald | `#059669` → `#10b981` → `#06b6d4` | `rgba(16, 185, 129, 0.25)` |
| **Amber** | Solar Gold | `#d97706` → `#f59e0b` → `#f97316` | `rgba(245, 158, 11, 0.25)` |
| **Rose** | Neon Crimson | `#e11d48` → `#f43f5e` → `#ec4899` | `rgba(244, 63, 94, 0.25)` |

All themes dynamically update:
- Primary CTA buttons (`.btn-premium`, `bg-brand`, `shadow-brand`)
- Ambient background blur spheres (`animate-float-slow`, `animate-float-reverse`)
- Metric highlight cards and active route pills in the sidebar

---

## 3. Glassmorphic Surface Components

### `.glass-panel`
- Background: `rgba(15, 23, 42, 0.75)` (Slate 900 translucent)
- Backdrop Filter: `blur(16px)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Inner Highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.06)`
- Outer Shadow: `0 20px 35px -10px rgba(0, 0, 0, 0.5)`

### `.glass-panel-hover`
- Applied to interactive cards (KPI metrics, course cards, coursework list items).
- Hover transition: Translates up by `-4px` (`translateY(-4px)`), expands shadow depth, and illuminates border with brand glow.

### `.btn-premium`
- Radiant linear gradient background (`var(--brand-1)` to `var(--brand-2)`).
- Diagonal shimmer animation overlay (`shimmerSlide`).
- Tactile active press: `transform: scale(0.98)`.

### `.btn-secondary`
- Translucent frosted glass button (`rgba(30, 41, 59, 0.8)`) with 1px border highlight.

---

## 4. Hardware-Accelerated Animations (`@keyframes`)

- **`fadeInUp`**: Staggered page load animations using utility classes:
  - `delay-75` (75ms delay)
  - `delay-150` (150ms delay)
  - `delay-225` (225ms delay)
  - `delay-300` (300ms delay)
- **`floatSlow` & `floatReverse`**: Fluid background lighting spheres providing depth and cinematic ambience.
- **`pulseGlow`**: Breathing glow applied to live badges and pending review indicators.
- **`shimmerSlide`**: Continuous light sheen across button surfaces.

---

## 5. Fixed Sidebar & Layout Architecture

The sidebar layout (`SidebarLayout.jsx`) is engineered for seamless dashboard navigation:

```
+-------------------------------------------------------------------+
| Navbar: sticky top-0 z-50 h-16 (Logo, Theme Switcher, User Menu)   |
+-------------------+-----------------------------------------------+
| Fixed Sidebar:    | Main Content Area:                            |
| fixed top-16      | lg:pl-64 offset                               |
| left-0 z-40       | Scrollable document viewport                   |
| w-64              |                                               |
| h-[100vh - 4rem]  | max-w-7xl mx-auto                             |
|                   |                                               |
| Independent       | Content scrolls naturally;                    |
| overflow-y-auto   | Sidebar NEVER moves or scrolls away!           |
+-------------------+-----------------------------------------------+
```

### Key Technical Specs:
- **Zero Scroll Displacement**: The sidebar `<aside>` is anchored with `position: fixed; top: 4rem; left: 0; z-index: 40; width: 16rem; height: calc(100vh - 4rem)`.
- **Content Padding**: The main container is padded on desktop with `lg:pl-64`, guaranteeing zero visual overlap.
- **Independent Scroll**: If the navigation menu has more items than the browser height, the internal `<nav>` scrolls independently using custom scrollbar styling.
- **Mobile Drawer**: On screens below `1024px` (`lg`), the sidebar slides out smoothly with `-translate-x-full` to `translate-x-0` backed by a frosted overlay backdrop.
