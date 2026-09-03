# ACT I — Design & Implementation Document

> **Status**: Draft v2 — all player comments incorporated. Review before implementation.
> **Scope**: Everything from game boot to end of Day 1 (player sleeps).
> **File**: `Docs/ACT_ONE.md` | **story.json scenes**: `act_one` through `night_one_end`

---

## DECISIONS LOG (from player comments)

The following are confirmed design decisions. These are not open questions anymore.

| # | Decision | Status |
|---|---|---|
| C1 | Camera has two modes: GAMEPLAY (close, third-person) and IDLE (zoomed-out, orbiting) | CONFIRMED |
| C2 | No UI at all until after the first left/right choice | CONFIRMED |
| C3 | Compass visible ONLY during active navigation, hidden when idling | CONFIRMED |
| C4 | Player thoughts: bubble above head (gameplay cam) or center-screen popup (idle cam) | CONFIRMED |
| C5 | Conversations = 2D dialogue panel. NPC thoughts = 3D bubble above head | CONFIRMED |
| C6 | Every UI element introduced with a pulsating reveal animation | CONFIRMED |
| C7 | Player WALKS the city — this is a walking simulation | CONFIRMED |
| C8 | Building interaction requires proximity — only nearby buildings are clickable | CONFIRMED |
| C9 | NPC memory system (like Shadow of Mordor nemesis) — no visible score, but NPCs remember | CONFIRMED |
| C10 | Nico does NOT mention Kruma Express. Player discovers it: pizzeria rejected, bakery rejected, Martha reveals Kruma | CONFIRMED |
| C11 | German bins have 5 categories + Pfand system. Bins scene is tappable mini-game | CONFIRMED |
| C12 | Vocab mini-game similar to Kruma picking mechanic | CONFIRMED |
| C13 | Shift 1 has generous timer. Nina comments on speed (slow vs fast) reactively | CONFIRMED |
| C14 | Receipt prints with thermal printer animation | CONFIRMED |
| C15 | Tips in Germany: never asked for, always given spontaneously | CONFIRMED |
| C16 | Canal scene: film grain + vignette. Phone: both 3D prop AND 2D glow overlay | CONFIRMED |
| C17 | Through-glass effect on Rita scene: shader on door mesh | CONFIRMED |
| C18 | Rita stamp sound: yes, subtle introduction | CONFIRMED |
| C19 | Coffee mug slide animation in Nico scene: yes | CONFIRMED |
| C20 | Choice labels: no dashes, natural speech rhythm | CONFIRMED |

---

## 0. Act I in One Sentence

> The player arrives in Luebeck with 20 euros, walks to the WG flat, meets Nico, sees the locked university, gets rejected at a pizzeria and a bakery before a warm baker named Martha reveals Kruma Express, works three shifts that teach der/die/das through physical rhythm, earns 31.50, calls home, and sleeps.

**Scene chain (updated)**:
```
act_one → wg_door → nico_kitchen → [nico_bins_choice] → nico_sends_kruma
        → uni_closed → pizzeria_job (NEW) → bakery_job (NEW)
        → shift_1_teach → shift_2_anticipate → shift_3_test
        → shift_receipt → rita_first → night_one → night_one_end
```

**Total scene count**: 15 scenes (was 13; pizzeria_job and bakery_job are new)
**Target**: 90 seconds from boot to Shift 3 (The Aha). Pacing will need tuning after addition of two new scenes.
**Economy end of Act I**: Wallet 20 → 51.50 euros. Body ~94. Heart varies.

---

## A. AUDIO DESIGN (full game)

**Design decision**: Tiered audio system based on context and urgency. Assets to be found or created.

### Three audio tiers:

**Tier 1 — Main Menu / Loading**
- A single ambient loading sound or short musical motif plays during boot.
- Character: Baltic, slightly melancholic, with warmth underneath.
- Not urgent — this is the last moment of calm before 28 days start.

