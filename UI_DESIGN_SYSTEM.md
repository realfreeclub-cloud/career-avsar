# UI Design System — Premium Light Theme (Editorial & Liquid Glass)

## 1. Overview & Design Direction
The Indian Teacher Recruitment & Placement Platform uses an editorial premium light theme combining:
- **Classic Editorial Design**: Serif typography (`Playfair Display`), sophisticated typographic hierarchy, and generous whitespace.
- **Modern Educational Branding**: Dignified Midnight Navy primary surfaces, Muted Gold emblems, and Forest Green verification signals.
- **Subtle Liquid Glass Effects**: Translucent white panels (`rgba(255, 255, 255, 0.85–0.95)`), refined blur (`backdrop-blur-md`), inner specular highlights, and soft layered shadows.
- **Accessible & High-Contrast**: Tested contrast exceeding WCAG AA and AAA ratios on warm ivory `#F8F7F3` and pure white `#FFFFFF`.

---

## 2. Global Color Tokens

| Token Name | Hex Code | RGB Token | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Main Background** | `#F8F7F3` | `248 247 243` | Warm ivory / linen body background with subtle top radial illumination |
| **Card Background** | `#FFFFFF` | `255 255 255` | Crisp white cards, input backgrounds, and modal surfaces |
| **Primary** | `#14233B` | `20 35 59` | Midnight Navy for headlines, brand emblems, primary CTA buttons, and admin sidebar |
| **Secondary** | `#244C78` | `36 76 120` | Classic Deep Slate Blue for institution links, subheadings, and icons |
| **Accent / Gold** | `#C6A66B` | `198 166 107` | Muted Warm Gold for category badges, highlights, counters, and awards |
| **Soft Blue** | `#EAF0F7` | `234 240 247` | Soft blue tint for pill backgrounds, table headers, active sidebar states |
| **Body Text** | `#172334` | `23 35 52` | Deep charcoal navy text for ultra-readable paragraphs (15.6:1 contrast ratio) |
| **Secondary Text** | `#687487` | `104 116 135` | Slate muted text for metadata, timestamps, and secondary labels (5.2:1 contrast) |
| **Borders** | `#E6E2D9` | `230 226 217` | Refined warm sand border for card outlines and subtle dividers |
| **Success** | `#15803D` | `21 128 61` | Verification checkmarks, approved badges, and offered statuses |
| **Warning** | `#B45309` | `180 83 9` | Pending statuses and warning pills |
| **Danger** | `#B91C1C` | `185 28 28` | Error messages, rejection tags, and destructive actions |

---

## 3. Typography & Hierarchy

- **Headings**: `Playfair Display` (`--font-playfair`, Google Fonts). Applied to `h1`, `h2`, `h3`, `.font-serif`, and `.editorial-heading`.
- **Body & UI**: `Inter` / `Manrope` (`--font-inter`, Google Fonts). Applied to body, buttons, forms, tables, and metadata.
- **Fluid Scale**:
  - `text-xs`: `clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)`
  - `text-sm`: `clamp(0.875rem, 0.84rem + 0.2vw, 0.9375rem)`
  - `text-base`: `clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)`
  - `text-lg`: `clamp(1.125rem, 1.06rem + 0.3vw, 1.25rem)`
  - `text-xl`: `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)`
  - `text-2xl`: `clamp(1.5rem, 1.35rem + 0.8vw, 1.875rem)`
  - `text-3xl`: `clamp(1.875rem, 1.6rem + 1.2vw, 2.5rem)`

---

## 4. Liquid Glass & Shadows
- **Translucent Liquid Glass Surface** (`.glass-surface`):
  `background: rgba(255, 255, 255, 0.82); border: 1px solid rgba(230, 226, 217, 0.9); backdrop-filter: blur(14px);`
- **Strong Liquid Glass Surface** (`.glass-surface-strong`):
  `background: rgba(255, 255, 255, 0.94); border: 1px solid rgba(230, 226, 217, 0.9); backdrop-filter: blur(18px);`
- **Inner Specular Highlight** (`.glass-highlight`):
  Pseudo-element `::before` with vertical linear gradient from `rgba(255, 255, 255, 0.85)` to transparent.
- **Shadow Tokens**:
  - Card: `0 2px 10px -2px rgba(20, 35, 59, 0.05), 0 1px 3px rgba(20, 35, 59, 0.03)`
  - Card Hover: `0 16px 32px -8px rgba(20, 35, 59, 0.09), 0 4px 12px -2px rgba(20, 35, 59, 0.04)`
  - Glass: `0 10px 30px -10px rgba(20, 35, 59, 0.08), 0 2px 6px rgba(20, 35, 59, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)`

---

## 5. Component Implementations

1. **Header (`src/components/site/site-header.tsx`)**:
   - Sticky with smooth scroll elevation.
   - Pristine white background (`bg-white/95 backdrop-blur-md`).
   - Midnight Navy logo with Muted Gold crest.
   - Navigation links in Midnight Navy `#14233B` with active soft blue indicator `#EAF0F7`.
   - Premium registration CTA with Midnight Navy background `#14233B`, hover `#244C78`, and gold arrow.
   - Accessible slide-out mobile drawer with touch targets >= 44px.

