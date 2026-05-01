# FAQ / Help Centre — Layout Spec

> Pure layout / structure only. Apply your own theme (colors, fonts, radii).

---

## Page chrome

Standard authenticated shell. Header text:
- Eyebrow: `Help Centre`
- Title: `How to use the library`
- Description: `Step-by-step guides on borrowing, returning, renewals, holds, and fines.`

---

## Desktop layout (1440 × 900)

Two-column CSS Grid:

```
┌────────────────────────────────────────┬────────────────────┐
│   ACCORDION SECTIONS  (stacked)        │   QUICK ACTIONS    │
│                                        │   (4 tiles)        │
│   ▸ Borrowing & Returns                │   ──               │
│   ▸ Renewals                           │   STILL NEED HELP? │
│   ▸ Holds & Reservations               │   contact card     │
│   ▸ Fines & Fees                       │                    │
└────────────────────────────────────────┴────────────────────┘
```

```css
padding: 24px 40px 40px;
display: grid;
grid-template-columns: 1fr 280px;
gap: 28px;
```

Right column is `align-self: start` so it doesn't stretch with the accordion.

---

## Components

### Section card (top-level accordion)

Each section is its own card, stacked with `gap: 10px`. Card uses `border-radius: 14px; overflow: hidden;` (so the inner dividers clip cleanly).

**Section header** — full-width button, `padding: 18px 20px`, horizontal flex with `gap: 14px; align-items: center;`:
- **Icon tile** — 36×36, `border-radius: 10px`, icon ~17px centered.
- **Title** — display/serif, 18px, weight 600, letter-spacing −0.2, `flex: 1`.
- **Item count** — mono, 9px, letter-spacing 1, e.g. `4 items`.
- **Chevron** — 16px, rotates `90deg` (`transition: transform .2s`) when this section is open.

**Expanded body** (only when open): `border-top: 1px solid <theme.border>;` containing the question rows.

### Question row (nested accordion)

Each Q row is a full-width button, `padding: 16px 20px`, horizontal flex `justify-content: space-between; align-items: center; gap: 14px;`:
- **Q text** — 13px, weight 600.
- **Chevron** — 14px, rotates `90deg` when open.
- Background flips to a subtle tint when this Q is the open one.

**A panel** (only when this Q is open): `padding: 0 20px 16px; font-size: 13px; line-height: 1.6;`

Rows are separated by a 1px divider, except the last row in a section.

### Sections + content (verbatim)

```ts
const FAQ_SECTIONS = [
  {
    title: 'Borrowing & Returns', icon: IconBook,
    items: [
      { q: 'How long is the loan period?',
        a: 'Standard loans are 14 days. Some reference materials may have shorter periods.' },
      { q: 'How do I return a book?',
        a: 'Return books at the library desk during staffed hours. Drop-off slots are available 24/7 at the main entrance.' },
      { q: 'How many books can I borrow?',
        a: 'Students may borrow up to 5 books at a time. Staff and postgrad students may borrow up to 10.' },
      { q: 'Can I return books after hours?',
        a: 'Yes! Use the 24-hour drop box at the library entrance. Items are processed the next business day.' },
    ],
  },
  {
    title: 'Renewals', icon: IconRenew,
    items: [
      { q: 'How do I renew a book?',
        a: 'Go to My Books → Current, then tap "Renew" next to the book. You can also visit the library desk.' },
      { q: 'How many times can I renew?',
        a: 'You can renew up to 2 times per item, unless another patron has placed a hold on it.' },
      { q: 'Will I be notified before a book is due?',
        a: 'Yes — you\'ll receive an in-app notification 3 days before and again on the due date.' },
    ],
  },
  {
    title: 'Holds & Reservations', icon: IconBookmark,
    items: [
      { q: 'How do I place a hold?',
        a: 'Search for the book in the catalogue and tap "Place hold". You\'ll be notified when it\'s ready for pickup.' },
      { q: 'How long is a hold kept?',
        a: 'Once your hold is ready, you have 3 days to collect it before it\'s released to the next person in queue.' },
    ],
  },
  {
    title: 'Fines & Fees', icon: IconAlert,
    items: [
      { q: 'What is the overdue fine?',
        a: 'RM 0.50 per day per item. Fines are tracked in your account and must be settled to borrow again.' },
      { q: 'How do I pay a fine?',
        a: 'Visit the library desk with your student ID. Card and e-wallet payments are accepted.' },
    ],
  },
];
```

### Sidebar — Quick-action tiles

Mono uppercase eyebrow `QUICK ACTIONS` (10px, letter-spacing 1.8, weight 700, `margin-bottom: 10px`).

Four tiles, full-width, stacked with `margin-bottom: 8px`:
- `padding: 14px 16px; border-radius: 12px;`
- horizontal flex, `gap: 12px; align-items: center;`
- Icon tile (36×36, radius 10) + label/sub stack (label 13px/600, sub 11px)

Tiles:
| Label | Sub | Icon |
|---|---|---|
| Borrow a book | Search by title or scan barcode | `IconBook` |
| Camera scan | Identify a book instantly | `IconScan` |
| My notifications | Due dates and hold alerts | `IconBell` |
| My profile | Account and preferences | `IconUser` |

### Sidebar — "Still need help?" card

Below the tiles, `margin-top: 8px`, `padding: 18px; border-radius: 14px;`:
- Heading 12px/600 — `Still need help?`, `margin-bottom: 6px`.
- Body 12px/line-height 1.5 — `Chat with a librarian during staffed hours or email us.`, `margin-bottom: 10px`.
- Email link 11px mono/700 — `mailto:library@swinburne.edu.my`.

---

## Behavior

- Two pieces of state: `openSection` (default `'Borrowing & Returns'`), `openItem` (default `null`).
- One section open at a time; clicking a section toggles it.
- One question open at a time (across all sections — fine because only one section is expanded at once).
- All chevron rotation via CSS `transform: rotate(90deg); transition: transform .2s;`.

---

## Mobile (390 × 844)

- Sidebar removed.
- Single full-width column for the accordion.
- Section header text drops to ~16px; everything else unchanged.
