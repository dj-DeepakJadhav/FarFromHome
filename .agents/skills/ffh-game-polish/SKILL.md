---
name: ffh-game-polish
description: Core checklist and standards for visual juice, tactile feedback, audio balance, and gameplay feel to polish the Far From Home: Kruma Express mobile prototype.
---

# Far From Home Game Polish & Juice Guidelines

Use this skill to guide all layout, visual feedback, sound integration, and transition changes. The goal is a highly polished, tactile, and immersive experience.

---

## 1. Visual Juice & Tactile Feedback
- **Tap Feedback**: Every successful tap/action must trigger a visual response (e.g., scale bounce, color flash, particle emission).
- **Early Pick ("gehört!")**:
  - Must display a floating, stylized text label (e.g. green `+2.0x` or `gehört!`) that drifts upward and fades out.
  - Particles emitted on early pick should be a different, more vibrant color (e.g., golden yellow/green `#FFD700`) compared to normal picks (white/blue).
- **Mispick Error**:
  - Screen shake effect (minor ortho zoom offset wobble) on mispicks.
  - Red flash or warning toast with precise penalty percentages derived from constants.
- **Diorama Transitions**:
  - Smooth camera pan/rotations when transitioning between the Room Hub, Shelf (Pick), and Street (Ride) dioramas.

## 2. Audio Polish
- **Muted Mode & Legibility**: All critical events (success, mistake, early-pick status) must have distinct visual representation so the game is fully playable without audio.
- **Audio Cues**:
  - Speech files must trigger immediately on item highlight.
  - Correct picks should trigger a satisfying, high-pitched "ding" or "pop" sound.
  - Incorrect picks should play a low-pitched "buzz" or dull "thud".
  - Early picks must play a distinct, richer success sound (e.g. adding a coin chime or a "swish").

## 3. UI Layout & Typography
- **Portrait Lock (390×844)**:
  - Absolutely zero element overflow.
  - No clipping or overlapping between the Manifest box and the active shelf items.
  - Margins must be proportional to mobile safe areas.
- **Visual Hierarchies**:
  - High-contrast, legible typography for German articles and symbols (`der ▲`, `die ●`, `das ■`).
  - Shop cards must clearly present before/after states of parameters (e.g., "Transit Time: 8s ➔ 4.8s").

## 4. Performance & Verification
- Ensure 60fps rendering in mobile browser views.
- No memory leaks from repeated run setups.
- Validate that the complete gameplay sequence (Pick -> Ride -> Debrief -> Shop) can be driven and navigated seamlessly.
