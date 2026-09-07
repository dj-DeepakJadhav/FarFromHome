# Task List

> **This is the only task list.** The three older lists it replaced
> (`MASTER_TASK_LIST`, `MASTER_POLISH_TASK_LIST`, `ONE_WEEK_MASTER_PLAN`) were
> deleted on 2026-09-07: they disagreed with each other and with the code.
> Recover from git history if ever needed.
>
> **Deadline: 8 September 2026, 1:00 PM PDT.**
>
> Status here was verified against `src/` and a running build on 2026-09-06.
> Do not tick a box from intent. Tick it from a check you actually ran, and say
> how you checked.

---

## 🤝 HANDOFF — read this first if you are picking up cold

> Written 2026-09-07 for whoever continues this. Everything below is a thing
> that has already bitten someone. Read it before editing `src/`.

### Where we are
Phases **A and B are complete** (see the Operator Checklist below).
Next up: **Phase C** (characters/assets, owned by DJ) and **Phase D** (juice).
Scope is **Acts I and II only**. Acts III to V are explicitly out of scope.

### Use the code graph, not grep
`codebase-memory-mcp` first for any code exploration; project name is
`Users-gestigon-Documents-DJ-FarFromHome`. Re-index after every commit, because
the graph pins to a SHA and a stale graph answers confidently about code that has
changed. Full protocol in `CLAUDE.md`. Grep is for Markdown, JSON and build
scripts only.

### Agents do not touch 3D art
Models, rigs, animations, materials, textures and colour grading belong to DJ.
Log art problems in Phase C and move on. See the OWNERSHIP RULE section.

### Verify before and after every change
```bash
node build/verify.js        # 24 assertions: data/code agreement, style, economy
node build/check-story.js   # narrative graph: reachability + chronology
node build/assemble.js      # rebuild index.html from src/
node build/check-size.js    # 35 MB limit
```
`verify.js` is the important one. It exists because the same classes of bug kept
recurring: a manifest referencing an item id that does not exist, a `playSfx`
key with no implementation, docs quoting a build size from months ago. **If you
add a tunable or a hardcoded id, add an assertion for it.**

`assemble.js` inlines `src/**` and `story.json` into the single `index.html`.
**Editing `index.html` directly is always wrong** — it is a build artifact.

### House style for all player-facing text
Non-negotiable, set by DJ:
- **No dashes** (no em/en dashes as punctuation)
- **No emoji** in dialogue, narration or modals. Functional HUD icons are fine.
- **Short lines.** Hard cap 140 chars; aim for 40 to 80.
- **No strained imagery.** One good metaphor is charm; twelve reads as generated.
- **Plain setups before jokes.** The old draft put a punchline on every single
  line, which is the main reason it read as AI-written.
- Speaker prefix is short and consistent: `Nina:`, `Klaus:`, `Lokker:`, `Nico:`.
  `storyRunner` splits on the first `:` to find the speaker.

### Ownership rules — do not reintroduce these bugs
1. **The state machine owns HUD visibility and the scene backdrop.**
   `Game.syncHudVisibility()` and `Game.syncBackdrop()` in `main.js`. Phases
   used to hide `#hud` themselves (an element that does not exist) and only the
   city phase set `scene.background`, so rooms inherited the city's dusk sky as
   a flat pink field.
2. **`updatePersistentHUD` rebuilds its own innerHTML on every call.** Anything
   written directly into its child nodes is wiped on the next wallet change.
   Store it as UI state and render it (see `_objRange`, `_showSkip`).
3. **`currentPhase` holds the phase OBJECT.** Compare `currentPhaseName`, or use
   `storyRunner.phaseIs()`. Six guards were comparing the object to a string and
   were therefore always true.
4. **Interior vs exterior is declared, never inferred.** `stage.space` is
   `interior` / `exterior` / `threshold` on all 86 scenes. It used to be guessed
   by substring-matching the location name, which put Martha's bakery counter on
   the open street and hardcoded `NPC_NICO` into every room.
5. **A scene with no `cast` builds no NPC.** Speakerless scenes render as an
   overlay over the live scene. Without this, Nico stood in for the narrator at
   the canal and at the ending.
