# AGENTS.md — Library Self-Checkout System

This file defines how Codex should collaborate in this repo. It prioritizes safe, pragmatic engineering, and aligns with the product requirements below.

## Product Goal
Build an AI-powered **Book Recommendations** experience:
- Personalized recommendations based on **user-stated interests** (no historical student profiles are available).
- Chat-style UX with clear guidance and guardrails.

## Core UX Requirements
- Chat input only accepts **English**.
- Reject or ignore **unrelated** or off-topic messages.
- **Anti-spam** protections (rate limits, debounce, or cooldown).
- A visible **Send/Enter** control so users can press Enter to submit.
- Chat history **scrolls** when it exceeds the viewport.
- Display of **recommended books** with clear metadata (title, author, short reason).

## Data Constraints
- There is **no student interest history** or prior records.
- Recommendations must be derived from **current conversation content** only.

## System Behavior Expectations
- Keep recommendations **explainable**: cite the interest signal used.
- Provide **fallback** recommendations if the user is vague:
  - Ask a short clarifying question or
  - Offer a few broad categories to choose from.
- Prefer **deterministic** or reproducible results in dev (seeded randomness).

## Guardrails
- English-only input: detect non-English and respond with a short English prompt to rephrase.
- Block unrelated queries with a brief redirect to book interests.
- Rate-limit user input to prevent spam.
- Avoid heavy requests on every keystroke; send only on explicit submit/Enter.

## Agent Skills / Patterns to Use
- **RAG (Retrieval-Augmented Generation)**:
  - Use a local or curated list of books when possible.
  - Retrieve candidates, then rank based on the stated interests.
- **Agent Tools / MCP**:
  - If the project uses MCP, prefer MCP for catalog search or metadata enrichment.
  - Keep tool usage small and focused; cache results if possible.

## Engineering Preferences
- Favor clarity and safety over cleverness.
- Keep UI behavior testable; add minimal tests around:
  - Input validation (English-only, anti-spam, unrelated messages).
  - Recommendation rendering and scrolling behavior.

## What to Ask the User When Blocked
If required info is missing, ask **one short question**:
- Example: “Which genres or topics do you enjoy most right now?”

