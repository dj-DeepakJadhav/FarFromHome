---
name: ffh-systemic-simulation-engineering
description: Framework for engineering systemic management simulations, multi-tier gameplay loops, economic engines, and experiential learning systems in Far From Home.
---

# Systemic Simulation & Management Engineering Skill

This skill enforces systemic simulation engineering and economic loop architecture for *Far From Home: Kruma Express*, drawing from academic simulation pedagogy (Riis, Johansen, Mikkelsen; Ruohomäki) and modern systemic game design (McAulay, Millard, MDA framework).

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
| Audio Callout -> Shelf Search -> Tap/Pack -> Route Dodge -> Buzzer Etiquette |
+-----------------------------------------------------------------------------+
```

1. **Primary (Micro) Loop**: Instant sensory feedback (ASMR sound, particle bursts, squash-and-stretch item drops). Low cognitive friction, high physical tactile reward.
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
| **11. Symbols** | Visual & cultural iconography: Gender Badges (▲ Blue *der*, ● Coral *die*, ■ Purple *das*), Euro signs, Intercom glyphs. |
| **12. Materials** | Tactile Kenney low-poly dioramas, cardboard bag slots, brass buzzer panels, cozy room props. |

---

## 3. Economy as the Engine (Sources, Sinks & Friction)
An economy is not just numbers; it dictates player motivation.

- **Sources (Taps)**: Base shift wage, perfect-pick streak multiplier, route time bonuses, doorstep etiquette tips (*Trinkgeld*).
- **Sinks (Drains)**: Broken item penalties, late delivery deductions, equipment purchases (Bicycle, Thermal Bag, Rain Poncho), student room comfort items (Desk lamp, Rug, Cat companion, Holiday lights), and the mandatory 250€ tuition sink.
- **Converters**: Time & audio comprehension converted into speed; speed & precision converted into tips; tips converted into room morale and transit efficiency.
- **No Infinite Wallet**: Player capital must stay tight. Every euro spent on room comfort must compete with courier tool upgrades needed to survive the next shift.

---

## 4. Experiential Learning Cycle (Kolb-Ruohomäki Loop)
1. **Concrete Experience**: Player hears German callout *"Ein Kasten Mineralwasser!"* and struggles to find the heavy crate under time pressure.
2. **Reflective Observation**: Player notices in the post-shift debrief receipt that the heavy crate slowed down traversal and lowered tips.
3. **Abstract Conceptualization**: Player realizes: *"Heavy items hurt bag integrity on cobbled streets; I need a Cargo Rack upgrade or must prioritize the smooth Fahrradweg."*
4. **Active Experimentation**: In the next shift, player immediately takes the *Fahrradweg* route when carrying bottled crates, validating their mental model.

---

## 5. Pre-Implementation Audit Checklist
Before writing code for any game mechanic:
- [ ] Does this mechanic link directly across Micro, Macro, and Meta loops?
- [ ] Is there clear cause-and-effect visibility (the player knows *why* they succeeded or failed)?
- [ ] Does it maintain economic tension without feeling unfairly punitive?
- [ ] Is feedback immediate and multisensory (audio chime, UI bounce, visual gauge update)?
- [ ] Does it respect the Design Constitution (Spoken German only, English text, Room is Progress Bar, 390x844 layout)?
