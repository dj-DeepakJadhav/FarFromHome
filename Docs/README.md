# Documentation Map

> **Read this first.** It says which document is authoritative for what.
>
> This repo previously had seven documents each calling itself "master" or
> "authority", and three task lists that disagreed. That is fixed. Exactly one
> document owns each subject below. If you are about to write "this document is
> the master authority" in a new file, don't — add to an existing owner instead.

---

## Authoritative documents

| Subject | Owner | Notes |
| :--- | :--- | :--- |
| **Competition rules & agent operating rules** | [`AGENTS.md`](../AGENTS.md) | Hard constraints, rubric weights, anti-patterns. Highest authority. |
| **Act One Narrative & Flow Ground Truth** | [`ACT_ONE_BRITISH_COMEDY.md`](ACT_ONE_BRITISH_COMEDY.md) | The authoritative story, dialogue beats, and NPC progression for Act One. |
| **Every number** (sizes, tunables, prices, word counts) | [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md) | No other doc may hard-code a number. Link here. |
| **Design at a glance** | [`ONE_PAGE_DESIGN_DOCUMENT.md`](ONE_PAGE_DESIGN_DOCUMENT.md) | The one-page GDD. Start here for the shape of the game. |
| **Full design detail** | [`README_HACKATHON.md`](README_HACKATHON.md) | Cast, loop, mechanics, narrative framing. |
| **Architecture & systems** | [`TECHNICAL_REFERENCE.md`](TECHNICAL_REFERENCE.md) | Layers, phase flow, rendering, audio. |
| **What is left to do** | [`TASKS.md`](TASKS.md) | The only task list. |
| **Submission deliverables** | [`submission/`](submission/) | Design Intent, Devpost answers, video script, checklist. |

## Reference material (not authoritative, still useful)

| Document | Purpose |
| :--- | :--- |
| [`GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md`](GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md) | Real German immigration law and daily-life research the fiction is built on. |
| [`MASTER_RESOURCES_AND_DECISION_ARCHIVE.md`](MASTER_RESOURCES_AND_DECISION_ARCHIVE.md) | Why each design decision was made, with the GDC talks behind it. |

## `archive/`

Superseded or out-of-scope. **Nothing in `archive/` is authoritative** and no agent
should treat it as a work order. It is kept for history.

It holds legacy drafts (such as `ACT_ONE_LEGACY.md`), the narrative bible,
the 28-day interactive text story, the narrative flow and mind-map documents,
the three retired task lists, the Messenger pivot analysis, and the development log.
Note: `assets/narrative/story.json` is preserved as-is as a secondary asset reference,
but is superseded by `ACT_ONE_BRITISH_COMEDY.md` for ground-truth narrative design.

---

## Rules for keeping docs honest

1. **Verify before you tick.** A checkbox means you ran a check. Say which one.
2. **Numbers live in one place.** Quote `CANONICAL_NUMBERS.md`, never memory.
3. **Docs follow code.** When they disagree, the code is right and the doc is a bug.
4. **No new "master" documents.** Extend an owner above.
5. **Scope discipline.** The rubric scores Focus at 15 % and penalises sprawl. If a
   feature is not in the shipped build, it does not belong in a submission document.
