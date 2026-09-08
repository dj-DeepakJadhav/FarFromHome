# Build Log. Far From Home: Kruma Express

**Competition:** Meta Horizon Creator Competition 2026. Game Prototype
**Category:** Simulation & Management
**Target:** Self-contained Three.js / HTML5 portrait build, offline, single top-level `index.html`

## How this prototype was built

Every session below was run by prompting an AI coding agent (Claude, via Claude Code
in the terminal and desktop app) against this repository. The agent did the heavy
lifting: it wrote the Three.js world generation, the A* navigation, the economy and
receipt ledger, the warehouse picking mechanic, the dialogue and narrative routing,
the HUD, and the build tooling that assembles `src/**` into a single `index.html`.

Hand work was confined to three things, and where it happened it is named in the
session entry:
1. **Directing.** Choosing what to build, what to cut, and what to revert.
2. **Playtesting.** Running the build and reporting what looked or felt wrong, most of the `fix(..)` commits below started as a human observation.
3. **Tuning and small bug edits.** Numbers, and the occasional one-line syntax fix.

The commit history is the primary evidence and is referenced throughout. Where a
session's claim can be checked by running something, the command is given.

Supporting authorities: `Docs/README_HACKATHON.md` (design pillars),
`Docs/CANONICAL_NUMBERS.md` (every economic tunable), `Docs/THE_MAKING_OF.md` (why the
project is shaped this way), `SUBMISSION_CHECKLIST.md` §4 (what is still open).

The task list and the technical development log this log grew out of were archived
out of the repository on 2026-09-08; this file supersedes both.

---

## Decisions locked

Locked decisions are the ones later sessions were not allowed to relitigate. Each
is dated to the session that closed it.

| # | Decision | Locked | Why |
|---|---|---|---|
| D1 | **Simulation & Management is the category.** The economy is the engine; narrative is the skin over it. | 2026-08-21 | Picks the rubric the prototype is judged against and stops the project drifting into a pure visual-novel. |
| D2 | **Single self-contained `index.html`, `vendor/` beside it, zero network requests.** | 2026-08-28 | Hard packaging rule. Enforced by `build/assemble.js` and `build/package.js`, not by discipline. |
| D3 | **Fixed 390×844 portrait, single-thumb play.** | 2026-08-28 | Category guidance: the thing you grow up top, the menu in thumb reach. |
| D4 | **English-first. This is not a language-learning game.** | 2026-09-01 | The German-teaching framing was advertised and hollow. Cut rather than faked. |
| D5 | **German grammatical gender is a *spatial filter*, not a lesson.** Bottom = `der`, middle = `die`, top = `das`. | 2026-09-01 | The originality bet. It is a search accelerator, it cuts the shelf you scan by two thirds, and a joke, and never a quiz. |
| D6 | **Every number lives in `Docs/CANONICAL_NUMBERS.md`.** No magic numbers at call sites. | 2026-09-01 | Six weeks of tuning across many sessions needs one source of truth or the published figures stop matching the build. |
| D7 | **No SFX assets ship**, all sound effects are runtime oscillator synthesis. One background music track *does* ship, embedded. | 2026-09-02, amended 2026-09-07 | Size budget, and refusing to claim a system that does not exist. The original decision was "no audio at all"; music was added on 2026-09-07 and the docs were not updated, so "no audio ships" stood as a false claim until 2026-09-08. See the correction below. |
| D8 | **Act I is one economic shift shown in three ramp stages.** Difficulty is carried by `unlocks.ramp.icon_delay_s` (0 / 1.5 / 2.5), never by `state.currentShift`. | 2026-09-08 | Broken once and reverted the same day; see the 2026-09-08 quickstart entry. |
| D9 | **Depth over sprawl.** A system that is advertised but hollow gets deleted, not shipped. | 2026-09-06 | Cost us the skill tree, the vocabulary dictionary, spaced repetition and the quiz. |

---

## Sessions

### 2026-08-21. Skeleton
Prompted the first end-to-end vertical slice: the systemic simulation loop and
tactical gameplay in one commit. Locked **D1**. At this point the loop existed but
had no city and no visible growth.

### 2026-08-28. City loop, economy, first packaging (9 commits)
The heaviest single build day. Prompted, in order:
-a continuous isometric city delivery loop, then smooth navigation with sliding
  collision (the first version walked into walls and stuck);
