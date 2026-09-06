# Meta Horizon Creator Competition (MHCP) — Hard Hackathon Rules for Agents

> **Governing Links**:
> - [Hackathon Overview](https://mhcp-game-prototype.devpost.com/)
> - [Design Guidance](https://mhcp-game-prototype.devpost.com/details/design-guidance)
> - [Rules & Eligibility](https://mhcp-game-prototype.devpost.com/rules)
> - [Forum Topics & Q&A](https://mhcp-game-prototype.devpost.com/forum_topics)
>
> **Master Game Design Authority**: `Docs/README_HACKATHON.md`  
> **Task List**: `Docs/TASKS.md`  
> **Canonical Numbers**: `Docs/CANONICAL_NUMBERS.md`  
> **Documentation Map**: `Docs/README.md`  
> **Submission Deliverables Folder**: `Docs/submission/`

Every AI agent (Antigravity, Claude Code, Gemini CLI, subagents) working in this repository **MUST STRICTLY ENFORCE** the following hard rules at all times.

---

## 1. Technical & Packaging Hard Constraints (Non-Negotiable)

1. **Strict 35 MB Limit**: The final uncompressed submission zip must be `≤ 35 MB`. Never quote a size from memory — run `node build/check-size.js` and see [`Docs/CANONICAL_NUMBERS.md`](Docs/CANONICAL_NUMBERS.md).
2. **100% Offline Airgap**:
   - **Zero external network requests.** No CDNs, no Google Fonts, no remote audio or image assets, no external API calls.
   - All Three.js libraries and vendor code must live in `vendor/` or be inlined.
3. **Single-File Entry Point**:
   - The game must build via `node build/assemble.js` to a single unminified `index.html` at the repository root.
4. **Fixed Mobile Portrait Viewport**:
   - Resolution is locked to `390×844` portrait with responsive centering. No landscape orientation.

---

## 2. Rubric & Design Guidance Enforcement

| Rubric Category | Weight | Hard Operating Rule for Agents |
| :--- | :---: | :--- |
| **Player Engagement** | **30%** | The game must be instantly fun, intuitive, and satisfying within the first 15 seconds. |
| **Playability** | **25%** | Zero blocking bugs, zero uncaught exceptions. Controls must be single-thumb touch/pointer friendly. |
| **Core Loop Design** | **20%** | **Invest ➔ Harvest ➔ Upgrade ➔ Observe Growth.** The economy must be the driving engine. |
| **Focus** | **15%** | **Depth is rewarded. Sprawl is heavily penalized.** Never build disconnected half-systems. |
| **Originality** | **10%** | Double down on the single thesis: *British deadpan comedy colliding with German municipal precision*, expressed through the `der/die/das` three-tier shelf gag. |

### 🚨 Critical Anti-Patterns & Prohibitions
- **DO NOT waste time on visual over-engineering**: The official rules state: *"Visual polish is deliberately not scored; the floor is legibility."* Never spend hours tweaking shaders if core loop, upgrades, or pacing need work.
- **DO NOT build open-world sprawl**: City exploration must remain a fast, snappy interactive diorama hub—not a 5-minute walking maze that delays reaching shifts.
- **DO NOT hallucinate out-of-scope systems**: No multiplayer, no space colonies, no complex calendar chains.
- **DO NOT reintroduce removed claims or systems** (see §3.1). This is the most common failure mode for agents working from stale context.

---

## 3. The 90-Second Golden Pacing Rule

*Far From Home: Kruma Express* is a **narrative courier-management sim**. Its single thesis is
**British deadpan comedy colliding with German municipal precision**. It is **not** a
language-learning game and makes **no pedagogical claim**. Judges must feel the joke land in
under 90 seconds:

- **Shift 1 (0.0s icon delay)**: Rail pulse and item icon arrive together. Klaus explains, deadpan, that an apple is a boy and a banana is a girl, and that the warehouse is therefore filed by gender.
- **Shift 2 (1.5s icon delay)**: The gender rail **pulses first**. Reading the pulse and tapping that tier before the icon resolves pays a **2.0× Early Pick** bonus.
- **Shift 3+ (2.5s icon delay)**: The rail pulse is the whole cue. The player is now filing groceries by grammatical gender at speed and finds this funny.

The cue is **visual, never audio**. Tiers are read by colour and symbol —
Bottom = `der` = Blue `#3A86FF` ▲ · Middle = `die` = Pink `#FF006E` ● · Top = `das` = Purple `#8338EC` ■.
Items are labelled **English-first**; the player never needs to know German.

**If the player cannot reach Shift 3 within 90 seconds, the pacing is broken and must be tuned.**

### 3.1 🚫 Permanently Removed — Never Reintroduce These Claims

The following were removed from the build on 2026-09-06. No agent may describe them as
existing, restore them in docs, or rebuild them without an explicit human instruction:

1. **All recorded audio / voice acting.** There has never been any. Every sound is synthesised
   at runtime from oscillators: SFX (`src/audio/sfx.js`) plus pitched per-character talk-blips
   (`src/audio/speech.js`). `src/data/voiceSprites.js` is **deleted**;
   `speakKey()` / `speakGermanText()` are **deleted**. Banned phrases: *studio voice acting,
   voiced NPCs, pre-baked voice sprites, audio-first, 12 Grocery Nouns, spoken German,
   🔊 pronunciation preview, listening test*.
2. **Spaced repetition / Leitner boxes.** `SpacedRepetition` is **deleted** from `src/data/items.js`.
3. **Vocabulary dictionary + self-quiz modal.** Deleted from `src/ui/screens/hudDictionary.js`,
   which now contains only `showSkillTreeModal`.
4. **Vocab Notebook HUD button.** Deleted from `src/ui/hud.js`.
5. **Any framing of the game as educational, pedagogical, or language-learning.** German text in
   dialogue (Beamtendeutsch, *"NEIN! Ruhezeit!"*, *Sie*/*Du* etiquette) stays — it is comedy
   flavour. Never call it teaching.
6. **The skill tree is not a headline system.** Six of its nine effects are dead writes. The code
   stays; the claim goes. Keep it out of every judge-facing feature list.

**Rule of thumb: if you are unsure whether something exists in the build, cut the claim.**

## 4. Special Award Targets ($15K Each)

1. **Most Innovative ($15K)**:
   - The *der/die/das* 3-tier spatial shelf: a real German grammatical absurdity turned into a colour-and-symbol search filter, played entirely for the joke.
2. **Most Satisfying Progression ($15K)**:
   - The €20 ➔ €250 tuition goal curve where every one of the 5 shop upgrades (**E-Bike** €45, **Thermal Bag** €50, **Shelf Labels** €25, **Pocket Notepad** €20, **Shift Rota Cards** €35) has an immediate, unmistakable mechanical and visual impact. Use these exact names — the catalogue lives in `src/data/shop.js`.

---

## 5. Submission Artifacts & `Docs/submission/` Maintenance

All agents must actively maintain and keep the submission package in sync with codebase changes:
1. **Design Intent Document (`Docs/submission/DESIGN_INTENT_DOC.md`)**: Must remain strictly **≤ 500 words** at all times.
2. **Devpost Form Answers (`Docs/submission/DEVPOST_SUBMISSION_FORM.md`)**: Must reflect the current game features accurately.
3. **Video Storyboard (`Docs/submission/VIDEO_SCRIPT_AND_STORYBOARD.md`)**: Must match the actual playable flow and must be shootable from the current build. No narration may claim audio, voice acting, or learning outcomes (see §3.1).
4. **Submission Checklist (`Docs/submission/SUBMISSION_CHECKLIST.md`)**: Must be verified before declaring the build submission-ready.

---

## 6. Playtest & Build Verification Gate

Before claiming any task is complete or preparing a commit:
1. Run `node build/assemble.js` and ensure it exits cleanly with code 0.
2. Run `node build/check-size.js` and verify bundle size is `< 35 MB`.
3. Verify that the loop executes end-to-end:
   `Boot ➔ Hub ➔ Shift ➔ Ride ➔ Doorway ➔ Debrief Receipt ➔ Bike Shop ➔ Next Shift ➔ Win / Lose`.

---

## 7. Strict Resource Reuse & Folder Discovery Protocol (Zero Waste)

1. **Mandatory Folder Audit Before Creation**:
   - **Never create new files, textures, geometry, or systems from scratch if they already exist in the repository.**
   - All agents MUST search existing project directories (`src/`, `vendor/`, `Docs/`, `Tools/`) and reuse existing assets, shaders, modules, and data models first.
   - Only create a new asset or file when the requested capability strictly does not exist in the repository.
2. **Leveraging the `Tools/` Directory**:
   - For 3D geometry, procedural generation, and visual pipelines, agents must inspect and utilize utilities located in `Tools/` (e.g. `Threejs-Awesome-Graphics-Agent-Skills`, `threejs-game-skills`, `webgpu-claude-skill`).

---

## 8. Mandatory 4-Tool Token Optimization Protocol (Strict Enforcement)

Every agent MUST actively use the four integrated token-optimization systems to minimize context overhead:

1. **`prometheus` (Durable Epistemic Memory & Lesson Recall)**:
   - **MANDATORY**: At the start of ANY task, call `memory_recall` with task keywords to check for existing decisions and architectural rules.
   - **MANDATORY**: At task completion or whenever an architectural rule/bug fix is solved, call `memory_store` with `project: "FarFromHome"`.
   - Never re-explore or guess known decisions.

2. **`codebase-memory-mcp` (Structural Knowledge Graph)**:
   - **MANDATORY**: Use `search_graph`, `trace_path`, and `get_code_snippet` FIRST for code queries.
   - NEVER dump or read full source files to discover functions or call chains.
   - Run `trace_path` before modifying signatures to inspect all callers.

3. **`graft` (Zero-LLM Wiring, Skeletons & Blast Radius)**:
   - **MANDATORY**: Use `graft skeleton <file>` when examining API interfaces.
   - Use `graft callers <symbol>` and `graft blast` to check dependencies and blast radius at zero token cost.
   - Use `graft map` for high-level repository structure.

4. **`headroom` (Context Compression & Retrieval Layer)**:
   - **MANDATORY**: When receiving or processing large tool outputs, test logs, or massive JSON (>100 lines), run `headroom_compress` to compress into a hash marker.
   - Call `headroom_retrieve` on demand only when full details are required.
   - Check `headroom_stats` to verify context reduction.

5. **Strict File Prohibitions & Surgical Changes**:
   - **ABSOLUTELY FORBIDDEN**: Never read, grep, or dump `index.html` (11.5 MB inlined release bundle). Always inspect modular files in `src/` or `index.dev.html`.
   - Touch only code strictly required for the prompt. Keep diffs minimal and surgical.

---

## 9. Scope Hygiene & Runtime Variable Guardrails (Zero Uncaught References)

To prevent runtime errors like `Uncaught ReferenceError: <var> is not defined` inside per-frame render loops (`update()` / `requestAnimationFrame`):
1. **No Out-of-Scope Variable Relocation**:
   - Never move a declaration into an `if` block if downstream sibling blocks or downstream statements rely on that variable.
   - Keep shared phase references (`sr`, `s`, `Stages`, `curStage`, `targetMesh`, `activePoiKey`) scoped at function-level top before conditional branches.
2. **Mandatory Post-Edit Node Script Validation**:
   - Before running `build/assemble.js`, run validation scripts (e.g. `node -c <file>` or `node -e "new (require('vm').Script)(fs.readFileSync('<file>','utf8'))"`) on every modified `.js` file to detect structural errors immediately.
3. **Loop & Per-Frame Blast Radius Audit**:
   - For edits inside per-frame `update(delta)` loops, inspect all references down to the end of the method to ensure no hoisted identifiers were shadowed or scoped away.

---

## Narrative edits

`assets/narrative/story.json` is the single source of truth for prose, branching,
economy deltas, unlocks and pacing. **Read [`Docs/STORY_FORMAT.md`](Docs/STORY_FORMAT.md)
before editing it**, and run:

```bash
node build/check-story.js
```

It fails the build on reintroduced audio/vocabulary claims, dangling scene targets,
dead UI unlocks, backwards Act I timestamps and terminal scenes with no outcome.
