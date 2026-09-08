# `story.json`. Developer Guide

> **File**: `assets/narrative/story.json` · **Runner**: `src/core/storyRunner.js`
> **Validate**: `node build/check-story.js`, run it before every commit that touches the story.
>
> This file owns the prose, the branching, the economy deltas, the UI/mechanic unlocks
> and the pacing. It is inlined into `window.FFH.storyData` at release assembly, so it
> ships inside `index.html` with no network fetch.

---

## 1. Read this before you write a line

Three rules. They are not stylistic preferences, breaking them re-introduces claims
we removed from the build on 2026-09-06.

1. **This is not a language-learning game.** No scene teaches German. No scene may
   claim to. There is no vocabulary system, no quiz, no flashcards, no spaced
   repetition. German is *scenery and punchline*, never homework.
2. **There is no recorded audio in the story layer.** The one music track ships
   separately via `build/assemble.js`. The `audio[]` arrays are advisory ambience
   slots for the procedural oscillator layer, they are **not asset filenames** and
   nothing loads them. Never write prose about hearing a word, picking "by ear", or a
   voice calling an item. The pick loop's cue is **visual**: the gender rail pulses.
3. **Never hardcode money.** Write `{wallet}€`, not `31.50€`. Four separate money
   figures had already drifted out of sync with the economy before this rule existed.

See `AGENTS.md` §3.1 for the full banned-claims list.

---

## 2. The shape of the story

A diamond. Threads open, then close.

| Act | Name | Threads | Intent |
| :-- | :--- | :-----: | :----- |
| I | One thread | 1 | Arrival, one conversation, the der/die/das ramp. Ends on the Aha. |
| II | Two threads | 2 | The Kaution fork: pay it and be broke, or borrow and keep a runway. |
| III | Four to six | 4 to 6 | Every remaining system arrives. Peak chaos. The hub. |
| IV | Threads close | ↓ | Nothing new is introduced. Mastery and untangling only. |
| V | One thread | 1 | One desk, one stamp, three shadings of the same ending. |

**The rule**: introduce mechanics on the widening half, master them on the narrowing
half. If you are adding a new mechanic in Act IV, you are adding it in the wrong act.

---

## 3. Scene anatomy

Every scene is one object in `scenes[]`. Only `id` is strictly required, but a scene
that renders needs `prose` and a way out.

```jsonc
{
  "id": "wg_buzzer",              // unique, snake_case. This is the address.
  "act": "I",                     // "I"."V", documentation, not logic
  "threads": 1,                   // how many problems the player is holding

  "stage": {                      // drives camera, lighting and location
    "loc":     "B_WG",            // POI id from the city grid, or LM_* landmark
    "time":    "15:45",           // MUST move forward within an act
    "light":   "afternoon_clear",
    "weather": "cold_clear",      // optional
    "camera":  "door_panel_close"
  },

  "cast":  ["NPC_NICO"],          // presence of cast defaults mode to "blocking"
  "props": ["buzzer_panel"],      // set dressing; advisory
  "audio": ["intercom_click"],    // ADVISORY ambience slots, never asset filenames

  "prose": [ "One line per paragraph.", "Speaker: dialogue goes inline." ],

  "choices": [ /* see §4 */ ],

  "effects": [                    // applied ONCE, on scene entry
    { "var": "heart", "expr": "heart - 2" }
  ],

  "mode": "blocking",             // see §5
  "duration_s": 8,
  "duration_source": "authored",  // or "estimated_from_wordcount"

  "unlocks": { /* see §6 */ },

  // Commentary. JSON has no comments, so these fields carry it:
  "beat":      "what this scene is FOR, in one line",
  "econ_note": "every economy delta, in words",
  "sets_note": "every flag this scene sets",
  "origin":    "story.ink | new | ACT_ONE_BRITISH_COMEDY.md scene 3"
}
```

### Navigation fields
Exactly one route out. In resolution order:

| Field | Meaning |
| :---- | :------ |
| `choices[].to` | Player picks. The normal case. |
| `next` | Unconditional single successor (used by the two `wg_door_*` variants). |
| `divert` | Fallback when a scene's choices all fall through. |
| `conditional_edges` | `[{ "if": "knots <= 1", "to": "act_four" }]`, evaluated before choices. |
| `terminal: true` | **Ends the run.** Requires `outcome: "WIN" \| "LOSE"`. |

A `to` may be a **tunnel**: `{ "tunnel": "night_tick", "then": "act_two" }` runs
`night_tick` (the nightly rent tick) and then continues to `act_two`. A tunnel scene
has no outgoing edge by design, the runner returns to `then`. `night_tick` is marked
`"tunnel": true` so the validator does not flag it as a dead end.

---

## 4. Choices

```jsonc
{
  "label":   "[WG 3B, the one that isn't a surname]",
  "gate":    "day >= 6 && not met_anke",   // null or omitted = always shown
  "to":      "wg_door",
  "effects": [ { "var": "r_nico", "expr": "r_nico + 1" } ],
  "prose":   [ "Shown after the choice is taken." ]
}
```