**Tier 2 — Gameplay Background**
- One persistent ambient track plays during city exploration.
- Character: Luebeck old town — cobblestones, distant water, city breath.
- Never changes abruptly. Crossfades between locations (inside/outside).
- Inside WG: radiator tick + kettle (already in code). Outside: wind + tram bell.

**Tier 3 — Mini-game Urgency Layer**
- During warehouse picking (PICK phase): silence baseline + voice cues are the rhythm.
- As time runs low in a shift: subtle urgency layer enters (heartbeat, faster background hum).
- Perfect run: satisfaction SFX (cash register, brief celebratory tone).
- Failed pick: brief buzz.
- Nina speed comment (reactive): audio-flagged as PRAISE or PUSH.

**Asset strategy**: Find free assets first (freesound.org, CCMIXTER). If unavailable, synthesise with Tone.js (already in vendor). No external CDN — all must be bundled inline.

---

## B. CAMERA SYSTEM

Two camera modes that transition smoothly between each other.

### GAMEPLAY Camera (when player is interacting)
- Third-person, close behind/above player character.
- Follows player as they walk the city.
- Zoom level: ~1.05 (intimate, ground-level feel).
- Activates: any touch, tap, drag, or key input.
- Transition in: smooth pan FROM idle position TO player, ~0.8s easing.

### IDLE Camera (when player stops touching for ~3 seconds)
- Zooms out slowly (zoom ~0.65).
- Begins slow orbit around a pivot point in the centre of the visible city.
- Equivalent to current city orbit behaviour — shows the world beauty.
- Player thoughts appear as CENTER-SCREEN popups (not above head — too small at this zoom).
- Transition out: smooth zoom-in and pan toward player when interaction resumes.

### Boot sequence camera (no UI)
- Game opens directly into the world, camera zoomed out.
- Slow cinematic pan from a high isometric view downward toward the player character standing in the street.
- No title card, no frosted glass panel — just the world and the character.
- The first prose line appears above the player's head as a thought bubble as the camera settles.

---

## C. UI VISIBILITY RULES

**Global rule**: No UI element is ever shown without a contextual reason. Every first reveal has a pulsating animation (glow pulse, then settle).

### Introduction order across Act I:

| Order | UI Element | When introduced | How |
|---|---|---|---|
| 1 | Player thought bubble | After act_one prose appears | Floats above player head, fades |
| 2 | Body score bar | After choice resolves (body drops) | Pulses in from edge, shakes once |
| 3 | Compass arrow | After player starts walking post-choice | Slides in from top-right, pulses |
| 4 | Dialogue panel | On arrival at wg_door (Nico) | Slides up from bottom |
| 5 | Vocab notebook button | After nico_bins_choice | Slides in from top-right with glow |
| 6 | Quest tracker card | After nico_sends_kruma | Drops from top with pulse |
| 7 | Tuition bar | On entering shift_1_teach | Rises from bottom |
| 8 | Shift timer | On entering shift_1_teach | Fills from left |
| 9 | Freshness bar | On entering shift_2_anticipate | Slides in from right |
| 10 | Integrity bar | On entering shift_3_test | Slides in from right |
| 11 | Debrief receipt panel | After shift_3_test completes | Full-screen slide-up |

**Nothing else visible until Act II.**

### Player thought bubbles (C4 decision):
- GAMEPLAY camera: small speech bubble appears directly above player character. Max 1-2 short sentences. Auto-fades after 3 seconds.
- IDLE camera: center-screen popup with slightly larger text. Same auto-fade.
- Triggered by: idle time (30s, 60s), proximity to buildings, story progression, player confusion signals (walking into walls, reversing direction repeatedly).
- Examples:
  - [30 seconds idle] "Maybe I should find Room 4 first."
  - [Near pizzeria before having the quest] "That place looks busy. I wonder if they need anyone."
  - [After rejection at pizzeria] "Two weeks. I don't have two weeks."
  - [After bakery gives Kruma lead] "Kruma Express. Behind the Holstentor. Nina."

---

## 1. Boot & Title Screen

### What the player sees
No UI. No title card.

