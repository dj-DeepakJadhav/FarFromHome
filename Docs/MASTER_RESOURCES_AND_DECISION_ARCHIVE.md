# Far From Home: Kruma Express. Master Resources & Design Decision Archive

> **Why things are the way they are.** This file is not the authority on design,
> numbers or tasks. See [`README.md`](README.md) for which document owns what.

It lists every outside resource that fed the project, talks, games, research links, and
the design decisions that came out of them. If you are about to change a system and you
want to know why it works the way it does, look here first.

---

## 1. Master Catalog of Provided Resources & Video References

Entries 1 to 20 are narrative and art design references that shaped the game as it was
being built. Entries 21 to 25 were added on **8 September 2026**, after the build was
complete, and are about **process rather than narrative**: how to scope a prototype, and
how to work with an AI agent without it drifting. The last column for those says what
they confirm or explain, not what they caused, because they arrived too late to have
driven any decision.

Entry 2 was removed earlier and the numbers were left alone so existing references still
point at the right rows.

| # | Resource / Link | Creator / Studio | Core Framework / Takeaways | Why It Matters Here |
| :- | :--- | :--- | :--- | :--- |
| **1** | [**Choices That Matter in Game Narrative**](https://www.youtube.com/watch?v=8FgBctI5ulU) | GDC Talk (Jamie Antonisse / Andrew Walsh) | • **"Mountain on the Horizon"**: Persistent overarching goal (`20€ / 250€` Tuition & Visa).<br>• **Narrative Economy**: Goal to Action to Feedback to Respite.<br>• **Show & DO**: Active stakes over passive text. | Forms our top HUD goal tracking and the 4-phase gameplay loop (`Pick to Ride to Doorstep to Room`). |
| **3** | [**The Nature of Order in Game Narrative**](https://www.youtube.com/watch?v=E-qnXNUSUMA) | Jesse Schell (GDC 2018) | • **15 Properties of Living Order** (Christopher Alexander).<br>• **Levels of Scale (Telescoping Goals)**: Macro (28d visa) to Meso (Daily shifts) to Micro (3s shelf pick).<br>• **Strong Centers & The Void**: WG Dorm Room sanctuary as peaceful respite.<br>• **Boundaries**: Doorstep buzzer threshold. | Solves world pacing, giving high-stress courier rushes a peaceful, meditative emotional sanctuary (*Stoßlüften*). |
| **4** | [**Narrative Sorcery: Storytelling in Open Worlds**](https://www.youtube.com/watch?v=HZft_U4Fc-U) | Jon Ingold (inkle / GDC 2017) | • **Encounters over Quests**: Non-linear free exploration.<br>• **Narrative Atoms with Preconditions**: Dialogue blocks only surface when prerequisites are met.<br>• **State-Dependent Reactivity**: NPCs react to current funds, smell of food, and work hours.<br>• **Organic World Blockers**: Real German laws replace artificial invisible walls. | Replaced rigid branching dialogue with reactive, living NPC encounters that remember the player's recent actions. |
| **5** | [**80 Days: Narrative Design & Post-Mortem**](https://www.youtube.com/watch?v=--3meejDM-U)<br>[**inkle: 80 Days Official**](https://www.inklestudios.com/80days/) | Meg Jayanth & Jon Ingold (inkle) | • **4-Resource Tension Engine**: Time (28d), Money (250€), Work Quota (20h), Freshness.<br>• **"Leading Players Astray"**: Tempting risky side-stories (e.g. Mathias's pizza cash shift).<br>• **"NPCs with Agency"**: Characters have their own grief, families, and schedules.<br>• **Player Persona Voice**: Choices define *Hustler* vs. *Bureaucrat* vs. *Diplomat*. | Anchors the emotional depth of every resident and creates tempting narrative detours. |
| **6** | [**German Laws & Expat Life Compendium**](GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md) | Official German Federal Law & Student Reality | • **§16b AufenthG**: Strict 20-Hour Weekly Work Limit.<br>• **Schwarzarbeit**: Unregistered cash gigs vs. primary contract.<br>• **4-Document Catch-22**: Lease to Anmeldung to Bank to Uni to Visa.<br>• **Alltag Rules**: *Stoßlüften*, *Pfand*, *22:00 Ruhezeit*, *Mülltrennung*. | Guarantees 100% authentic cultural and legal simulation without fantasy shortcuts. |
| **7** | [**The Three Pillars of Game Writing**](https://www.youtube.com/watch?v=wNNXdoj7cCQ) | Extra Credits | • **Plot**: External ticking pressure (28d visa, 250€ tuition).<br>• **Character**: Internal motivations & grief (Lokker's Anna, Rita's daughter).<br>• **Lore**: Hanseatic brick gothic history, Beamtendeutsch, and German daily life. | Forms the 3-act narrative architecture and character depth of our entire world. |
| **8** | [**How To Start Your Game Narrative: Design Mechanics First**](https://www.youtube.com/watch?v=22HoViH4vOU) | Extra Credits (James Portnow) | • **Mechanics First, Story Last**: Emotional Core to Core Gameplay Loop to Art Style to Narrative.<br>• **Zero Ludonarrative Dissonance**: Dialogue and quests must emerge directly from player verbs (Steering, Sorting, Budgeting).<br>• **Show & DO**: The player feels the tension through the 20h quota and cobblestone friction before any NPC speaks. | Ensures that every dialogue line and story quest reinforces live gameplay mechanics. |
| **9** | [**Branching Paths Without a AAA Budget**](https://www.youtube.com/watch?v=Gdt5zCdXoSc) | Design Doc | • **Diamond Foldback Structure**: Meaningful mid-chapter divergence (Kruma vs. Pizzeria vs. Bakery) folding back to shared milestones (WG Dorm Sanctuary).<br>• **Invisible Variable State Tracking**: Modifying dialogue/reputation via state tags (`zollRisk`, `semester`, `wallet`, `hoursWorked`) without expensive new 3D assets.<br>• **Delayed Consequences (Chekhov's Gun)**: Early kindness to Oma Martha or Nico pays off in late-game bureaucracy defense. | Enables deep multi-path branching within a strictly constrained 35 MB offline bundle. |
| **10** | [**The Design in Narrative Design**](https://www.youtube.com/watch?v=f8VIlfTtypg) | Jurie Horneman (GDC 2015) | • **Systems & Narrative as Two Sides of One Coin**: Mechanics provide stakes; narrative provides meaning.<br>• **Authentic In-World Artifacts**: Stylized Lohnabrechnung (Courier Payslip) with gross wages, accuracy bonuses, and transit lessons learned.<br>• **Continuous Experiential Loop**: No binary game over; every movement is a moment of learning ("When you lose, you learn; when you win, you prepare for next"). | Grounds the shift debrief and economy directly in in-world working reality. |
| **11** | [**Storytelling Tools to Boost Indie Game Narrative**](https://www.youtube.com/watch?v=8fXE-E1hjKk) | Mata Haggis (GDC 2017) | • **Environmental Breadcrumbs**: Replacing text walls with in-world environmental clues (corkboard postcards, fridge notes, receipt memos).<br>• **Narrative Tension Sinusoid**: High-adrenaline 1-line radio calls during courier rushes, paired with deep meditative respite in the WG Dorm room.<br>• **Character Mirror**: The physical room visually evolves from a cold, barren attic into a warm, personalized sanctuary. | Keeps mobile portrait pacing snappy and avoids narrative fatigue. |
| **12** | [**Systemic Game Design: Applied to Storytelling**](https://www.youtube.com/watch?v=-NKKIDYU0sU) | TurboHermit | • **Interlocking Systems Generate Emergent Narrative**: Combining independent systems (20h work limit + weather friction + Schwarzarbeit risk + NPC sensory perception) to create unique emergent anecdotes without manual scripting.<br>• **Rule Transparency**: Clear HUD indicators (20h meter, wallet, weather) allow players to make informed, high-stakes trade-offs.<br>• **Reactive NPC Synthesis**: Characters react dynamically to the overlapping state of multiple systems simultaneously. | Transforms scripted quests into a living, reactive student survival simulation. |
| **13** | [**Who Does What: Narrative Designer Edition**](https://www.youtube.com/watch?v=QnY-Uu_s8Vw) | Games Industry Archive | • **Narrative as Systemic Glue**: Narrative design is not writing prose in isolation; it connects audio, game balance, UI meters, and level design into one cohesive player experience.<br>• **Contextual Micro-Dialogue**: Delivering story through active verbs (delivering, picking, shopping) rather than passive text logs. | Ensures narrative designers build mechanics-aligned UI and gameplay flow. |
| **14** | [**Emergence, Dynamic Narrative and Systems**](https://www.youtube.com/watch?v=OrmyLaLCaIo) | The Game Overanalyser | • **Dynamic Complexity Theory in Games**: How simple interacting rules (friction + stamina + cash risk + social reputation) yield infinitely varied player journeys.<br>• **Feedback Loops**: Positive reinforcement (high accuracy to higher tips to bike upgrade to easier drift) balanced by negative constraints (20h legal cap). | Provides mathematical elegance to the student economy and narrative loop. |
| **15** | [**Making Player Choices Feel Like They Matter**](https://www.youtube.com/watch?v=KU3FlTpxSyk) | Tony Howard-Arias (Black Tabby Games / GDC) | • **Cumulative Personality Heuristics**: Tracking player disposition (Hustler vs. Bureaucrat vs. Diplomat) to alter character perceptions and dialogue tone without combinatorial branching explosion.<br>• **Asymmetric NPC Agency**: NPCs react to your track record rather than isolated dialogue trees. | Delivers profound player agency within strict offline bundle constraints. |
| **16** | [**Mastering VISUAL Storytelling in Concept Art**](https://www.youtube.com/watch?v=UPz8oYL6GeE) | Jose Vega | • **Focal Hierarchy & Environmental Storytelling**: Layering active objectives (laptop tuition meter) with tactile background life (radiator steam, wet wool coats, bicycle pumps).<br>• **Visual Weight**: Ensuring primary interactive items stand out immediately against architectural dioramas. | Grounds the 3D isometric WG Dorm room in authentic immigrant grit. |
| **17** | [**These Games are LITERALLY Art**](https://www.youtube.com/watch?v=S4qUR8lYps8) | Game Art Retrospective | • **Handcrafted Stylization Over Photorealism**: Distinctive ink outlines and cel-shading create higher emotional connection and instant memorability than generic 3D models.<br>• **Diorama Aesthetic**: Mobile portrait view framed like a physical living comic book. | Validates our custom ink outline and cel-shaded material pipeline. |
| **18** | [**Visual Communication: Why Game Art Matters**](https://www.youtube.com/watch?v=SV1BBtD3hY4) | Game Design Analysis | • **Art as Direct Cognitive Affordance**: Colors, silhouettes, and lighting communicate gameplay function instantly without tutorial text.<br>• **3-Tier Search Palette**: Blue ▲ (der), Pink ● (die), Purple ■ (das) instantly reducing warehouse picking time. | Satisfies the 15-second instant player intuition rubric criteria. |
| **19** | [**Worldbuilding and Narrative Design for Games**](https://www.youtube.com/watch?v=R2AHoTAlX4o) | Narrative Craft | • **Micro-Worldbuilding Anchors Macro-Themes**: Grounding high-stakes visa themes in tangible civic routines (Stoßlüften, Ruhezeit, Pfand, Anmeldung).<br>• **Civic Etiquette**: NPCs caring about hallway noise and sorting recycling rather than generic fantasy lore. | Makes Lübeck feel like a real, functioning German city. |
| **20** | [**The Shapes in Your Story: Narrative Mapping**](https://www.youtube.com/watch?v=_Xrsn2HBs6w) | GDC Narrative Track | • **Kurt Vonnegut "Man in a Hole" Interactive Arc**: Beginning in deep vulnerability (€20, bare room, ticking clock), finding mechanical mastery through courier shifts, and triumphantly summiting the tuition/visa goal.<br>• **Pacing Waves**: Balancing shift exhaustion with dormitory rejuvenation. | Structures the 28-day campaign into an unforgettable emotional climb. |
| **21** | [**The "Paper First" Method for Better Game Design**](https://www.youtube.com/watch?v=3pkH2Bj4TfE) | YouTube | Design the rules on paper before building anything, so the idea is tested before it is expensive. | Matches how Act I was built: the story was written and validated as a document first, then converted to playable scenes "in chunks" on 3 to 4 September rather than in one pass. |
| **22** | [**What's the Difference Between a Prototype, MVP and Vertical Slice?**](https://www.youtube.com/watch?v=GA5pZrVReqQ) | YouTube | Three different things that get confused. A prototype answers one question, an MVP is shippable, a vertical slice proves one full path through the game. | Names what we actually submitted. This is a **vertical slice**: Act I is complete top to bottom, from arrival through shifts to the first stamped documents, rather than 28 shallow days. It is the reason cutting the skill tree was correct. |
| **23** | [**From Prototypes to MVPs**](https://www.youtube.com/watch?v=yPsrbSwXWWE) | YouTube | How a prototype becomes something you can put in front of players, and what has to be finished before that is honest. | Supports the "depth over sprawl" rule: an advertised system that is hollow makes the whole build read as unfinished. Every cut listed in section 2 came from that reasoning. |
| **24** | [**Solo Mobile Game Dev: From Idea to Playable in 30 Days**](https://www.youtube.com/watch?v=kMFWeN65Ecg) | YouTube | One developer taking a mobile game from concept to playable inside a month. Scope control under a hard deadline. | Directly comparable: this build went from first commit on 21 August to submission on 8 September, solo, portrait mobile. |
| **25** | [**Context Engineering 101: Why Your AI Chats Fall Apart**](https://www.youtube.com/watch?v=i0hpcNBbDFA) | YouTube | Why long AI conversations lose track, and how to structure what the model can see so it stays accurate. | The most load bearing of these five, because this game was built by prompting an AI agent. It is the reasoning behind the whole documentation structure: one document owning each subject, `CANONICAL_NUMBERS.md` as the only source for figures, and a code discovery protocol in `CLAUDE.md`. When that structure slipped, the agent produced confident and wrong work: a technical reference describing a deleted file, and a "no audio ships" claim that stayed in eleven documents for a day after it became false. |

---

## 2. Master Decision Rationale Matrix ("Why Did We Make These Decisions?")

### Q1: Why is the game 100% English-first with German as atmospheric flavor?
- **Decision**: We eliminated mandatory German grammar puzzles from primary dialogue and shelf navigation, making English the default with subtle German subtitles (`Milk (die Milch)`).
- **Rationale**: Hackathon judges evaluate game prototypes in **3 to 5 minutes**. Mandatory German grammar exams created severe cognitive friction and turned off non-German speakers. English-first dialogue allows instant emotional immersion while German text preserves cultural charm.
- **Superseded 2026-09-06 (Q1b)**: this entry originally credited "authentic German voice
  acting" for the cultural charm. No recorded audio ever shipped, and none ships now, one music track ships and every other sound is runtime oscillator synthesis. The charm is carried by text and character
  writing instead. See Q1b below.

### Q1b: Why did we drop language learning and audio entirely? (2026-09-06)
- **Decision**: Removed the language-learning framing, spaced repetition (Leitner boxes),
  the vocabulary dictionary and self-quiz, the Vocab Notebook HUD button, and every claim
  about voice acting or spoken German. Kept the three-tier `der/die/das` shelf, reframed
  from a lesson into the game's central joke.
- **Rationale**: We were pitching two games at once, a comedy about German bureaucracy
  and a vocabulary trainer, and the second one was the weaker half. The quiz UI was never
  reachable from any menu, the scheduler never fed the pick loop, and the "audio-first"
  core ran on oscillator beeps because no voice assets were ever produced. Claiming
  systems that do not exist is a credibility risk a judge can catch in one minute.
- **What this cost us**: nothing mechanically. The shelf already imposed zero language
  burden, items are labelled English-first and the tiers are read by colour and symbol.
- **What it bought us**: a single coherent thesis (British deadpan vs. German municipal
  precision), and a mechanic that is simultaneously the joke, the theme and the skill
  ceiling.

### Q2: Why do we have the 20-Hour Work Limit and Off-the-Books Cash Shifts?
- **Decision**: We added the `0/20h` weekly legal quota meter to the HUD, and let players choose between official Kruma shifts and shady night cash gigs at Mathias's Pizzeria (*Schwarzarbeit*).
- **Rationale**: Under German immigration law (§16b AufenthG), international students are strictly capped at 20h/week. The tension between needing €250 for tuition before the deadline and risking an off-the-books cash gig creates incredible narrative and economic gameplay stakes.

### Q3: Why is the WG Dorm Room a living 3D sanctuary rather than a simple menu?
- **Decision**: Every upgrade purchased (E-Bike frame, Thermal Bag, Study Corkboard, Notepad, Window) visually renders in real-time in the isometric 3D dorm room, accompanied by a peaceful *Stoßlüften* window moment.
- **Rationale**: Applying Jesse Schell's *The Nature of Order* (*Strong Centers* and *The Void*), high-adrenaline street courier shifts need a peaceful, restorative physical anchor where players observe their tangible growth.

### Q4: Why did we declutter the top HUD and remove the VOCAB button?
- **Decision**: Reduced the top HUD to only 3 essential components on Row 1 (Settings, Skills Button, Tuition Progress) and a full-width Objective bar on Row 2.
- **Rationale**: Squeezing 6 different buttons, tiny paper icons, and vocabulary drills into a 390px mobile portrait header caused horizontal overflow and text clipping. Clean, spacious minimalism ensures perfect legibility.

### Q5: Why did we add the Randomized Winter vs. Summer Semester Intake?
- **Decision**: Each fresh game start randomly assigns either *Wintersemester (WiSe)* or *Sommersemester (SoSe)*, altering lighting palette, fog density, street friction, heating/freshness rules, and NPC greetings.
- **Rationale**: Gives players and hackathon judges instant replayability and delightful surprise on every run with **0KB asset bloat**, reflecting the two distinct seasonal realities of studying in Germany.

### Q6: Why do we follow the "Design Mechanics First" philosophy?
- **Decision**: We engineered the economic simulation, 4-phase loop, 20h quota, and bicycle drift physics *before* writing the dialogue. The dialogue directly comments on your wallet balance, your speed, your current work hours, and your dorm upgrades.
- **Rationale**: Prevents ludonarrative dissonance. The player never feels like they are reading an irrelevant novel; every word spoken by Rita, Lokker, or Nina is a direct reaction to what the player just did mechanically.

### Q7: Why do we use the Diamond Foldback and Invisible State Tracking?
- **Decision**: Instead of exponential story branching (which creates unmaintainable bloat), we use the *Diamond Foldback*: players make divergent daily choices (Kruma courier shift vs. Pizzeria night cash run vs. Bakery diplomacy) that converge back to the WG Dorm sanctuary at night, tracking consequences through state variables (`zollRisk`, `semester`, `weeklyHoursWorked`, `npcRelationships`).
- **Rationale**: Delivers deep player agency, meaningful moral dilemmas, and high replayability without exploding asset size or engineering complexity.

### Q8: Why is there no binary Win/Lose state? ("When you lose, you learn; when you win, you get ready for next")
- **Decision**: We eliminated punishing "Game Over" restart screens. Incomplete deliveries or missed quotas result in reduced tip disbursements, constructive feedback on your *Lohnabrechnung* courier pay slip, and instant tactical adaptation in the Dorm room.
- **Rationale**: Real immigrant life is not a binary game over; every setback is a lesson in resilience, and every victory is just preparation for the next shift.

### Q9: Why do we use Environmental Breadcrumbs and Tension Sinusoids?
- **Decision**: Rather than forcing players through lengthy exposition text, lore and rules are delivered via environmental breadcrumbs (fridge notes, corkboards, payslips) and rapid 1-line radio calls during street rushes, reserving deep emotional dialogue for the dorm room sanctuary.
- **Rationale**: Matches the fast mobile portrait rhythm of the hackathon build, preventing player fatigue while keeping emotional impact high.

### Q10: Why do we use Systemic Storytelling over Scripted Cutscenes?
- **Decision**: We created overlapping systemic loops (legal work quotas, seasonal street physics, off-the-books cash risks, NPC sensory memory) so that unique, unscripted student survival stories emerge naturally from player decisions.
- **Rationale**: Produces memorable emergent gameplay and high replayability, allowing each player to craft their own unique journey through the German expat maze.

### Q11: Why do we track Cumulative Personality Heuristics (The Hustler, The Bureaucrat, The Diplomat)?
- **Decision**: Instead of authoring thousands of combinatorial branch scripts, we evaluate player choices along 3 core personality archetypes, dynamically adjusting NPC dialogue tone, tips, and immigration trial testimony based on cumulative score.
- **Rationale**: Gives every choice lasting emotional and mechanical weight while maintaining strict architectural cleanliness and lightweight bundle performance.

### Q12: Why do we use Handcrafted Cel-Shading and Visual Affordance Palettes?
- **Decision**: We built custom cel-shading materials with crisp black ink outlines and coded the 3-tier grammatical search filter (*der* = Blue ▲, *die* = Pink ●, *das* = Purple ■) into the environment.
- **Rationale**: Handcrafted visual stylization creates immediate emotional connection, runs with extreme efficiency on mobile WebGL, and delivers instantaneous mechanical clarity in under 15 seconds without cumbersome tutorials.

---

## 3. Mandatory Protocol for Future Agents

Before changing a game system or writing code:
1. **Consult This Resource Archive**: Check why existing systems were engineered before refactoring them.
2. **Consult [`Docs/GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md`](GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md)**: Ensure all economic and narrative changes obey canonical German legal constraints.
3. **The mind map and character interaction matrix** were retired to a private local archive on 2026-09-08. They are history, not a work order, the shipped cast is defined in `README_HACKATHON.md`.
4. **Verify the build.** Run the whole chain, not just part of it:

```bash
node build/assemble.js && node build/verify.js && node build/check-story.js && node build/package.js
```

The zip must stay under 35 MB and must make no network requests. `package.js` refuses
to build if any external URL appears in `index.html`.

5. **Add a check when you fix something.** Break the thing on purpose first and confirm
   your check fails. Several checks in this suite exist because a bug slipped past a
   check that could not have caught it.

