# Assets

This folder is a **source library**, not the shipped payload. Most of it is not in
the build, and that is intentional.

## What actually ships

Only these 8 Kenney Food Kit models are bundled into `index.html`:

```
apple  banana  bread  carrot  carton  cheese  egg  soda-bottle
```

They are inlined by `build/bundle_obj.js` into `src/data/objAssets.js` (~226 KB).

The whitelist is the `USED_MODELS` array in `build/bundle_obj.js`. **It must stay in
sync with the `modelMap` object in `src/render/geometryFactory.js`** — that map is
what decides which model a given item type gets. Adding a model to one without the
other either ships dead weight or crashes the lookup.

### Why a whitelist
Every `.obj` and `.mtl` in `Food/` used to be inlined — 400 entries, about 3 MB of
the bundle — while the code referenced 8. Pruning to the referenced set cut
`index.html` from 6.59 MB to 3.63 MB.

### The colour atlas
Every Kenney `.mtl` points at a single shared `Textures/colormap.png` (512×512) via
a relative `map_Kd`. MTLLoader resolves that to a **relative URL and fetches it at
runtime**, which breaks the 100 % offline requirement. `build/bundle_obj.js` rewrites
that line to an inline `data:` URI, which `resolveURL()` passes through untouched.
The models keep their real colours and the build issues zero requests.

> Careful with that rewrite. The `.mtl` files use CRLF endings and MTLLoader splits
> strictly on `\n`. An anchored `/^\s*map_Kd.*$/m` replacement silently eats the
> preceding newline — JavaScript's `/m` treats a bare `\r` as a line start — welding
> two directives into one line so the map is dropped without any error. Match
> `map_Kd[^\r\n]*` instead.

## What does not ship

| Folder | Files | Status |
| :--- | ---: | :--- |
| `Food/` | ~400 | 8 models bundled, rest unused |
| `Props/` | ~280 | **Unused.** Interiors are procedural geometry. |
| `Characters/` | ~49 | **Unused.** NPCs are procedural (`src/render/npcFactory.js`). |

`Props/` and `Characters/` are referenced zero times in `src/`. The named character
models (`Ch_female_ Works at Kurma Express - Nina.obj` and friends) match the cast
exactly, so they were clearly intended — they were simply never wired up.

Keeping them costs nothing at runtime, since nothing outside the whitelist is
bundled. Delete them only if you want a smaller repo, and remember git history
retains them either way.

## Rebuilding after an asset change

```bash
node build/bundle_obj.js && node build/assemble.js && node build/check-size.js
```
