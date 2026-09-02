// Storyboard validator + manifest generator.
//
// Reads assets/narrative/story.json -- the single source of truth for prose,
// branching, economy deltas, UI/mechanic unlocks and pacing -- and:
//
//   1. validates it (link integrity, pacing budget, unlock coverage,
//      progressive-disclosure rules, economy sync against src/core/economy.js)
//   2. emits Docs/generated/ART_MANIFEST.md and GAMEPLAY_MANIFEST.md
//
// Zero dependencies: story.json is read with the built-in JSON.parse, which is
// why the storyboard is JSON and not YAML. Nothing here ships in index.html.
//
//   node build/storyboard_check.js            validate + write manifests
//   node build/storyboard_check.js --check    validate only, non-zero on error
//
// Supersedes build/narrative_manifest.js, which read the now-stale story.ink.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STORY = path.join(ROOT, 'assets', 'narrative', 'story.json');
const OUT_DIR = path.join(ROOT, 'Docs', 'generated');
const CHECK_ONLY = process.argv.includes('--check');

// Assets the storyboard deliberately introduces that src/ does not define yet.
// Reported as planned work, not errors. Remove an entry once it exists.
const PLANNED_LOCATIONS = {
  B_ZOB: 'coach/station arrival point',
  B_DARKSTORE_YARD: 'exterior yard behind B_DARKSTORE (Klaus scenes)',
  LM_CANAL: 'canal bank with lantern reflections',
  LM_MARKTPLATZ: 'plaza exists in townLayout, needs a POI id',
  LM_BANK_STEP: 'step outside B_BANK',
  LM_HARBOUR_ROAD: 'unlit pothole road'
};
const PLANNED_CAST = { NPC_YUSRA: 'new arrival in Act IV' };

// ------------------------------------------------------------------ helpers

function readIds(file, regex) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return new Set();
  const src = fs.readFileSync(p, 'utf-8');
  const out = new Set();
  let m;
  while ((m = regex.exec(src)) !== null) out.add(m[1]);
  return out;
}

function readEconomy() {
  const p = path.join(ROOT, 'src', 'core', 'economy.js');
  if (!fs.existsSync(p)) return {};
  const src = fs.readFileSync(p, 'utf-8');
  const start = src.indexOf('ECONOMY:');
  if (start === -1) return {};
  const open = src.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) { end = i; break; }
  }
  if (end === -1) return {};
  const block = src.slice(open, end);
  const out = {};
  const re = /([A-Z][A-Z0-9_]+)\s*:\s*(-?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(block)) !== null) out[m[1]] = parseFloat(m[2]);
  return out;
}

// "END" is the story terminal inherited from Ink, not a scene.
const TERMINALS = new Set(['END', 'DONE']);

const targetOf = t => (t && typeof t === 'object') ? (t.then || t.tunnel) : t;

// Includes conditional_edges: diverts that live inside a condition
// ({ day >= 20: -> act_four }). Leaving them out makes whole acts look
// unreachable, because that is the only way into Act IV.
// A tunnel edge {tunnel, then} visits BOTH scenes, so both are real edges --
// otherwise the tunnel target (night_tick) looks unreachable.
function edgesFrom(t) {
  if (!t) return [];
  if (typeof t === 'object') return [t.tunnel, t.then].filter(Boolean);
  return [t];
}

function outEdges(sc) {
  const es = [];
  for (const c of sc.choices || []) es.push(...edgesFrom(c.to));
  es.push(...edgesFrom(sc.divert));
  for (const e of sc.conditional_edges || []) es.push(...edgesFrom(e.to));
  return es.filter(x => x && !TERMINALS.has(x));
}

// A scene may also legitimately end the story.
function isTerminal(sc) {
  for (const c of sc.choices || []) if (TERMINALS.has(targetOf(c.to))) return true;
  if (TERMINALS.has(targetOf(sc.divert))) return true;
  return false;
}

function esc(s) { return String(s == null ? '' : s).replace(/\|/g, '\\|'); }

