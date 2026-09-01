# Meta Horizon Creator Competition (MHCP) — Hard Hackathon Rules for Agents

> **Governing Links**:
> - [Hackathon Overview](https://mhcp-game-prototype.devpost.com/)
> - [Design Guidance](https://mhcp-game-prototype.devpost.com/details/design-guidance)
> - [Rules & Eligibility](https://mhcp-game-prototype.devpost.com/rules)
> - [Forum Topics & Q&A](https://mhcp-game-prototype.devpost.com/forum_topics)
>
> **Master Game Design Authority**: `Docs/README_HACKATHON.md`  
> **Master Execution Plan**: `Docs/ONE_WEEK_MASTER_PLAN.md`  
> **Submission Deliverables Folder**: `Docs/submission/`

Every AI agent (Antigravity, Claude Code, Gemini CLI, subagents) working in this repository **MUST STRICTLY ENFORCE** the following hard rules at all times.

---

## 1. Technical & Packaging Hard Constraints (Non-Negotiable)

1. **Strict 35 MB Limit**: The final uncompressed submission zip must be `≤ 35 MB`. The single-file `index.html` must remain lightweight (currently ~5.7 MB uncompressed, ~1.8 MB zipped).
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
| **Originality** | **10%** | Double down on the signature mechanic: *German grammar (`der/die/das`) as a spatial search filter*. |

### 🚨 Critical Anti-Patterns & Prohibitions
- **DO NOT waste time on visual over-engineering**: The official rules state: *"Visual polish is deliberately not scored; the floor is legibility."* Never spend hours tweaking shaders if core loop, upgrades, or pacing need work.
- **DO NOT build open-world sprawl**: City exploration must remain a fast, snappy interactive diorama hub—not a 5-minute walking maze that delays reaching shifts.
- **DO NOT hallucinate out-of-scope systems**: No multiplayer, no space colonies, no complex calendar chains.

---

## 3. The 90-Second Golden Pacing Rule

The game's signature pedagogical breakthrough must be experienced by judges in under 90 seconds:
- **Shift 1 (TEACH - 0.0s delay)**: Audio + icon together. Shows *der* (Blue ▲), *die* (Pink ●), *das* (Purple ■).
- **Shift 2 (ANTICIPATE - 1.5s delay)**: Audio first. Guessing by shelf color tier pays a **2.0× Early Bonus**.
- **Shift 3 (TEST - 2.5s delay)**: Pure audio recognition. The player picks by listening alone.

**If the player cannot reach Shift 3 within 90 seconds, the pacing is broken and must be tuned.**

---

## 4. Special Award Targets ($15K Each)

1. **Most Innovative ($15K)**:
   - The *der/die/das* 3-tier spatial search filter cutting warehouse picking time by 66%.
2. **Most Satisfying Progression ($15K)**:
   - The €20 ➔ €250 tuition goal curve where every shop upgrade (**E-Bike**, **Thermal Bag**, **Shelf Labels**, **Vocab Notepad**, **Flashcards**) has an immediate, unmistakable mechanical and visual impact.

---

## 5. Submission Artifacts & `Docs/submission/` Maintenance

All agents must actively maintain and keep the submission package in sync with codebase changes:
1. **Design Intent Document (`Docs/submission/DESIGN_INTENT_DOC.md`)**: Must remain strictly **≤ 500 words** at all times.
2. **Devpost Form Answers (`Docs/submission/DEVPOST_SUBMISSION_FORM.md`)**: Must reflect the current game features accurately.
3. **Video Storyboard (`Docs/submission/VIDEO_SCRIPT_AND_STORYBOARD.md`)**: Must match the actual playable flow.
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

## 8. MCP Graph & Token Efficiency Standard

1. **Prefer `codebase-memory-mcp` Over Full-File Dumps**:
   - Always prioritize MCP knowledge graph queries (`search_graph`, `get_code_snippet`, `trace_path`) for targeted code discovery to minimize token overhead.
   - Avoid reading giant files repeatedly when surgical line-range reads or symbol lookups suffice.
2. **Lean, Focused Edits**:
   - Perform surgical changes via targeted chunk replacements.
   - Keep context windows clean and token consumption minimal.

