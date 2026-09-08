# Gameplay, Progression & Economy Manifest

> ##  FROZEN, generated from a retired source
>
> This file was generated on **2026-09-05** by `build/narrative_manifest.js`, which
> reads `assets/narrative/story.ink`. That Ink source was **retired**, the shipped
> narrative is `assets/narrative/story.json`, so the generator now exits early with
> `CRITICAL: assets/narrative/story.ink not found` and **this file no longer
> regenerates.**>
> Treat every figure below as a 2026-09-05 snapshot, not as current. The live,
> authoritative check is:
>
> ```bash
> node build/check-story.js
> ```
>
> To make this file trustworthy again, `narrative_manifest.js` needs repointing at
> `story.json` (see `Docs/STORY_FORMAT.md`).

> Generated from `assets/narrative/story.json` by `build/storyboard_check.js`.
> Do not edit by hand -- change the storyboard and regenerate.

## Pacing (snapshot, see the frozen notice above)

Rule source: Docs/THE_MAKING_OF.md section 10 (the 90s target is withdrawn)

Budget **90s** to `shift_3_test`. **This line's "Actual: 87s -- PASS" was stale and wrong.** Measured against the shipped `story.json`, the Aha is at **167s**, and that is a deliberate design choice for a slow-burn narrative sim, not a pass, and not a failure. First interactive scene: **10s**. See `Docs/THE_MAKING_OF.md` §10.

| at | scene | act | mode | dur | source | |
| --- | --- | --- | --- | --- | --- | --- | | 10s | `act_one` | I | overlay | 10s | authored | |
| 17s | `wg_door` | I | blocking | 7s | authored | |
| 23s | `nico_kitchen` | I | blocking | 6s | authored | |
| 30s | `nico_bins_choice` | I | blocking | 7s | authored | |
| 36s | `nico_sends_kruma` | I | overlay | 6s | authored | |
| 43s | `uni_closed` | I | blocking | 7s | authored | |
| 61s | `shift_1_teach` | I | gameplay | 18s | authored | |
| 75s | `shift_2_anticipate` | I | gameplay | 14s | authored | |
| 87s | `shift_3_test` | I | gameplay | 12s | authored | **AHA** | | 99s | `shift_receipt` | I | blocking | 12s | authored | |
| 105s | `rita_first` | I | overlay | 6s | authored | |
| 119s | `night_one` | I | blocking | 14s | authored | |
| 125s | `night_one_end` | I | overlay | 6s | authored | |
| 133s | `act_two` | II | blocking | 8s | authored | |
| 143s | `lokker_kaution` | II | blocking | 10s | authored | |
| 151s | `act_two_fork` | II | overlay | 8s | authored | |
| 161s | `kaution_pay` | II | blocking | 10s | authored | |
| 169s | `act_two_end` | II | blocking | 8s | authored | |
| 177s | `act_three_open` | III | overlay | 8s | authored | |
| 183s | `hub` | III | blocking | 6s | authored | |
| 191s | `knot_paper` | III | blocking | 8s | authored | |
| 195s | `the_circle` | III | blocking | 4s | estimated | |
| 212s | `the_circle_2` | III | blocking | 17s | estimated | |
| 224s | `the_circle_3` | III | blocking | 12s | authored | |

Durations marked `estimated` are derived from word count at ~170 wpm,
not measured. Replace them with real timings after a playtest.

## Delivery mode mix

| mode | scenes | meaning |
| --- | --- | --- |
| overlay | 9 | narration plays over live gameplay and never blocks input |
| blocking | 61 | a real conversation; the dialogue IS the interaction |
| gameplay | 6 | a minigame owns the screen; narration is incidental |

## Progression ladder

The rule: **Introduce mechanics on the widening half. Master them on the narrowing half.** When the player first meets each system.

