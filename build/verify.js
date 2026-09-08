#!/usr/bin/env node
// Headless assertion suite for Far From Home.
//
// check-story.js validates the narrative GRAPH (reachability, chronology).
// This validates everything else that has actually broken during development:
// data/code agreement, style rules, economy arithmetic, and cross-file wiring.
//
//   node build/verify.js
//
// Exit code 1 on any failure, so it can gate a commit.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0;
const failures = [];
const notes = [];
const ok = (name) => { pass++; };
const bad = (name, detail) => failures.push({ name, detail });
const check = (name, cond, detail) => cond ? ok(name) : bad(name, detail);

// ---------- load game data in a fake browser global ----------
global.window = { FFH: {} };
global.THREE = {};
const load = (rel) => {
  try { eval(fs.readFileSync(path.join(ROOT, rel), 'utf8')); return true; }
  catch (e) { bad('load ' + rel, e.message); return false; }
};
load('src/data/items.js');
load('src/data/shop.js');
load('src/core/economy.js');
load('src/data/shifts.js');
const F = global.window.FFH;

const story = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/narrative/story.json'), 'utf8'));
const scenes = story.scenes;
const byId = Object.fromEntries(scenes.map(s => [s.id, s]));

// ---------- 1. scene schema ----------
const noSpace = scenes.filter(s => !['interior','exterior','threshold'].includes((s.stage||{}).space));
check('every scene declares stage.space', noSpace.length === 0,
      noSpace.map(s => s.id).join(', '));

// Scenes intentionally without a speaker. Anything else with an empty cast is
// a bug: it used to build an NPC diorama and default it to NPC_NICO.
const SPEAKERLESS_OK = new Set(['wg_buzzer','kruma_flyer','night_one','hub','the_circle_3',
  'four_uni','four_shortfall','four_evening','four_last_night','four_phone','the_end',
  // pure narration beats: nobody is in the room and none is intended
  'act_one','golden_hour','rita_first','night_one_end','act_two_fork',
  'act_three_open','night_tick','act_four']);
const unexpectedEmpty = scenes.filter(s =>
  ['blocking','overlay'].includes(s.mode) && !(s.cast||[]).length && !SPEAKERLESS_OK.has(s.id));
check('no unexpected speakerless dialogue scenes', unexpectedEmpty.length === 0,
      unexpectedEmpty.map(s => s.id).join(', '));

// ---------- 2. house style ----------
const strings = [];
const walk = (o, sid) => {
  if (typeof o === 'string') strings.push([sid, o]);
  else if (Array.isArray(o)) o.forEach(v => walk(v, sid));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
    if (['prose','label'].includes(k)) walk(v, sid); else walk(v, sid);
  }
};
scenes.forEach(s => { walk(s.prose, s.id); (s.choices||[]).forEach(c => { walk(c.prose, s.id); walk(c.label, s.id); }); });

// Style rules are enforced on the committed scope, Acts I and II. Acts III to V
// are explicitly out of scope for this build (see TASKS.md, NOT DOING).
const IN_SCOPE = new Set(scenes.filter(s => ['I','II'].includes(s.act)).map(s => s.id));
const scoped = strings.filter(([sid]) => IN_SCOPE.has(sid));
const tooLong = scoped.filter(([, t]) => t.length > 140);
check('no Act I/II line over 140 chars', tooLong.length === 0,
      tooLong.slice(0,3).map(([s,t]) => `${s}: ${t.slice(0,50)}...`).join(' | '));
const outOfScopeLong = strings.filter(([sid]) => !IN_SCOPE.has(sid)).filter(([, t]) => t.length > 140);
if (outOfScopeLong.length) notes.push(`Acts III-V: ${outOfScopeLong.length} long lines (out of scope)`);

const dashed = scoped.filter(([, t]) => /[—–]/.test(t));
check('no em/en dashes in Act I/II text', dashed.length === 0,
      dashed.slice(0,3).map(([s]) => s).join(', '));

const emojid = scoped.filter(([, t]) => /[\u{1F300}-\u{1FAFF}]/u.test(t));
check('no emoji in Act I/II text', emojid.length === 0,
      emojid.slice(0,3).map(([s]) => s).join(', '));

