# Documentation Map

> **Read this first.** It says which document is authoritative for what.
>
> **The thesis, in one line:** *Far From Home: Kruma Express* is a narrative
> courier-management sim about British deadpan comedy colliding with German
> municipal precision. It is **not** a language-learning game and makes **no**
> pedagogical claim. The three-tier `der/die/das` shelf is the comedy mechanic,
> not a lesson: German nouns have arbitrary genders, so of course the warehouse is
> filed by them. Items are labelled English-first and the tiers are read by colour
> and symbol. German in dialogue is flavour — never describe it as teaching.
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
| **Single Master Game Design Blueprint** | [`README_HACKATHON.md`](README_HACKATHON.md) | The single authoritative game design document: narrative beats, British comedy dynamic, cast, core loop, mechanics. |
| **Every number** (sizes, tunables, prices, word counts) | [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md) | Single source of truth for numbers. No other doc may hard-code a number. |
| **Design at a glance** | [`ONE_PAGE_DESIGN_DOCUMENT.md`](ONE_PAGE_DESIGN_DOCUMENT.md) | The visual one-page GDD poster. Mirrors `README_HACKATHON.md`. |
| **Architecture & systems** | [`STORY_FORMAT.md`](STORY_FORMAT.md) | How to read and edit `assets/narrative/story.json`. Read before touching the story. Validate with `node build/check-story.js`. |
| [`TECHNICAL_REFERENCE.md`](TECHNICAL_REFERENCE.md) | Software layers, phase flow, rendering, runtime-synthesised audio, and asset pipeline. |
| **Developer Guide & Lingo** | [`PROGRAMMING_GUIDE.md`](PROGRAMMING_GUIDE.md) | Developer architecture, lifecycle hooks, coordinate spaces, and technical vocabulary. |
| **What is left to do** | [`TASKS.md`](TASKS.md) | The only active task list. |
| **Submission deliverables** | [`submission/`](submission/) | Design Intent (≤ 500w), Devpost form, video script, submission checklist. |

## Reference material & Code Data

| Resource | Purpose |
| :--- | :--- |
| `assets/narrative/story.json` | Authoritative code-data asset for dialogue and branching; inlined into `window.FFH.storyData` at release assembly. |
| [`GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md`](GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md) | Real German immigration law and daily-life research the fiction is built on. |
| [`MASTER_RESOURCES_AND_DECISION_ARCHIVE.md`](MASTER_RESOURCES_AND_DECISION_ARCHIVE.md) | Why each design decision was made, with the GDC talks behind it. |

## `archive/`

Superseded or out-of-scope. **Nothing in `archive/` is authoritative** and no agent
should treat it as a work order. It is kept for history.

It holds legacy drafts (such as `ACT_ONE_LEGACY.md` and `ACT_ONE_BRITISH_COMEDY.md` drafts), the narrative bible,
the 28-day interactive text story, the narrative flow and mind-map documents,
the three retired task lists, the Messenger pivot analysis, and the development log.

---

## Rules for keeping docs honest

1. **Verify before you tick.** A checkbox means you ran a check. Say which one.
2. **Numbers live in one place.** Quote `CANONICAL_NUMBERS.md`, never memory.
3. **Docs follow code.** When they disagree, the code is right and the doc is a bug.
4. **No new "master" documents.** Extend an owner above.
5. **One thesis.** Comedy, not curriculum. Never reintroduce a claim about voice
   acting, recorded audio, spoken German, spaced repetition, a vocabulary
   dictionary or quiz, a vocab notebook, or language learning — none of it exists
   in the build. There is no recorded audio at all: every sound is synthesised at
   runtime from oscillators. If you are unsure whether something exists, cut the
   claim rather than restore it.
6. **Scope discipline.** The rubric scores Focus at 15 % and penalises sprawl. If a
   feature is not in the shipped build, it does not belong in a submission document.
