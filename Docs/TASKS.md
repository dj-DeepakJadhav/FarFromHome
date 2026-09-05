# Task List

> **This is the only task list.** It replaces `MASTER_TASK_LIST.md`,
> `MASTER_POLISH_TASK_LIST.md` and `ONE_WEEK_MASTER_PLAN.md`, which disagreed with
> each other and with the code. They are in `Docs/archive/` for history only.
>
> **Deadline: 8 September 2026, 1:00 PM PDT.**
>
> Status here was verified against `src/` and a running build on 2026-09-02.
> Do not tick a box from intent. Tick it from a check you actually ran, and say
> how you checked.

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
  to Shift 3. If it exceeds 90 s, tune before touching anything else.

---

## 🟡 Medium — polish

- [ ] Mathias Pizzeria/Bike Shop 3D model elevation: adjust preset in `src/config/gameConfig.js` (`y: 0.05, z: -1.10` currently sinks behind counter).
- [ ] Juicy cash feedback: coin burst + register SFX on payout.
- [ ] Confirm every shop upgrade has a visible in-world change, not just a stat.
- [ ] Performance pass: hold 60 FPS at 390×844, check for leaks across phase changes.

---

## ✅ Verified done (2026-09-02)

Checked against source, not claimed from memory.

- [x] **Bureaucracy state machine** — `hasJob`, `isMatriculated`, `hasApartment`,
      `hasAnmeldung`, `isSperrkontoUnlocked`, `hasVisaExtended` all present in state.
- [x] **Prominent goal HUD** — `DAY 1/28`, `DOCS ▫▫▫▫`, `€20` render on the city
      screen. (The archived plan still listed this as pending.)
- [x] **3-branch skill tree** — `src/data/skillTree.js`, wired into `src/ui/hud.js`.
- [x] **Spaced repetition vocab** — `SpacedRepetition` Leitner boxes in
      `src/data/items.js`.
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