The Luebeck city diorama renders at full zoom-out. Slow cinematic camera pan from high isometric view, moving toward the player character standing on the cobblestones of LM_ALTSTADT.

As the camera settles, the first thought appears above the player's head:
> [thought bubble] "Luebeck. Six in the evening, already dark."

Then a second thought:
> [thought bubble] "Twenty euros. Twenty-eight days. Room 4."

The player sees the world. The character thinks. There is no menu.

**After ~4 seconds**, the game silently enters interactive mode. The camera has settled into GAMEPLAY position. The player can move.

### Audio
- Tier 1 loading sound plays during the pan (short, atmospheric).
- As pan completes: wind_gust_loop + tram_bell_distant begin (Tier 2 gameplay ambient).

### Economy at boot
```
wallet:   20.00
day:      1
body:     100
heart:    50
shift_no: 0
```
None of these are displayed. They exist in state only.

---

## 2. Scene: act_one — Arrival

**Mode**: overlay — character thoughts above head. No bottom panel.
**Location**: LM_ALTSTADT
**Time**: 18:00
**Duration**: ~10 seconds

---

### Look & Feel

**Camera**: GAMEPLAY mode, close to player. Player character stands on cobblestones with suitcase.

**Lighting — dusk_cold**:
- Deep blue-grey sky, last orange strip at horizon
- Amber from lit windows, cold blue-grey on brick facades
- Pool of warm lantern light on wet cobblestones
- Canal water visible in background with broken orange reflections

**Weather — wind_baltic_hard**:
- Clouds move visibly across sky
- Subtle vignette at screen edges

### Audio
| Sound | Description |
|---|---|
| wind_gust_loop | Low persistent Baltic wind |
| tram_bell_distant | Clear ding-ding from off-screen left |

### Prose delivery
NO narration panel. All prose appears as player thought bubbles above head.

Thought 1: "Luebeck. Six in the evening, already dark."
Thought 2: "Twenty euros in my jacket pocket. A visa that stops in twenty-eight days. Room 4."
[3 seconds pass — player can begin moving]

**Then the two choices appear** — NOT as a panel, but as floating interactive prompt near the player:

```
[ Go right, it looks shorter. ]    → body -5
[ Go left, past the canal. ]       → body -6
```

**Design note (C20)**: Labels have natural speech rhythm, no dashes.

### After the choice

**Body score bar appears for the first time** (C6 — pulsating reveal):
- Slides in from left edge
- Pulses red once to show the drop
- Then settles as a persistent thin bar at top-left

This teaches: your body is a resource. You just spent some.

**Compass arrow appears for the first time** (C3 — only during navigation):
- Slides in from top-right corner
- Points toward B_WG (south)
- Pulses once, then stays steady

**Quest thought bubble** (above head):
> "I need to find Room 4. The paper says: 4."

Player now walks the city. This is a walking simulation (C7).

### Economy
| Event | Effect |
|---|---|
| Choice A (go right) | body -5 |
| Choice B (go left) | body -6 |

---

## 3. Scene: wg_door — Meeting Nico

**Mode**: blocking
**Location**: B_WG
**Travel required**: yes. Compass active. Player walks south through the city.
**Proximity rule** (C8): WG building becomes clickable/enterable only when player is within ~3 tiles distance.
**Time**: 18:40
**Duration**: ~7 seconds

### Look & Feel

**Transition**: City fades. WG kitchen diorama room fades in (createWGRoom() already built).

**Diorama room**:
- Single overhead amber bulb — warm contrast after the cold
- Kitchen counter. Kettle. Instant coffee jars. Radiator (tick).
- Suitcase on floor.
- Nico at counter. Medium height, slightly tired, friendly.

**Camera**: doorway_two_shot, zoom 2.45. Camera is at the doorway threshold.

**Lighting**: interior_warm_lamp — full amber.

**Coffee mug animation (C19)**: When Nico's line "He pushes a mug across the counter" triggers, the mug prop visibly slides from his side to the player side of the counter. Small animation, high impact.