function table(rows, headers) {
  return ['| ' + headers.join(' | ') + ' |',
          '|' + headers.map(() => ' --- ').join('|') + '|',
          ...rows.map(r => '| ' + r.join(' | ') + ' |')].join('\n');
}

function rollUp(scenes, pick) {
  const map = new Map();
  for (const s of scenes) {
    for (const id of pick(s) || []) {
      if (!id) continue;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(s.id);
    }
  }
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

// --------------------------------------------------------------- validation

function validate(doc) {
  const problems = [], warnings = [], planned = [];
  const scenes = doc.scenes;
  const byId = new Map(scenes.map(s => [s.id, s]));

  if (scenes.length !== byId.size) problems.push('duplicate scene ids present');

  // --- link integrity
  for (const s of scenes) {
    for (const e of outEdges(s)) {
      if (!byId.has(e)) problems.push(`${s.id}: edge -> "${e}" has no such scene`);
    }
    // night_tick is a tunnel: it returns to its caller rather than diverting.
    if (!outEdges(s).length && !isTerminal(s) && s.id !== 'night_tick') {
      warnings.push(`${s.id}: dead end (no choice, no divert, no ending)`);
    }
  }

  // --- reachability from the start scene
  const start = scenes[0] && scenes[0].id;
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop();
    if (!id || seen.has(id) || !byId.has(id)) continue;
    seen.add(id);
    for (const e of outEdges(byId.get(id))) stack.push(e);
  }
  for (const s of scenes) {
    if (!seen.has(s.id)) warnings.push(`${s.id}: unreachable from "${start}"`);
  }

  // --- pacing budget
  const pacing = doc.pacing || {};
  const aha = byId.get(pacing.aha_scene);
  let ahaAt = null;
  if (!aha) {
    problems.push(`pacing.aha_scene "${pacing.aha_scene}" is not a scene`);
  } else if (typeof aha.cumulative_s !== 'number') {
    problems.push(`${aha.id}: on no critical path, so it has no cumulative_s`);
  } else {
    ahaAt = aha.cumulative_s;
    if (ahaAt > pacing.budget_s) {
      problems.push(`PACING: "${aha.id}" lands at ${ahaAt}s, over the `
                    + `${pacing.budget_s}s budget (${pacing.rule_source})`);
    }
  }

  // --- progressive disclosure: nothing new may be introduced in Act IV or V
  for (const s of scenes) {
    const u = s.unlocks || {};
    const introduces = u.phase || u.mechanic || (u.ui && u.ui.length);
    if (introduces && (s.act === 'IV' || s.act === 'V')) {
      problems.push(`${s.id}: introduces a new system in Act ${s.act}; `
                    + `Acts IV-V are mastery only`);
    }
  }

  // --- unlock coverage: is any HUD element never introduced?
  const hudIds = readIds('src/ui/hud.js', /id="([a-zA-Z][\w-]*)"/g);
  const introduced = new Set();
  for (const s of scenes) for (const id of (s.unlocks || {}).ui || []) introduced.add(id);
  const orphanUi = [...hudIds].filter(id => !introduced.has(id)).sort();

  // --- phases: every transitionTo target should be introduced somewhere
  const phases = new Set();
  for (const f of ['src/main.js', 'src/phases/cityExplorationPhase.js',
                   'src/phases/pickPhase.js', 'src/phases/dialoguePhase.js',
                   'src/phases/shopPhase.js', 'src/ui/hud.js']) {
    for (const p of readIds(f, /transitionTo\('([A-Z_]+)'/g)) phases.add(p);
  }
  const introducedPhases = new Set();
  for (const s of scenes) if ((s.unlocks || {}).phase) introducedPhases.add(s.unlocks.phase);
  const orphanPhases = [...phases].filter(
    p => !introducedPhases.has(p) && !['BOOT', 'WIN', 'LOSE'].includes(p)).sort();

  // --- stage / cast ids against the codebase
  const npcIds = readIds('src/data/npcDialogue.js', /'(NPC_[A-Z_]+)'/g);
  let poi = readIds('src/data/townLayout.js', /'(B_[A-Z_]+)'/g);
  if (!poi.size) poi = readIds('src/data/npcDialogue.js', /building:\s*'(B_[A-Z_]+)'/g);

  for (const s of scenes) {
    const loc = (s.stage || {}).loc;
    if (!loc) { problems.push(`${s.id}: no stage.loc`); }
    else if (!(loc in PLANNED_LOCATIONS) && loc.startsWith('B_')
             && poi.size && !poi.has(loc)) {
      problems.push(`${s.id}: stage.loc "${loc}" is not a building id in src/`);
    }
    for (const c of s.cast || []) {
      if (c in PLANNED_CAST) continue;
      if (npcIds.size && !npcIds.has(c)) {
        problems.push(`${s.id}: cast "${c}" has no entry in src/data/npcDialogue.js`);
      }
    }
    if (!s.act) problems.push(`${s.id}: no act`);
    if (typeof s.duration_s !== 'number') problems.push(`${s.id}: no duration_s`);
    if (!['overlay', 'blocking', 'gameplay'].includes(s.mode)) {
      problems.push(`${s.id}: mode "${s.mode}" is not overlay|blocking|gameplay`);
    }
  }

  // --- economy sync
  const econ = readEconomy();
  const st = doc.state || {};
  const pairs = [['STARTING_WALLET', 'wallet'], ['VISA_DAYS', null]];
  if (econ.STARTING_WALLET != null && st.wallet != null
      && econ.STARTING_WALLET !== st.wallet) {
    problems.push(`state.wallet ${st.wallet} != economy.js STARTING_WALLET `
                  + `${econ.STARTING_WALLET}`);
  }

  for (const [id, note] of Object.entries(PLANNED_LOCATIONS)) {
    const uses = scenes.filter(s => (s.stage || {}).loc === id).map(s => s.id);
    if (uses.length) planned.push(`location ${id} -- ${note} (${uses.length} scene(s))`);
  }
  for (const [id, note] of Object.entries(PLANNED_CAST)) {
    const uses = scenes.filter(s => (s.cast || []).includes(id)).map(s => s.id);
    if (uses.length) planned.push(`cast ${id} -- ${note} (${uses.length} scene(s))`);
  }

  return { problems, warnings, planned, econ, ahaAt, orphanUi, orphanPhases,
           hudCount: hudIds.size, introducedCount: introduced.size };
}

// ---------------------------------------------------------------- manifests

function artManifest(doc, v) {
  const s = doc.scenes;
  const L = ['# Art Manifest', '',
    '> Generated from `assets/narrative/story.json` by `build/storyboard_check.js`.',
    '> Do not edit by hand -- change the storyboard and regenerate.', '',
    `Scenes: **${s.length}**`, ''];

  if (v.planned.length) {
    L.push('## Not in the codebase yet', '',
      'The storyboard requires these and `src/` does not define them.', '');
    for (const p of v.planned) L.push('- [ ] ' + p);
    L.push('');
  }

  const sections = [
    ['Locations', x => [(x.stage || {}).loc]],
    ['Cast', x => x.cast],
    ['Props', x => x.props],
    ['Audio cues', x => x.audio],
    ['Lighting presets', x => [(x.stage || {}).light]],
    ['Camera presets', x => [(x.stage || {}).camera]],
    ['Weather', x => [(x.stage || {}).weather]]
  ];
  for (const [title, pick] of sections) {
    const map = rollUp(s, pick);
    L.push(`## ${title} (${map.size})`, '');
    L.push(map.size ? table([...map.entries()].map(([id, u]) => [
      '`' + esc(id) + '`', u.length,
      u.slice(0, 6).join(', ') + (u.length > 6 ? ` +${u.length - 6} more` : '')
    ]), ['id', 'scenes', 'used in']) : '_none_');
    L.push('');
  }

  L.push('## Per-scene art sheet', '');
  L.push(table(s.map(x => [
    '`' + x.id + '`', x.act, x.mode,
    '`' + ((x.stage || {}).loc || '') + '`', (x.stage || {}).time || '',
    (x.stage || {}).light || '', (x.cast || []).join(' '),
    (x.props || []).join(' ')
  ].map(esc)), ['scene', 'act', 'mode', 'loc', 'time', 'light', 'cast', 'props']));
  L.push('');
  return L.join('\n');
}

function gameplayManifest(doc, v) {
  const s = doc.scenes;
  const L = ['# Gameplay, Progression & Economy Manifest', '',
    '> Generated from `assets/narrative/story.json` by `build/storyboard_check.js`.',
    '> Do not edit by hand -- change the storyboard and regenerate.', ''];

  // pacing
  L.push('## Pacing: the 90-second runway', '',
    `Rule source: ${doc.pacing.rule_source}`, '',
    `Budget **${doc.pacing.budget_s}s** to \`${doc.pacing.aha_scene}\`. ` +
    `Actual: **${v.ahaAt}s** -- ${v.ahaAt <= doc.pacing.budget_s ? 'PASS' : 'FAIL'}`, '');
  const cp = s.filter(x => typeof x.cumulative_s === 'number')
              .sort((a, b) => a.critical_path_index - b.critical_path_index);
  L.push(table(cp.map(x => [
    x.cumulative_s + 's', '`' + x.id + '`', x.act, x.mode, x.duration_s + 's',
    x.duration_source === 'authored' ? 'authored' : 'estimated',
    x.id === doc.pacing.aha_scene ? '**AHA**' : ''
  ].map(esc)), ['at', 'scene', 'act', 'mode', 'dur', 'source', '']));
  L.push('');
  L.push('Durations marked `estimated` are derived from word count at ~170 wpm,');
  L.push('not measured. Replace them with real timings after a playtest.', '');

  // delivery modes
  L.push('## Delivery mode mix', '');
  const modes = new Map();
  for (const x of s) modes.set(x.mode, (modes.get(x.mode) || 0) + 1);
  L.push(table([...modes.entries()].map(([m, n]) =>
    [m, n, esc(doc.pacing.delivery_modes[m] || '')]), ['mode', 'scenes', 'meaning']));
  L.push('');

  // progression ladder
  L.push('## Progression ladder', '',
    'The rule: **' + doc.shape.rule + '**', '',
    'When the player first meets each system.', '');
  const ladder = s.filter(x => {
    const u = x.unlocks || {};
    return u.phase || u.mechanic || (u.ui && u.ui.length);
  }).sort((a, b) => (a.cumulative_s || 1e9) - (b.cumulative_s || 1e9));
  L.push(table(ladder.map(x => [
    x.cumulative_s != null ? x.cumulative_s + 's' : '-', '`' + x.id + '`', x.act,
    (x.unlocks.phase || ''), (x.unlocks.mechanic || ''),
    (x.unlocks.ui || []).join(' '),
    x.unlocks.teaches ? JSON.stringify(x.unlocks.teaches) : ''
  ].map(esc)), ['at', 'scene', 'act', 'phase', 'mechanic', 'ui', 'teaches']));
  L.push('');

  L.push('### Systems introduced per act', '');
  const perAct = new Map();
  for (const x of s) {
    const u = x.unlocks || {};
    const n = (u.phase ? 1 : 0) + (u.mechanic ? 1 : 0) + ((u.ui || []).length ? 1 : 0);
    perAct.set(x.act, (perAct.get(x.act) || 0) + n);
  }
  L.push(table((doc.shape.acts || []).map(a => [
    a.id, perAct.get(a.id) || 0, esc(a.intent)
  ]), ['act', 'introductions', 'intent']));
  L.push('');

  L.push('### UI never introduced', '');
  L.push(`\`hud.js\` defines **${v.hudCount}** element ids; the storyboard `
         + `introduces **${v.introducedCount}**.`, '');
  if (v.orphanUi.length) {
    L.push('The player meets these cold. Either gate them in a scene or accept',
           'they are always-on chrome:', '');
    for (const id of v.orphanUi) L.push('- `' + id + '`');
  } else {
    L.push('_none_');
  }
  L.push('');
  if (v.orphanPhases.length) {
    L.push('### Phases never introduced', '');
    for (const p of v.orphanPhases) L.push('- `' + p + '`');
    L.push('');
  }

  // economy
  L.push('## Economy constants (read from `src/core/economy.js`)', '');
  const keys = Object.keys(v.econ).sort();
  L.push(keys.length ? table(keys.map(k => ['`' + k + '`', v.econ[k]]),
    ['constant', 'value']) : '_economy.js not readable_');
  L.push('');

  L.push('## Economy deltas by scene', '');
  const rows = [];
  for (const x of s) {
    const eff = [...(x.effects || [])];
    for (const c of x.choices || []) for (const e of c.effects || []) eff.push(e);
    if (x.payout) eff.push({ var: 'wallet', expr: '+' + x.payout.wallet });
    if (!eff.length && !x.econ_note) continue;
    rows.push(['`' + x.id + '`', x.act,
      eff.map(e => `${e.var} = ${e.expr}`).join('; '), esc(x.econ_note || '')]);
  }
  L.push(table(rows.map(r => r.map(esc)), ['scene', 'act', 'effects', 'note']));
  L.push('');

  L.push('## Beat sheet', '');
  L.push(table(s.map(x => ['`' + x.id + '`', x.act, (x.stage || {}).time || '',
    esc(x.beat || '')].map(esc)), ['scene', 'act', 'time', 'beat']));
  L.push('');
  return L.join('\n');
}

// --------------------------------------------------------------------- main

function main() {
  if (!fs.existsSync(STORY)) {
    console.error('CRITICAL: assets/narrative/story.json not found');
    process.exit(1);
  }
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(STORY, 'utf-8'));
  } catch (e) {
    console.error('CRITICAL: story.json is not valid JSON -- ' + e.message);
    process.exit(1);
  }

  const v = validate(doc);

  console.log(`story.json: ${doc.scenes.length} scenes, schema v${doc.$schema_version}`);
  console.log(`  critical path: ${doc.scenes.filter(s => s.cumulative_s != null).length} scenes`);
  console.log(`  AHA "${doc.pacing.aha_scene}" at ${v.ahaAt}s of ${doc.pacing.budget_s}s `
              + `-- ${v.ahaAt <= doc.pacing.budget_s ? 'PASS' : 'FAIL'}`);
  console.log(`  hud.js ids ${v.hudCount}, introduced by story ${v.introducedCount}, `
              + `never introduced ${v.orphanUi.length}`);

  if (v.planned.length) {
    console.log(`\n${v.planned.length} asset(s) not in src/ yet:`);
    for (const p of v.planned) console.log('  TODO ' + p);
  }
  if (v.warnings.length) {
    console.log(`\n${v.warnings.length} warning(s):`);
    for (const w of v.warnings.slice(0, 20)) console.log('  ~ ' + w);
    if (v.warnings.length > 20) console.log(`  ... +${v.warnings.length - 20} more`);
  }
  if (v.problems.length) {
    console.log(`\n${v.problems.length} PROBLEM(s):`);
    for (const p of v.problems) console.log('  - ' + p);
  } else {
    console.log('\nStoryboard validates cleanly.');
  }

  if (CHECK_ONLY) process.exit(v.problems.length ? 1 : 0);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'ART_MANIFEST.md'), artManifest(doc, v), 'utf-8');
  fs.writeFileSync(path.join(OUT_DIR, 'GAMEPLAY_MANIFEST.md'),
                   gameplayManifest(doc, v), 'utf-8');
  console.log('\nWrote Docs/generated/ART_MANIFEST.md');
  console.log('Wrote Docs/generated/GAMEPLAY_MANIFEST.md');
  process.exit(v.problems.length ? 1 : 0);
}

main();