| at | scene | act | phase | mechanic | ui | teaches |
| --- | --- | --- | --- | --- | --- | --- |
| 10s | `act_one` | I | CITY_EXPLORATION | walk_city | btn-roam-city delivery-distance-indicator |
|
| 17s | `wg_door` | I | DIALOGUE | converse | dialogue-speaker dialogue-text dialogue-options-container | |
| 30s | `nico_bins_choice` | I | | vocab_notebook | btn-vocab-notebook vocab-modal vocab-list | {"subject":"muelltrennung","mode":"TEACH"} | | 36s | `nico_sends_kruma` | I | | quest_tracking | city-quest-tracker city-quest-text city-poi-card | |
| 61s | `shift_1_teach` | I | PICK | gender_shelf_sort | pick-timer-text tuition-text tuition-bar | {"subject":"der_die_das","mode":"TEACH","icon_delay_s":0} | | 75s | `shift_2_anticipate` | I | | freshness | hud-freshness-bar | {"subject":"der_die_das","mode":"ANTICIPATE","icon_delay_s":1.5} | | 87s | `shift_3_test` | I | | bag_integrity | hud-integrity-bar | {"subject":"der_die_das","mode":"TEST","icon_delay_s":2.5} | | 99s | `shift_receipt` | I | DEBRIEF_RECEIPT | shift_receipt | btn-finish-shift | |
| 161s | `kaution_pay` | II | | document_dossier | stamp-seal | |
| - | `shop` | III | SHOP | invest_upgrade | btn-close-shop | |
| - | `night_route` | III | | night_ride_hazards | |  | | - | `martha` | III | | etiquette_tip | |  | | - | `anke` | III | | skill_tree | btn-close-skills skills-tree-scroll | |

### Systems introduced per act

| act | introductions | intent |
| --- | --- | --- |
| I | 20 | Arrival, one conversation, and the der/die/das ramp. Ends on the Aha. |
| II | 2 | The Kaution fork: pay it and be broke, or borrow and keep a runway. |
| III | 7 | Every remaining system arrives here. Peak chaos. |
| IV | 0 | Nothing new is introduced. Mastery and untangling only. |
| V | 0 | One desk, one stamp, three shadings of the same ending. |

### UI never introduced

`hud.js` defines **47** element ids; the storyboard introduces **21**.

The player meets these cold. Either gate them in a scene or accept
they are always-on chrome:

- `archetype-badge`
- `btn-close-dict`
- `btn-close-poi`
- `btn-close-vocab`
- `btn-continue`
- `btn-new-game`
- `btn-poi-action`
- `btn-restart`
- `btn-sound`
- `btn-start-quiz`
- `btn-start-ride`
- `btn-start-shift`
- `buzzer-list`
- `city-header-bar`
- `delivery-distance-arrow`
- `delivery-distance-val`
- `dialogue-scroll-indicator`
- `dialogue-scroll-stream`
- `dialogue-typewriter-text`
- `dict-content-body`
- `pick-warning-center`
- `poi-card-desc`
- `poi-card-tag`
- `poi-card-title`
- `quiz-feedback`
- `resident-dialogue`

## Economy constants (read from `src/core/economy.js`)

| constant | value |
| --- | --- |
| `ACCURACY_BONUS_PER_ITEM` | 2.5 |
| `EARLY_PICK_MULTIPLIER` | 2 |
| `HOSTEL_DAILY_RENT` | 8 |
| `KAUTION_DEPOSIT` | 30 |
| `MAX_STRIKES` | 3 |
| `MISPICK_INTEGRITY_COST` | 8 |
| `POTHOLE_INTEGRITY_COST` | 15 |
| `STARTING_WALLET` | 20 |
| `STREAK_MAX` | 2.5 |
| `STREAK_STEP` | 0.14 |
| `TUITION_GOAL` | 250 |
| `VISA_DAYS` | 28 |

## Economy deltas by scene