### Audio
| Sound | Description |
|---|---|
| stairwell_echo | Stairs sound, fades out |
| kettle_low | Barely simmering |
| radiator_tick | Slow rhythmic tick |

### Dialogue Panel
The dialogue panel slides up from the bottom for the first time (C6 — pulsating reveal on first appearance).

Speaker: Nico [portrait: small circular avatar, slightly scruffy, warm eyes]

Narration lines (italic):
> Room 4 is on the second floor of a building the colour of wet brick.
> The stairwell smells of radiators and old paint.
> Somebody has left the kitchen door open. There is a lamp on in there.

Nico speaks:
> "Oh. You're the new one. Room 4."
> "Sit down. Put the suitcase down, it isn't going anywhere."
[mug slides across counter]
> He pushes a mug across the counter. Instant coffee. It is the best thing you have ever held.

Choices:
```
[ "Thank you. I didn't think anyone would be awake." ]   → r_nico +1
[ "How long have you been here?" ]                       → neutral
```

### NPC Memory System (C9)
r_nico is not displayed. However Nico's behaviour in every future scene is shaped by this score. If r_nico is high: Nico is warmer, gives better hints, defends the player in Act III crisis. If low: professional but distant. This runs silently in the background like Shadow of Mordor's nemesis system.

---

## 4. Scene: nico_kitchen — Two Things

**Mode**: blocking (same room, no travel)
**Time**: 18:50
**Duration**: ~6 seconds

Camera shifts to over_shoulder_table. Three bins visible in corner background.

Nico:
> "Right. Two things, then sleep."
> "One — the university office shuts at five. It's ten past six."
[You look at the window. The window looks back, black.]
> "Two, and I am serious about this one. The bins."

```
[ "The bins." ]                                         → nico_bins_choice
[ "Can the bins wait? I've been travelling two days." ] → nico_sends_kruma (heart -2)
```

**Economy**:
- "Can it wait?" → heart -2. Body score bar pulses to reflect.
- "The bins" → avoids 25 euro fine on Day 11.

---

## 5. Scene: nico_bins_choice — Muelltrennung

**Mode**: blocking (same room)
**Duration**: ~7 seconds
*(Reached only via "The bins." choice)*

### Camera
insert_three_bins — cuts close to the bins. Lower half of screen.

### Full German waste system (C11 — updated from comments):

| Bin | Colour | Contents |
|---|---|---|
| Blue (Blaue Tonne) | #3A86FF | Paper, cardboard, newspapers |
| Yellow (Gelber Sack) | #FFD166 | Plastic, metal, composite packaging (Tetra Pak) |
| Brown/Green (Biomüll) | #8B6914 | Organic food waste, garden waste |
| Black/Grey (Restmüll) | #444444 | Non-recyclable residual waste |
| Glass containers (public) | #88BB44 | By colour: white, green, brown |
| Pfand bottles | bottle icon | Deposit bottles returned to stores for refund |

**For Act I, Nico teaches the three main household bins** (blue, yellow, black). The brown bin and Pfand system are introduced later when player explores the city.

### Bins are tappable (C11)
This is a mini-interaction similar to the Kruma picking mechanic (C12):
- Three bins shown close-up with labels hidden initially
- Nico says: "Blue is paper, yellow is plastic, black is everything else"
- Player taps each bin as Nico names it — small confirmation animation (bin lid opens briefly)
- Learning by doing, not by reading

```
[ "Blue paper, yellow plastic, black the rest. Say it again, slower." ]
    → knows_trennung = true, r_nico +1

[ "Twenty-five euros. For bins." ]
    → no flag set (fine risk Day 11)
```

### UI Unlocked — Vocab Notebook
```
unlocks: {
  ui: [ btn-vocab-notebook, vocab-modal, vocab-list ],
  mechanic: vocab_notebook
}
```
📔 Notebook button slides in from top-right with pulsating glow (C6).
First entry: Muelltrennung — "waste sorting" — with audio replay button.

---

