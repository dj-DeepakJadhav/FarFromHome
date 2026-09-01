# Far From Home: Kruma Express — Master Resources & Design Decision Archive

> **Permanent Living Archive & Decision Rationale Authority**  
> This file tracks every external resource, GDC talk, game reference, research link, and core design decision provided by the director. Whenever doubts arise in the future regarding *why* a feature, system, or mechanic exists, consult this document.

---

## 1. Master Catalog of Provided Resources & Video References

| # | Resource / Link | Creator / Studio | Core Game Design Framework / Takeaways | Why We Applied It in *Far From Home* |
| :- | :--- | :--- | :--- | :--- |
| **1** | [**Choices That Matter in Game Narrative**](https://www.youtube.com/watch?v=8FgBctI5ulU) | GDC Talk (Jamie Antonisse / Andrew Walsh) | • **"Mountain on the Horizon"**: Persistent overarching goal (`20€ / 250€` Tuition & Visa).<br>• **Narrative Economy**: Goal ➔ Action ➔ Feedback ➔ Respite.<br>• **Show & DO**: Active stakes over passive text. | Forms our top HUD goal tracking and the 4-phase gameplay loop (`Pick ➔ Ride ➔ Doorstep ➔ Room`). |
| **2** | [**Startup Panic Post-Mortem & Mechanics**](https://www.youtube.com/watch?v=QWQX_GBO0aI) | Algorocks / *Startup Panic* | • **Systemic Management Loop**: Invest ➔ Harvest ➔ Upgrade ➔ Observe Growth.<br>• **Expat Survival Skill Tree**: 3 Branches (*Hustler*, *Bureaucrat*, *Diplomat*).<br>• **Tangible Room Upgrades**: E-Bike, Thermal Bag, Corkboard physically manifest in the 3D room. | Transformed our game from a simple runner into a deep, systemic student life and courier management simulation. |
| **3** | [**The Nature of Order in Game Narrative**](https://www.youtube.com/watch?v=E-qnXNUSUMA) | Jesse Schell (GDC 2018) | • **15 Properties of Living Order** (Christopher Alexander).<br>• **Levels of Scale (Telescoping Goals)**: Macro (28d visa) ➔ Meso (Daily shifts) ➔ Micro (3s shelf pick).<br>• **Strong Centers & The Void**: WG Dorm Room sanctuary as peaceful respite.<br>• **Boundaries**: Doorstep buzzer threshold. | Solves world pacing, giving high-stress courier rushes a peaceful, meditative emotional sanctuary (*Stoßlüften*). |
| **4** | [**Narrative Sorcery: Storytelling in Open Worlds**](https://www.youtube.com/watch?v=HZft_U4Fc-U) | Jon Ingold (inkle / GDC 2017) | • **Encounters over Quests**: Non-linear free exploration.<br>• **Narrative Atoms with Preconditions**: Dialogue blocks only surface when prerequisites are met.<br>• **State-Dependent Reactivity**: NPCs react to current funds, smell of food, and work hours.<br>• **Organic World Blockers**: Real German laws replace artificial invisible walls. | Replaced rigid branching dialogue with reactive, living NPC encounters that remember the player's recent actions. |
| **5** | [**80 Days: Narrative Design & Post-Mortem**](https://www.youtube.com/watch?v=--3meejDM-U)<br>[**inkle: 80 Days Official**](https://www.inklestudios.com/80days/) | Meg Jayanth & Jon Ingold (inkle) | • **4-Resource Tension Engine**: Time (28d), Money (250€), Work Quota (20h), Freshness.<br>• **"Leading Players Astray"**: Tempting risky side-stories (e.g. Mathias's pizza cash shift).<br>• **"NPCs with Agency"**: Characters have their own grief, families, and schedules.<br>• **Player Persona Voice**: Choices define *Hustler* vs. *Bureaucrat* vs. *Diplomat*. | Anchors the emotional depth of every resident and creates tempting narrative detours. |
| **6** | [**German Laws & Expat Life Compendium**](file:///c:/DeepakJadhav/Personal/FarFromHome/Docs/GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md) | Official German Federal Law & Student Reality | • **§16b AufenthG**: Strict 20-Hour Weekly Work Limit.<br>• **Schwarzarbeit**: Unregistered cash gigs vs. primary contract.<br>• **4-Document Catch-22**: Lease ➔ Anmeldung ➔ Bank ➔ Uni ➔ Visa.<br>• **Alltag Rules**: *Stoßlüften*, *Pfand*, *22:00 Ruhezeit*, *Mülltrennung*. | Guarantees 100% authentic cultural and legal simulation without fantasy shortcuts. |
| **7** | [**The Three Pillars of Game Writing**](https://www.youtube.com/watch?v=wNNXdoj7cCQ) | Extra Credits | • **Plot**: External ticking pressure (28d visa, 250€ tuition).<br>• **Character**: Internal motivations & grief (Lokker's Anna, Rita's daughter).<br>• **Lore**: Hanseatic brick gothic history, Beamtendeutsch, and German daily life. | Forms the 3-act narrative architecture and character depth of our entire world. |
| **8** | [**How To Start Your Game Narrative: Design Mechanics First**](https://www.youtube.com/watch?v=22HoViH4vOU) | Extra Credits (James Portnow) | • **Mechanics First, Story Last**: Emotional Core ➔ Core Gameplay Loop ➔ Art Style ➔ Narrative.<br>• **Zero Ludonarrative Dissonance**: Dialogue and quests must emerge directly from player verbs (Steering, Sorting, Budgeting).<br>• **Show & DO**: The player feels the tension through the 20h quota and cobblestone friction before any NPC speaks. | Ensures that every dialogue line and story quest reinforces live gameplay mechanics. |

---

## 2. Master Decision Rationale Matrix ("Why Did We Make These Decisions?")

### Q1: Why is the game 100% English-first with German as atmospheric flavor?
* **Decision**: We eliminated mandatory German grammar puzzles from primary dialogue and shelf navigation, making English the default with authentic German voice acting and subtle subtitles (`Milk (die Milch)`).
* **Rationale**: Hackathon judges evaluate game prototypes in **3 to 5 minutes**. Mandatory German grammar exams created severe cognitive friction and turned off non-German speakers. English-first dialogue allows instant emotional immersion while German voice acting preserves rich cultural charm.

### Q2: Why do we have the 20-Hour Work Limit and Off-the-Books Cash Shifts?
* **Decision**: We added the `⏱️ 0/20h` weekly legal quota meter to the HUD, and let players choose between official Kruma shifts and shady night cash gigs at Mathias's Pizzeria (*Schwarzarbeit*).
* **Rationale**: Under German immigration law (§16b AufenthG), international students are strictly capped at 20h/week. The tension between needing €250 for tuition before the deadline and risking an off-the-books cash gig creates incredible narrative and economic gameplay stakes.

### Q3: Why is the WG Dorm Room a living 3D sanctuary rather than a simple menu?
* **Decision**: Every upgrade purchased (E-Bike frame, Thermal Bag, Study Corkboard, Notepad, Window) visually renders in real-time in the isometric 3D dorm room, accompanied by a peaceful *Stoßlüften* window moment.
* **Rationale**: Applying Jesse Schell's *The Nature of Order* (*Strong Centers* and *The Void*), high-adrenaline street courier shifts need a peaceful, restorative physical anchor where players observe their tangible growth.

### Q4: Why did we declutter the top HUD and remove the VOCAB button?
* **Decision**: Reduced the top HUD to only 3 essential components on Row 1 (Settings, Skills Button, Tuition Progress) and a full-width Objective bar on Row 2.
* **Rationale**: Squeezing 6 different buttons, tiny paper icons, and vocabulary drills into a 390px mobile portrait header caused horizontal overflow and text clipping. Clean, spacious minimalism ensures perfect legibility.

### Q5: Why did we add the Randomized Winter vs. Summer Semester Intake?
* **Decision**: Each fresh game start randomly assigns either *Wintersemester (WiSe)* or *Sommersemester (SoSe)*, altering lighting palette, fog density, street friction, heating/freshness rules, and NPC greetings.
* **Rationale**: Gives players and hackathon judges instant replayability and delightful surprise on every run with **0KB asset bloat**, reflecting the two distinct seasonal realities of studying in Germany.

### Q6: Why do we follow the "Design Mechanics First" philosophy?
* **Decision**: We engineered the economic simulation, 4-phase loop, 20h quota, and bicycle drift physics *before* writing the dialogue. The dialogue directly comments on your wallet balance, your speed, your current work hours, and your dorm upgrades.
* **Rationale**: Prevents ludonarrative dissonance. The player never feels like they are reading an irrelevant novel; every word spoken by Rita, Lokker, or Nina is a direct reaction to what the player just did mechanically.

---

## 3. Mandatory Protocol for Future Agents

Every AI agent (Antigravity, Claude Code, Gemini CLI) MUST follow this rule before modifying game systems or writing code:
1. **Consult This Resource Archive**: Check why existing systems were engineered before refactoring them.
2. **Consult [`Docs/GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md`](file:///c:/DeepakJadhav/Personal/FarFromHome/Docs/GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md)**: Ensure all economic and narrative changes obey canonical German legal constraints.
3. **Consult [`Docs/GAME_MIND_MAP_AND_NARRATIVE_DESIGN.md`](file:///c:/DeepakJadhav/Personal/FarFromHome/Docs/GAME_MIND_MAP_AND_NARRATIVE_DESIGN.md)**: Update the living mind map and character interaction matrix with every change.
4. **Verify Build Integrity**: Always run `node build/assemble.js` and `node build/check-size.js` (must remain `< 35 MB` and 100% offline airgapped).