| scene | act | effects | note |
| --- | --- | --- | --- |
| `act_one` | I | wallet = wallet - 2.9; body = body - 6 | wallet -2.90 (bus) \\| body -6 (walk) |
| `wg_door` | I | r_nico = r_nico + 1 |
|
| `nico_kitchen` | I | heart = heart - 2 | heart -2 (brush off) | | `nico_bins_choice` | I | knows_trennung = true; r_nico = r_nico + 1 | |
| `nico_sends_kruma` | I | r_nico = r_nico + 1 | |
| `uni_closed` | I | heart = heart + 3; heart = heart - 3 | heart +3 / -3 | | `shift_1_teach` | I | wallet = wallet + 9.5; shift_no = shift_no + 1; wallet = +9.5 | |
| `shift_2_anticipate` | I | wallet = wallet + 10.5; shift_no = shift_no + 1; wallet = +10.5 | |
| `shift_3_test` | I | wallet = wallet + 11.5; shift_no = shift_no + 1; heart = heart + 6; wallet = +11.5 | |
| `shift_receipt` | I | | no wallet change here: the three shift scenes already paid 9.50 + 10.50 + 11.50 = 31.50 | | `night_one` | I | heart = heart + 6; told_truth_home = true; heart = heart - 4 | heart +6 (lie) \\| heart -4 (truth) | | `act_two` | II | r_lokker = r_lokker + 1 | |
| `lokker_kaution` | II | r_lokker = r_lokker + 1 | |
| `kaution_pay` | II | wallet = wallet - 30.0; paid_kaution = true; has_lease = true; r_lokker = r_lokker + 1; r_lokker = r_lokker + 1 | wallet -30.00 | | `act_three_open` | III | knots = 4 | |
| `hub` | III | | readout: wallet, body, day | | `the_circle` | III | knows_the_circle = true; knots = knots + 1 | |
| `the_circle_3` | III | heart = heart - 6; heart = heart - 2 | heart -6 (sit) \\| heart -2 (ask) | | `mathias_loan` | II | r_mathias = r_mathias + 1; r_mathias = r_mathias + 2 | wallet +30.00, owes_mathias 30.00 | | `mathias_loan_2` | II | wallet = wallet + 30.0; owes_mathias = 30.0; r_mathias = r_mathias + 1; heart = heart + 5; heart = heart + 2; wallet = wallet + 30.0; owes_mathias = 30.0; r_mathias = r_mathias + 2 | wallet +30.00, owes_mathias 30.00 | | `knot_money` | III | shift_no = shift_no + 1; wallet = wallet + pay; body = body - 7 | wallet + (10 + 3n + 12.5) +upgrades -11 if body<50; body -7 | | `nina_sister_2` | III | r_nina = r_nina + 1 | |
| `nina_sister_3` | III | r_nina = r_nina + 1 | |
| `shop` | III | wallet = wallet - 45.0; has_ebike = true; body = body + 8; wallet = wallet - 50.0; has_thermalbag = true; wallet = wallet - 35.0; has_vocabcards = true; wallet = wallet - 25.0; has_labels = true; wallet = wallet - 20.0; has_notepad = true | wallet -45 \\| -50 \\| -35 \\| -25 \\| -20; body +8 (ebike) | | `knot_body` | III | r_klaus = r_klaus + 1 | |
| `klaus_offer` | III | r_klaus = r_klaus + 2; heart = heart + 4 | |
| `klaus_offer_repeat` | III | r_klaus = r_klaus + 1 | |
| `night_route` | III | night_route_taken = night_route_taken + 1; wallet = wallet + 60.0; body = body - 22; heart = heart - 5; knots = knots + 1 | wallet +60.00, body -22, heart -5 | | `knot_heart` | III | r_nico = r_nico + 1 | |
| `nico_money` | III | wallet = wallet - 120.0; helped_nico = true; r_nico = r_nico + 3; heart = heart + 12; knots = knots - 1 | wallet -120.00, heart +12 | | `nico_work` | III | helped_nico = true; r_nico = r_nico + 2; r_nina = r_nina + 1; heart = heart + 8; knots = knots - 1 | heart +8 | | `nico_no` | III | heart = heart - 8; knots = knots - 1 | heart -8 | | `knot_heart_after` | III | heart = heart - 4; heart = heart + 3 | heart +3 \\| heart -4 | | `martha` | III | r_martha = r_martha + 1; body = body + 5; heart = heart + 5; wallet = wallet - 2.0; r_martha = r_martha + 1; body = body + 3; heart = heart + 3; body = body + 4; heart = heart + 2 | wallet -2.00 (buy); body +3.5; heart +2.5 | | `martha_weber` | III | r_martha = r_martha + 2; r_martha = r_martha + 1 | |
| `anke` | III | met_anke = true | |
| `anke_cut` | III | circle_cut = true; knots = knots - 1; heart = heart + 8 | heart +8 | | `end_of_day` | III | fined_trennung = true; wallet = wallet - 25.0; knots = knots + 1; strikes = strikes + 1; nico_gone = true; heart = heart - 10; knots = knots - 1; wallet = 0.0 | wallet -25.00 (day 11 fine, if !knows_trennung); strikes +1 (day 14) | | `night_tick` | III | day = day + 1; wallet = wallet - 8.0; body = body + 5; body = 100 | day +1, wallet -8.00 rent, body +5 (cap 100) | | `four_bank` | IV | heart = heart - 3; wallet = wallet - 25.0; has_konto = true; wallet = wallet + 50.0 | wallet -25.00 unless r_martha>=3; wallet +50.00 disbursement | | `four_amt_stamp` | IV | has_anmeldung = true; r_vogel = r_vogel + 1 | |
| `four_uni` | IV | | readout: shortfall vs 250 | | `four_grind` | IV | shift_no = shift_no + 1; wallet = wallet + pay; body = body - 6 | wallet + (10 + 3n + 14) +upgrades -10 if body<50; body -6 | | `four_mathias` | IV | owes_mathias = 0.0; wallet = wallet + 60.0; heart = heart + 8 | wallet +60.00, owes_mathias 0, heart +8 | | `four_nico_repay` | IV | wallet = wallet + 120.0; heart = heart + 10 | wallet +120.00, heart +10 | | `four_nina_advance` | IV | wallet = wallet + 70.0; body = body - 12; r_nina = r_nina + 1 | wallet +70.00, body -12 | | `four_uni_pay` | IV | wallet = wallet - 250.0; matriculated = true; knots = 0; heart = heart + 6; heart = heart + 3 | wallet -250.00 | | `four_klaus` | IV | r_klaus = r_klaus + 1 | |
| `four_klaus_3` | IV | klaus_quit = true; heart = heart + 6 | heart +6 | | `four_phone` | IV | told_truth_home = true; heart = heart + 10; heart = heart + 2 | heart +2 \\| heart +10 | | `four_door` | IV | r_nico = r_nico + 1; heart = heart + 12; heart = heart + 12 | heart +12 | | `five_read` | V | heart = heart + 4 | heart +4 | | `five_verdict` | V | heart = heart - 2; heart = heart + 4 | heart -2 (night route >=3) \\| heart +4 (ask for time) | | `five_out` | V | | readout: wallet, body, heart |

