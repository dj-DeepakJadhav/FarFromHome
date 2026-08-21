# 00 — DESIGN CONSTITUTION (Authoritative)

> **STATUS: ACTIVE & NON-NEGOTIABLE**  
> Every other document in `Docs/`, codebase module in `src/`, and agent skill in `.claude/skills/` or `.agents/skills/` defers to this constitution.

---

## 1. The Three Non-Negotiable Pillars

### Pillar 1: German is Spoken-Only
- **Rule 1.1**: Every word the player must **read** to play is **English** (manifest, HUD, buttons, dialog subtitles, tooltips).
- **Rule 1.2**: Every word the player **hears** is authentic **German** (item callouts, resident intercom responses, cook, ambient street noise).
- **Rule 1.3**: German audio fires **~1.5s before** the visual manifest reveals the item icon. Understanding German gives an immediate head-start to move early and bank streak. Not understanding German means waiting for the English icon and losing a beat.
- **Rule 1.4**: **Never blocked, only rewarded.** German is a shortcut to higher efficiency and tips, never a hard pass/fail gate.
- **Rule 1.5**: Vocabulary discipline: 8–12 high-frequency nouns repeated across contexts. Use ▲ (*der*) / ● (*die*) / ■ (*das*) color-blind glyphs in reference tables.

### Pillar 2: The Room is the Progress Bar (Visible Growth)
- **Rule 2.1**: Money earned from shifts is not an abstract metric—it buys physical furnishings and a pet companion for the student room.
- **Rule 2.2**: The four Kenney CC0 asset kits serve strict mechanical roles:
  - `mini-market`: The Dark Store (core picking venue).
  - `furniture-kit`: Home furnishings that dynamically appear in the room (`createLevel0Room`).
  - `cube-pets`: Room companion (e.g. cat/dog) boosting student morale.
  - `holiday-kit`: Win-state celebration dressing when the 250€ *Semesterbeitrag* is paid.
- **Rule 2.3**: Location-Verb Rule: A location earns its place in the game *only if it introduces or modifies a core verb*. Furniture stores, pet stores, and holiday stages are **not** separate levels; they are the visible growth readout of the single core economy.
- **Rule 2.4**: **Invest-Harvest-Upgrade Loop**: The game MUST feature a repeating invest, harvest, and upgrade loop where output (earnings) reinvests into progression (e.g. buying a bike to do deliveries faster, furniture to unlock buffs).
- **Rule 2.5**: **The Economy is the Engine**: What the player earns must meaningfully feed back into growth. There must be multiple cycles with visible progress (e.g. the room after 15 mins looks vastly different from minute 1). Satisfying loops and aesthetic coherence are mandatory.

### Pillar 3: One Core Verb Across Contexts
- **Rule 3.1**: The core game loop verb is **Hear/Read $\rightarrow$ Identify $\rightarrow$ Tap / Route**.
- **Rule 3.2**: This verb is applied across three distinct narrative contexts:
  1. **Dark Store**: Picking grocery items by audio callout & shelf memory.
  2. **Route Selection**: Tactical transit trade-off (*Kurzer Weg* vs *Fahrradweg*) balancing freshness vs bag integrity.
  3. **Doorstep Intercom**: Buzzing the correct resident name and apartment floor code (`EG`, `1. OG`, `HH`) under time pressure.

### Pillar 4: Systemic 3-Tier Loops & Experiential Debriefing
- **Rule 4.1 (3-Tier Nested Loops)**: Every interaction must align across:
  - *Micro-Loop (1–5s)*: Audio cue $\rightarrow$ Tap $\rightarrow$ Tactile ASMR bounce feedback.
  - *Macro-Loop (1–2m)*: Briefing $\rightarrow$ Pick $\rightarrow$ Route $\rightarrow$ Intercom $\rightarrow$ **Itemized Settlement Debrief**.
  - *Meta-Loop (5–15m)*: Pay 250€ *Semesterbeitrag* $\rightarrow$ Transform student room from bare floor to furnished home sanctuary.
- **Rule 4.2 (Experiential Debriefing / Kolb Cycle)**: Every shift MUST conclude with an explicit, itemized receipt breakdown (Base Wage, Streak/Speed Bonus, Etiquette Tips, Item Damage Deductions, Net Payout) so players clearly understand cause-and-effect and adapt strategy for future shifts.
- **Rule 4.3 (Systemic Interconnection & Friction)**: Cargo fragility, road surface choices, and timer pressure must interact deterministically without hidden random penalties.

---

## 2. Screen Layout Specification (390×844 Portrait)

All UI elements must strictly fit within the 390×844 portrait frame without clipping or overflowing:

```
+---------------------------------------------------+ [0px]
| TOP BAR (40px)                                    |
| [Shift 2]   [🔥 1.5x Streak]   [💰 45€ / 250€] [🔊] |
+---------------------------------------------------+ [40px]
| TOP CONTEXT / GOAL CARD (90px)                    |
| Order #104 (3 items) • Timer: [████████░░] 14s     |
| [🥛 Milk] [🍞 Bread] [🍎 Apple]                    |
+---------------------------------------------------+ [130px]
|                                                   |
|                                                   |
| CENTER 3D ISOMETRIC VIEWPORT (460px)              |
| (Clean Kenney Low-Poly Diorama with Cel Outline)  |
| - Dark Store Shelves in PICK                      |
| - Transit 3D push in RIDE                         |
| - Building Doorway in INTERCOM                    |
| - Furnished Student Room in ROOM/SHOP             |
|                                                   |
|                                                   |
+---------------------------------------------------+ [590px]
| BOTTOM ACTION ZONE (210px)                        |
| In PICK:      Freshness Meter + Bag Drop Targets  |
| In RIDE:      Route Choice Cards (Rough vs Safe)  |
| In INTERCOM:  Intercom Keypad & Floor Selector    |
| In ROOM/SHOP: Buy Furniture & "Start Next Shift"  |
+---------------------------------------------------+ [800px]
| SAFE BOTTOM MARGIN (44px)                         |
+---------------------------------------------------+ [844px]
```

---

## 3. Submission & Technical Hard Gates

1. **Size Limit**: Total packaged build (`far-from-home.zip`) must be $\le 35\text{ MB}$. Target: $\approx 3\text{–}5\text{ MB}$.
2. **Top-level `index.html`**: Single unminified standalone file runnable via file or local HTTP.
3. **No External Network Dependencies**: Zero CDNs, zero remote web fonts, zero remote API calls. All assets in `vendor/` or embedded in `src/`.
4. **Orientation**: Strictly locked portrait orientation (390×844 ratio).
5. **No Broken Fallbacks**: Missing voice assets must fail silently, never falling back to browser-inconsistent `speechSynthesis`.

---

## 4. Evaluation Rubric & Priorities

| Criteria | Weight | Implementation Focus |
|---|---|---|
| **Player Engagement** | **30%** | Live visible streak multipliers, time pressure (`pickTimeLimit`), audio head-starts. |
| **Playability** | **25%** | Responsive input, zero ambiguity, clear English HUD, intuitive touch/click targets. |
| **Core Loop** | **20%** | Tight Pick $\rightarrow$ Route $\rightarrow$ Deliver $\rightarrow$ Upgrade Room loop. |
| **Focus** | **15%** | Room-as-progress-bar; every system serves the student tuition survival theme. |
| **Originality** | **10%** | Cultural German courier life, intercom etiquette, audio-first language acquisition. |
| **Visual Polish** | *Excluded from score* | Clean, legible low-poly Kenney aesthetic; legibility is mandatory. |
