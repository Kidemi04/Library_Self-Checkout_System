# Chat Support — Layout Spec

> Pure layout / structure only. Apply your own theme (colors, fonts, radii). Sizes (px) and proportions matter — they keep the page reading as "calm conversational support" instead of a noisy chat product.

---

## Page chrome

Renders inside the standard authenticated shell (left nav + top bar + page header). The shell already provides the page title; the spec below only describes the **content area**.

Header text for this page:
- Eyebrow: `Support`
- Title: `Chat Assistant`
- Description: `Ask about loans, holds, renewals, or get help finding books.`

---

## Desktop layout (1440 × 900)

Two-column CSS Grid:

```
┌──────────────────────────────────────────────┬──────────────┐
│                                              │              │
│   MESSAGE FEED  (scrollable, flex-grow)      │   SIDEBAR    │
│                                              │   (sticky)   │
│                                              │              │
├──────────────────────────────────────────────┤              │
│   QUICK-REPLY CHIPS  (wrap row)              │              │
├──────────────────────────────────────────────┤              │
│   INPUT WELL  +  SEND BUTTON                 │              │
└──────────────────────────────────────────────┴──────────────┘
```

```css
padding: 0 40px 0;
display: grid;
grid-template-columns: 1fr 300px;
gap: 24px;
height: calc(100% - 1px);
overflow: hidden;
```

Left column = `flex-direction: column`, full height. Inside it, top→bottom:
1. **Messages** — `flex: 1; overflow-y: auto; padding: 24px 0 16px; display: flex; flex-direction: column; gap: 14px;`
2. **Quick replies** — `display: flex; gap: 6px; padding-bottom: 12px; flex-wrap: wrap;`
3. **Input row** — `display: flex; gap: 8px; padding-bottom: 28px; align-items: center;`

Right column = `padding: 24px 0 28px; display: flex; flex-direction: column; gap: 14px;`

---

## Components

### Message row

A horizontal flex row, justified to `flex-end` for the user, `flex-start` for the assistant. `align-items: flex-end`, `gap: 10px`.

- **Assistant avatar** (only on assistant messages): 28×28 circle, single-letter wordmark.
- **Bubble:** `max-width: 72%`, `padding: 12px 16px`, `font-size: 13px`, `line-height: 1.55`, `white-space: pre-line`.
- Bubble corner radii are asymmetric so the "tail" points toward the speaker:
  - User → `16px 16px 4px 16px`
  - Assistant → `16px 16px 16px 4px`
- **Timestamp** below the bubble (separate div): `font-size: 10px`, `margin-top: 4px`, aligned to the bubble side (right for user, left for assistant).

### Typing indicator

When the assistant is "thinking", append a row with the avatar + a bubble containing 3 × 6×6 dots, `border-radius: 3`, with a staggered pulse animation.

### Quick-reply chip

`padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; cursor: pointer;`

Default chip set (4 chips, wrap):
- `What are my current loans?`
- `How do I renew a book?`
- `Is "Sapiens" available?`
- `What's my overdue fine?`

### Input row

- **Input well** (`flex: 1`): `padding: 12px 16px; border-radius: 12px;` containing a borderless `<input>` (13px). Pressing Enter sends.
  Placeholder: `Ask me anything about the library…`
- **Send button**: 44×44 square, `border-radius: 12px`, contains a right-arrow icon (~18px).

### Sidebar (right column, 300px)

Two cards stacked, each `padding: 20px; border-radius: 14px;`.

**Card A — Support hours**
- Mono uppercase label `SUPPORT HOURS` (10px, letter-spacing 1.8, weight 700).
- 3 rows, each `margin-bottom: 10px`, each row = small mono label (10px) + value (13px, weight 600):
  - Weekdays / `8:00 AM – 9:00 PM`
  - After hours / `Auto-reply + email`
  - Hotline / `+6082 260936`

**Card B — Quick links**
- Mono uppercase label `QUICK LINKS`.
- 3 stacked button-tiles, each `padding: 10px 12px; border-radius: 8px;` with a 12px/600 label and a 10px sub:
  - `Borrowing FAQ` — Limits, renewals, returns
  - `My active loans` — Current dashboard
  - `Notifications` — Due reminders & holds

---

## Behavior

- `messages` array, seeded with one assistant greeting.
- `send(text?)` pushes a user message, shows the typing indicator, then after ~1200ms appends a canned assistant reply.
- Quick-reply chip click calls `send(chipText)` directly (does not populate the input).
- Time format: `HH:MM AM/PM`.
- After each new message, set the feed's `scrollTop = scrollHeight` (do **not** use `scrollIntoView`).

---

## Mobile (390 × 844)

- Sidebar removed.
- Single full-width column: messages → quick replies → input.
- Bubble max-width still `72%`, same corner radii.
- Input row sits above the mobile bottom tab bar.
