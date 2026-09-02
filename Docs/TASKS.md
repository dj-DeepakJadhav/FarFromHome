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

- [ ] **Rename the two colliding character pairs.** Verified counts in `src/`:
  - `Frau Weber` (banker, 20 refs) vs `Martha Webber` / `Frau Webber` (baker, 8 refs).
    `VIDEO_SCRIPT_AND_STORYBOARD.md` already greets the *baker* as "Frau Webber",
    which in a judged video reads as a mistake.
  - `Nina Lindemann` (dispatcher, 5 refs) vs `Dr. Lindemann` (immigration officer).
  Pick two new surnames and update `src/data/npcDialogue.js`, `src/data/dialogue.js`,
  then re-grep for the old names.
- [ ] **Eyeball the Kenney food models on the warehouse shelf.** They render for the
  first time as of 2026-09-02 (the OBJ/MTL loaders were never inlined before, so the
  game always fell back to procedural meshes). Loading and texturing are verified
  objectively; the *look* is not. Check scale, orientation and that the gender
  colour ring still reads clearly behind the model.
- [ ] **Re-verify the 90-second pacing rule** end to end. Time a cold run from boot
  to Shift 3. If it exceeds 90 s, tune before touching anything else.

---

## 🟡 Medium — polish

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
