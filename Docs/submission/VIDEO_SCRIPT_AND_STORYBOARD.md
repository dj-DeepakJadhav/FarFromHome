# Gameplay Video Script & Storyboard (2–3 Minutes)

> ⚠️ **Fix before recording.** Beat 3 greets the *baker* as "Frau Webber", while
> "Frau Weber" is the *banker* in Beat 5. Those two characters have nearly identical
> names in the shipped dialogue, and on camera it will read as a mistake. Rename one
> of them in `src/data/npcDialogue.js` first, then update this script. Same issue
> with `Nina Lindemann` (dispatcher) vs `Dr. Lindemann` (immigration officer).
> See [`../TASKS.md`](../TASKS.md).

> **Format**: Vertical Portrait capture (390×844) centered on high-contrast background.  
> **Duration**: 2:15 – 2:45  
> **Key Goal**: Demonstrate the core loop, English-first accessible warehouse picking with German atmospheric audio, the €20 ➔ €250 economic progression, 4-document dossier gauntlet, and 100% offline airgap compliance.

---

## 🎬 Beat-by-Beat Timeline

### Beat 1: The Student Dilemma & Mountain-on-Horizon HUD (0:00 – 0:25)
- **Visual**: Camera opens in the cozy 3D Altstadt isometric view outside the Temporary Hostel. HUD prominently displays the persistent goal: `[20€ / 250€] [Day 1 of 28] [📜 📄 📑 💳]`.
- **Narration**: *"You have just arrived in Lübeck on a 28-day student visa with €20 in your pocket. To secure your permanent residence permit, you must conquer the 4-document German bureaucracy gauntlet: earn your €250 semester tuition, sign your rental contract, register at the Bürgeramt, and unlock your bank account. To fund your dream, you work as a courier for Kruma Express."*
- **Action**: Tap Kruma Dispatch -> Meet Nina Lindemann -> Clock in for Shift 1.

### Beat 2: English-First Warehouse Picking & Color Shelf Categories (0:25 – 1:00)
- **Visual**: Close-up of the 3-tier warehouse shelf in the warehouse diorama.
- **Narration**: *"Picking is fast, tactile, and intuitive. Orders display clear English titles with German subtitles, sorted across three color-coded shelf categories: Bottom Blue for Chilled drinks, Middle Pink for Fresh produce, and Top Purple for Bakery items."*
- **Action (Audio ON)**: Spoken voice calls *"die Milch!"*. Player taps *Milk (die Milch)* on the middle pink shelf. Then *"der Apfel!"* (*Apple*), *"das Brot!"* (*Bread*).
- **Callout Banner**: `INSTANT RECOGNITION | 2.0x EARLY PICK SPEED BONUS`.

### Beat 3: The City Delivery Ride & Doorstep Etiquette (1:00 – 1:30)
- **Visual**: Courier cycles through cobblestone streets with the packed grocery bag on their bike, heading toward a glowing destination pin while avoiding obstacles.
- **Narration**: *"After packing, you cycle through the historic streets of Lübeck, delivering groceries to local residents while practicing authentic cultural etiquette."*
- **Action**: Courier arrives at Oma Martha's bakery doorway -> Selects polite formal greeting (*"Good morning, Frau Webber! Fresh flour and butter for your bakery!"*) -> Oma Martha beams with joy and awards a generous €12.00 tip!

### Beat 4: The Economic Engine & Shop Upgrades (1:30 – 2:00)
- **Visual**: Shift summary receipt prints with base pay, streak multiplier, and customer tips.
- **Narration**: *"In your dorm room, every euro you earn buys tangible gear upgrades that accelerate future shifts."*
- **Action**: Player purchases the **E-Bike** and **Thermal Bag**. The bike visibly transforms with an electric motor, and courier speed noticeably surges.

### Beat 5: Bureaucracy Victory & 100% Offline Airgap Proof (2:00 – 2:30)
- **Visual**: Player deposits €250 at the University with Registrar Rita, signs their lease with Hans Lokker, gets stamped at the Rathaus with Herr Vogel, and activates their Sperrkonto at Sparkasse with Frau Weber.
- **Victory**: Final scene at the Ausländerbehörde: Dr. Lindemann stamps the permanent Residence Permit with full commendation!
- **Proof**: DevTools shown in Offline / Airplane mode with single-file `index.html` running at 60 FPS fully self-contained.
- **Narration**: *"Far From Home: Kruma Express. A heartfelt student management simulation built for the Meta Horizon Creator Competition."*