6. **Act I is ONE economic shift shown in three ramp stages.** `currentShift`
   stays 1 across `shift_1_teach` / `shift_2_anticipate` / `shift_3_test`, and
   it pays once at `shift_receipt`. The ramp comes from
   `scene.unlocks.ramp.icon_delay_s` (0 / 1.5 / 2.5), **not** from
   `currentShift`. Anything that keys difficulty off `currentShift` in Act I is
   wrong.
7. **`dailyCostsFor()` in `economy.js` is the single source for rent and food.**
   Both `finishShift` (which charges) and the receipt (which displays) call it,
   so the shown number and the charged number cannot drift.
8. **The rail pulse is the Aha cue.** `pickFeedback` flashes
   `rail.material.color` to white. The rail colour must live on the *material*,
   not baked into the texture, or the flash multiplies white by white and the
   entire anticipation mechanic silently disappears.

### Two entry points, and why
- `?quickstart=1` drops straight into Shift 1. **This is what goes in the
  submission link.** Do not put a "start at shift 1" button on the main menu; it
  asks a first-time player to choose without context and reads as showcasing.
- `Skip intro` is a row inside the HUD card, shown only during the prologue.

### Known-good baselines
- 86 scenes, all reachable, `check-story` clean
- `verify.js` 24/24
- `index.html` 12.91 MB of 35 MB
- 180s economy: 20.00 -> 57.85 -> 27.85 (labels) -> 79.75 -> 36.75 (Kaution),
  DOCS box 1 green

---

## 🎨 OWNERSHIP RULE — art is DJ's, code is the agent's

> **Agents do not touch 3D art. Ever.** This is a standing rule, not a preference.

**DJ owns (agents must not edit):**
- 3D models, meshes, rigs, skeletons, animations (`assets/Characters`, `assets/Food`,
  `assets/Props`, `src/data/characterGLB.js`, `src/data/objAssets.js`)
- Materials, textures, colour grading, lighting art direction
- Character look, proportions, placement in the scene as a *visual* judgement

**Agent owns:**
- All logic, story data, UI markup and CSS, HUD layout, economy, build tooling
- Wiring an asset up once DJ has made it (mapping, spawn, scale, position as a
  *functional* fix)

**When an agent hits an art problem: log it in Phase C below and move on.**
Do not attempt it, do not "improve" a model, do not tweak a texture. If a fix is
genuinely functional and not aesthetic (a mesh at the wrong Y so it floats, an id
that does not resolve), do it and say so explicitly in the report.

---

## 🌙 DAY-BOUNDARY RITUAL — built

Every day now ends the same way, in the same place:

```
work ends somewhere in the city
  -> objective flips to "Go home. It's late." with the beacon on B_WG
  -> the player walks home themselves (~20-30s, real navigation)
  -> in the room: the PAYSLIP opens, HUD suppressed behind it
  -> dismiss -> the room scene plays (Nico, the day's last thought)
  -> [Sleep.] -> night_tick: day +1, rent -8.00, body restored
  -> next day opens somewhere else
```

Tagged `unlocks.mechanic: 'day_end'` on `night_one_end` (day 1),
`act_two_end` (day 3) and `night_two_home` (day 2, fail path, new scene).

**Verified:** objective reads "Go home. It's late.", beacon targets B_WG,
payslip opens in the room with the HUD hidden, dismissal resumes the scene, and
Sleep moves day 1 -> 2 with wallet 20.00 -> 12.00.

### Why this mattered more than it looked
`DEBRIEF_RECEIPT` had exactly **one** caller, buried in `dialogueResidents.js`.
The itemised payslip (food, hostel bed, TAKE HOME, count-up) was **unreachable
in normal play**. Putting receipts in the room is what finally puts them on the
critical path.

### Bug found while wiring it
Mechanic dispatch lived inside `handleBlockingScene`, so any scene declaring a
mechanic while being `mode: 'overlay'` silently skipped it. `night_one_end` is
exactly that. Dispatch is now hoisted above the mode branch in `renderScene`,
because a mechanic is a property of the scene, not of how its text is presented.

---

## 🌿 THE DAY 2 BRANCH — spec for whoever builds the rest

> **Build scope is Days 1 to 3. Nothing beyond Day 3 ships.** Acts III to V
> remain in `story.json` but are out of scope; do not extend them.