## Beat sheet

| scene | act | time | beat |
| --- | --- | --- | --- |
| `act_one` | I | 18:00 | arrival / hope + first cold |
| `wg_door` | I | 18:40 | first kindness / the mug |
| `nico_kitchen` | I | 18:50 | setup: office shut + the bins |
| `nico_bins_choice` | I | 18:52 | PLANT: pays off day 11 as a 25 euro fine |
| `nico_sends_kruma` | I | 18:25 | MOTIVATES the first shift tonight, and routes you past the locked door |
| `uni_closed` | I | 19:20 | first defeat / the locked door |
| `shift_1_teach` | I | 18:50 | TEACH: audio and icon together, cannot fail. Mechanic introduced. |
| `shift_2_anticipate` | I | 19:20 | ANTICIPATE: 1.5s icon delay. Player starts listening, not looking. |
| `shift_3_test` | I | 19:50 | THE AHA. Icon never arrives; the grammar has become spatial instinct. |
| `shift_receipt` | I | 09:30 | THE RECEIPT: names the money so the tuition bar means something |
| `rita_first` | I | 19:25 | the number 250 lands as weather |
| `night_one` | I | 20:10 | THEME: the worthwhile lie / mirrored in four_phone |
| `night_one_end` | I | 21:30 | the suitcase stays packed for 11 days |
| `act_two` | II | 08:10 | the antagonist who is not one |
| `lokker_kaution` | II | 08:12 | INCITING: 30 euros in 3 days |
| `act_two_fork` | II | 08:30 | THE FORK, REFRAMED: pay it and be broke, or borrow and keep a runway |
| `kaution_pay` | II | 13:00 | FIRST PAPER WON / both threads converge here |
| `act_two_end` | II | 21:00 | the botched high five / warning: it stops being one thing at a time |
| `act_three_open` | III | 07:00 | CHAOS OPENS: four problems held at once |
| `hub` | III | 09:00 | PLAYER AGENCY: work the knots in any order |
| `knot_paper` | III | 10:00 | KNOT 1 opens |
| `the_circle` | III | 10:20 | the deadlock is named |
| `the_circle_2` | III | 10:40 | the other half of the circle |
| `the_circle_3` | III | 11:00 | EMOTIONAL LOW / nobody to be angry at |
| `mathias_loan` | II | 09:00 | THEME: the debt you repay forward, not back |
| `mathias_loan_2` | II | 09:10 | Naples 1994 / the debt you repay forward, not back |
| `knot_money` | III | 06:00 | KNOT 2 / the audio ramp TEACH->ANTICIPATE->TEST |
| `nina_sister` | III | 14:00 | RELATIONSHIP AS CURRENCY: sets up act_five reference |
| `nina_sister_2` | III | 14:02 | reveal: Nina and Dr Lindemann are sisters |
| `nina_sister_3` | III | 14:05 | the actionable advice: make the file good, not sad |
| `shop` | III | 15:00 | INVEST / HARVEST / UPGRADE spine |
| `knot_body` | III | 16:00 | KNOT 3 / THE MIRROR: 14 years, meant to do 2 |
| `klaus_revisit` | III | 16:00 | he is always on the crate now |
| `klaus_offer` | III | 16:10 | THE TEMPTATION: 60 euros against your own body |
| `klaus_offer_repeat` | III | 16:10 | it gets harder to say no every time |
| `night_route` | III | 22:00 | FAST MONEY / logged against you in act_five |
| `knot_heart` | III | 03:00 | KNOT 4 / the 3am table |
| `nico_crisis` | III | 03:10 | THE ASK HE DOES NOT MAKE: 120 euros by the 19th |
| `nico_money` | III | 03:20 | THE REAL SACRIFICE: pushes tuition 11 days back |
| `nico_work` | III | 06:00 | THE THIRD WAY: teach instead of pay |
| `nico_no` | III | 03:20 | COST OF SAYING NO / leads to the empty room on day 19 |
| `knot_heart_after` | III | 23:00 | either you cover him with a blanket, or you look at tape |
| `martha` | III | 11:00 | THE WARM ROOM in the middle of a cold act |
| `martha_2` | III | 11:10 | as long as the oven is on, nobody starves |
| `martha_weber` | III | 11:12 | REVEAL: Frau Weber is her daughter / unlocks the fee waiver |
| `martha_weber_2` | III | 11:15 | do not argue, it is yesterday’s |
| `anke` | III | 13:00 | KNOT 5 opens: the thread that becomes the knife |
| `anke_cut` | III | 13:05 | CATHARSIS: the wall was a door nobody may point at |
| `anke_2` | III | 13:10 | bank, then Buergeramt, then university. Two days. |
| `end_of_day` | III | 23:00 | CONSEQUENCE ENGINE: day 11 fine, day 14 crash, day 19 empty room |
| `night_tick` | III | 06:30 | THE DRIP: rent every morning regardless |
| `act_four` | IV | 07:00 | TURN: you know what to do NEXT. that is the difference. |
| `four_bank` | IV | 09:00 | KNOT CLOSES 1: kindness to Martha pays out here |
| `four_amt` | IV | 11:00 | KNOT CLOSES 2 |
| `four_amt_stamp` | IV | 11:05 | the bureaucrat apologises / 20 days is not good and he knows it |
| `four_uni` | IV | 09:00 | the mystery becomes arithmetic |
| `four_grind` | IV | 06:00 | MASTERY: you stopped looking at the shelves |
| `four_shortfall` | IV | 18:00 | THE COMMUNITY PAYS BACK: three doors, all of them people |
| `four_mathias` | IV | 18:30 | PAYOFF OF THEME: pay it to somebody with a suitcase |
| `four_nico_repay` | IV | 18:30 | he wrote the date on his hand and he does not miss dates |
| `four_nina_advance` | IV | 18:30 | NOT the harbour road. she knows Klaus talks. |
| `four_uni_pay` | IV | 09:00 | CALLBACK: notes not coins / she remembers the locked door |
| `four_evening` | IV | 18:00 | the dossier, squared twice |
| `four_klaus` | IV | 17:00 | KNOT CLOSES: the mirror gets an out |
| `four_klaus_2` | IV | 17:05 | you are the second who said no. I keep count. (he lied) |
| `four_klaus_3` | IV | 17:10 | maybe the leg won / he takes the desk on the Monday |
| `four_last_night` | IV | 20:00 | FIRST EMPTY EVENING / the suitcase is unpacked |
| `four_phone` | IV | 21:00 | MIRROR of night_one: the lie, revisited |
| `four_door` | IV | 22:00 | THE DIAMOND CLOSES: you are Nico now. same framing as wg_door. |
| `yusra_bins` | IV | 22:10 | the office is shut. it will be there tomorrow. |
| `yusra_bins_2` | IV | 22:20 | FULL CIRCLE: you say it twice, slowly, without making her feel stupid |
| `act_five` | V | 09:40 | she reads every page. six minutes. nobody speaks. |
| `five_read` | V | 09:46 | "Day two." the lease date is the whole character sheet |
| `five_verdict` | V | 09:50 | EVERY ACT III CHOICE IS READ BACK ALOUD |
| `five_stamp` | V | 09:55 | the sound is smaller than you imagined |
| `five_out` | V | 10:30 | THREE ENDINGS, ONE DOOR / different person walking out |