-the **economic engine and visible upgrades**, this is the invest to harvest to
  upgrade to observe-growth spine, and the point at which the category requirement
  was actually met rather than described;
-90-second pedagogical pacing and FTUE banners;
-release verification and packaging, locking **D2** and **D3**.

Then a playtest round: main-menu UI, dialogue camera, scrollable UI, removing the
diorama from the boot screen, Kenney `.obj` food assets in the store, and killing
the robotic TTS. **Cut this session:** browser TTS voice, it read as a screen
reader, not a character.

### 2026-08-29. Dialogue camera
One commit: over-the-shoulder cinematic camera for the dialogue phase.

### 2026-09-01. Narrative research pass, then the English-first pivot (28 commits)
Two halves.

The first half was research-driven: prompted the agent to read a set of GDC and
industry narrative-design frameworks and integrate what applied, a persistent goal
HUD, richer NPC dialogue trees, living-systems reactivity, foldback branching,
seasonal winter/summer intake, a 20h work-limit HUD grounded in real German student
visa rules. Much of this landed as documentation in `Docs/` before it landed as code,
which is why the day has as many `docs(..)` commits as `feat(..)` ones.

The second half was a **reversal**. Two commits (`feat(design): pivot to
English-first`, then `refactor(narrative): streamline dialogue to 100% clean
English first`) removed the German-language-teaching framing entirely. Locked
**D4** and **D5**: German stops being content and becomes *filing*. This is the
single most important decision in the project, it turned an educational claim we
could not honour into a mechanic that is genuinely ours.

Also locked **D6** after HUD numbers and doc numbers were found to disagree.
Three UI decluttering commits in a row are a fair record of how long it took to
get the portrait HUD readable.

### 2026-09-02. World building and rendering (35 commits)
The largest day by commit count and almost entirely 3D. Prompted: procedural math
textures and normal maps, an anime cel water shader with animated Voronoi caustics
and FBM flow distortion, a hand-authored Lübeck map with an enclosed canal moat and
bridges, a 360° countryside horizon with rolling hills and forest groves, a medieval
rampart wall with watchtowers, and **A\* grid pathfinding** for the courier and
roaming NPCs.

