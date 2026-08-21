# Far From Home: Kruma Express (Arbeit & Sprache)
## PRODUCTION PLAN & MVP SCOPE
**Genre:** Systemic Simulation & Management  
**Target Platform:** Pure Client-Side HTML5 / Three.js (Fixed Portrait 390x844 px)  
**Package Constraint:** Single `.zip` bundle $\le$ 35 MB, zero external network dependencies  
**Lineage:** Evolution of the award-winning *Kruma* prototype architecture.

---

## 1. MVP SCOPE DEFINITION & SYSTEM ARCHITECTURE

### 1.1 The Core MVP Formulation
> **The MVP is:** A self-contained 3-shift workday simulation featuring **Isometric Warehouse Picking** + **Tactical Route Traversal** + **Altbau Intercom Buzzer Matching** + **Itemized Post-Shift Debrief Receipt** + **Student Room Shop Metagame**, culminating in a 250€ tuition fee win condition.

### 1.2 Exact System Inclusions vs. Scope Cuts
| System / Component | Included in MVP (Shippable Build) | Explicitly Cut from MVP (Post-Launch Backlog) |
| :--- | :--- | :--- |
| **Warehouse Fulfillment** | • 3 shelf tiers with 8 low-poly Kenney items.<br>• Dual-signaling grammatical gender glyphs (▲ *der*, ● *die*, ■ *das*).<br>• Raycast touch picking + parabolic bag drop physics.<br>• Spoken German voice audio sprites with ~1.5s audio head-start. | • Barcode laser scanning minigame.<br>• 50+ extended inventory SKU list. |
| **Street Traversal** | • 3-lane modular street grid with procedural tile recycling.<br>• Green *Fahrradweg* (+30% speed boost).<br>• Tactical route choice cards (*Kurzer Weg* vs *Fahrradweg*).<br>• Cobblestone cargo shake and pothole hazards. | • Dynamic day/night and 4-season climate simulation.<br>• AI-driven pedestrian crowd simulation. |
| **Delivery & Doorstep** | • 8-button brass intercom board with floor codes (*EG, 1. OG, HH*).<br>• German etiquette dialogue selection (*Formal Sie* vs. *Casual Du*).<br>• Authentic door buzzer audio triggers and resident voice responses. | • Multi-floor 3D stairwell climbing minigame.<br>• Customer apartment interior exploration. |
| **Debriefing & Economy** | • **Itemized Post-Shift Settlement Receipt** (Base wage, accuracy/speed bonus, etiquette tips, item damage deductions).<br>• Living economy: Courier equipment vs Room comfort upgrades.<br>• 250€ *Semesterbeitrag* win state. | • Multi-city franchise expansion (Munich / Vienna).<br>• Global multiplayer leaderboards. |
| **The Room (Visible Growth)** | • Single living student room (`createLevel0Room`).<br>• Purchased furniture items, desk lamp, rug, and pet cat dynamically spawn in 3D. | • Multiple separate real-estate apartments. |

---

## 2. BUILD SEQUENCING (5-STAGE ROADMAP)

```text
[STAGE 1: ENGINE FOUNDATION & WAREHOUSE MVP]
  ├── Standalone boilerplate: index.html + local /vendor/three.min.js
  ├── Isometric warehouse diorama with 3 shelf tiers & Graphic Novel Cel Shader
  ├── Raycast touch picking, parabolic item drop animations, and manifest UI
  └── Gate 1: 60 FPS touch picking with zero console errors in 390x844 viewport

[STAGE 2: STREET TRAVERSAL & ROUTE SELECTION]
  ├── Top-down 3-lane road renderer with procedural tile recycling
  ├── Tactical route cards (Fahrradweg speed vs Kurzer Weg cobblestone fragility)
  ├── Live Freshness Decay meter and Bag Integrity tracking
  └── Gate 2: Smooth one-thumb lane switching with clear feedback

[STAGE 3: INTERCOM PUZZLE & VOICE AUDIO SPRITES]
  ├── Web Audio API audio sprite engine with inline timestamp map
  ├── 8-nameplate brass buzzer UI with floor code verification (EG, OG, HH)
  ├── Etiquette dialogue choices (Sie vs Du) affecting tip payout
  └── Gate 3: Flawless audio playback and buzzer matching in offline sandbox

[STAGE 4: DEBRIEFING RECEIPT, ROOM SHOP & WORKDAY ARC]
  ├── GameState FSM across 3 escalating shifts
  ├── Post-shift itemized settlement receipt breakdown (Kolb debrief)
  ├── Student room shop (City Bike, Thermal Bag, Desk Lamp, Rug, Cube Cat)
  └── Gate 4: Complete end-to-end 5-minute playthrough to 250€ tuition win screen

[STAGE 5: AIR-GAP AUDIT, PACKAGING & SUBMISSION]
  ├── Single unminified index.html build (< 35 MB total bundle)
  ├── Air-gap test: disconnect network, verify full playthrough
  └── Final Gate: Package far-from-home.zip and generate verification report
```