### Shape
```
DAY 1  arrival -> Nico -> uni shut -> pizzeria rejects -> Martha gives the lead
       -> kruma_door (they are closing, come back) -> canal -> [night_tick]
DAY 2  nina_trial -> shift 1/2/3
         |
         +-- PASS -> shift_receipt (hired) -> act_two (Lokker wants 30)
         |            DAY 3: second shift -> pay Kaution -> DOCS box ticks
         |
         +-- FAIL -> trial_failed -> nico_setback -> nico_tour -> post_flyer
                      -> [night_tick] -> DAY 3: post_office (letter round)
                      -> rejoins act_two. Kruma stays open as the better job.
```

### Already authored and playing (verified 2026-09-07)
`trial_failed`, `nico_setback`, `nico_tour`, `post_flyer`, `post_office`.
All five route to the correct NPC, and the `post_flyer -> night_tick -> post_office`
tunnel correctly advances Day 2 to Day 3 and charges the 8 euro nightly rent.

### The fail gate
`window.FFH.recordShiftPerformance(state)` in `economy.js` runs at both shift
completion paths and sets `state.trialPassed`. The gate is
`TRIAL_MIN_PACKED_RATIO = 0.5`: you fail only by packing fewer than half the
order. **This is deliberate.** The branch is a rare, felt setback for someone who
barely engaged, not a punishment for being slow. Anyone playing the shift passes.
Routing is `shift_3_test.conditional_edges: trialPassed == false -> trial_failed`.

### BUILT ✅ — companion walk  (`unlocks.mechanic: 'companion_walk'`)
`nico_tour` currently plays as a stationary two-shot. It should be Nico physically
walking the player past `B_DOM`, `B_MARIEN` and `LM_MARKTPLATZ`
(`unlocks.tour_stops` already lists them).

**Implemented in `src/phases/city/cityCompanion.js`.** Nico spawns beside the
player, paths stop to stop with A*, waits when the player falls more than
`LEASH` (7.0) behind, and speaks one line per arrival. Verified: leash engages
when the player stands still and releases when they close within 7.0 units.
**The feel still needs DJ's eyes** — whether following him is pleasant is not
something a DOM assertion can answer. `SPEED`, `LEASH` and `ARRIVE_RADIUS` are
the three numbers to tune.

Historical note: `cityCitizens.js` already spawns agents with A* pathing,
building-collision avoidance and walk/idle animation, driven by
`createCitizenBehaviorTree()`. `createNPCMesh('NPC_NICO')` resolves through
`NPC_GLB_MAPPING` to `character-male-c`. What is missing is one behaviour mode,
roughly 60 to 80 lines:
1. Spawn Nico at `B_WG` rather than a random road tile
2. Path him stop to stop instead of wandering
3. **A leash: idle if the player falls more than N units behind.** This is the
   fiddly part and the one that decides whether it feels like a companion or a
   bug. It needs real playtesting, not a DOM assertion.
4. Fire a prose beat on arrival at each stop

*Why it is worth it:* the Dom and St Marys are described, modelled, and **never
visited on the main path**. This walk is the only thing in the game that shows
the city off.

### BUILT ✅ — letter round  (`unlocks.mechanic: 'letter_round'`)
**Implemented in `src/phases/city/cityLetterRound.js`.** Post job, Day 3 onward.
No pick phase: the verb is navigate and knock, against Kruma's sort at speed.
6 addresses, 150s, 4.00 EUR per letter delivered (24.00 for a full round, about
63% of a clean Kruma shift, and far worse per minute since it is a walk).
Addresses are deduped and labelled from grid position, so a round reads as
"Altbau 10-14, Dom zu Lubeck" rather than "A3, A3, A1".
Verified: 6 delivered, wallet 12.00 -> 36.00, reason 'complete'.
**Tuning is a playtest call** — the per-minute rate may feel punishing.
- Timed round, several addresses, paid **per letter delivered, not carried**
- Reuses the existing delivery beacon, door-finding and doorway handoff
- Flat rate, **no streak and no early-pick multiplier** (there is no sorting),
  around 65 to 70 percent of a Kruma shift
- Needs a loss condition (undelivered letters at time-out)

*Why the rates matter:* Kruma must stay clearly the better job so climbing back
to it is the player's own idea. The trial can be retried; the branch converges.

### Do not
- Do not make the fail branch a permanent fork. It rejoins.
- Do not give the letter round a sorting minigame; it would compete with the
  der/die/das shelf, which is the "Most Innovative" entry.
