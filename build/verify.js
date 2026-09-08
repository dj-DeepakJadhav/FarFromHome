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
        /startFirstShift\('shift_1_teach'\)/.test(mainSrc) &&
        !/startFirstShift\('shift_3_test'\)/.test(mainSrc),
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
