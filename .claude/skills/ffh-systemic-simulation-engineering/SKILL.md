---
name: ffh-systemic-simulation-engineering
description: Framework for engineering systemic management simulations, multi-tier gameplay loops, and economic engines in Far From Home.
---

# Systemic Simulation & Management Engineering Skill

This skill enforces systemic simulation engineering and economic loop architecture for *Far From Home: Kruma Express*, drawing from simulation-design theory (Riis, Johansen, Mikkelsen; Ruohomäki) and modern systemic game design (McAulay, Millard, MDA framework).

*Far From Home: Kruma Express* is a **narrative courier-management sim**. Single thesis:
**British deadpan comedy colliding with German municipal precision.** The systems below exist
to make that joke playable. Nothing here is a teaching instrument, and no mechanic may be
justified on pedagogical grounds — see `AGENTS.md` §3.1.

---

## 1. The 3-Tier Gameplay Loop Architecture
Every feature must clearly occupy and connect across three nested loop tiers:

```
+-----------------------------------------------------------------------------+
| TERTIARY / META LOOP (Session Arc: 5-7 mins)                                |
| Overarching Survival Goal: Pay 250€ Semesterbeitrag | Student Room Metagame |
+-----------------------------------------------------------------------------+
       | Reinvests Into                                  ^ Wages & Room Items
       v                                                 |
+-----------------------------------------------------------------------------+
| SECONDARY / MACRO LOOP (Shift Arc: 1-2 mins)                                |
| Briefing -> Pick Shift -> Route Transit -> Intercom Drop -> Debriefing/Shop |
+-----------------------------------------------------------------------------+
       | Drives                                          ^ Shift Multipliers
       v                                                 |
+-----------------------------------------------------------------------------+
| PRIMARY / MICRO LOOP (Second-to-Second: 1-5s)                               |
| Rail Pulse -> Tier Read (colour) -> Tap/Pack -> Route Dodge -> Buzzer       |
+-----------------------------------------------------------------------------+
```

1. **Primary (Micro) Loop**: Instant sensory feedback (procedural SFX, particle bursts, squash-and-stretch item drops). The informative cue is **visual** — the gender rail pulses before the item icon resolves; tapping that tier early pays 2.0×. Low cognitive friction, high tactile reward.
2. **Secondary (Macro) Loop**: Strategic shift execution, economic tension (managing Freshness vs Bag Integrity vs Shift Clock), followed by an explicit **Debriefing & Accounting Statement** (Wages, Tips, Penalties, Streak Bonus).
3. **Tertiary (Meta) Loop**: Tangible visible progression (The Room is the Progress Bar), permanent unlockable gear, and visa/tuition milestone survival.

---

## 2. The 12 Simulation Elements (Riis-Duke Framework)
When designing or refactoring any simulation module, audit against these 12 formal elements:

| Element | FFH Implementation Standard |
| :--- | :--- |
| **1. Model** | Explicit, deterministic economy & logistics model (picking speed, transit decay, tip algorithms). |
| **2. Scenarios** | 3 contextual shifts: Morning Training, Lunch Rush, Rainy Night Climax. |
| **3. Pulse / Events** | Unexpected systemic shocks: rush orders, traffic bottlenecks, cobblestone rain slicks, broken doorbells. |
| **4. Game Process** | Seamless sequence: Briefing $\rightarrow$ Execution $\rightarrow$ Debriefing $\rightarrow$ Shop Reinvestment. |
| **5. Game Periods** | Distinct work shifts with escalating customer expectations and stricter SLA timers. |
| **6. Roles** | International Student Courier (vulnerable worker, striving for tuition and community integration). |
| **7. Procedures** | Standard Operating Procedures: Pack $\rightarrow$ Stow $\rightarrow$ Ride $\rightarrow$ Buzz $\rightarrow$ Greet. |
| **8. Decisions** | Meaningful trade-offs: Fast rough road vs Safe bike lane; Formal *Sie* vs Casual *Du*; Save vs Reinvest. |
| **9. Result Statement** | Transparent end-of-shift receipt showing gross wage, speed bonus, tips, item damage penalties, net cash. |
| **10. Indicators** | Real-time dials: Bag Freshness Gauge, Bag Integrity Meter, Live Streak Multiplier, Tuition Progress Bar. |
| **11. Symbols** | Visual & cultural iconography: Gender Badges (▲ Blue `#3A86FF` *der*, ● Pink `#FF006E` *die*, ■ Purple `#8338EC` *das*), Euro signs, Intercom glyphs. Items are labelled **English-first**; the badge is the readable signal. |
| **12. Materials** | Tactile Kenney low-poly dioramas, cardboard bag slots, brass buzzer panels, cozy room props. |

---

## 3. Economy as the Engine (Sources, Sinks & Friction)
An economy is not just numbers; it dictates player motivation.

- **Sources (Taps)**: Base shift wage, perfect-pick streak multiplier, route time bonuses, doorstep etiquette tips (*Trinkgeld*).
- **Sinks (Drains)**: Broken item penalties, late delivery deductions, the 5 equipment purchases in `src/data/shop.js` (E-Bike €45, Thermal Bag €50, Shelf Labels €25, Pocket Notepad €20, Shift Rota Cards €35), student room comfort items, and the mandatory 250€ tuition sink.
- **Converters**: Pattern recognition on the rail pulse converted into speed; speed & precision converted into tips; tips converted into room morale and transit efficiency.
- **No Infinite Wallet**: Player capital must stay tight. Every euro spent on room comfort must compete with courier tool upgrades needed to survive the next shift.

---

## 4. Systemic Feedback Cycle (Player Mental Model)
The player is never instructed. They are allowed to *infer* the system and then exploit it —
that inference is the reward.

1. **Concrete Experience**: The dispatch rail pulses purple, the icon has not resolved yet, and the player hesitates and loses the 2.0× window.
2. **Reflective Observation**: The debrief receipt shows how much of the shift's pay was forfeited early-pick bonus.
3. **Abstract Conceptualisation**: The player realises the colour alone is sufficient — the icon is confirmation, not information.
4. **Active Experimentation**: Next shift they commit on the pulse, the multiplier climbs, and they have voluntarily become fluent in a filing system invented by a bureaucracy. That is the punchline.

## 5. Pre-Implementation Audit Checklist
Before writing code for any game mechanic:
- [ ] Does this mechanic link directly across Micro, Macro, and Meta loops?
- [ ] Is there clear cause-and-effect visibility (the player knows *why* they succeeded or failed)?
- [ ] Does it maintain economic tension without feeling unfairly punitive?
- [ ] Is feedback immediate and multisensory (procedural chime, UI bounce, visual gauge update) — with the *informative* cue always visual, never audio?
- [ ] Does it respect the Design Constitution (English-first labels, colour/symbol tiers, procedural audio only, Room is Progress Bar, 390×844 layout)?
- [ ] Does it serve the comedy thesis rather than a pedagogical one?
