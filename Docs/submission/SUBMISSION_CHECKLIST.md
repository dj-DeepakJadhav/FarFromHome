# Hackathon Official Submission Checklist

> **Competition**: Meta Horizon Creator Competition (MHCP) Game Prototype
> **Deadline**: September 8, 2026 at 1:00 PM PDT
>
> **Tick a box only after running the stated check.** Every item below names how it
> was verified. An item with no verification method is not done.
>
> Numbers: [`../CANONICAL_NUMBERS.md`](../CANONICAL_NUMBERS.md) · Tasks: [`../TASKS.md`](../TASKS.md)

---

## 1. Packaging & Technical Hard Constraints

- [x] **File Structure**: Single `index.html` at the root of the submission zip.
- [x] **Vendor Assets**: `vendor/` folder included alongside `index.html`.
- [x] **Strict Size Limit**: `node build/check-size.js` → 11.08 MB, well under 35 MB (see [`../CANONICAL_NUMBERS.md`](../CANONICAL_NUMBERS.md)).
- [x] **100% Offline Airgap**: verified 2026-09-02 in the DevTools Network tab across
      repeated loads — the document request appears and nothing else. The Kenney
      colour atlas is inlined as a `data:` URI, so the previous relative fetch of
      `Textures/colormap.png` is gone.
- [x] **Locked Mobile Viewport**: fixed 390×844 portrait, canvas confirmed at
      390×844 in the running build.
- [x] **Zero console errors** on boot and through the city phase.
- [x] **Dev/release parity**: `build/assemble.js` fails the build if `index.dev.html`
      and the release module list diverge.

### Source readability — state this precisely
- [x] **Game source** (`src/**`) ships unminified and readable inside `index.html`.
- [x] **Vendor libraries** (`three.min.js`, `three-mesh-bvh.umd.js`) ship minified,
      as distributed upstream.

> Do not claim "the whole file is unminified". It isn't, and a judge opening the
> file will see minified vendor code in the first screenful.

---

## 2. Submission Deliverables

- [x] **Design Intent Document**: `DESIGN_INTENT_DOC.md` — 491 words (limit 500), rewritten 2026-09-06.
      Recount: `sed '1,3d' Docs/submission/DESIGN_INTENT_DOC.md | wc -w`
- [x] **Devpost Written Questionnaire**: `DEVPOST_SUBMISSION_FORM.md` pre-filled and reframed 2026-09-06.
- [ ] **Gameplay Video**: 2–3 minutes, per `VIDEO_SCRIPT_AND_STORYBOARD.md`. **Not started.**
- [ ] **Public Video Hosting**: uploaded to YouTube / Vimeo, public or unlisted.
- [ ] **Fresh Screenshots**: current ones are from 2026-08-26 and are stale — they
      show German-first checklist text and predate the Day/Docs/€ HUD.
- [ ] **Final Release Zip**: generated and confirmed to contain only `index.html`
      and `vendor/` — no `cloudflared.exe`, `node_modules/`, logs, or the old zip.

---

## 3. Rubric Alignment

- [x] **Player Engagement (30%)**: instant action in the first 15 seconds; single-thumb touch.
- [x] **Playability (25%)**: no uncaught exceptions observed; loop runs end to end.
- [ ] **Core Loop Design (20%)**: Invest ➔ Harvest ➔ Upgrade ➔ Observe Growth —
      re-time a cold run to Shift 3 against the 90-second rule before ticking.
      **Currently failing**: Act One is 10 stages before the first shift. The fix is
      the fast-start / skip-prologue path tracked in `../TASKS.md`, which is worth
      more rubric weight (Engagement 30% + Core Loop 20%) than anything else open.
- [x] **Focus (15%)**: one cohesive narrative-courier sim under a single thesis
      (British deadpan vs. German municipal precision). Verified 2026-09-06 by
      removing every advertised-but-hollow system: the language-learning framing,
      spaced repetition, the vocabulary dictionary/quiz and all audio claims are
      longer advertised as a headline system.
- [x] **Originality (10%)**: German *der/die/das* as a 3-tier spatial search filter —
      framed as an absurd bureaucratic filing rule, not as a lesson.

### Special Award Targets
- *Most Innovative ($15K)*: the gender-as-spatial-filter picking mechanic.
- *Most Satisfying Progression ($15K)*: €20 ➔ €250 curve with 5 upgrades
  (see [`../CANONICAL_NUMBERS.md`](../CANONICAL_NUMBERS.md) §3). All five now have a
  real mechanical effect *and* a visible in-world change; `pocketNotepad` was fixed
  on 2026-09-06 (it was previously ungated and its button never rendered).

---

## 4. Known open risks

1. The gameplay video is the single hard blocker and has not been started.
2. [RESOLVED] Character-name collisions resolved (`Martha Beck` for baker, `Nina Voss` for dispatcher; `Frau Weber` for banker, `Dr. Lindemann` for immigration officer).
3. The Kenney food models render for the first time as of 2026-09-02 and have not
   been visually reviewed on the shelf.
4. The 90-second rule is not met. See Core Loop Design above.
5. No audio ships, by design. This is now stated openly in every judge-facing doc —
   do not let it drift back into a claim. All sound is runtime oscillator synthesis.