- Do not raise `TRIAL_MIN_PACKED_RATIO` without discussing it.

---

## 🗂️ OPERATOR CHECKLIST — phased to the target

> **How to read this.** Every item has an owner (**DJ** = you, **AG** = agent/me),
> an estimate, and a *verification step* so a box is ticked from a check that was
> actually run, not from intent. Phases are ordered by score impact per hour.
>
> **Scores are my judgement, not the judges'.** They are here to rank work, not to
> predict a result. `Build` = what someone playing the download experiences.
> `Video` = the 180-second cut, which is what most judges actually watch.
>
> | | Build | Video | First 90s |
> |---|---|---|---|
> | Session start | 5.5 | n/a | 3.0 |
> | **Now (Phase A done)** | **7.5** | — | **8.0** |
> | After Phase B | 8.0 | — | 8.5 |
> | After Phase C | 8.5 | 8.5 | 9.0 |
> | After Phase D | 9.0 | 9.0 | 9.0 |
> | After Phase E | 9.0 | **9.5** | 9.0 |
>
> **Honest ceiling: the build caps around 9.0 by the deadline.** Acts III to V are
> 51 scenes with 3 gameplay beats and will not be finished. The 9.5 lives in the
> video, where you control every frame. Do not spend Phase E hours on the build.

---

### PHASE A — Foundations ✅ COMPLETE
*Delivered: 5.5 → 7.5 build, 3.0 → 8.0 first-90s.*
Loop is legible, HUD exists, blockers cleared. Detail in the Video Sprint section below.

---

### PHASE B — Narrative & sequence ✅ COMPLETE  ·  **7.5 → 8.0**
*Why it scores: the 180-second cut is mostly Act I/II dialogue. Right now half of
it is in the old voice and one speaker is wrong.*

- [x] **B1. Act II dialogue rewrite** (AG, 1h). Lokker, the Kaution fork, `act_two_end`.
  Same rules as Act I: short lines, plain setups before jokes, no dashes, no emoji,
  no strained imagery. *Verify:* no string in Act II over 140 chars; read the
  Kaution fork aloud.
- [x] **B2. Empty-cast fallbacks** (AG, 30m). 11 blocking scenes have no cast and
  fall back to `NPC_NICO`, so Nico narrates the canal and the ending. Fix the two
  in the 180s cut first: `wg_buzzer`, `kruma_flyer`. *Verify:*
  `scenesById[id].cast.length > 0` for both, and `DIALOGUE.targetNpcKey` matches.
- [x] **B3. Shift-1 manifest shows all items** (AG, 45m). Currently reveals one
  line, so there is no lookahead and no planning. *Verify:* 3 rows visible on shift 1.
- [x] **B4. Dead code from the HUD migration** (AG, 30m). `playObjectiveRevealSequence`
  still animates `city-quest-text`, which no longer exists. `refreshStats` writes to
  removed `stat-val-body` / `stat-val-heart`. Harmless but misleading. *Verify:*
  no `getElementById` in `hud.js` returns null for an element the function needs.
- [x] **B5. Re-time a cold run** (AG, 20m). *Verify:* `node build/check-story.js`
  clean, and a stopwatch run to Shift 3 via `?quickstart=1`.

**Also fixed during Phase B (found, not planned):**
- `shift_3_test` declared item id `karton`, which does not exist, so the Aha
  shift silently ran 4 items instead of 5. Now `karotte`.
- The manifest reveal keyed off `currentShift`, which stays 1 through all three
  Act I ramp stages, so shifts 2 and 3 would have shown the full manifest and
  killed the anticipation. Now keys off the scene's real `icon_delay_s`.
- `playObjectiveRevealSequence` reduced 82 lines -> 12; it was animating three
  elements removed with the old city header bar.
- `showTutorialBanner` no longer hijacks the objective line.


---

### PHASE C — Art  ·  **DJ ONLY**  ·  **8.0 → 8.5** (unlocks Video 8.5)
*Every item below was observed in a real playtest this session. Agents log here;
they do not fix these.*

**3D / characters**
- [ ] **C1. NPC models for the 180s cast**: Nina, Klaus, Lokker, Martha, Mathias,
  Nico. All six resolve through `NPC_GLB_MAPPING` and spawn correctly — this is a
  *look* task, not a wiring task.
- [ ] **C2. T-posing / mis-rotated NPCs.** At least one NPC at the ZOB lies at an
  angle during the prologue. Seen in the arrival frames.