- **Square brackets**= an action the player takes. **Quotation marks**= something the
  player says. Keep that distinction; it is the only signal of who is speaking.
- `gate` uses the mini expression language in §7. A choice whose gate fails is not
  rendered, so **never gate every choice in a scene** unless `divert` is set.
- Choice `effects` apply on selection; scene `effects` apply on entry. Do not put the
  same delta in both.

---

## 5. `mode`, who owns the screen

| Mode | Meaning | Rule |
| :--- | :------ | :--- |
| `overlay` | Narration over live gameplay | Must never block input |
| `blocking` | A real conversation; the dialogue **is** the interaction | Default when `cast` is non-empty |
| `gameplay` | A minigame owns the screen; narration is incidental | Routes to the PICK phase |

---

## 6. `unlocks`, first-time reveals

```jsonc
"unlocks": {
  "phase":    "PICK",                  // engine phase this scene switches to
  "ui":       ["pick-timer-text"],     // DOM ids revealed for the first time
  "mechanic": "gender_shelf_sort",     // human-readable capability name
  "ramp":     { "cue": "gender_rail_pulse", "icon_delay_s": 1.5 }
}
```

`ramp.icon_delay_s` is the **only** field here the engine reads for behaviour
(`storyRunner.handleGameplayScene`). Omit it and the phase falls back to the canonical
`window.FFH.iconRevealDelay()`. Set it to `0` only if you genuinely mean no delay.

> **Historical trap**: the runner used to read a top-level `scene.teaches.icon_delay_s`
> that no scene ever had, so it silently resolved to `0` and flattened the ramp on the
> story path. Fixed 2026-09-06. Do not reintroduce a `teaches` block.

Every id you list in `ui[]` must actually exist in the DOM. `nico_bins_choice` used to
unlock `btn-vocab-notebook`, `vocab-modal` and `vocab-list`, all three of which were
deleted from the codebase. The validator now checks for known-dead ids.

---

## 7. Expression language

Used by `gate`, `effects[].expr` and `conditional_edges[].if`. Deliberately tiny.

- **Comparison**: `>=  <=  >  <  ==  !=`
- **Boolean**: `&&`, `||`, `not `
- **Arithmetic**: `+ - * /`
- **Literals**: numbers, `true`, `false`
- **Variables**: any key in the top-level `state` object

```
"gate": "shift_no >= 2 && not klaus_quit"
"expr": "wallet - 30.0"
"expr": "true"
```

### Prose interpolation
- `{wallet}`, substitutes a state value. **Use this for all money.**-`{ has_lease:Lease: yes.|Lease: no.}`, inline conditional.
- `{day > 12:The days have started to look the same.}`, conditional with no else.

---

## 8. The economy contract

**`src/core/economy.js` is authoritative. `Docs/CANONICAL_NUMBERS.md` mirrors it.
`story.json` obeys both.** If a number here disagrees with the code, the code wins.

| Scene money comes from | How |
| :--------------------- | :-- |
| A **real engine payout** | `{ "var": "wallet", "expr": "wallet + pay" }`, `pay` is injected by the shift result. Use this for every shift from Act III on. |
| An **authored beat** | An explicit literal, e.g. `wallet - 30.0` for the Kaution. Must be justified in `econ_note`. |

### Act I is one shift, paid once
`shift_1_teach` / `shift_2_anticipate` / `shift_3_test` are **three ramp stages of a
single evening**, not three shifts. They pay nothing individually. The whole evening
pays once, at `shift_receipt`: **+11.25** (base 13.00 + accuracy 7.50 − trial deduction
9.25).

That deduction is a joke *and* a tuning device: it lands the player at roughly **€31.50** entering Act II, which is what makes Lokker's €30 Kaution hurt. If you change the Act I
payout, you break the Act II fork. Check `act_two_fork` before touching it.

> Previously these three scenes each paid a literal (15 / 17.5 / 20 = 52.50) while
> `shift_receipt.econ_note` claimed "9.50 + 10.50 + 11.50 = 31.50", `act_two_fork` said
> "thirty-one fifty in your pocket" and `night_one` said "seventeen euros". Four numbers,
> four different answers, none of them the real wallet. Hence the no-hardcoding rule.

---

## 9. Pacing

`pacing.budget_s` is **90 seconds to the Aha** (`shift_3_test`). It measures the time to
the "Aha", not the length of Act I.

**The budget is retained as an instrument, not as a target.** The authored path reaches
`shift_3_test` at **167 s**, deliberately, see `Docs/THE_MAKING_OF.md` §10. The field
stays at 90 so the number keeps being measured and printed honestly; it is not a bar the
build is trying to clear.

`cumulative_s` and `critical_path_index` are **generated**, not authored. They are
recomputed along the first-exit path from `act_one` by the validator. Do not hand-edit
them, and do not retune `duration_s` values just to make the budget pass.