## 6. Scene: nico_sends_kruma — Find Work (Kruma NOT mentioned)

**Mode**: overlay
**Duration**: ~6 seconds

Nico (no longer tells player about Kruma directly — C10):
> "One more thing and then I'll leave you alone. Lokker wants thirty euros by Friday."
> "You'll need to find work tonight. Around the old market, near the Holstentor — there is always something for somebody willing to start now."

```
[ "Tonight? I have not even put the suitcase down." ]   → neutral
[ "Around the old market. Got it." ]                    → r_nico +1
```

Both → uni_closed.

Quest tracker card drops from top (C6 — first appearance, pulsating):
```
🎯  Find work near the old market tonight
    Lokker wants €30 deposit by Friday.
```

Compass appears pointing to B_UNI (Nico said to go past it on the way).

---

## 7. Scene: uni_closed — The Locked Door

**Mode**: blocking
**Location**: B_UNI (travel required — compass guides)
**Time**: 19:20
**Duration**: ~7 seconds

### Look & Feel

**Camera**: through_glass_two_shot. Camera is OUTSIDE looking THROUGH the door glass at Rita inside.

**Through-glass shader (C17)**: Confirmed. A distortion/refraction shader on the door mesh. Not just framing — the glass is physically there.

**Lighting**: night_lantern + cold_clear. One window still lit inside. Cobblestones have wet-sheen from wind.

**Rita's stamp sound (C18)**: She's holding keys, but a faint administrative sound (paper shuffle, drawer close) is audible from inside. Her full stamp obsession is Act II — this is just a tease.

Rita (muffled slightly through glass):
> "We closed at seventeen hundred."

```
[ "I know. I've only just arrived. I only wanted to see where it was." ]
    → heart +3
    → "Nine o'clock. Two hundred and fifty euros. Notes, not coins."

[ "Please. Two minutes. I've come a very long way." ]
    → heart -3
    → "So has everybody in the queue that starts tomorrow at nine."
```

Both choices → pizzeria_job. The 250 euro number has been named. It will not appear in the HUD until after the first shift.

---

## 8. Scene: pizzeria_job — First Rejection (NEW)

**Mode**: blocking
**Location**: B_PIZZA (travel required — player explores freely)
**Time**: 19:35
**Duration**: ~9 seconds

### Look & Feel

**Camera**: counter_low_across — looking up at the pizzeria owner behind the counter.
**Lighting**: interior_warm_red — red pendant lights, flour dust in the air, hot oven glow.

**Atmosphere**: Loud, hot, busy. A man in a flour-dusted apron does not look up when you enter.

Prose:
> The pizzeria shutter is half up. Hot air and garlic come out from under it.
> You duck inside. A man in a flour-dusted apron doesn't look up.
> Owner: "We're closed."
> You: "I'm looking for work. Any work."
> He looks up for the first time. Assesses. Looks back down.
> Owner: "Nobody to train tonight. Come back in two weeks. Or don't."

```
[ "Two weeks is too late. Thank you anyway." ]
    → Outside, cold air again. Flour smell stays with you half a block.

[ "Can I leave my number?" ]
    → He points at a corkboard. Already full. You write at the bottom.
```

Both → bakery_job.

**Player thought bubble after this scene**:
> "Two weeks. I don't have two weeks."

---

## 9. Scene: bakery_job — Second Rejection / Kruma Discovery (NEW)

**Mode**: blocking
**Location**: B_BAKERY (player explores to find it)
**Time**: 19:50
**Duration**: ~14 seconds

### Look & Feel

**Camera**: counter_close_warm — intimate counter shot.
**Lighting**: interior_warm_bakery — the warmest lighting in the game so far. Yellow-amber, soft.

**Atmosphere**: Quiet, bread smell, faint oven hum. Complete contrast to the pizzeria. Martha is stacking bread trays when you knock.

### Martha's introduction
This is the player's first meeting with Martha (Oma Martha). She is warm but honest. She listens fully before responding — which you notice because nobody has done that since you arrived.

