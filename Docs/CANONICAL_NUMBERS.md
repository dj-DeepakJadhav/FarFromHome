# Canonical Numbers

> **This file is the single source of truth for every number quoted in any document.**
> No other doc may hard-code a build size, tunable, or word count. Link here instead.
>
> Every value below is read from code or measured from the build. If a number here
> disagrees with the code, **the code wins** — fix this file, not the code.

Last verified: 2026-09-06

---

## 1. Build & Packaging

| Fact | Value | Source of truth |
| :--- | :--- | :--- |
| Release `index.html` (uncompressed) | **11.08 MB** | `node build/check-size.js` |
| Competition hard limit | 35 MB | MHCP rules |
| Headroom | ~68.3 % unused | — |
| Viewport | 390 × 844 fixed portrait | `index.dev.html` |
| Three.js | r128, vendored | `vendor/three.min.js` |
| Runtime network requests | **0** (document only) | DevTools Network tab |

**Never quote a build size from memory.** Run:

```bash
node build/check-size.js
```

### Minification status (be precise when claiming this)
- **Game source** (`src/**`): unminified and readable in the shipped `index.html`.
- **Vendor libraries**: `three.min.js` and `three-mesh-bvh.umd.js` ship minified, as distributed upstream.

State it that way. Do not claim the whole file is unminified.

---

## 2. Economy (`src/core/economy.js`)

| Constant | Value |
| :--- | :--- |
| `STARTING_WALLET` | €20 |
| `TUITION_GOAL` | €250 |
| `KAUTION_DEPOSIT` | €30 |
| `HOSTEL_DAILY_RENT` | €8 |
| `VISA_DAYS` | 28 |
| `MAX_STRIKES` | 3 |
| `ACCURACY_BONUS_PER_ITEM` | €2.50 |
| `EARLY_PICK_MULTIPLIER` | 2.0× |
| `STREAK_STEP` | 0.14 |
| `STREAK_MAX` | 2.5× |
| `MISPICK_INTEGRITY_COST` | 8 |
| `POTHOLE_INTEGRITY_COST` | 15 |

> There is **no** `FRESHNESS_DECAY_RATE` constant in `economy.js`. Earlier drafts of
> `README_HACKATHON.md` quoted one. Do not reintroduce it without adding the constant.

---

## 3. Shop Catalog (`src/data/shop.js`)

| id | name | cost | effect |
|---|---|---|---|
| `ebike` | E-Bike | €45 | -40% transit time |
| `thermalBag` | Thermal Bag | €50 | Halves freshness decay while riding |
| `shelfLabels` | Shelf Labels | €25 | Stamps tier symbol (▲●■) on every item |
| `pocketNotepad` | Pocket Notepad | €20 | One free rail re-pulse per shift |
| `vocabCards` | Shift Rota Cards | €35 | -0.8s icon delay, +25% early-pick bonus |

> The `vocabCards` id is legacy; the shipped display name is **Shift Rota Cards**.
> `pocketNotepad` is gated on ownership and its button renders in the shift HUD
> only when owned.

---

## 4. Shelf Tiers (`src/phases/pickPhase.js`, `src/data/items.js`)

Shelves are filed **purely by grammatical gender** — the joke being that a German
warehouse would of course be organised by an arbitrary property of the noun. They
are stacked **bottom → top**, not left → right. The player never needs to know
German: items are labelled English-first and the tiers are read by colour and symbol.

| Row | Position | Article | Colour | Hex | Symbol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | **Bottom** | `der` | Blue | `#3A86FF` | ▲ |
| 1 | **Middle** | `die` | Pink | `#FF006E` | ● |
| 2 | **Top** | `das` | Purple | `#8338EC` | ■ |

> Do **not** label these rows with food categories such as "Chilled & Drinks",
> "Fresh & Snacks" or "Bakery & Dry". Those labels were doc-only fiction and they
> contradict the data: milk (`die`) is not in a "chilled" row, and apple, cheese
> and coffee share the bottom row only because all three are `der`. The mechanic
> is coherent as gender filing; the category names broke it.
>
> Do **not** describe this as teaching, a lesson, or a language exercise. It is a
> colour-and-symbol sorting mechanic with a comedic premise.

The `category` field in `items.js` holds `Food` / `City` / `Bureaucracy` / `Culture`
and is unrelated to shelf placement.

---

## 5. Pacing Ramp (visual rail pulse)

The gender rail **pulses** before the item icon resolves. Tapping the correct tier
during that window earns the 2.0× Early Pick bonus. The cue is **visual** — there
is no recorded audio anywhere in the build.

| Shift | Icon delay |
| :--- | :--- |
| 1 | 0.0 s |
| 2 | 1.5 s |
| 3+ | 2.5 s |

Judges must reach Shift 3 within **90 seconds**.

---

## 6. Bundled 3D Assets

| Fact | Value |
| :--- | :--- |
| Kenney Food models bundled | **8** (`apple`, `banana`, `bread`, `carrot`, `carton`, `cheese`, `egg`, `soda-bottle`) |
| Colour atlas | one 512×512 PNG, inlined as a `data:` URI |
| Files in `assets/` | ~730 (source library — **not** all shipped) |
| Bundled payload | `src/data/objAssets.js`, ~226 KB |

The whitelist lives in `build/bundle_obj.js` (`USED_MODELS`) and must stay in sync
with `modelMap` in `src/render/geometryFactory.js`. See `assets/README.md`.

---

## 7. Submission Deliverables

| Fact | Value |
| :--- | :--- |
| `Docs/submission/DESIGN_INTENT_DOC.md` | 445 words (limit 500) |
| Deadline | 8 September 2026, 1:00 PM PDT |

Recount words with:

```bash
sed '1,3d' Docs/submission/DESIGN_INTENT_DOC.md | wc -w
```
