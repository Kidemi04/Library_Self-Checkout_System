# Book Recommendations — Layout Spec

> Pure layout / structure only. Apply your own theme (colors, fonts, radii).

---

## Page chrome

Standard authenticated shell. Header text:
- Eyebrow: `Reading assistant`
- Title: `Book Recommendations`
- Description: `Personalised picks based on your borrowing history and interests.`

---

## Desktop layout (1440 × 900)

Two-column CSS Grid:

```
┌─────────────────────────────────────────┬──────────────────────┐
│   ✦ CURATED FOR KELVIN                  │   ✦ AI RECOMMENDATIONS│
│                                         │                       │
│   ┌──────┐ ┌──────┐ ┌──────┐            │   "Tell me what       │
│   │cover │ │cover │ │cover │            │    you want"          │
│   └──────┘ └──────┘ └──────┘            │   <textarea>          │
│   title    title    title               │   [Find recs] btn     │
│   author   author   author              │                       │
│   tag tag  tag      tag tag             │   (reply card,        │
│   reason   reason   reason              │    pops in on submit) │
│                                         │                       │
│   (next 3 books, same grid…)            │                       │
└─────────────────────────────────────────┴──────────────────────┘
```

```css
padding: 24px 40px 40px;
display: grid;
grid-template-columns: 1fr 320px;
gap: 28px;
```

Right column is `align-self: start`.

---

## Components

### "Curated for Kelvin" eyebrow

Above the grid:
- horizontal flex, `gap: 8px; align-items: center; margin-bottom: 20px;`
- Sparkle icon (~16px) + uppercase mono label `CURATED FOR KELVIN` (10px, letter-spacing 2, weight 700).

### Recommendation grid

```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 18px;
```

Each card has **no surface chrome** (no background, no border) — the book covers carry the page.

**Cover** — use the existing `<BookCover>` primitive: `w={168} h={240} radius={6}`, with `gradient`, `title`, `author` from the data.

**Below the cover** (`margin-top: 10px`):
- Title — display/serif, 15px, weight 600, letter-spacing −0.2, `line-height: 1.15`
- Author — display/serif italic, 11px
- Tags row — flex, `gap: 4px; margin-top: 6px; flex-wrap: wrap;` of `<Chip mono>` pills
- Reason — mono, 10px, `margin-top: 6px`

Outer wrapper has `cursor: pointer`. No hover lift / scale.

### Recommendation data (verbatim)

```ts
const REC_BOOKS = [
  { id: 'R1', title: 'Sapiens', author: 'Yuval Noah Harari',
    cover: 'linear-gradient(135deg, #A88D5A 0%, #6B5A38 100%)',
    reason: 'Based on your history', tags: ['History', 'Bestseller'] },
  { id: 'R2', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas',
    cover: 'linear-gradient(135deg, #1A3A4F 0%, #0D1F2C 100%)',
    reason: 'Popular in ICT', tags: ['Computing', 'Classic'] },
  { id: 'R3', title: 'Deep Work', author: 'Cal Newport',
    cover: 'linear-gradient(135deg, #3A4A2F 0%, #1F2818 100%)',
    reason: 'Trending this week', tags: ['Self-help'] },
  { id: 'R4', title: 'Zero to One', author: 'Peter Thiel',
    cover: 'linear-gradient(135deg, #1F2128 0%, #3A3D4A 100%)',
    reason: 'ICT students also read', tags: ['Business', 'Tech'] },
  { id: 'R5', title: 'The Phoenix Project', author: 'Gene Kim et al.',
    cover: 'linear-gradient(135deg, #4A2A1A 0%, #8B4A2A 100%)',
    reason: 'Related to your subjects', tags: ['Computing', 'DevOps'] },
  { id: 'R6', title: 'Mindset', author: 'Carol Dweck',
    cover: 'linear-gradient(135deg, #2A1A4A 0%, #6B4A9A 100%)',
    reason: 'Recommended by staff', tags: ['Psychology'] },
];
```

The cover gradients ARE the color of the page — keep them.

### AI prompt card (right column)

Single card, `padding: 22px 20px; border-radius: 14px;`.

**Eyebrow** — flex, `gap: 8px; align-items: center; margin-bottom: 10px;`:
sparkle icon (~14px) + `AI RECOMMENDATIONS` (mono, 9px, letter-spacing 2, weight 700).

**Headline** — `Tell me what you want` (display/serif, 20px, weight 600, letter-spacing −0.3, `margin-bottom: 6px`).

**Body** — 12px, `line-height: 1.5`, `margin-bottom: 14px`:
`Describe what you're looking for and I'll find matching books in the catalogue.`

**Textarea** — `rows={3}`, `width: 100%`, `padding: 10px 12px; border-radius: 8px;` 12px, `resize: none; outline: none; box-sizing: border-box; margin-bottom: 10px;`. Placeholder: `e.g. I want something about startup culture…`

**Submit button** — `width: 100%; padding: 11px 0; border-radius: 8px;`, 12px/700, label `Find recommendations`.

**AI reply card** (only when `aiReplied === true`):
- `margin-top: 16px; padding: 14px; border-radius: 10px;`
- 12px, `line-height: 1.6`
- `animation: popIn .3s ease`
- Book titles inside the reply use display/serif italic + weight 600.
- Default reply: `Based on your interest, I'd recommend `*Zero to One*` by Peter Thiel and `*The Lean Startup*` by Eric Ries. Both are available at Sarawak Campus.`

---

## Behavior

- `chatInput` string state for the textarea.
- `aiReplied` boolean, default `false`.
- `askAI()` — if `chatInput` empty, no-op. Otherwise after a 1000ms `setTimeout`, set `aiReplied = true`.
- Grid book cards are static (no interaction wired beyond `cursor: pointer`).

---

## Mobile (390 × 844)

- Two-column collapses; AI prompt card moves to the **top** of the page (above the grid) so the prompt is the first thing seen.
- Book grid becomes 2-up (`repeat(2, 1fr)`), `gap: 14px`.
- Cover dimensions ~`w=148 h=212`.