She provides:
1. A kind rejection (language barrier — orders go to German customers)
2. A Franzbroetchen (free pastry)
3. The Kruma Express lead — the only way the player learns where to go

Martha:
> "Do you speak German? Even a little?"
> [player explains]
> "Our orders go to German customers. It would not work, not tonight."
> [she pauses, takes a Franzbroetchen from the tray]
> "But. There is a place around the Holstentor. Kruma Express. Dark store. Night deliveries."
> "They sort by ear, not by words. You hear the article, you find the shelf. Nina runs it."
> "Tell her Martha sent you."

```
[ "Kruma Express. I'll find it. Thank you, Martha." ]   → r_martha +2
[ [Take the Franzbroetchen and go.] ]                   → r_martha +1
```

Both → shift_1_teach.

**Why this scene matters**:
- Kruma Express is DISCOVERED, not assigned. This makes the first shift feel earned.
- Martha is introduced warmly and organically — she is a recurring character.
- The Franzbroetchen is a small gift that players remember. It becomes Martha's signature.
- Martha's memory (C9): she remembers you came to her for work before Kruma. Future dialogues reference this.

**Economy**:
| Effect | Value |
|---|---|
| r_martha +1 or +2 | Relationship memory |
| Franzbroetchen | body +2 (implied, not shown as a stat) |

---

## 10. Scene: shift_1_teach — First Warehouse Shift (TEACH)

**Mode**: gameplay
**Location**: B_DARKSTORE (travel required — compass guides to Kruma Express)
**Time**: ~20:10
**Duration**: ~18 seconds

### Travel
Player now has "Kruma Express" as their destination. Compass points to B_DARKSTORE.

### Arrival and Nina's briefing
Player enters. Nina Lindemann at the dispatch counter. Full diorama character.

Nina:
> "You're the temp, or you're lost."
> "Martha sent you? Fine. Shelves. Three rows."
> "Bottom is der. Middle is die. Top is das."
> "Not fruit on one and drinks on another. Nobody sorts a warehouse by fruit."
> "The word tells you the shelf. Learn the word and you stop searching."

### The shelf

| Row | Article | Colour | Symbol |
|---|---|---|---|
| Bottom | der | Blue #3A86FF | ▲ |
| Middle | die | Pink #FF006E | ● |
| Top | das | Purple #8338EC | ■ |

3D food models on coloured tier rails. Gender symbols visible on shelf edge tags.

### TEACH Mechanic (icon_delay = 0.0s)
Voice + shelf glow SIMULTANEOUSLY. Cannot fail.

### Generous timer (C13)
Shift 1 has significantly more time per item than later shifts. Player can be slow.

**Nina's reactive speed comments (C13)**:
- If player is slow: Nina says nothing at first. Mid-shift: "You'll get faster. Everyone does."
- If player is very slow: "You're in Germany now. We move at German speed."
- If player is fast: [surprised] "I didn't expect you to match German speed on your first night."
- If player is exceptional: "Martha said you needed work. She didn't say you were good."

These appear as dialogue overlay lines DURING the gameplay, not blocking it.

### HUD Unlocked (first appearance, pulsating — C6)
- Tuition bar slides up from bottom. Shows 20/250. Tiny sliver.
- Shift timer slides in from left.

### Economy
| Event | Effect |
|---|---|
| Complete Shift 1 | wallet +9.50, shift_no → 1 |

Wallet: 20 → 29.50

---

## 11. Scene: shift_2_anticipate — Second Shift (ANTICIPATE)

**Mode**: gameplay
**Duration**: ~14 seconds

### The Change
1.5 second gap between voice and glow. Player starts moving on the word.

Early pick (before glow) → 2x bonus → gold flash + coin sound.

Nina (text overlay):
> "There it is. You heard it before you saw it."

### HUD Unlocked
- Freshness bar slides in from right (C6).

### Economy
| Event | Effect |
|---|---|
| Complete Shift 2 | wallet +10.50, shift_no → 2 |