- [ ] **C3. Characters clipping set geometry.** Seen earlier with figures
  intersecting the warehouse shelf.
- [ ] **C4. Player reads as back-of-head** for the entire prologue. Consider a
  turn-to-camera on dialogue entry.

**3D / props**
- [ ] **C5. Stray model faces near the DAS rail** — small white and green slivers,
  most likely loose faces in the croissant or salad meshes. Visible in every
  warehouse frame.
- [ ] **C6. Oversized crates on the DER row** dwarf the groceries beside them.

**Environment / grading**
- [ ] **C7. Title-screen diorama is still the washed-out light-blue city.** The
  warm cobble pass DJ applied shows in gameplay but not on the title screen, which
  is the first frame a judge sees.
- [ ] **C8. City prop density in wides.** The ZOB plaza reads as an empty field in
  wide shots. Biggest single frame-quality win available in the video.

**Done by DJ already this session**
- [x] Warm cobblestone pass (grey → brown). Visible improvement in every city frame.
- [x] Character models with faces now spawning in the street.

### PHASE D — Juice & feel  ·  AG  ·  ~3h  ·  **8.5 → 9.0**
*Why it scores: "Most Satisfying Progression" is decided here. The numbers are
correct already; they need to feel like something.*

- [ ] **D1. Pick feedback juice** (1h). Combo popup on streak, subtle screen shake
  on mispick, particle burst on early pick. *Verify:* record a shift, watch muted.
- [ ] **D2. Upgrade purchase reveal** (45m). Camera push-in on the changed bike or
  room, `NEW` tag. The buy already works and already stamps the shelf; it needs a
  moment. *Verify:* buy Shelf Labels, confirm a visible beat before the next shift.
- [ ] **D3. Day/night from `stage.time`** (1h). `applyStage` already reads it and
  every scene declares one; only tuning is needed. *Verify:* 15:00 / 19:40 / 22:05
  should look materially different.
- [x] **D4. `STREAK_MAX` is unreachable** (15m). Ceiling is 1.98 at 8 items, constant
  says 2.5. Set 2.0 or raise `STREAK_STEP`. *Verify:* arithmetic in `economy.js`.

---

### PHASE E — Submission  ·  DJ + AG  ·  ~2h  ·  **Video → 9.5**
*Why it scores: this is the artifact most judges actually grade.*

- [ ] **E1. Record the 180s cut** (DJ). Beat sheet: shift 1 → receipt → buy Shelf
  Labels → shift 2 (stamps visible) → receipt → Kaution → **DOCS box ticks green**.
  Economy verified: €20 → €57.85 → €27.85 → €79.75 → €36.75.
- [ ] **E2. Lead with the document, not the picking.** Every rival entry is a farm,
  a factory or a shop. "Earn money, spend it on bureaucracy, unlock the next office"
  is the differentiator. Open on the DOCS row.
- [ ] **E3. Reshoot screenshots** — `Docs/screenshots/*.png` are from 2026-08-26 and
  predate the entire HUD.
- [x] **E4. Docs correction.** `CANONICAL_NUMBERS.md` says 11.08 MB; build is
  **12.93 MB**. Docs claim "zero recorded assets"; build ships a 939 KB
  `bgMusic.mp3`. Correct to: background music + procedural SFX, **no voice acting**.
- [ ] **E5. Submission link uses `?quickstart=1`** so a reviewer lands in the loop
  on the first click.
- [ ] **E6. Release zip** contains only `index.html` + `vendor/`.

---

### NOT DOING — decided, not forgotten
- Acts III to V (51 scenes, 3 gameplay beats). Out of scope.
- Threshold scenes keeping the city visible behind the speaker. Needs phase
  stacking; `cityExplorationPhase.exit()` destroys `worldGroup`.
- Energy and Heart in the HUD. No consequence in Acts I and II. State and the 38
  authored story effects are intact for later.
- Shift variety past 7. `SHIFT_STORIES` clamps; acceptable.

---

## 🎬 VIDEO SPRINT — the 180-second showcase (current focus)

> **Scope: Acts I and II only.** The target is 180 seconds of footage showing
> two full invest → harvest → upgrade cycles plus one document acquired.
> Everything here is judged on whether it looks finished *on camera*.
>
> Verified target economy for the run:
> €20 → shift 1 (~€38) → €58 → Shelf Labels (−€25) → €33 → shift 2 (~€52)
> → €85 → Kaution (−€30) → €55, **DOCS box 1 ticks green**.