const corrupted = scoped.filter(([, t]) => /\([a-z]{1,4}\)'/.test(t) || /\(\d+\)-/.test(t));
check('no regex-corrupted strings', corrupted.length === 0,
      corrupted.slice(0,3).map(([s,t]) => `${s}: ${t.slice(0,40)}`).join(' | '));

// ---------- 3. item ids referenced from code actually resolve ----------
const itemIds = new Set(F.items.map(i => i.id));
const pickSrc = fs.readFileSync(path.join(ROOT, 'src/phases/pickPhase.js'), 'utf8');
const manifests = [...pickSrc.matchAll(/manifestIds\s*=\s*\[([^\]]+)\]/g)]
  .map(m => m[1].split(',').map(s => s.trim().replace(/['"]/g, '')));
const badIds = manifests.flat().filter(id => !itemIds.has(id));
check('hardcoded shift manifests resolve to real items', badIds.length === 0,
      'missing: ' + badIds.join(', '));
notes.push(`shift manifests: ${manifests.map(m => m.length).join(' / ')} items`);

// ---------- 4. shelf tiers ----------
const food = F.items.filter(i => i.category === 'Food');
for (const g of ['der','die','das']) {
  const n = food.filter(i => i.gender === g).length;
  check(`>=4 Food items for '${g}' (shelf needs 4 slots)`, n >= 4, `only ${n}`);
}
const dupTypes = {};
food.forEach(i => { (dupTypes[i.type] = dupTypes[i.type] || []).push(i.nameEn); });
const shared = Object.entries(dupTypes).filter(([, v]) => v.length > 1);
check('every Food item has its own mesh type', shared.length === 0,
      shared.map(([t,v]) => `${t}: ${v.join('+')}`).join(' | '));

// ---------- 5. shift pool never leaks non-Food ----------
let leaked = [];
for (let n = 1; n <= 12; n++) {
  const pool = F.getShiftItemPool(n);
  leaked = leaked.concat(pool.filter(id => {
    const it = F.items.find(x => x.id === id);
    return !it || it.category !== 'Food';
  }));
}
check('shift item pool is Food-only at every shift', leaked.length === 0,
      'leaked: ' + [...new Set(leaked)].join(', '));

// ---------- 6. Act I ramp ----------
const RAMP = { shift_1_teach: 0, shift_2_anticipate: 1.5, shift_3_test: 2.5 };
for (const [sid, want] of Object.entries(RAMP)) {
  const got = ((byId[sid]||{}).unlocks||{}).ramp;
  check(`${sid} declares icon_delay_s ${want}`, got && got.icon_delay_s === want,
        `got ${got ? got.icon_delay_s : 'no ramp block'}`);
}

// ---------- 7. sfx keys called vs implemented ----------
const sfxSrc = fs.readFileSync(path.join(ROOT, 'src/audio/sfx.js'), 'utf8');
const called = new Set();
const walkDir = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) walkDir(p);
  else if (e.name.endsWith('.js')) {
    const t = fs.readFileSync(p, 'utf8');
    [...t.matchAll(/playSfx\(['"]([a-zA-Z_]+)['"]/g)].forEach(m => called.add(m[1]));
  }
});
walkDir(path.join(ROOT, 'src'));
const silent = [...called].filter(k => !sfxSrc.includes(`'${k}'`));
check('every playSfx key exists in sfx.js', silent.length === 0, 'silent: ' + silent.join(', '));

// ---------- 8. shop wiring ----------
const cityInt = fs.readFileSync(path.join(ROOT, 'src/phases/city/cityInteractions.js'), 'utf8');
const soldSomewhere = F.shopUpgrades.filter(u => cityInt.includes(`'${u.id}'`));
check('every shop upgrade is sold at some POI',
      soldSomewhere.length === F.shopUpgrades.length,
      'unsold: ' + F.shopUpgrades.filter(u => !cityInt.includes(`'${u.id}'`)).map(u=>u.id).join(', '));

// ---------- 9. the 180-second economy run ----------
{
  const E = F.ECONOMY;
  let wallet = E.STARTING_WALLET, day = 1, lease = false;
  const step = (payout) => {
    wallet += payout; day += 1;
    F.dailyCostsFor({ day, has_lease: lease, storyFlags: {} }, day)
      .forEach(c => { wallet = Math.max(0, wallet - c.amount); });
  };
  step(37.85);
  wallet -= 25;                       // Shelf Labels
  step(51.90);
  wallet -= E.KAUTION_DEPOSIT; lease = true;
  wallet = Math.round(wallet * 100) / 100;
  check('180s run ends solvent', wallet > 0, `ended at ${wallet}`);
  check('180s run reaches ~36.75', Math.abs(wallet - 36.75) < 0.5, `got ${wallet}`);
  notes.push(`180s economy: 20.00 -> ${wallet.toFixed(2)} by day ${day}`);

  // lease must stop the hostel charge
  const after = F.dailyCostsFor({ day: 5, has_lease: true, storyFlags: {} }, 5);
  check('lease stops the hostel charge', !after.some(c => c.label === 'Hostel bed'),
        JSON.stringify(after));
}

// ---------- 10. streak ceiling is reachable ----------
{
  const E = F.ECONOMY;
  const maxItems = F.getShift(20).itemsCount;
  const reachable = 1 + maxItems * E.STREAK_STEP;
  check('STREAK_MAX is reachable', reachable >= E.STREAK_MAX,
        `ceiling ${reachable.toFixed(2)} vs STREAK_MAX ${E.STREAK_MAX}`);
}

// ---------- 11. docs match the build ----------
{
  const idx = path.join(ROOT, 'index.html');
  if (fs.existsSync(idx)) {
    const mb = fs.statSync(idx).size / (1024 * 1024);
    const canon = fs.readFileSync(path.join(ROOT, 'Docs/CANONICAL_NUMBERS.md'), 'utf8');
    const quoted = (canon.match(/\*\*([\d.]+) MB\*\*/) || [])[1];
    check('CANONICAL_NUMBERS build size matches index.html',
          quoted && Math.abs(parseFloat(quoted) - mb) < 0.3,
          `doc says ${quoted} MB, build is ${mb.toFixed(2)} MB`);
    check('build is under the 35 MB limit', mb < 35, `${mb.toFixed(2)} MB`);
    notes.push(`index.html: ${mb.toFixed(2)} MB`);
  }
  const hasMusic = fs.existsSync(path.join(ROOT, 'assets/Music/bgMusic.mp3'));
  const readme = fs.readFileSync(path.join(ROOT, 'Docs/README_HACKATHON.md'), 'utf8');
  check('docs do not claim zero audio while shipping music',
        !(hasMusic && /ships no audio files|zero recorded assets/i.test(readme)),
        'README_HACKATHON claims no audio but bgMusic.mp3 exists');
}

// ---------- gameplay regressions caught in the mobile playtest ----------
load('src/ui/hud.js');
load('src/ui/screens/hudShifts.js');
check('pick feedback API exists', typeof F.UI.prototype.spawnFloatingText === 'function',
      'Correct picks used to throw before removing the grocery.');
check('no obsolete audio-only picking instruction',
      !/listening test|pick by audio alone/i.test(pickSrc), 'Visual cues must be described accurately.');
load('src/phases/pickPhase.js');
{
  const pick = Object.create(F.PickPhase.prototype);
  const cam = { position: { copy() {} }, lookAt() {} };
  const state = { currentShift: 1, upgrades: {}, freshness: 100,
    activeOrder: [{ id: 'milch', gender: 'die', packed: false }] };
  let pulses = 0;
  pick.game = { state, cameras: { mainCamera: cam }, speech: { playTalkBlip() {} },
    ui: { updatePickHUD() {}, showWarehouseManifest() {} } };
  Object.assign(pick, { timeRemaining: 13, pickDuration: 13, isTransitioning: false,
    finishing: false, briefingHold: true, shelvedMeshes: [], currentStoryParams: { iconDelay: 1.5 } });
  pick.pulseRailForGender = () => pulses++;
  pick.update(1);
  check('briefing preserves timer and early cue', pick.timeRemaining === 13 && pulses === 0);
  pick.briefingHold = false;
  pick.update(0.1);
  check('story ramp applies to first prompt', state.activeOrder[0].revealDelay === 1.5 && pulses === 1);
  pick.update(1);
  check('icon stays hidden within early window', !state.activeOrder[0].revealed);
  pick.update(0.5);
  check('icon reveals after active play delay', state.activeOrder[0].revealed);
  state.activeOrder[0].packed = true;
  state.activeOrder.push({ id: 'kaese', gender: 'der', packed: false });
  pick.update(0.1);
  check('later prompt retains story ramp', state.activeOrder[1].revealDelay === 1.5 && pulses === 2);
  pick.finishing = true;
  const time = pick.timeRemaining;
  pick.update(1);
  check('completed order cannot also time out', pick.timeRemaining === time);
}
check('trial pays actual performance', byId.shift_receipt.effects.some(e => e.var === 'wallet' && e.expr === 'wallet + pay'));
check('story nights use canonical living costs', byId.night_tick.effects.some(e => e.var === 'wallet' && e.expr.includes('daily_cost')));
const assembler = fs.readFileSync(path.join(ROOT, 'build/assemble.js'), 'utf8');
check('vendor source is not embedded by assembler', !assembler.includes('vendorContents'));

// ---------- 12. Act I keeps ONE shift across its three ramp stages ----------
// The quickstart path once set currentShift from the scene id, so landing on
// shift_3_test paid from shift 3's wage table (19.00 base instead of 13.00) and
// titled the reviewer's opening frame "WG Flat Party Surge". The economy test
// above builds its own state and therefore could not see it. These are source
// assertions because the bug lived in the entry point, not in the data.
{
  const mainSrc = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');

  check('startFirstShift does not derive currentShift from the scene id',
        !/currentShift\s*=\s*startSceneId/.test(mainSrc),
        'Act I is one shift in three ramp stages; difficulty comes from ' +
        'unlocks.ramp.icon_delay_s, never from currentShift');

  check('startFirstShift pins currentShift to 1',
        /this\.state\.currentShift\s*=\s*1\s*;/.test(mainSrc));

  check('quickstart lands on the teach stage, not the test stage',
        /startFirstShift\('shift_1_teach'/.test(mainSrc) &&
        !/startFirstShift\('shift_3_test'/.test(mainSrc),
        'the Shift 3 Aha depends on stages 1 and 2 having been played');

  // The real difficulty source must stay distinct per stage, or the ramp that
  // replaces currentShift is itself flat.
  const stages = ['shift_1_teach', 'shift_2_anticipate', 'shift_3_test'];
  const delays = stages.map(id => ((byId[id] || {}).unlocks || {}).ramp || {})
                       .map(r => r.icon_delay_s);
  check('each Act I stage declares its own icon reveal delay',
        delays.length === 3 && new Set(delays).size === 3 &&
        delays.every(d => typeof d === 'number'),
        'delays: ' + JSON.stringify(delays));
  check('the Act I ramp increases',
        delays[0] < delays[1] && delays[1] < delays[2],
        'delays: ' + JSON.stringify(delays));

  // Every Act I stage must resolve to the same wage table.
  const s1 = F.getShift(1);
  check('Act I pays from the shift 1 wage table',
        s1.baseWage === 13 && s1.quota === 23,
        'baseWage ' + s1.baseWage + ', quota ' + s1.quota);
}

// ---------- 13. P0.1 receipt / day-boundary contract ----------
// Five deterministic day-end scenarios. Each asserts that what the receipt
// SHOWS and what the wallet actually DOES agree, that income already sitting in
// the wallet is never counted a second time, and that a pending Kruma payout is
// counted exactly once.
{
  const E = F.ECONOMY;
  const baseState = (over) => Object.assign({
    day: 1, currentShift: 1, wallet: E.STARTING_WALLET, strikes: 0,
    bagIntegrity: 100, stats: { shiftsWorked: 0 }, upgrades: {},
    activeOrder: [], storyFlags: {}
  }, over || {});

  // dailyCostsFor is the ONLY rent/food source, and the day it is asked about
  // must be the day the player wakes into.
  check('day 1 charges nothing (arrival night is free)',
        F.dailyCostsFor(baseState(), 1).length === 0);
  check('day 2 charges food only',
        F.dailyCostsFor(baseState(), 2).map(c => c.label).join(',') === 'Food');
  check('day 3 charges hostel bed and food',
        F.dailyCostsFor(baseState(), 3).map(c => c.label).sort().join(',') === 'Food,Hostel bed');
  check('a signed lease stops the hostel charge',
        !F.dailyCostsFor(baseState({ has_lease: true }), 3)
           .some(c => c.label === 'Hostel bed'),
        'kaution_pay sets has_lease, not hasApartment');

  // --- Scenario 1: Day 1 orientation with Pfand. Income is ALREADY in the
  // wallet (bottles were collected during the walk), so the receipt must show
  // it as earnings but must NOT add it again to the projected balance.
  {
    const allFive = F.round2(E.PFAND_DEPOSIT * 5);     // 5 bottles spawn per day
    const st = baseState({ day: 1, wallet: F.round2(20 + allFive), pfandCollected: allFive });
    const l = F.buildReceiptLedger(st, { netPayout: 0, isExplorationDay: true }, { day: 1 });
    check('day 1 receipt itemises Pfand as income', l.explorationIncome === allFive);
    check('day 1 receipt shows next-day food cost', l.dailyTotal === E.DAILY_FOOD_COST);
    check('day 1 Pfand is not added to the wallet twice',
          l.projectedWallet === F.round2(20 + allFive - E.DAILY_FOOD_COST),
          'projected ' + l.projectedWallet);
    check('day 1 net change is income minus costs',
          l.netChange === F.round2(allFive - E.DAILY_FOOD_COST));

    // The regression this counter exists for. The old ledger inferred Pfand as
    // `wallet - STARTING_WALLET`, so spending anything during the walk made the
    // receipt under-report income that the player had genuinely earned. Here
    // the player banks all five bottles and then spends 2.00 on coffee.
    const spent = baseState({ day: 1, wallet: F.round2(20 + allFive - 2.00),
                              pfandCollected: allFive });
    const ls = F.buildReceiptLedger(spent, { netPayout: 0, isExplorationDay: true }, { day: 1 });
    check('spending during day 1 does not hide Pfand earnings',
          ls.explorationIncome === allFive,
          'reported ' + ls.explorationIncome + ' instead of ' + allFive);
    check('day 1 projection reflects money actually spent',
          ls.projectedWallet === F.round2(20 + allFive - 2.00 - E.DAILY_FOOD_COST),
          'projected ' + ls.projectedWallet);

    // A run with no bottles collected must report zero, not a negative number.
    const none = baseState({ day: 1, wallet: 18.00, pfandCollected: 0 });
    const ln = F.buildReceiptLedger(none, { netPayout: 0, isExplorationDay: true }, { day: 1 });
    check('collecting no Pfand reports zero income', ln.explorationIncome === 0,
          'reported ' + ln.explorationIncome);

    check('a fresh run starts with an empty Pfand ledger',
          F.createRunState().pfandCollected === 0);
    check('Pfand deposit is a canonical tunable, not a literal',
          typeof E.PFAND_DEPOSIT === 'number' && E.PFAND_DEPOSIT > 0);
  }

  // --- Scenario 2: Day 2 Kruma trial passed. The payout is PENDING (the story
  // scene applies it), so it must be added exactly once.
  {
    const st = baseState({ day: 2, wallet: 12.00, trialPassed: true });
    const l = F.buildReceiptLedger(st, { netPayout: 37.85 }, { day: 2 });
    check('day 2 Kruma receipt counts the pending payout once', l.income === 37.85);
    check('day 2 Kruma pay is reported as still to come', l.pendingIncome === 37.85,
          'the receipt shows this row so the balance arithmetic is followable');
    check('day 2 Kruma projects wallet + pay - tomorrow costs',
          l.projectedWallet === F.round2(12.00 + 37.85 - 13.00),
          'projected ' + l.projectedWallet);
  }

  // --- Scenario 3: Day 2 failed trial. No pay, but the night still costs.
  {
    const st = baseState({ day: 2, wallet: 12.00, trialPassed: false });
    const l = F.buildReceiptLedger(st, { netPayout: 0, isExplorationDay: true }, { day: 2 });
    check('failed trial night earns nothing', l.income === 0,
          'income ' + l.income);
    check('failed trial night still charges the day', l.dailyTotal === 13.00);
    check('failed trial night reduces the wallet',
          l.projectedWallet === F.round2(12.00 - 13.00));
  }

  // --- Scenario 4: Day 3 Kruma, settled. `settled` means the story already
  // charged the night, so the receipt must not charge it a second time.
  {
    const st = baseState({ day: 3, currentShift: 2, wallet: 36.75 });
    const l = F.buildReceiptLedger(st, { netPayout: 41.90 }, { day: 3, settled: true });
    check('a settled receipt charges no costs', l.dailyTotal === 0);
    check('a settled receipt still reports earnings', l.income === 41.90);
  }

  // --- Scenario 5: Day 3 post round. Letter pay is already banked by the
  // round itself, so it must not be added again.
  {
    const full = E.LETTER_RATE * E.LETTER_ROUND_SIZE;
    const st = baseState({ day: 3, wallet: F.round2(12.00 + full) });
    const l = F.buildReceiptLedger(st, { netPayout: full, isLetterRound: true }, { day: 3 });
    check('post round reports the full round', l.income === full);
    check('post round pay is not pending, it is already banked',
          l.pendingIncome === 0, 'pendingIncome ' + l.pendingIncome);
    check('post round pay is not banked twice',
          l.projectedWallet === F.round2(12.00 + full - 13.00),
          'projected ' + l.projectedWallet);
    check('a post round pays less than a Kruma shift', full < 37.85,
          'Kruma must stay the better job');
  }

  // --- Repeat dismissal must not duplicate pay. This is the guard that was
  // missing: the receipt button called finishShift with no protection, so a
  // double-tap credited the wallet twice and charged the night twice.
  {
    const st = baseState({ day: 2, currentShift: 1, wallet: 12.00 });
    const game = {
      state: st,
      lastPayout: { netPayout: 37.85, metQuota: true },
      transitionTo: () => {},
      ui: {}
    };
    F.finishShift(game);
    const afterFirst = st.wallet;
    const dayAfterFirst = st.day;
    F.finishShift(game);
    F.finishShift(game);
    check('repeat dismissal cannot duplicate pay', st.wallet === afterFirst,
          'wallet drifted from ' + afterFirst + ' to ' + st.wallet);
    check('repeat dismissal cannot advance the day again', st.day === dayAfterFirst,
          'day drifted from ' + dayAfterFirst + ' to ' + st.day);
    check('the shown cost is the charged cost',
          st.wallet === F.round2(12.00 + 37.85 - 13.00),
          'wallet ' + st.wallet);
  }
}

// ---------- 14. the receipt projection IS the next morning's wallet ----------
// The contract that matters to a player: the number the receipt promises after
// sleep is the number they wake up with. Simulates night_tick exactly as
// storyRunner does (charge dailyCostsFor(day+1), advance the day) and compares.
{
  const E = F.ECONOMY;
  const sleep = (st) => {                       // mirrors storyRunner night_tick
    const costs = F.dailyCostsFor(st, (st.day || 1) + 1);
    const daily = costs.reduce((sum, c) => sum + c.amount, 0);
    st.day = (st.day || 1) + 1;
    st.wallet = F.round2(st.wallet - daily);
    st.pfandCollected = 0;
    return st.wallet;
  };

  // Day 1 orientation: five bottles banked, 2.00 spent on the walk.
  {
    const st = F.createRunState();
    for (let i = 0; i < 5; i++) {
      st.wallet = F.round2(st.wallet + E.PFAND_DEPOSIT);
      st.pfandCollected = F.round2(st.pfandCollected + E.PFAND_DEPOSIT);
    }
    st.wallet = F.round2(st.wallet - 2.00);
    const projected = F.buildReceiptLedger(
      st, { netPayout: 0, isExplorationDay: true }, { day: 1 }).projectedWallet;
    check('day 1 projection is the day 2 opening wallet', sleep(st) === projected,
          'projected ' + projected + ', woke with ' + st.wallet);
  }

  // Day 2 Kruma pass: payout is pending, so sleep must apply it once.
  {
    const st = Object.assign(F.createRunState(), { day: 2, wallet: 15.00 });
    const pay = 37.85;
    const projected = F.buildReceiptLedger(st, { netPayout: pay }, { day: 2 }).projectedWallet;
    st.wallet = F.round2(st.wallet + pay);      // the story scene banks the pay
    check('day 2 Kruma projection is the day 3 opening wallet', sleep(st) === projected,
          'projected ' + projected + ', woke with ' + st.wallet);
  }

  // Day 3 post round: pay is already banked, so sleep must not add it again.
  {
    const round = F.round2(E.LETTER_RATE * E.LETTER_ROUND_SIZE);
    const st = Object.assign(F.createRunState(), { day: 3, wallet: F.round2(15.00 + round) });
    const projected = F.buildReceiptLedger(
      st, { netPayout: round, isLetterRound: true }, { day: 3 }).projectedWallet;
    check('day 3 post projection is the day 4 opening wallet', sleep(st) === projected,
          'projected ' + projected + ', woke with ' + st.wallet);
  }

}

// ---------- 15. day/night follows the story clock ----------
// The cycle used to look random because a table of stage.light values replaced
// the computed clock: interior_fluorescent_cold forced 0.90 (night), so the
// Kruma warehouse scenes at 06:20-07:40 rendered under a midnight sky, and
// dawn_grey forced 0.22 onto three 09:xx scenes, sending the morning backwards
// after 08:40 had already shown full day.
{
  const runnerSrc = fs.readFileSync(path.join(ROOT, 'src/core/storyRunner.js'), 'utf8');
  const envSrc = fs.readFileSync(path.join(ROOT, 'src/phases/city/cityEnvironment.js'), 'utf8');

  const noTime = scenes.filter(sc => !((sc.stage || {}).time));
  check('every scene declares a clock time', noTime.length === 0,
        noTime.map(sc => sc.id).join(', '));

  check('stage.light no longer overrides the story clock',
        !/timeProgress\s*=\s*0\.(75|88|22|90)\b/.test(runnerSrc),
        'stage.light describes the local set treatment, not what time it is');

  check('the story clock is persisted for phase rebuilds',
        /storyTimeProgress/.test(runnerSrc) && /storyTimeProgress/.test(envSrc),
        'the city phase is rebuilt on every shop/interior/sleep transition');

  check('lighting interpolates between keyframes',
        /TIME_STOPS/.test(envSrc) && /lerp/.test(envSrc),
        'four hard buckets made 19:40 and 22:05 render identically');

  check('keyframes span a full day',
        /t:\s*0\.00/.test(envSrc) && /t:\s*1\.00/.test(envSrc));

  // Seasonal variety is a FEATURE: each run is WiSe or SoSe and the palette
  // follows. What must hold is that the label agrees with the roll, the roll
  // is recorded so a run can be reproduced, and the judge path can pin it.
  check('both seasons are defined with a label and an emoji',
        ['WINTER', 'SUMMER'].every(k => F.SEASONS && F.SEASONS[k]
          && F.SEASONS[k].name && F.SEASONS[k].emoji),
        JSON.stringify(F.SEASONS));

  ['WINTER', 'SUMMER'].forEach(season => {
    const st = F.createRunState(season);
    check('a forced ' + season + ' run uses the ' + season + ' palette',
          st.semester === season, 'got ' + st.semester);
    check('the ' + season + ' label matches the roll',
          st.semesterName === F.SEASONS[season].name
          && st.semesterEmoji === F.SEASONS[season].emoji,
          st.semesterName + ' / ' + st.semesterEmoji);
    check('a ' + season + ' run records its seed',
          typeof st.seasonSeed === 'number', String(st.seasonSeed));
  });

  // Over many unforced runs both seasons must actually appear, or the variety
  // is not there; and every run must still be self-consistent.
  const rolled = {};
  let mismatched = 0;
  for (let i = 0; i < 200; i++) {
    const st = F.createRunState();
    rolled[st.semester] = (rolled[st.semester] || 0) + 1;
    if (st.semesterName !== (F.SEASONS[st.semester] || {}).name) mismatched++;
  }
  check('unforced runs vary between the two seasons',
        rolled.WINTER > 0 && rolled.SUMMER > 0, JSON.stringify(rolled));
  check('every rolled run agrees with its own label', mismatched === 0,
        mismatched + ' of 200 runs had a label from the other season');

  // The judge path must not gamble on the palette.
  const mainSrcSeason = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');
  check('the quickstart path pins the showcase palette',
        /startFirstShift\('shift_1_teach',\s*window\.FFH\.SHOWCASE_SEASON\)/.test(mainSrcSeason));
  check('a showcase season is declared',
        !!(F.SEASONS && F.SEASONS[F.SHOWCASE_SEASON]), String(F.SHOWCASE_SEASON));

  // Chronology per authored route. A day must read as one continuous day.
  const toMinutes = (id) => {
    const t = ((byId[id] || {}).stage || {}).time || '00:00';
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const routes = {
    'day 1': ['act_one', 'wg_door_scenic', 'wg_buzzer', 'nico_kitchen', 'golden_hour',
              'uni_closed', 'pizzeria_job', 'bakery_job', 'kruma_flyer', 'kruma_door',
              'night_one', 'night_one_end'],
    'Kruma day 2': ['nina_trial', 'shift_1_teach', 'shift_2_anticipate', 'shift_3_test',
                    'shift_receipt', 'rita_first'],
    'Kruma day 3 via Kaution': ['act_two', 'lokker_kaution', 'act_two_fork',
                                'kaution_pay', 'act_two_end'],
    'Kruma day 3 via loan': ['act_two', 'lokker_kaution', 'act_two_fork',
                             'mathias_loan', 'mathias_loan_2', 'act_two_end'],
    'post day 2': ['trial_failed', 'nico_setback', 'nico_tour', 'post_flyer', 'night_two_home']
  };
  Object.entries(routes).forEach(([name, ids]) => {
    const missing = ids.filter(id => !byId[id]);
    const back = [];
    for (let i = 0; i < ids.length - 1; i++) {
      if (toMinutes(ids[i + 1]) < toMinutes(ids[i])) {
        back.push(ids[i] + ' -> ' + ids[i + 1]);
      }
    }
    check('the clock never runs backwards on ' + name,
          missing.length === 0 && back.length === 0,
          missing.length ? 'missing scenes: ' + missing.join(', ') : back.join('; '));
  });
}

// ---------- 16. every speaking character resolves to a real model ----------
// createNPCMesh does `mapping[npcKey] || npcKey`, so an unmapped cast key
// looks for a GLB named e.g. "NPC_KLAUS", finds nothing and returns an EMPTY
// GROUP: the character is invisible and nothing throws. Six speaking
// characters were in that state, NPC_KLAUS among them, and he is cast in the
// three warehouse scenes including the one ?quickstart=1 lands a judge on.
{
  const glbSrc = fs.readFileSync(path.join(ROOT, 'src/data/characterGLB.js'), 'utf8');
  const mapMatch = glbSrc.match(/NPC_GLB_MAPPING\s*=\s*(\{[\s\S]*?\})\s*;/);
  let mapping = {};
  try { mapping = JSON.parse(mapMatch[1]); } catch (e) { bad('parse NPC_GLB_MAPPING', e.message); }

  // Authoritative list of models: the files actually on disk.
  const glbRoot = path.join(ROOT, 'assets/Characters/glb');
  const available = new Set();
  ['Mini', 'Blocky'].forEach(dir => {
    const full = path.join(glbRoot, dir);
    if (!fs.existsSync(full)) return;
    fs.readdirSync(full).filter(f => f.endsWith('.glb'))
      .forEach(f => available.add(f.replace(/\.glb$/, '')));
  });
  check('character models are present on disk', available.size > 0, glbRoot);

  const castKeys = new Set();
  scenes.forEach(sc => (sc.cast || []).forEach(c => castKeys.add(c)));

  const unresolved = [...castKeys].filter(k => !available.has(mapping[k] || k));
  check('every cast NPC resolves to a model file', unresolved.length === 0,
        'invisible: ' + unresolved.join(', '));

  // Same check restricted to what actually ships, so an Acts III-V regression
  // cannot mask a defect on the critical path.
  const shipCast = new Set();
  scenes.filter(sc => sc.act === 'I' || sc.act === 'II')
        .forEach(sc => (sc.cast || []).forEach(c => shipCast.add(c)));
  const shipUnresolved = [...shipCast].filter(k => !available.has(mapping[k] || k));
  check('every Act I-II NPC resolves to a model file', shipUnresolved.length === 0,
        'invisible on the shipping path: ' + shipUnresolved.join(', '));

  // Nico is a student. character-male-c is a blue police uniform with cap and
  // badge, which gave the wrong impression entirely.
  check('Nico does not wear the police model',
        mapping['NPC_NICO'] !== 'character-male-c',
        'currently ' + mapping['NPC_NICO']);
}

// ---------- 17. the HUD reacts when its values change ----------
// updatePersistentHUD rebuilds its innerHTML on every call, so the doc boxes'
// CSS transition could never fire: the element being animated was always a
// brand new node with no previous state. Feedback therefore has to compare
// against values stored on the UI object and animate after the rebuild.
{
  const hudSrc = fs.readFileSync(path.join(ROOT, 'src/ui/hud.js'), 'utf8');

  check('the HUD compares against previously rendered values',
        /_hudPrev/.test(hudSrc),
        'without this a rebuild cannot tell what changed');
  check('the HUD flashes changes after rebuilding',
        /this\.flashHudChanges\(/.test(hudSrc) && /flashHudChanges\(s, wallet, docs\)\s*\{/.test(hudSrc));
  check('the wallet counts toward its new value',
        /countUp\(walletEl/.test(hudSrc),
        'countUp existed but was never called, so the wallet snapped');
  check('delta chips live outside the rebuilt HUD node',
        /ffh-hud-feedback/.test(hudSrc),
        'a chip inside #ffh-persistent-hud is wiped by the next wallet change');
  check('the day badge and doc boxes are addressable',
        /id="ffh-hud-day"/.test(hudSrc) && /id="ffh-doc-\$\{i\}"/.test(hudSrc));
}

// ---------- 18. the post round tells the player where to go ----------
// The round set an objective string and nothing else usable: the street beacon
// aimed at a door while the round scored against the building centre, the
// range readout was overwritten to inactive every frame by the block that runs
// after letterRound.update(), addresses could be map-border scenery, and their
// names were raw grid coordinates.
{
  const lrSrc = fs.readFileSync(path.join(ROOT, 'src/phases/city/cityLetterRound.js'), 'utf8');
  const citySrc = fs.readFileSync(path.join(ROOT, 'src/phases/cityExplorationPhase.js'), 'utf8');
  const doorSrc = fs.readFileSync(path.join(ROOT, 'src/phases/city/cityDoorway.js'), 'utf8');

  check('the round scores against the same door the beacon marks',
        /getDoorPosition\(m\.userData\.type, m\.position\)/.test(lrSrc),
        'otherwise the ring the player walks to is not the point that counts');

  check('the range readout survives a post round',
        /inLetterRound/.test(citySrc) && /isDelivery \|\| hasStoryTarget \|\| inLetterRound/.test(citySrc),
        'the else branch set it inactive after letterRound.update published it');

  check('the beacon aims at the round address',
        /targetMesh = curLetter\.mesh/.test(citySrc));

  check('walking to a letter address does not pull the player indoors',
        /inLetterRound/.test(doorSrc),
        'auto-entry at 1.6m would interrupt the round at every door');

  check('map-border scenery cannot be a delivery address',
        /onBorder/.test(lrSrc), 'a round could target the corner of the world');

  check('addresses are named, not grid coordinates',
        /_nearestLandmark/.test(lrSrc) && !/Altbau \$\{gx\}/.test(lrSrc),
        '"Altbau 10-14" is a grid reference, not a destination');

  check('the objective line is released when the round ends',
        /activeObjective = null/.test(lrSrc),
        '"Round complete." otherwise stays as the objective for later scenes');
}

// ---------- report ----------
console.log('');
notes.forEach(n => console.log('  · ' + n));
console.log('');
if (failures.length === 0) {
  console.log(`  ✅ verify: ${pass}/${pass} checks passed`);
  process.exit(0);
}
console.log(`  ❌ verify: ${pass} passed, ${failures.length} FAILED\n`);
failures.forEach(f => console.log(`     x ${f.name}\n       ${f.detail || ''}`));
process.exit(1);