Wallet: 29.50 → 40.00

---

## 12. Scene: shift_3_test — Third Shift (THE AHA)

**Mode**: gameplay
**Duration**: ~12 seconds
**Target: reached by second 90 from boot. Pacing must be verified after new scenes added.**

### The glow never comes
2.5 second gap. The icon never arrives. The player is already moving.

Thought bubble (appears mid-gameplay, non-blocking):
> "The light does not come. It does not come because I do not need it."
> "I have known this word for eleven minutes. I already knew which shelf."

### Why this matters
The player didn't study. They sorted it physically three times and their hands learned it. der = bottom blue. die = middle pink. das = top purple. The grammar became spatial memory.

### HUD Unlocked
- Integrity bar slides in from right (C6).

### Economy
| Event | Effect |
|---|---|
| Complete Shift 3 | wallet +11.50, shift_no → 3, heart +6 |

Wallet: 40.00 → 51.50

---

## 13. Scene: shift_receipt — The Receipt

**Mode**: blocking
**Duration**: ~12 seconds

Nina:
> "Three manifests. The receipt prints on paper that curls."
> "Thirty-one fifty for the night. You earned it."

**Receipt thermal printer animation (C14)**: Paper curls out from the top of a small thermal printer prop in the diorama. The receipt text appears as it prints, line by line.

**About tips (C15)**: In Germany, you never ask for a tip. Customers give spontaneously. The "bitte" story beat is kept as-is (the hostel customer tipped spontaneously because you were polite). No mechanic that asks for a tip.

Single choice: [ Take the receipt. ]

**Debrief receipt panel** (full-screen slide-up, C6):
```
KRUMA EXPRESS — SHIFT LOG
Base wage:          31.50
──────────────────────────
TOTAL:              31.50
Wallet now:         51.50
Tuition:       ████░░░░  21%
```

Tuition bar updates. The player sees the bar move. That first movement matters.

---

## 14. Scene: rita_first — The Number as Weather

**Mode**: overlay
**Duration**: ~6 seconds

Thought bubble (above head):
> "I have 51.50 euros."
> "Two hundred and fifty is not a number I can look at directly yet. It is more like weather."

Single choice: [ Walk back the slow way. ]

---

## 15. Scene: night_one — The Canal Call

**Mode**: blocking
**Location**: LM_CANAL (player walks back through city)
**Time**: 20:10
**Duration**: ~14 seconds

### Look & Feel

**Camera**: wide_reflection_hold. Canal fills bottom third. Lanterns reflected as unbroken orange lines on still water. Player character is small against it.

**Film grain and vignette (C16)**: Confirmed. Subtle film grain layer + soft vignette on this scene specifically. Sells the emotional weight.

**Phone (C16)**: The phone is a 3D prop in the player's hand (small rectangle glowing). As the call connects, a 2D overlay also appears (the call screen UI — name, avatar, duration). Both simultaneously.

**Lighting**: night_lantern_water — deep blue-black sky, orange lanterns, perfect reflections.
**Weather**: still_cold — wind has stopped. Quiet.

### Audio
| Sound | Description |
|---|---|
| water_lap_soft | Quietest sound in the game |
| phone_buzz | One vibration. Silence. Then ringtone. |

### The choice

```
[ "It's beautiful here. Everything's fine. The room's great." ]
    → heart +6
    → "You hear your mother let a breath out. It is worth the lie."

[ "I got in late. I missed the office. I have seventeen euros." ]
    → told_truth_home = true, heart -4
    → Father takes the phone: "So you'll go at nine tomorrow. That's all this is."
    → "It fixes nothing. You sleep better anyway."
```

The told_truth_home flag echoes in Act IV (four_phone scene).

---

## 16. Scene: night_one_end — Room 4

**Mode**: overlay
**Location**: B_WG
**Time**: 21:30
**Duration**: ~6 seconds

Thought bubble:
> "Room 4 has a bed, a desk, a window, and a radiator that ticks."
> "I do not unpack. I will not unpack for eleven days."