### Done (2026-09-07, verified by playtest)
- [x] **Fast entry.** `Skip intro` pill during prologue + `?quickstart=1` for the
  submission link. No bypass button on the main menu.
- [x] **Narration skippable.** Prose is a cancellable tap-advance queue.
  First choice 87s → 17.6s unattended, 3.4s tapped.
- [x] **Progression blocker.** `hideDialogueBox()` was called but never defined,
  leaving dead buttons over the next scene. Implemented + drawer teardown.
- [x] **Scene routing.** `stage.space` (interior/exterior/threshold) on all 85
  scenes, honoured in both handlers. Martha and Mathias now appear in their own
  shops instead of Nico on the street.
- [x] **Missing SFX.** `playSfx('wrong')` ×6 and `'doorbell_wrong'` aliased.
- [x] **Pick feedback English-first.** `EARLY +Milk (x1.4)` / `Wrong shelf (-8%)`.
- [x] **Act I dialogue rewritten** across 13 scenes.
- [x] **Title screen rebuilt.** Removed slots/trash dev-menu buttons.
- [x] **Shop directory.** Dorm panel no longer shows a fake price button on a div
  with no handler; routes to the per-location shops that already worked.

### P0 — on camera, must land  ✅ COMPLETE (awaiting your playtest)
- [x] **#3 DER/DIE/DAS rail legend.** Permanent shelf furniture driven by
  `items.js` gender data, not a shift-1 tutorial overlay. Must read identically
  at shift 12. *Without this the Aha cannot fire: during a shift the only German
  on screen is `(das Brot)` and nothing maps purple to `das`.*
- [x] **#4 Shelf scale + layout.** Parameterised on `itemsCount` / `shelfSlots`
  from `getShift(n)` so 3 items and 8 items both lay out. Currently the whole
  interaction sits in 4.6% of the screen with 35px item spacing.
- [x] **#13 Stray white diagonal lines** across the shelf. In every frame.
- [x] **#7 Build `updatePersistentHUD`.** It is a stub that blanks the HUD and
  renders nothing. Spec: `DAY n/28`, `€x / €250` + bar, objective line,
  `DOCS ☐☐☐☐`. Energy and Heart hidden — state and story effects kept intact,
  they have zero consequence in Acts I–II.
- [x] **#8 Money flow.** `+€37.85` deltas, wallet counting up not snapping,
  `-€30` at Lokker then the DOCS box ticking. This is what makes the economy
  legible in a silent video.
- [x] **#11 Visible upgrade effect.** Shelf Labels must visibly change the shelf
  on the next shift. The purchase has to *show* on camera.

### P1 — video polish
- [ ] **Act II dialogue rewrite.** Lokker and the Kaution fork are on camera and
  still carry the old voice.
- [ ] **#9 Dedupe shift-1 item pool** and show the full manifest, not one line.
- [ ] **Shift timer runs during the briefing.** Unfair and looks broken.
- [ ] **Day/night from `stage.time`.** `applyStage` already reads it; tune only.

### P2 — submission hygiene
- [ ] `CANONICAL_NUMBERS.md` says 11.08 MB; build is **12.35 MB**.
- [ ] Docs claim "zero recorded assets"; build ships a 939 KB `bgMusic.mp3`.
      Correct to: background music + procedural SFX, **no voice acting**.
- [ ] Cold-run timing check, then **record the video**.

### Known, deliberately not fixed
- `STREAK_MAX` 2.5 is unreachable; ceiling is 1.98 at 8 items.
- Threshold scenes do not keep the city visible: `cityExplorationPhase.exit()`
  destroys `worldGroup`. Needs phase stacking. Deferred past deadline.
- Acts III–V: 51 scenes, 3 gameplay beats. Out of scope.

---

## 🔴 Blocking — submission fails without these

- [ ] **Record the gameplay video (2–3 min)**
  Follow `Docs/submission/VIDEO_SCRIPT_AND_STORYBOARD.md`. This is the only
  deliverable with nothing done yet, and it cannot be rushed on the last day.
