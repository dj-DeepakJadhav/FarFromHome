# Development Archive

## 6. Complete Chronological Build Log

### 2026-09-08

- **Agent 2 — city camera polish:** Made the boot-city view settle, then start a gentle aerial glide while idle. Added a one-tap city-view rotation button for portrait touch play, while retaining desktop right-drag/Q/E and two-finger rotate/pinch. Manual camera choices now persist while the courier moves instead of being reset by movement; existing line-of-sight building fading remains the player-visibility safeguard.
- Verification: JavaScript syntax validation, release assembly, size check, full verification/story checks and live browser checks passed. The title survived the idle delay cleanly; a new run exposed and accepted the `Rotate city view` button without blocking city UI.
- **Agent 2 — pick readability / pacing:** Replaced repeated German-gender tutorial popups with one concise, English-first shelf map. The rail itself remains the anticipation cue. Added distinct muted outcome badges for normal pick, Early Pick ×2.0, and Wrong Shelf (including the canonical bag-integrity loss), while retaining the existing particle burst, bag drop and bounded wrong-pick shake.
- **Agent 2 — judge fast-start:** Kept the cozy normal Day 1 route intact and changed only `?quickstart=1` to enter the authored Shift 3 rail-pulse test. The release link now reaches the five-item, 2.5-second cue scenario immediately, so the 90-second review proof does not require a hurried story edit.
- Verification: JavaScript syntax validation, `node build/assemble.js`, `node build/check-size.js`, and a live `?quickstart=1` browser check passed. Release package measured 12.81 MiB.
- Corrected the Day 1 orientation receipt so Pfand and other city-walk gains are itemised and included in both the earnings and net-change rows. This keeps the receipt consistent with the tuition balance shown to the player.
- Verification: JavaScript syntax validation, release assembly, and bundle-size check completed successfully.
- Unified the Day 1–3 receipt ledger for orientation, Kruma Express, and post rounds. Each now projects the actual after-sleep balance without double-counting income already in the wallet or omitting a pending Kruma payout.
- Replaced the active task queue with a two-lane, score-driven roadmap: reliability and flow first, then tactile progression, art/camera proof and truthful submission capture. Historical task sections remain as context rather than competing work queues.
- Assigned the active roadmap to two non-overlapping implementation roles. DJ's 3D cleanup is complete, so both roles may make evidence-backed 3D corrections while preserving offline and size constraints.
