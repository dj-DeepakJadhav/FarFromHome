# Documentation Map

Read this first. It says which document to trust for what.

## The game in one paragraph

*Far From Home: Kruma Express* is a courier management game with a story. You arrive
in Lübeck with 20 euros and 28 days before your visa runs out. You work shifts, sort
groceries by colour, ride across a 3D city, deal with very German officials, and try
to collect four stamped documents before the clock runs out. The tone is British
deadpan humour meeting German municipal precision.

**It is not a language learning game.** It teaches nothing and tests nothing. All play
is in English. German is scenery: signs, official language, and the joke below.

The three tier shelf is that joke. German nouns have genders, so the warehouse files
its stock by gender. Items are labelled in English first and the tiers are told apart
by colour and shape, so you never need to know any German. Do not describe this as
teaching.

## Which document owns what

| Subject | Document |
| :--- | :--- |
| Competition rules and how agents must work | [AGENTS.md](../AGENTS.md) |
| The game design | [README_HACKATHON.md](../README_HACKATHON.md) |
| Every number: sizes, prices, timers | [CANONICAL_NUMBERS.md](CANONICAL_NUMBERS.md) |
| The design on one page | [ONE_PAGE_DESIGN_DOCUMENT.md](ONE_PAGE_DESIGN_DOCUMENT.md) |
| How the code is built | [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) |
| How to read and edit the story file | [STORY_FORMAT.md](STORY_FORMAT.md) |
| How the project came to be, and why it changed | [THE_MAKING_OF.md](THE_MAKING_OF.md) |
| What is still open | [submission/SUBMISSION_CHECKLIST.md](submission/SUBMISSION_CHECKLIST.md) |
| Things we must hand in | [submission/](submission/) |

Nothing here may call itself a master document. If you want to add one, add to an
owner above instead. This repo once had seven documents each claiming to be the
authority, and three task lists that disagreed with each other.

## Background reading

| Document | Why it exists |
| :--- | :--- |
| [GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md](GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md) | The real German immigration law and daily life rules the game is built on. Nothing in the game's bureaucracy is invented. |
| [MASTER_RESOURCES_AND_DECISION_ARCHIVE.md](MASTER_RESOURCES_AND_DECISION_ARCHIVE.md) | Why each design decision was made, with the talks and games behind it. |
| [screenshots/](screenshots/) | Current in engine pictures, and a note on what they do and do not show. |
| [generated/](generated/) | Two generated manifests. **Both are frozen** and say so at the top. Their generator reads a story file that no longer exists. |

## The story data

The story lives in `assets/narrative/story.json`. It is data, not code, and it gets
copied into `index.html` when the release is built.

Always check it after editing:

```bash
node build/check-story.js
```

## Five rules that keep these documents honest

**1. Check before you tick.** A ticked box means you ran something. Say what you ran.

**2. Numbers live in one place.** Quote CANONICAL_NUMBERS.md. Never quote from memory.

**3. The code wins.** When a document and the code disagree, the document is the bug.

**4. Be exact about sound.** One music track ships, inside `index.html` as text. Every
sound effect is generated while the game runs. Nobody speaks. Do not write "no audio
ships", which was true until 7 September 2026 and is now wrong.

**5. Do not claim what does not exist.** Never bring back a claim about voice acting,
spoken German, spaced repetition, a vocabulary list or a quiz. None of it is in the
game. If you are unsure whether something exists, cut the claim rather than restore it.

## What was moved out of this repo

On 8 September 2026 a number of files were moved into a private local archive that has
its own README explaining each one. None of it is on GitHub, none of it is
authoritative, and no agent should treat it as work to do.

What moved, and why:

| Moved | Reason |
| :--- | :--- |
| The task list and the development log | Replaced by [submission/BUILD_LOG.md](submission/BUILD_LOG.md), which we have to hand in anyway and covers the same ground. Open items now live in the checklist. |
| The old `archive/` folder | Early Act One drafts, the story bible, the mind map, and the 28 day text story. |
| The programming guide | Its useful half is now in TECHNICAL_REFERENCE.md. |
| The video script and voice over transcript | The video is being made a different way. |
| The old screenshots | They showed German first labels, which contradicts how the game actually works. |