Single choice: [ Sleep. ]

Audio: radiator_tick only. Then silence.

Transition: night_tick time-lapse (clock advances, city darkens then lightens) → act_two.

---

## 17. Economy Summary — Full Act I

| Scene | Wallet | Body | Heart | Key flags |
|---|---|---|---|---|
| Boot | 20.00 | 100 | 50 | — |
| act_one (go right) | 20.00 | 95 | 50 | — |
| act_one (go left) | 20.00 | 94 | 50 | — |
| wg_door (thank you) | 20.00 | 95/94 | 50 | r_nico +1 |
| nico_bins (learn) | 20.00 | 95/94 | 50 | knows_trennung=true, r_nico +1 |
| nico_kitchen (skip bins) | 20.00 | 95/94 | 48 | — (fine risk Day 11) |
| uni_closed (gracious) | 20.00 | 95/94 | +3 | — |
| uni_closed (beg) | 20.00 | 95/94 | -3 | — |
| pizzeria_job | 20.00 | 95/94 | varies | — |
| bakery_job | 20.00 | 95/94 + body+2 | varies | r_martha +1 or +2 |
| shift_1_teach | 29.50 | varies | varies | shift_no=1 |
| shift_2_anticipate | 40.00 | varies | varies | shift_no=2 |
| shift_3_test | 51.50 | varies | +6 | shift_no=3 |
| night_one (lie) | 51.50 | varies | +6 | — |
| night_one (truth) | 51.50 | varies | -4 | told_truth_home=true |
| **End of Act I** | **51.50** | **~96** | **~56** | lease still needed: 30 |

---

## 18. HUD Progression — What Unlocks When

| Scene | New UI Element | How introduced |
|---|---|---|
| act_one (after choice) | Body score bar | Pulses in from left, shakes once |
| act_one (start walking) | Compass arrow | Slides from top-right, pulses |
| wg_door | Dialogue panel | Slides up from bottom |
| nico_bins_choice | Vocab notebook 📔 | Slides from right with glow |
| nico_sends_kruma | Quest tracker card | Drops from top with pulse |
| shift_1_teach | Tuition bar + timer | Rise from bottom / fill from left |
| shift_2_anticipate | Freshness bar | Slides from right |
| shift_3_test | Integrity bar | Slides from right |
| shift_receipt | Debrief receipt panel | Full-screen slide-up |

**NOT visible in Act I**: Day counter, docs dossier, wallet HUD, shop button, heart bar.

---

## 19. Story.json Changes Made

All changes already applied to `assets/narrative/story.json`:

| Change | What |
|---|---|
| `nico_sends_kruma.prose` | Removed Kruma Express mention. Nico says "find work near the Holstentor" |
| `nico_sends_kruma.choices[1].label` | Changed "Behind the Holstentor. Got it." → "Around the old market. Got it." |
| `uni_closed.choices[*].to` | Changed from `shift_1_teach` → `pizzeria_job` |
| `uni_closed.divert` | Changed from `shift_1_teach` → `pizzeria_job` |
| NEW: `pizzeria_job` | Full new scene — player asks for work, gets rejected, walks away |
| NEW: `bakery_job` | Full new scene — Martha rejects politely, gives Franzbroetchen, reveals Kruma Express |

---

## 20. Remaining Open Questions (unresolved)

| # | Question | Notes |
|---|---|---|
| Q1 | Idle timer: how long before IDLE camera activates? | Suggest 3 seconds |
| Q2 | Idle thought frequency: how often do player thoughts trigger? | Suggest: 30s first, 60s next, 90s after |
| Q3 | Proximity distance for building interaction? | Suggest: 3 city tiles radius |
| Q4 | Should the Franzbroetchen give an actual body +2 in state? | Currently implied only |
| Q5 | Pacing: two new scenes add ~23 seconds. Does Act I still hit 90s Aha target? | Needs browser timing test |
| Q6 | Wallet display: first shown in debrief receipt, or is it always visible from start? | Currently: receipt first |
