# Hackathon Official Submission Checklist

> **Competition**: Meta Horizon Creator Competition (MHCP) Game Prototype
> **Deadline**: September 8, 2026 at 1:00 PM PDT
>
> **Tick a box only after running the stated check.** Every item below names how it
> was verified. An item with no verification method is not done.
>
> Numbers: [`../CANONICAL_NUMBERS.md`](../CANONICAL_NUMBERS.md) · Story of the build: [`../THE_MAKING_OF.md`](../THE_MAKING_OF.md) · Session record: [`BUILD_LOG.md`](BUILD_LOG.md)
>
> The old task list was archived out of the repo on 8 September 2026. Section 4 below
> is now the only list of what is still open.

---

## 1. Packaging & Technical Hard Constraints

- [x] **File Structure**: Single `index.html` at the root of the submission zip.
- [x] **Vendor Assets**: `vendor/` folder included alongside `index.html`.
- [x] **Strict Size Limit**: `node build/package.js` to **3.45 MB zipped** (uncompressed 11.08 MB via
      `node build/check-size.js`), against the 35 MB limit. The packager fails the build
      if the zip exceeds it.
- [x] **100% Offline Airgap**: re-verified 2026-09-08 **against the extracted zip**, not the
      working tree. Unpacked to a clean directory, served over HTTP, and loaded: the network
      log contains only `localhost` and `blob:` entries, zero external requests, and the
      console is clean. `build/package.js` additionally refuses to build if any `http(s)://`
      or protocol-relative reference appears in `index.html`. The Kenney colour atlas is
      inlined as a `data:` URI, so the old relative fetch of `Textures/colormap.png` is gone.
- [x] **Locked Mobile Viewport**: fixed 390×844 portrait, canvas confirmed at
      390×844 in the running build.
- [x] **Zero console errors** on boot and through the city phase.
- [x] **Dev/release parity**: `build/assemble.js` fails the build if `index.dev.html`
      and the release module list diverge.

### Source readability, state this precisely
- [x] **Game source** (`src/**`) ships unminified and readable inside `index.html`.
- [x] **Vendor libraries** (`three.min.js`, `three-mesh-bvh.umd.js`) ship minified,
      as distributed upstream.

> Do not claim "the whole file is unminified". It isn't, and a judge opening the
> file will see minified vendor code in the first screenful.

---

## 2. Submission Deliverables

- [x] **Design Intent Document (.docx)**: `DESIGN_INTENT_DOC.docx`, required format is text-only
      `.docx`, generated 2026-09-08 from `DESIGN_INTENT_DOC.md`. **492 words** counted from the
      document's own XML (limit 500), no images, and `dc:creator` / `cp:lastModifiedBy` are
      empty so the file carries no identifying information. A **Future-State Vision** section
      was added, which the template requires and the previous draft omitted.
      Recount: `sed '1,3d' Docs/submission/DESIGN_INTENT_DOC.md | wc -w`
- [x] **Devpost Written Questionnaire**: `DEVPOST_SUBMISSION_FORM.md` pre-filled and reframed 2026-09-06.
- [ ] **Gameplay Video**: 2 to 3 minutes. **Not started.** The old script and voice over
      transcript were archived with the retired video pipeline.
- [ ] **Public Video Hosting**: uploaded to YouTube or Vimeo, public or unlisted.
- [ ] **Fresh Screenshots**: current ones are from 2026-08-26 and are stale, they
      show German-first checklist text and predate the Day/Docs/€ HUD.
- [x] **Build Log (.md)**: `BUILD_LOG.md`, required, not scored. Nine dated locked decisions
      and a per-session record reconstructed from the 110-commit history, naming which work
      the AI agent did and which was directing, playtest reporting or hand tuning. Records
      the reversals honestly (the English-first pivot, the cut skill tree, the same-day
      quickstart revert).
- [x] **Final Release Zip**: `node build/package.js` to `dist/far-from-home-kruma-express.zip`.
      Verified by re-reading the produced artefact, not by trusting the zip step: contents are
      exactly `index.html` (top level) plus the 11 referenced `vendor/` libraries, and nothing
      else. The packager stages a clean tree, so `node_modules/`, logs and old zips cannot leak in.

