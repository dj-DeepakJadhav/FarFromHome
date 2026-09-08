# Screenshots

Captured **2026-09-08** from the shipped build at `?season=summer`, the season the
video script and storyboard specify so stills and footage agree.

| File | Shows |
|---|---|
| `01_city_lubeck.jpg` | The parametric Lübeck: stepped-gable Altbau, cel-shaded canal water, cobblestone promenades, the rampart wall. |
| `02_gender_shelf.jpg` | **The signature mechanic.** Three colour-and-symbol coded shelf tiers, `DAS` purple ■ (top), `DIE` pink ● (middle), `DER` blue ▲ (bottom), stocked with the Kenney food models. This is the *Most Innovative* award submission in one frame. |
| `03_courier_street.jpg` | The courier in third person on the canal-side street. |

## How these were captured, and their one limitation

These are **in-engine renders of the WebGL canvas**, produced by calling
`renderer.render()` and `canvas.toDataURL()` in the same synchronous block, the
renderer runs with `preserveDrawingBuffer: false`, so a capture taken any later
comes back blank.

**They therefore do not include the DOM HUD.** The day counter, wallet, tuition bar,
document tracker and packing list are HTML overlaid on the canvas, so they are
absent here. For judged surfaces that need the HUD visible, the Devpost gallery
especially, take an OS-level screen capture at 390×844 instead.

The previous set (2026-08-26) was **archived out of the repository**, not kept. It
showed the pick checklist German-first (`Wasser (Water)`), which actively
contradicted the English-first pillar every submission document leads with, and
predated both the Day/Docs/€ HUD and the Kenney food models rendering at all.