2. **Hero (`src/app/(public)/page.tsx` & `src/components/public/hero-job-search.tsx`)**:
   - Warm ivory `#F8F7F3` background with subtle ambient radial glow.
   - Editorial headline in Playfair Display.
   - Authentic, high-resolution teacher classroom photograph framed in double border with floating glass stats.
   - White liquid glass search panel with stacked responsive inputs and Midnight Navy submit CTA.
   - Trust indicators for verified institutions, real database jobs, and no placement fees.

3. **Job Cards (`src/components/public/job-card.tsx`)**:
   - Pure white card `#FFFFFF` with subtle `#E6E2D9` border.
   - Muted gold category badge (`#FAF5EB` with text `#8F7032`).
   - Job title in Playfair Display navy text `#14233B`.
   - Clear INR salary badge with IndianRupee icon.
   - Soft elevation on hover with subtle translate lift.

4. **Admin CRM (`src/components/admin/shell.tsx` & `ui.tsx`)**:
   - Warm ivory `#F8F7F3` page background.
   - Elegant Light Sidebar (`#FFFFFF` surface with `#E6E2D9` border), Midnight Navy brand typography, Muted Gold crest, dark navy navigation text, and Soft Blue active states (`#EAF0F7` with border `#D5DFEB`).
   - Crisp white KPI and data cards with Playfair Display numbers.
   - Light table surfaces with soft blue header (`#EAF0F7/70`) and light alternating hover states.
   - Dedicated in-page modal dialogs for institutional actions (adding schools, scheduling interviews, recording placements).

5. **Teacher Dashboard (`src/components/teacher/dashboard/shell.tsx` & `ui.tsx`)**:
   - Pristine light theme with white sidebar, mobile top bar, and stat cards.
   - Responsive multi-step profile progress bar with Forest Green verification checks.
   - Private document vault uploader with light progress meters.
   - Structured communications and account security management.

---

## 6. Global Design System Requirements for All Development

> [!IMPORTANT]
> **MANDATORY STANDING RULE FOR ALL WORK:**
> All newly developed pages, modules, forms, dashboards, and components MUST adhere strictly to the approved Premium Light Theme.
> - **Main Background**: Warm Ivory `#F8F7F3`
> - **Surface / Cards**: Pure White `#FFFFFF`
> - **Primary Brand / Headings / CTAs**: Midnight Navy `#14233B`
> - **Secondary Links / Accents**: Royal / Slate Blue `#244C78`
> - **Accent / Badges / Crests**: Champagne Gold `#C6A66B`
> - **Active States / Tints**: Soft Blue `#EAF0F7`
> - **Body & Label Typography**: Inter / Manrope
> - **Editorial Headings**: Playfair Display
> - **Glass Elements**: Subtle Liquid Glass accents (`.glass-surface`, `.glass-surface-strong`)
> - **Borders & Dividers**: Refined Sand `#E6E2D9`

### Strict Prohibitions
- **NO Dark Backgrounds**: Never use dark navy, charcoal, or black as base or section backgrounds.
- **NO Ad-hoc Color Palettes**: Do not introduce random hex colors, neon gradients, or unapproved shades.
- **NO Separate Visual Identities**: Every module (Public, Teacher, Admin, Recruiter, etc.) belongs to the same unified institutional design system.
- **NO Arbitrary Component Variants**: Always reuse existing primitives from `@/components/ui` (`Button`, `Card`, `Input`, `Select`, `Modal`, `Drawer`, `DataTable`, `EmptyState`, `StatusPill`).

---

## 7. Responsive Breakpoint & Testing Protocol

Every newly created or modified section must be independently responsive and tested across all mandatory viewports:

| Breakpoint | Target Category | Layout Strategy & Deliberate Design Rules |
| :--- | :--- | :--- |
| **320px** | Small Mobile (iPhone SE 1st gen) | Single-column, stacked forms, minimum 44px touch targets, 0px horizontal overflow |
| **375px** | Standard Mobile (iPhone SE/8) | Single-column, fluid typography, compact navigation drawer, auto-wrapping tags |
| **430px** | Large Mobile (iPhone Pro Max / Plus) | High-contrast touch cards, full-width action buttons, balanced gutter padding |
| **768px** | Tablet Portrait (iPad) | 2-column adaptive grids, collapsible sidebars, balanced 16px-24px spacing |
| **1024px** | Tablet Landscape / Small Laptop | Multi-column grids (3-col cards, 12-col hero), persistent desktop navigation bar |
| **1280px** | Standard Desktop | Full editorial layout, generous whitespace, fixed or sticky sidebar navigation |
| **1440px** | Large Desktop / iMac | Contained `max-w-[80rem]` reading widths, refined shadows, clear visual hierarchy |
| **1920px** | Ultrawide / Full HD | Controlled `max-w-[1920px]` container, zero stretching or blown-out elements |

### Completion Checklist
Before marking any module or component complete:
1. **Visual Consistency**: Conforms exactly to the approved color tokens, Playfair Display headings, and Inter body text.
2. **Accessibility**: High contrast (WCAG AA/AAA compliant text on ivory/white surfaces) and visible focus rings.
3. **Responsiveness**: Tested from 320px through 1920px with zero horizontal scroll or clipped text.
4. **Code Quality**: Passes `npm run lint` (0 errors, 0 warnings) and `npm run build` (exit code 0).