This day is the clearest illustration of the human role being *playtest reporting*.
A run of commits, `buildings facing the wrong way`, `west edge buildings must face
east`, `north mainland buildings face south`, `enforce inward rotation for outer
border buildings`, are all one observation ("the houses have their backs to the
street") narrowed down over several prompts. Likewise a chain of collision fixes
after `StaticGeometryGenerator.generate()` turned out to return a `BufferGeometry`
directly rather than what the first implementation assumed.

Locked **D7**: no audio assets ship. (Amended 2026-09-07 when music was added, see the correction in the final session.)

### 2026-09-03 to 2026-09-04. Story into playable Act One (10 commits)
Prompted the conversion of the written story into actual scene flow, deliberately
"in chunks" rather than one pass. Interior diorama rooms now get their own camera
transition for the WG buzzer, the pizzeria and the Mülltrennung beat. Two commits
this day are pure hand fixes: missing brackets from the modal injections, and a
Pizzeria crash. The first draft of the British-deadpan voice landed here.

### 2026-09-05. Character rendering and atmosphere
Fixed a real bug the agent diagnosed from a screenshot: cloned `SkinnedMesh`
instances collapsed into crushed polygons, needing manual bone and skeleton
rebinding at clone time. Also found a **shadowing** bug, duplicate
`setupAtmosphere` / `updateAtmosphericTime` definitions meant the environment
controller received empty arrays, silently freezing every nature animation. Cloud
density went 6 to 30 to fill an empty sky over the starting station. The End of Day
modal was rewritten from a monospace terminal look into the game's own chunky
navy-and-white aesthetic.

### 2026-09-06. Honesty pass on the docs
Locked **D9**. Went through every judge-facing document and removed each
advertised-but-hollow system: the language-learning framing, spaced repetition, the
vocabulary dictionary and quiz, and all audio claims. Also fixed `pocketNotepad`,
which had been listed as one of the five upgrades while being ungated with a button
that never rendered, an upgrade that did not exist. Character-name collisions
resolved. `DESIGN_INTENT_DOC.md` rewritten to 491 words.

### 2026-09-07. Progression blockers and the day-boundary ritual
Background music and UI updates, then a progression blocker and unskippable
narration fixed. Added the day-boundary ritual, the letter round and the companion
walk. **Cut this session:** the Expat Adaptation skill tree, built on 2026-09-01.
It was a menu of numbers the player could not feel, exactly the trap the category
guidance names, so **D9** applied and it was deleted rather than tuned.

### 2026-09-08. Correctness, then presentation (17 commits)

*Ledger correctness.* Closed the receipt/day-boundary contract: `finishShift`
credits the wallet, advances the day and charges daily costs, and had no
settle-once guard, so a double-tap on the receipt button ran the entire settlement
twice. The guard is keyed on the payout object rather than a day+shift token,
because `finishShift` advances both values and a repeat call would mint a fresh
token and settle again, a mistake made, then caught by the new assertions before
it landed. Replaced the Day 1 Pfand inference with an explicit
`state.pfandCollected` counter; the receipt had derived city-walk income as
`wallet - STARTING_WALLET`, which silently reported zero the moment the player
bought anything, hiding money they had really earned. `build/verify.js` grew from
35 to 64 assertions, and **each new assertion was validated by restoring the bug
and confirming the suite fails.***A revert worth recording.* Prompted a judge fast-start so a reviewer could reach
the Shift 3 "aha" inside 90 seconds. The agent parameterised
`startFirstShift(startSceneId)` and pointed `?quickstart=1` at `shift_3_test`. It
was reverted the same day on review. Entering that scene also set
`state.currentShift = 3`, and `calculatePayout` reads `getShift(state.currentShift)`,
so a reviewer's opening frame was titled "WG Flat Party Surge" and paid from shift
3's table, base wage 19.00 against the documented 13.00, quota 32 against 23, contradicting every published figure. The design reason matters more than the
arithmetic: the Shift 3 aha *is* that purple means `das`, learned across stages 1
and 2. Dropped cold onto the hardest stage, a reviewer sees a rail pulse whose
meaning was never taught. It satisfied the stopwatch by bypassing the game.
`check-story` still reported the aha at 167s, unchanged. The parameterisation was
kept, the target was not, and **D8** was locked with six source-level assertions
pinning it, the old gate could not have caught this, because `verify.js`'s economy
test built its own state instead of going through `startFirstShift`.

*Repository hygiene.* Untracked 108 files, about 21 MB. The significant find was 81
unused pronunciation and NPC voice `.wav` files under `build/tmp_audio/`: the
shipped build never referenced them, but they contradicted the "no voice acting"
claim for anyone who opened the tree. `.gitignore` was rewritten as valid UTF-8, its last two entries were stored as UTF-16 with interleaved null bytes and
therefore matched nothing.

*Presentation.* Camera and art work driven by playtest screenshots: building
occlusion fade at real distances, the day/night cycle tied to the story clock, the
title diorama lit from the game's own palette, a civilian model for Nico plus six
invisible NPCs un-hidden, seasonal variety restored, clouds placed as sky, the
Sobel ink outline made opt-in, HUD feedback when the day, wallet or documents
change, and navigation objectives that state both where to go and how far.

*A false claim caught during a cleanup pass.* Every judge-facing document stated
"no audio assets ship". That was true when **D7** was locked on 2026-09-02, and it
stopped being true on 2026-09-07 when a background music track was added, the docs
were never updated, so the claim stood false for a day. `assemble.js` embeds
`assets/Music/bgMusic.mp3` as a 1.28 MB `data:audio/mpeg` URI and the runtime reads
`window.FFH.musicDataUri` first, falling back to the relative path only in dev. The
packaging is therefore correct, nothing is fetched at runtime, but the claim was
not. Corrected in `DESIGN_INTENT_DOC`, this log and the checklist to: one music
track ships embedded, every sound effect is runtime oscillator synthesis, and the
game is fully playable muted. Worth recording because the checklist had an explicit
note telling future sessions not to let the no-audio claim drift, and it drifted in
the direction the note did not anticipate.

*Submission packaging.* Added `build/package.js`, which derives the vendor list
from `index.html` itself, refuses to build if any `http(s)://` or `//` reference is
present, stages a clean tree so no logs or `node_modules` can leak in, zips from
inside the stage directory so `index.html` lands at the top level, and then
verifies the artefact it just produced rather than trusting the zip step.

```bash
node build/package.js
```

Result: `dist/far-from-home-kruma-express.zip`, **3.45 MB** against the 35 MB
limit, `index.html` at the top level, 11 libraries under `vendor/`, zero external
URL references. Extracted to a clean directory and served over HTTP, the build
boots to the title screen with **no console errors** and a network log containing
only `localhost` and `blob:` entries, no external request of any kind.

### 2026-09-08 (later), documentation consolidation

Not a gameplay change, recorded because it altered what the submission claims.

*The narrative record.* Wrote `Docs/THE_MAKING_OF.md`: where the project came from
(the earlier *Kruma* pitch, a 2D sanctuary sim whose core mechanic was **speaking
German into a microphone**, backed by a cloud LLM moving to an on-device Llama 3 8B /
Gemma 2 2B via ExecuTorch), why that could not survive this competition's packaging
rules, and what the pivot kept. The constraint collision is arithmetic, not taste:
speech needs a server (banned by the no-network rule) or a local model (banned by the
35 MB budget). This project has a first-hand measurement of the gap, the local
**text-to-speech** stack installed for the submission video weighed **496 MB** (`onnxruntime-node` 208 MB, `@huggingface/transformers` 136 MB, `onnxruntime-web`
91 MB, `kokoro-js` 29 MB), more than 14× the whole game budget for the easier half of
the problem, against a finished submission of 3.45 MB.

The document also traces how `GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md`, compiled as
*background* for the voice game, turned out to describe a dependency graph with a
timer on it, and became the dossier chain and the `DAY n/28` counter unchanged.

*Fresh screenshots.* The previous set (2026-08-26) was archived rather than kept: it
showed the pick checklist German-first, contradicting the English-first pillar. New
in-engine captures were taken from the shipped build at `?season=summer` by calling
`renderer.render()` and `canvas.toDataURL()` in the same synchronous block, the
renderer runs `preserveDrawingBuffer: false`, so a capture taken any later returns
blank. Documented limitation: these are canvas-only and therefore carry **no DOM
HUD**, so judged surfaces that need the HUD still want an OS-level capture.

*Consolidation.* The 876 line task list, the development log and
`Docs/archive/` were archived out of the repo, this Build Log supersedes the first
two, and the `ffh-build-log` skill was repointed here so future sessions append to
the live deliverable. Open items now live in one place: `SUBMISSION_CHECKLIST.md` §4.
Every dangling cross-reference left behind was repaired, and a link check across all
of `Docs/**` now resolves clean.

*Two accuracy fixes found by doing this.*
1. The false "no audio ships" claim was corrected in all eleven files that carried
   it, plus two skill definitions that would have re-enforced it on future agents.
2. `ONE_PAGE_DESIGN_DOCUMENT.md` published a payout formula with a **€15 base wage**.
   The real value is `baseWage = 10 + 3 × shift` (`src/data/shifts.js:73`), so shift 1
   pays **€13.00**. `CANONICAL_NUMBERS.md` had never listed the wage formula at all, the gap is why the wrong number survived. It is now pinned there.

*A gate that was weaker than it looked.* `verify.js`'s canonical-size assertion
matched `/\*\*([\d.]+) MB\*\*/`, **the first bold megabyte figure anywhere in the
file**, so adding the new submission-zip row above it silently retargeted the check
at the wrong number. Re-anchored on the row label, and extended with two assertions
pinning the zipped size and the 35 MB limit. Suite 109 to **111**, and the new
assertions were validated the usual way: the zip figure was falsified and the suite
confirmed failing before it was restored.

### 2026-09-08 (later still), the pacing position, stated properly

*Decision.* The 90-second guideline is **deliberately not applied**, and every file
that treated it as a target was updated to say so. This is a slow-burn narrative sim:
the Lübeck arrival establishes the thesis rather than delaying it, and compressing it
turns the pick loop into colour-matching with nothing at stake. The metric the genre
is accountable to is met, **first interactive scene at 10 s**, WG buzzer at 18 s, no
menu wall, no unskippable cutscene. What takes 167 s is not "time until the game
starts"; it is time until one *specific* payoff, and that payoff only exists because
stages 1 and 2 teach it wordlessly first.

The evidence for the position is the revert recorded above: pointing `?quickstart=1`
at Shift 3 hit the stopwatch exactly and produced a worse experience. Optimising for
the metric made the game worse, which is the strongest available argument that the
metric is the wrong instrument here.

Updated accordingly: `CLAUDE.md` rule 4, `AGENTS.md` §3 (which had read "if the player
cannot reach Shift 3 within 90 seconds, the pacing is broken and must be tuned", now
explicitly withdrawn, with standing instructions not to retune durations, not to
repoint quickstart, and to preserve the 0.0/1.5/2.5 ramp), `CANONICAL_NUMBERS.md` §5,
`STORY_FORMAT.md` §9, the `ffh-playtest-gate` skill, the `story.json` pacing note and
`rule_source`, and `check-story.js`, which now prints "over budget BY DESIGN" plus the
time to first interactive scene so the over-budget figure is never the only number a
reader sees. `budget_s` stays at 90 deliberately, it is kept as a measuring
instrument, not a goal, and nothing was retuned to make it pass.

*A false claim in a generated document.* `Docs/generated/GAMEPLAY_MANIFEST.md` asserted
**"Budget 90s. Actual: 87s -- PASS"**. That was wrong in a judge-facing file. Root
cause: `build/narrative_manifest.js` reads `assets/narrative/story.ink`, which was
retired when the narrative moved to `story.json`, so the generator has been exiting
early with `CRITICAL: assets/narrative/story.ink not found` and the manifest has been
**frozen since 2026-09-05** while silently reading as current. Both generated manifests
now carry a prominent frozen notice naming the cause and pointing at
`node build/check-story.js` as the live check, and the false PASS line is corrected.
Repointing the generator at `story.json` is left as follow-up work.

*New guard.* Added an assertion that no judge-facing document may claim a pacing PASS
while `story.json`'s own `aha_cumulative_s` exceeds `budget_s`. Validated by restoring
the false line and confirming the suite fails. Suite 111 to **112**.

*Local paths removed.* Every absolute local path reference was stripped from the docs, those resolve to nothing for anyone who clones the repository. The archive is now
described as "a private local archive" without a path. Also removed the hardcoded
hardcoded MCP project name from `CLAUDE.md` and `AGENTS.md`, replaced with
instructions to derive it from the reader's own checkout; it leaked a username and
would have been wrong for every other clone.

### 2026-09-08 (final) documentation rewrite

The documents were accurate but read like they were written by a machine: heavy with
em dashes, dense clauses and jargon. This pass rewrote them in plain language, removed
every em dash and every decorative emoji, and added real diagrams.

*Rewritten from scratch.* `TECHNICAL_REFERENCE.md`, `ONE_PAGE_DESIGN_DOCUMENT.md`,
`Docs/README.md`, `THE_MAKING_OF.md` and `DESIGN_INTENT_DOC.md`. Mermaid diagrams
replaced the ASCII art: a layer diagram and a phase state machine in the technical
reference, the gameplay loop and the paperwork chain in the one pager and the making of.

*Two documents were wrong about the code, which is why they were rewritten rather than
tidied.*

1. `TECHNICAL_REFERENCE.md` documented `src/core/grammarEngine.js` in full, including a
   section on the rules it codified. **That file does not exist.** It was the one with
   no callers, deleted earlier, and the document described it for weeks afterwards. The
   phase diagram was also missing `INTERIOR`, which is a real registered phase.
2. `STORY_FORMAT.md` section 12 warned that Act One was a storyboard the game only
   loosely followed, because `BRITISH_BEAT_MAP` intercepted ten scene ids before they
   rendered. That map is now `{}` and `handleBritishSpecialBeats` returns `false`
   immediately, so nothing is intercepted and every scene renders from `story.json`.
   The warning was withdrawn. Four cast members present in the data
   (`NPC_ANKE`, `NPC_LINDEMANN`, `NPC_PIZZERIA_OWNER`, `NPC_YUSRA`) were undocumented
   and are now listed.

`ONE_PAGE_DESIGN_DOCUMENT.md` also published a payout formula with a 15 euro base wage
against the real `10 + 3 x shift`, and embedded a poster image that was never
committed. Both fixed.

*Moved out of the repo.* The programming guide (its useful half is now in the technical
reference), and the video script and voice over transcript, which belong with the
retired video pipeline.

*`.gitignore` rewritten.* Most of it referred to things that no longer exist: the video
workspace, the graft cache, the temporary audio folder, the deleted voice sprite
generator, the old `.agents` directory, `Docs/archive`. Every remaining rule was
checked in both directions with `git check-ignore`, confirming that nothing needed is
ignored and that everything intended to be ignored is.

*Mistakes made during this pass, since they are instructive.* A bulk cleanup regex
`\|\s+\|` was intended to tidy empty table cells. `\s` matches newlines, so it
collapsed every markdown table in thirteen files onto a single line. A second rule
collapsing `\.\s*\.` turned every `../` relative link into `./`, breaking the links
out of `Docs/submission/`. A third ate the space after list bullets. All three were
caught by a structural markdown check written afterwards (balanced code fences, heading
spacing, consistent table column counts) plus the existing link checker, and all were
repaired. The lesson: `\s` is not "spaces", and bulk regex over markdown needs a
structural check run straight after it.

### 2026-09-08 (fix) the title screen sound button

Reported as behaving oddly, and it was: **on a fresh load the music was already
playing while the button showed a crossed out speaker reading "Tap to enable sound".**
Pressing it changed nothing you could hear, it only corrected the icon, so muting the
title screen actually took two presses.

Measured in the browser before touching anything:

| | label shown | muted | playing | audible |
| :--- | :--- | :--- | :--- | :--- |
| on load | Tap to enable sound | false | **true** | **true** |
| after press 1 | Sound on | false | true | true |
| after press 2 | Tap to enable sound | true | true | false |

Press 1 moves nothing in the last three columns. That is the whole bug.

*Cause.* The handler kept its own `soundEnabled` flag, initialised once while the boot
screen was being built. At that moment the track has not started, so
`isMusicPlaying()` returned false. The update function only assigned the flag in two
cases, muted or playing-and-unmuted, and unmuted-and-not-yet-playing fell through both,
leaving the flag false. Autoplay then started the track a moment later and nothing
re-rendered the button, so the icon stayed wrong for the life of the title screen.

*Fix.* The state is now derived from the audio every time it is drawn, never
remembered. `soundIsOn()` returns false if either mute flag is set, otherwise reports
whether the element is actually playing, so unmuted-but-silent (a browser that blocked
autoplay) correctly still reads as off and the first press starts the track. The click
handler asks the same function, so one press always means one change. `play`, `pause`,
`ended` and `volumechange` on the music element now trigger a re-render, with a few
bounded re-checks after boot to catch autoplay landing late. No permanent timer.

*Verified in the browser*, not just reasoned about. On load the button reads "Sound on"
and matches what is audible. Three presses give off, on, off, one change each. The
autoplay-blocked case was simulated by pausing the element while unmuted: the button
reads "Tap to enable sound" and a single press starts the music. Console clean.

*Four assertions added*, pinning that the button derives its state, keeps no cached
flag, binds the element's play and pause events, and decides from the live state.
Validated by restoring the cached flag and confirming the suite fails. Suite 112 to
**116**.

---

## Tooling notes for future sessions

- **The code graph does not model this codebase's `window.FFH.x = function`
  pattern.** `src/core/economy.js` yields only File and Module nodes, and symbol
  searches for its functions return nothing. Direct file reads are the correct
  fallback for `src/core/**` until the indexer handles namespace assignment.
- **Text search has repeatedly reported this codebase as fine when it was not.** `hideDialogueBox` was called in two places and defined in none; `playSfx('wrong')`
  had six call sites and no implementation; `grammarEngine.js` had zero callers and
  still shipped. Grep finds strings; the missing edge needs the graph.
- `build/assemble.js` fails the build if `index.dev.html` and the release module
  list diverge, so dev/release parity is not a manual check.

## Known open at time of submission

1. **The 90-second guideline is deliberately not applied.** `check-story` reports the
   Shift 3 aha at 167s against a 90s budget, and that is a design decision, not a
   gap: this is a slow-burn narrative sim, and compressing the Lübeck arrival to suit
   a stopwatch makes the pick loop a colour-matching game with nothing at stake. The
   metric that fits the genre is met, first interactive scene at **10s**, WG buzzer
   at 18s, no menu wall. The alternative was tested and reverted (see **D8** and the
   quickstart entry above), which is the evidence for the position rather than an
   excuse for it. Full reasoning: `Docs/THE_MAKING_OF.md` §10. The figure is still
   measured and printed by `check-story.js`, never retuned to pass.
2. Screenshots were re-shot from the shipped build on 2026-09-08 and the stale
   2026-08-26 set archived. The new captures are canvas-only and therefore carry no
   DOM HUD, judged surfaces that need the HUD visible still want an OS-level capture
   at 390×844.
3. The gameplay video is not started. Its old script and voice over transcript were
   archived along with the retired video pipeline.