- [ ] **Upload the video** to YouTube or Vimeo, public or unlisted.
- [ ] **Reshoot the screenshots.** `Docs/screenshots/*.png` are from 2026-08-26 and
  are stale: they show German-first checklist text (`Wasser (Water)`) when the
  build has been English-first (`Milk (die Milch)`) since, and they predate the
  Day/Docs/€ HUD. Capture from the same session as the video.
- [ ] **Generate the final release zip** and confirm it contains only
  `index.html` + `vendor/` — not `cloudflared.exe`, `node_modules/`, `*.log`,
  or the stale `far-from-home-release.zip`.

---

## 🟠 High — credibility risks a judge can see

- [ ] **Wire the three restored Act One scenes so they actually play.**
  `wg_buzzer`, `golden_hour` and `kruma_flyer` were authored into
  `assets/narrative/story.json` on 2026-09-06 from
  `Docs/archive/ACT_ONE_BRITISH_COMEDY.md` (scenes 3, 6 and 9). They validate and are
  reachable in the graph, but `handleBritishSpecialBeats` / `BRITISH_BEAT_MAP`
  (`src/core/storyActions.js:119`) routes Act I through building interactions, so they
  never fire in normal play. Needs a beat-map entry or a city-exploration trigger.
  Verify with `game.storyRunner.startScene('wg_buzzer')` then check `currentScene.id`.
  See `Docs/STORY_FORMAT.md` §12.


- [ ] **Add a fast-start / skip-prologue path to the title screen.** *(Highest-value
  item remaining — worth more rubric points than anything else on this list.)*
  A judge who has to sit through the Day 1 prologue may never reach the warehouse,
  and the 90-second rule is scored on what they actually see. Add a second title
  button (e.g. `SKIP TO SHIFT`) that seeds the state a completed Day 1 would leave
  behind (€20.25 wallet, Day 2 07:00, Klaus tutorial armed) and drops straight into
  the warehouse. Keep the full prologue as the default first button.
- [x] **Rename the two colliding character pairs.** Resolved:
  - `Martha Webber` -> `Martha Beck` (baker, `B_BAKERY`). `Frau Weber` remains the Sparkasse banker.
  - `Nina Lindemann` -> `Nina Voss` (dispatcher, `B_DARKSTORE`). `Dr. Lindemann` remains the immigration officer.
  - Reconciled orphaned Martha medicine favor block in `src/data/npcDialogue.js` and verified clean AST syntax.
- [ ] **Act One British Comedy Narrative Implementation (Scenes 1–10 per `README_HACKATHON.md` §2):**
  - [ ] **Scene 1 (Arrival & Bus Shelter Roast)**: Bus station arrival at `B_ZOB` North Gate, British deadpan thought bubble on microwave-sized shelter, timetable inspection plaque, compass pulse to `B_WG`.
  - [ ] **Scene 2 & Pfand Collectibles**: 5 floating glass bottle collectibles (+€0.25 Pfand pickup chime, ground pulse ring), cobblestone walk environmental thoughts.
  - [ ] **Scene 3 (WG 3-Button Doorbell Buzzer)**: Intercom modal at `B_WG` door (Frau Meier *Ruhezeit* shout + noise strike vs Herr Schmidt wrong buzzer vs Nico buzzer).
  - [ ] **Scene 4 (Nico & Mülltrennung Trash Sorting)**: Enter WG kitchen diorama, 3-bin recycling challenge (Yellow/Blue/Black bins), update `window.FFH.npcMemory.nico`.
  - [ ] **Scene 5 (Tuition Warning Letter & HUD Focus)**: Letter on desk highlighting €250 semester fee due, €20.25 in pocket, prompt to rush to University before 17:00.
  - [ ] **Scene 6 & 7 (Golden Hour & Locked University Door)**: Dynamic lighting shift to warm 16:45 sunset, closed door notice at `B_UNI` at 17:01.
  - [ ] **Scene 8 (Frau Klein Outside University)**: Encounter Frau Klein with canvas bags of potatoes on Uni steps, teasing about German 90-minute public-sector work weeks.
  - [ ] **Scene 9 (19:00 Night Walk & Kruma Job Flyer)**: Transition to night lighting with glowing street lamps, inspect job flyer on lamp post, failed inquiries at Pizzeria & Bakery.
  - [ ] **Scene 10 (Bedtime Day 1 Recap & Day 2 Dawn)**: WG bed interaction, Day 1 financial recap modal, transition to Day 2 07:00 morning mist and Klaus warehouse tutorial.