---

## 3. Rubric Alignment

- [x] **Player Engagement (30%)**: instant action in the first 15 seconds; single-thumb touch.
- [x] **Playability (25%)**: no uncaught exceptions observed; loop runs end to end.
- [x] **Core Loop Design (20%)**: Invest to Harvest to Upgrade to Observe Growth runs
      end to end, shifts pay, upgrades change a stat *and* something visible, the
      day-end receipt closes the ledger, and the dossier advances.

      **On the 90-second guideline, a deliberate divergence, not an open task.** `node build/check-story.js` reports the Shift 3 aha at **167 s against a 90 s
      budget**. This is a slow-burn narrative sim, paced closer to a walking sim than
      an arcade loop; the Lübeck arrival establishes the thesis rather than delaying
      it, and compressing it makes the pick loop a colour-matching game with nothing
      at stake. What the Engagement criterion actually asks for *is* met: the first
      interactive scene lands at **10 s** and the WG buzzer at **18 s**, with no menu
      wall and no unskippable cutscene.

      Tested, not assumed, the Shift-3 fast-start hit the stopwatch exactly and
      produced a worse experience (revert in [`BUILD_LOG.md`](BUILD_LOG.md); full
      reasoning in [`../THE_MAKING_OF.md`](../THE_MAKING_OF.md) §10). The number is
      still measured and printed, never retuned to pass.
- [x] **Focus (15%)**: one cohesive narrative-courier sim under a single thesis
      (British deadpan vs. German municipal precision). Verified 2026-09-06 by
      removing every advertised-but-hollow system: the language-learning framing,
      spaced repetition, the vocabulary dictionary/quiz and all audio claims are
      longer advertised as a headline system.
- [x] **Originality (10%)**: German *der/die/das* as a 3-tier spatial search filter, framed as an absurd bureaucratic filing rule, not as a lesson.

### Special Award Targets
-*Most Innovative ($15K)*: the gender-as-spatial-filter picking mechanic.
-*Most Satisfying Progression ($15K)*: €20 to €250 curve with 5 upgrades
  (see [`../CANONICAL_NUMBERS.md`](../CANONICAL_NUMBERS.md) §3). All five now have a
  real mechanical effect *and* a visible in-world change; `pocketNotepad` was fixed
  on 2026-09-06 (it was previously ungated and its button never rendered).

---

## 4. Known open risks

1. The gameplay video is the single hard blocker. It is a Devpost-page requirement, not
   one of the three graded artefacts, the prototype zip, the Design Intent `.docx` and
   the Build Log are all generated and verified.
   **Status 2026-09-08:** the HyperFrames + Kokoro pipeline under `video/` was retired
   and archived out of the repository; it had narration and a rough cut but never got
   its 7 gameplay screen recordings. The video
   will be made another way, so its script and voice over transcript were archived with
   it. Two capture rules still apply whenever it gets shot: use
   `index.html?season=summer` so the footage is reproducible, and do not pass `?ink=1`,
   because the ink outline still draws around the canal water and thin railings.
2. [RESOLVED] Character-name collisions resolved (`Martha Beck` for baker, `Nina Voss` for dispatcher; `Frau Weber` for banker, `Dr. Lindemann` for immigration officer).
3. The Kenney food models render for the first time as of 2026-09-02 and have not
   been visually reviewed on the shelf.
4. [RESOLVED AS A DESIGN DECISION] The 90-second guideline is deliberately not
   applied, the genre is a slow-burn narrative sim, and forcing it makes the game
   feel rushed. First player action still lands at 10 s. See Core Loop Design above.
5. **One** music track ships (`assets/Music/bgMusic.mp3`, inlined as a data URI);
   every sound effect is runtime oscillator synthesis, and there is no voice acting.
   Do not let this drift in either direction, "no audio ships" was true until
   2026-09-07 and is now false.
