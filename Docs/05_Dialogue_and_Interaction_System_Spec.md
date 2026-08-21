# Far From Home: Kruma Express (Arbeit & Sprache)
## SCENARIO DIALOGUE & INTERACTION SYSTEM SPEC
**Purpose:** Technical and Linguistic Specification for all in-game Scenarios, Inputs, Audio Triggers, and Etiquette Logic.  
**Runtime Engine:** Offline Web Audio API Sprite Engine + Deterministic State Machine.  
**Language Modes:** English Default (English UI + Spoken German Environmental Audio) | German Immersion Toggle

---

## 1. SYSTEM ARCHITECTURE & INTERACTION FLOW

```text
[Touch / Tap Input] 
       │
       ▼
[Linguistic Verification Engine]
   ├─ 1. Grammatical Gender Match (der / die / das)
   ├─ 2. Spatial Direction Decryption (Hauptstraße vs. Einbahnstraße)
   ├─ 3. Building Code Match (EG, OG, HH)
   └─ 4. Etiquette Evaluation (Formal 'Sie' vs. Informal 'Du')
       │
       ▼
[Web Audio API Audio Sprite Trigger] (Kokoro Spoken German + SFX)
       │
       ▼
[Economy & State Output] (Shift Wage + Freshness Tip + Etiquette Bonus)
```

---

## 2. SCENARIO 1: DARK STORE WAREHOUSE FULFILLMENT

### 2.1 Narrative & Setting
Inside Kruma Dark Store #104 (Berlin-Kreuzberg). The player stands in front of a 3-tier wooden and steel fulfillment shelf packing customer manifests into brown paper bags.

### 2.2 System Specifications
- **Player Inputs:** Raycast Touch/Click on 3D shelf items; Manifest checkboxes.
- **Linguistic Rules & Dual-Signaling:**
  - **Maskulin (*der* / Blue `#3A86FF`):** *der Apfel* 🍎, *der Käse* 🧀, *der Kaffee* ☕, *der Tee* 🍵
  - **Feminin (*die* / Coral Red `#FF006E`):** *die Milch* 🥛, *die Tomate* 🍅, *die Banane* 🍌, *die Butter* 🧈
  - **Neutrum (*das* / Purple `#8338EC`):** *das Brot* 🍞, *das Ei* 🥚, *das Wasser* 💧, *das Müsli* 🥣
  - **Dietary Modifiers:** *Hafermilch (vegan)* vs. *Vollmilch (tierisch)*.

### 2.3 Audio & Dialogue Triggers
| Event | Spoken German Audio (Kokoro TTS) | English UI Manifest Text | Accompanying SFX |
| :--- | :--- | :--- | :--- |
| **Pick: Apple** | *"Der Apfel!"* | `[■] 1x Apple (der Apfel) 🍎` | Packaging pop + 8-star sparkle chime |
| **Pick: Oat Milk** | *"Die Hafermilch!"* | `[■] 1x Oat Milk (die Hafermilch) 🥛` | Carton snap SFX |
| **Pick: Bread** | *"Das Vollkornbrot!"* | `[■] 1x Bread (das Vollkornbrot) 🍞` | Paper crinkle SFX |
| **Incorrect Pick** | *"Falscher Artikel!"* | `[!] Wrong Item (-3s)` | Low-tone thud error + 3s shelf shake |
| **Order Complete** | *"Bestellung fertig! Auf geht's!"*| `[✓] Order Packed! Go!` | Cash register *Ka-Ching!* |

---

## 3. SCENARIO 2: STREET TRAVERSAL & ROAD SIGNS

### 3.1 Inputs & Rules
- **Player Inputs:** Binary Screen Touch Zones: Left 50% (`[◀ LEFT]`) / Right 50% (`[RIGHT ▶]`).
- **Road Navigation Signs:**
  - `[Hauptstraße ➡️]` -> Target main road route (Maintain full speed).
  - `[Einbahnstraße ⛔]` -> One-way street entry (Triggers -5s route detour penalty).
  - `[Fahrradweg 🚲]` -> Dedicated green bike lane (Grants +30% speed multiplier).

### 3.2 Audio Triggers
- **Bike Lane Entry:** Bell chime (*"Ring-Ring!"*) + green tire streak trail.
- **Pothole Hit:** Frame rattle SFX + screen shake (-15% bag integrity).

---

## 4. SCENARIO 3: ALTBAU INTERCOM BUZZER PUZZLE

### 4.1 Floor Abbreviations & Nameplates
- `EG` = *Erdgeschoss* (Ground floor)
- `1. OG / 2. OG / 3. OG` = *Obergeschoss* (Upper floor / 1st, 2nd, 3rd floor)
- `VH` = *Vorderhaus* (Front building)
- `HH` = *Hinterhaus* (Back courtyard building)
- `L / R` = *Links / Rechts* (Left / Right door)

### 4.2 Audio Feedback
- **Correct Buzzer:** Lo-fi intercom speaker effect: *"Hallo? Ja, bitte hochkommen!"* + door buzzer *BZZZT*.
- **Wrong Buzzer:** *"Falscher Name! Hier wohnt kein Müller!"* + harsh static buzz.

---

## 5. SCENARIO 4: DOORSTEP ETIQUETTE & CUSTOMER DIALOGUE

#### Scenario 4A: Shift 1 — The Student Peer (Casual Du)
- **Customer:** *"Hey! Kruma Express? Super schnell, danke!"*
- **Choice A (Friendly Du):** *"Gerne! Guten Appetit und viel Erfolg beim Lernen!"* &rarr; **+3€ Tip**
- **Choice B (Overly Stiff):** *"Hier ist Ihre Ware, mein Herr. Unterschreiben Sie."* &rarr; **+1€ Tip**

#### Scenario 4B: Shift 2 — The Busy Mother (Polite Sie)
- **Customer:** *"Guten Tag! Ist die laktosefreie Milch dabei? Das ist sehr wichtig!"*
- **Choice A (Attentive & Polite):** *"Ja, genau hier: Einmal laktosefreie Milch. Schönen Tag noch!"* &rarr; **+8€ Tip**
- **Choice B (Dismissive):** *"Alles in der Tüte, weiß ich nicht."* &rarr; **+0€ Tip**

#### Scenario 4C: Shift 3 — The Hospital Doctor (VIP Formal Sie)
- **Customer:** *"Guten Abend. Ich habe die Express-Lieferung für Station 4B bestellt."*
- **Choice A (Formal Sie):** *"Guten Abend Frau Doktor! Hier ist Ihre Express-Bestellung. Einen ruhigen Dienst noch!"* &rarr; **+20€ VIP Tip**
- **Choice B (Casual Slang):** *"Jo! Hier dein Zeug, ich muss weiter!"* &rarr; **+2€ Tip**