- [ ] **Eyeball the Kenney food models on the warehouse shelf.** They render for the
  first time as of 2026-09-02 (the OBJ/MTL loaders were never inlined before, so the
  game always fell back to procedural meshes). Loading and texturing are verified
  objectively; the *look* is not. Check scale, orientation and that the gender
  colour ring still reads clearly behind the model.
- [ ] **Re-verify the 90-second pacing rule** end to end. Time a cold run from boot
  to Shift 3 — via the fast-start path once it exists, and again from a cold boot.
  If it exceeds 90 s, tune before touching anything else.

---

## 🟡 Medium — polish

- [ ] Mathias Pizzeria/Bike Shop 3D model elevation: adjust preset in `src/config/gameConfig.js` (`y: 0.05, z: -1.10` currently sinks behind counter).
- [ ] Juicy cash feedback: coin burst + register SFX on payout.
- [ ] Confirm every shop upgrade has a visible in-world change, not just a stat.
- [ ] Performance pass: hold 60 FPS at 390×844, check for leaks across phase changes.

---

## ✅ Verified done

Checked against source, not claimed from memory.

- [x] **Bureaucracy state machine** — `hasJob`, `isMatriculated`, `hasApartment`,
      `hasAnmeldung`, `isSperrkontoUnlocked`, `hasVisaExtended` all present in state.
- [x] **Prominent goal HUD** — `DAY 1/28`, `DOCS ▫▫▫▫`, `€20` render on the city
      screen. (The archived plan still listed this as pending.)
- [x] **Language-learning framing removed (2026-09-06).** The game is a narrative
      courier-management sim; its single thesis is British deadpan comedy colliding
      with German municipal precision. No pedagogical claim remains in any
      judge-facing document. The der/die/das shelf stays as the comedy mechanic:
      arbitrary noun genders, so of course the warehouse is filed by them.
- [x] **Spaced repetition deleted (2026-09-06)** — `SpacedRepetition` / Leitner
      boxes removed from `src/data/items.js`.
- [x] **Vocabulary dictionary and self-quiz modal deleted (2026-09-06)** —
      `src/ui/screens/hudDictionary.js` now contains only the skill-tree modal.
      The dictionary UI was already unreachable dead code.
- [x] **Vocab Notebook HUD button deleted (2026-09-06)** — removed from
      `src/ui/hud.js`; it was gated on an upgrade id that never existed.
- [x] **Audio claims corrected (2026-09-06)** — the build never contained recorded
      audio or voice acting. Every sound is synthesised at runtime from oscillators:
      SFX plus pitched per-character talk-blips (`src/audio/speech.js`).
      `src/data/voiceSprites.js`, `speakKey()` and `speakGermanText()` are deleted.
      The pick-phase anticipation cue is the **visual** gender-rail pulse.
- [x] **Shop catalogue renamed (2026-09-06)** — "Vocab Cards" is now **Shift Rota
      Cards**; `pocketNotepad` grants one free rail re-pulse per shift, is correctly
      gated on ownership, and renders in the shift HUD only when owned. See
      `Docs/CANONICAL_NUMBERS.md` §3.
      *Not a headline system: 6 of its 9 effects are dead writes. The code stays;
      do not advertise it to judges.*
- [x] **English-first item labels** — `src/ui/hud.js` renders
      `Milk (die Milch)`. Only the old screenshots show otherwise.
- [x] **Shelf tiers bottom/middle/top by gender** — `src/phases/pickPhase.js:293`.
- [x] **Kenney food models load and texture** — 8 models parse, all bind the
      512×512 atlas from an inlined `data:` URI.
- [x] **100 % offline airgap** — DevTools Network shows the document request and
      nothing else across repeated loads. No relative texture path remains.
- [x] **Zero console errors** on boot and through the city phase.
- [x] **Build size** — see `Docs/CANONICAL_NUMBERS.md`. Far under 35 MB.
- [x] **Dev/release parity guard** — `build/assemble.js` now fails loudly if
      `index.dev.html` and the release module list diverge.

---

## Verification gate

Run before any commit that claims completeness:

```bash
node build/bundle_obj.js && node build/assemble.js && node build/check-size.js
```

Then in the browser: boot, check console for errors, and confirm the Network tab
shows only the document.
