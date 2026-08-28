# Hackathon Official Submission Checklist

> **Competition**: Meta Horizon Creator Competition (MHCP) Game Prototype  
> **Deadline**: September 8, 2026 at 1:00 PM PDT  
> **Internal 1-Week Target**: September 3, 2026

---

## 📋 Pre-Submission Verification Gate

### 1. Packaging & Technical Hard Constraints
- [x] **File Structure**: Single `index.html` at the root of the submission zip.
- [x] **Vendor Assets**: `vendor/` folder included alongside `index.html` with all Three.js libraries.
- [x] **Strict Size Limit**: Total zip file is `≤ 35 MB` (Currently ~1.8 MB zipped).
- [x] **Unminified Source**: Shipped `index.html` remains readable, unminified JavaScript.
- [x] **100% Offline Airgap**: Verified zero network requests in DevTools offline mode.
- [x] **Locked Mobile Viewport**: Fixed 390×844 portrait orientation with responsive centering.

---

### 2. Submission Deliverables
- [x] **Design Intent Document**: `Docs/submission/DESIGN_INTENT_DOC.md` (433 words, strictly ≤ 500 words).
- [x] **Devpost Written Questionnaire**: `Docs/submission/DEVPOST_SUBMISSION_FORM.md` pre-filled.
- [ ] **Gameplay Video**: 2–3 minute video recorded following `Docs/submission/VIDEO_SCRIPT_AND_STORYBOARD.md`.
- [ ] **Public Video Hosting**: Video uploaded to YouTube / Vimeo with public/unlisted access.
- [ ] **Final Release Zip**: `far-from-home-release.zip` generated via `node build/assemble.js`.

---

### 3. Rubric Alignment Verification
- [x] **Player Engagement (30%)**: Instant action in first 15 seconds; intuitive touch controls.
- [x] **Playability (25%)**: 0 uncaught exceptions; end-to-end loop verified (Win & Lose paths).
- [x] **Core Loop Design (20%)**: Invest ➔ Harvest ➔ Upgrade ➔ Observe Growth.
- [x] **Focus (15%)**: Zero disconnected half-systems; tight cohesive narrative-courier sim.
- [x] **Originality (10%)**: German *der/die/das* 3-tier spatial search filter.
- [x] **Special Awards Target**:
  - *Most Innovative ($15K)*: Spatial grammar search filter.
  - *Most Satisfying Progression ($15K)*: €20 ➔ €250 tuition curve with 5 impactful upgrades.