> **Not an open item.** The authored critical path reaches `shift_3_test` at **167 s**> (`pacing.aha_cumulative_s`), and that is the intended pace for a slow-burn narrative
> sim. Do **not** add a fast-start that skips to the Aha, that was built, it made the
> experience worse, it was reverted, and `build/verify.js` now pins `?quickstart=1` to
> `shift_1_teach`. Reasoning: [`THE_MAKING_OF.md`](THE_MAKING_OF.md) §10.

---

## 10. Voice

British deadpan against German municipal precision. The comedy comes from the collision,
never from a character being stupid.

**What works:**-Understatement over exclamation. *"It is quarter to four in the afternoon. You decide
  not to argue the point through a metal grille."*
- The bureaucracy is always **correct and immovable**. Vogel is not a villain; he is a
  man with a stamp and a queue and he loves exactly one of those things.
- Specificity is funnier than exaggeration. "A padlock the size of a teacup saucer"
  beats "a huge padlock".
- Let the player be wry, tired and polite. They are not a comedian; they are knackered.
- Kindness lands harder than jokes when it arrives unannounced. Mathias's thirty euros,
  Martha's Franzbrötchen. Do not undercut those with a gag.

**What doesn't:**-Explaining the joke. Klaus states the gender rule once. Nobody mentions it again.
- Germans as punchlines. The system is absurd; the people are just doing their jobs.
- Wall-of-text prose. Three to six short lines per scene. If it needs more, it is two
  scenes.
- Exclamation marks. Almost never. Deadpan does not shout.

---

## 11. Adding a scene, checklist

1. Unique snake_case `id`. Add it to `scenes[]` near its act neighbours.
2. `stage.time` moves **forward** relative to the scene before it. An overnight cut
   must advance the clock via a `day` effect (e.g. `day1_sleep`'s choice sets
   `{ "var": "day", "expr": "2" }`), the validator is day-aware and honours it.
3. `prose` in the voice above. 3 to 6 lines.
4. A route out: `choices[].to`, `next`, `divert`, or `terminal` + `outcome`.
5. Money as `{wallet}€`, never a literal.
6. Fill `beat`, and `econ_note` / `sets_note` if anything changes.
7. Every `unlocks.ui` id exists in the DOM.
8. `node build/check-story.js`, must pass clean.
9. `node build/assemble.js && node build/check-size.js`, then boot and play it.

---

## 12. Every scene renders from this file

This used to be the section warning you that Act One was a storyboard the game only
loosely followed. That is no longer true, and the warning is withdrawn.

`storyRunner.startScene()` still calls `handleBritishSpecialBeats()` first, but as of
now that function is:

```js
window.FFH.BRITISH_BEAT_MAP = {};
window.FFH.handleBritishSpecialBeats = function (resolvedId, game) {
  return false;
};
```

The map is empty and the handler always returns false, so nothing is intercepted.
Editing a scene's prose in this file changes what the player reads.

If you ever refill that map, come back and rewrite this section, because a scene
listed there stops rendering from this file and there is no error to tell you.

To confirm a scene rendered:

```js
game.storyRunner.startScene('wg_buzzer');
game.storyRunner.currentScene.id;   // 'wg_buzzer' means it rendered
```

---

## 13. Cast

| Id | Character | Role |
| :- | :-------- | :--- |
| `NPC_NICO` | Nico | Flatmate. Recycling anxiety, peppermint tea. Act III crisis. |
| `NPC_KLAUS` | Klaus | Warehouse veteran. Teaches the shelf in Act I; offers the dodgy night route in Act III. |
| `NPC_NINA` | Nina Voss | Dispatch lead. Quotas, receipts, the shop counter. |
| `NPC_MARTHA` | Martha Beck | Baker. Rejects you kindly, points you at Kruma. |
| `NPC_MATHIAS` | Mathias Becker | Pizzeria/bike shop. Lends thirty euros he won't take back. |
| `NPC_LOKKER` | Hans Lokker | Landlord. The Kaution. Not an antagonist, which is worse. |
| `NPC_VOGEL` | Herr Vogel | Bürgeramt. Peak Amtsschimmel. Half of the Circle. |
| `NPC_WEBER` | Frau Weber | Sparkasse. The other half of the Circle. |
| `NPC_RITA` | Rita Schneider | University registrar. Stamps the matriculation. |
| `NPC_LINDEMANN` | Dr. Lindemann | Immigration office. The last desk, and the one that decides. |
| `NPC_PIZZERIA_OWNER` | Pizzeria Owner | The first job that says no. |
| `NPC_ANKE` | Anke | Neighbour. Appears in three scenes. |
| `NPC_YUSRA` | Yusra | Neighbour. Appears in three scenes. |

The names players see come from `NPC_SPEAKER_MAP` in `src/core/storyActions.js`. If you
add a cast id here, add it there too, or the character speaks under their raw id.

Counts as of now: 92 scenes, and the ids above are the only ones the data uses.

> Klaus teaches Shift 1 (per the archived Act One draft and the README
> roster). Nina handles dispatch, the receipt and the shop. They were briefly conflated;
> they are not the same person and the Act III night-route beat only works if the man who
> taught you the rules is the one bending them.
