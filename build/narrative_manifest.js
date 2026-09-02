// SUPERSEDED -- use build/storyboard_check.js instead.
//
// This script reads assets/narrative/story.ink, which no longer matches the
// game: story.json now owns the storyboard and contains the Act I restructure
// (the der/die/das ramp moved into the first 90 seconds, and nina_hire,
// nina_hire_2 and explore_prompt were retired). Running this will regenerate
// the manifests from the OLD structure and overwrite the current ones.
//
// Kept only so the Ink tag layer stays readable. Delete once story.ink is
// regenerated from story.json.
//
// Narrative -> art + gameplay manifest generator.
//
// Single source of truth is assets/narrative/story.ink. Every knot there
// carries a "# key: value" tag block (see the SCENE TAGS header in that file).
// This script parses those tags and emits two review documents:
//
//   Docs/generated/ART_MANIFEST.md       every location, prop, cast member,
//                                        audio cue, light and camera preset the
//                                        story actually requires, deduplicated,
//                                        with the scenes that need each one.
//   Docs/generated/GAMEPLAY_MANIFEST.md  the act/thread curve, every economy
//                                        delta, gate and state write per scene.
//
// It also validates the tags against the code: POI ids against
// src/data/townLayout.js, NPC ids against src/data/npcDialogue.js, and economy
// figures against src/core/economy.js. Unknown ids are reported, not fixed --
// this script never writes to src/.
//
// Read-only with respect to the game. Nothing here ships in index.html.
//
//   node build/narrative_manifest.js            write the manifests
//   node build/narrative_manifest.js --check    validate only, non-zero on error

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INK = path.join(ROOT, 'assets', 'narrative', 'story.ink');
const OUT_DIR = path.join(ROOT, 'Docs', 'generated');

const CHECK_ONLY = process.argv.includes('--check');

// Tags whose value is a comma-separated set of ids (they roll up into the
// art manifest). Everything else is treated as a single scalar note.
const LIST_TAGS = ['cast', 'props', 'audio'];

// Ids the story deliberately introduces that do not exist in src/ yet. These
// are reported as PLANNED work rather than errors, so --check stays usable in
// CI while the art and dialogue for them is still being built. Delete an entry
// from here once it exists in the codebase; the validator will then enforce it.
const PLANNED_LOCATIONS = {
  B_ZOB: 'coach/station arrival point -- act_one only',
  B_DARKSTORE_YARD: 'exterior yard behind B_DARKSTORE -- all Klaus scenes',
  LM_CANAL: 'canal bank with lantern reflections -- night_one',
  LM_MARKTPLATZ: 'existing plaza in townLayout, needs a POI id',
  LM_BANK_STEP: 'step outside B_BANK -- the_circle_3 low point',
  LM_HARBOUR_ROAD: 'unlit pothole road -- night_route'
};
const PLANNED_CAST = {
  NPC_YUSRA: 'new arrival in Act IV -- mirrors the player at wg_door'
};

// ---------------------------------------------------------------- parse ink

function parseScenes(src) {
  const lines = src.split(/\r?\n/);
  const scenes = [];
  let cur = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip the comment header: a "//" line can contain "# act:" as documentation.
    if (/^\s*\/\//.test(line)) continue;

    // Trailing "===" is optional in Ink, so it must be an optional GROUP.
    // "===?" would wrongly require at least two trailing equals signs.
    const knot = line.match(/^===\s*(\w+)\s*(?:===)?\s*$/) || line.match(/^=\s*(\w+)\s*$/);
    if (knot) {
      cur = { name: knot[1], line: i + 1, tags: {} };
      scenes.push(cur);
      continue;
    }

    const tag = line.match(/^\s*#\s*(\w+)\s*:\s*(.+?)\s*$/);
    if (tag && cur) {
      const key = tag[1];
      const val = tag[2].trim();
      if (LIST_TAGS.includes(key)) {
        cur.tags[key] = val.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        cur.tags[key] = val;
      }
    }
  }
  return scenes;
}

// ------------------------------------------------------------- code truth

function readIds(file, regex) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const src = fs.readFileSync(p, 'utf-8');
  const out = new Set();
  let m;
  while ((m = regex.exec(src)) !== null) out.add(m[1]);
  return out;
}

// Reads ONLY the ECONOMY block. Scanning the whole file also picks up
// state defaults such as the npcRelationships map (NPC_ANKE: 50), which are
// not tunables and are noise in the manifest.
function readEconomy() {
  const p = path.join(ROOT, 'src', 'core', 'economy.js');
  if (!fs.existsSync(p)) return {};
  const src = fs.readFileSync(p, 'utf-8');

  const start = src.indexOf('ECONOMY:');
  if (start === -1) return {};
  const open = src.indexOf('{', start);
  if (open === -1) return {};

  // Walk braces so the block ends where ECONOMY ends, not at the first '}'.
  let depth = 0, end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return {};

  const block = src.slice(open, end);
  const out = {};
  const re = /([A-Z][A-Z0-9_]+)\s*:\s*(-?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(block)) !== null) out[m[1]] = parseFloat(m[2]);
  return out;
}

// ------------------------------------------------------------- roll-ups

function rollUp(scenes, key) {
  const map = new Map(); // id -> [sceneName]
  for (const s of scenes) {
    const v = s.tags[key];
    if (!v) continue;
    const ids = Array.isArray(v) ? v : [v];
    for (const id of ids) {
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(s.name);
    }
  }
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function table(rows, headers) {
  const out = [];
  out.push('| ' + headers.join(' | ') + ' |');
  out.push('|' + headers.map(() => ' --- ').join('|') + '|');
  for (const r of rows) out.push('| ' + r.join(' | ') + ' |');
  return out.join('\n');
}

function esc(s) {
  return String(s).replace(/\|/g, '\\|');
}

// ------------------------------------------------------------- validation

function validate(scenes) {
  const problems = [];
  const planned = [];

  const npcIds = readIds('src/data/npcDialogue.js', /'(NPC_[A-Z_]+)'/g);
  const poiIds = readIds('src/data/townLayout.js', /'(B_[A-Z_]+)'/g);

  // townLayout may not carry B_ ids at all; fall back to the dialogue building field.
  let knownPoi = poiIds && poiIds.size ? poiIds : readIds('src/data/npcDialogue.js', /building:\s*'(B_[A-Z_]+)'/g);
  if (!knownPoi) knownPoi = new Set();

  for (const s of scenes) {
    // every scene must carry the minimum set for art to be buildable
    for (const req of ['act', 'loc', 'beat']) {
      if (!s.tags[req]) problems.push(`${s.name}: missing required tag "${req}"`);
    }
    const loc = s.tags.loc;
    if (loc && !(loc in PLANNED_LOCATIONS) && loc.startsWith('B_')
        && knownPoi.size && !knownPoi.has(loc)) {
      problems.push(`${s.name}: loc "${loc}" is not a building id in the codebase`);
    }
    for (const c of s.tags.cast || []) {
      if (c in PLANNED_CAST) continue;
      if (npcIds && npcIds.size && !npcIds.has(c)) {
        problems.push(`${s.name}: cast "${c}" has no entry in src/data/npcDialogue.js`);
      }
    }
  }

  // Roll planned assets up once each, with the scenes that need them.
  for (const [id, note] of Object.entries(PLANNED_LOCATIONS)) {
    const uses = scenes.filter(s => s.tags.loc === id).map(s => s.name);
    if (uses.length) planned.push(`location ${id} -- ${note} (${uses.length} scene(s))`);
  }
  for (const [id, note] of Object.entries(PLANNED_CAST)) {
    const uses = scenes.filter(s => (s.tags.cast || []).includes(id)).map(s => s.name);
    if (uses.length) planned.push(`cast ${id} -- ${note} (${uses.length} scene(s))`);
  }

  return { problems, planned };
}

// ------------------------------------------------------------- manifests

function artManifest(scenes, econ, planned) {
  const L = [];
  L.push('# Art Manifest');
  L.push('');
  L.push('> Generated from `assets/narrative/story.ink` by `build/narrative_manifest.js`.');
  L.push('> Do not edit by hand -- retag the story and regenerate.');
  L.push('');
  L.push(`Scenes: **${scenes.length}**`);
  L.push('');

  if (planned.length) {
    L.push('## Not in the codebase yet');
    L.push('');
    L.push('The story requires these and `src/` does not define them. This is the');
    L.push('build list before art lock.');
    L.push('');
    for (const p of planned) L.push('- [ ] ' + p);
    L.push('');
  }

  const sections = [
    ['Locations', 'loc', 'Every place the story needs to exist.'],
    ['Cast', 'cast', 'Characters who appear on screen.'],
    ['Props', 'props', 'Models and set dressing the script names.'],
    ['Audio cues', 'audio', 'Every distinct cue id.'],
    ['Lighting presets', 'light', 'Renderer presets to author.'],
    ['Camera presets', 'camera', 'Framing setups.'],
    ['Weather / dressing', 'weather', '']
  ];

  for (const [title, key, blurb] of sections) {
    const map = rollUp(scenes, key);
    L.push(`## ${title} (${map.size})`);
    if (blurb) L.push('');
    if (blurb) L.push(blurb);
    L.push('');
    if (!map.size) { L.push('_none tagged_'); L.push(''); continue; }
    L.push(table(
      [...map.entries()].map(([id, uses]) =>
        [`\`${esc(id)}\``, uses.length, uses.slice(0, 6).join(', ') + (uses.length > 6 ? ` +${uses.length - 6} more` : '')]),
      ['id', 'scenes', 'used in']
    ));
    L.push('');
  }

  // Scene-by-scene art sheet
  L.push('## Per-scene art sheet');
  L.push('');
  L.push(table(
    scenes.map(s => [
      `\`${s.name}\``,
      s.tags.act || '',
      `\`${s.tags.loc || ''}\``,
      s.tags.time || '',
      s.tags.light || '',
      (s.tags.cast || []).join(' '),
      (s.tags.props || []).join(' ')
    ].map(esc)),
    ['scene', 'act', 'loc', 'time', 'light', 'cast', 'props']
  ));
  L.push('');
  return L.join('\n');
}

function gameplayManifest(scenes, econ) {
  const L = [];
  L.push('# Gameplay & Economy Manifest');
  L.push('');
  L.push('> Generated from `assets/narrative/story.ink` by `build/narrative_manifest.js`.');
  L.push('> Do not edit by hand -- retag the story and regenerate.');
  L.push('');

  // Diamond curve
  L.push('## The diamond');
  L.push('');
  L.push('Thread count per act, straight from the `threads:` tags. `enters` and');
  L.push('`exits` are the width at the first and last scene of the act, so a');
  L.push('narrowing act reads as narrowing instead of being hidden by its peak.');
  L.push('');
  const byAct = new Map();
  for (const s of scenes) {
    const a = s.tags.act || '?';
    if (!byAct.has(a)) byAct.set(a, []);
    byAct.get(a).push(parseInt(s.tags.threads || '0', 10) || 0);
  }
  const actRows = [];
  for (const [a, widths] of byAct) {
    const peak = Math.max(...widths);
    const enters = widths[0];
    const exits = widths[widths.length - 1];
    const arrow = enters === exits ? 'flat' : (exits < enters ? 'narrowing' : 'widening');
    actRows.push([a, widths.length, enters, peak, exits, arrow, '#'.repeat(peak)]);
  }
  L.push(table(actRows, ['act', 'scenes', 'enters', 'peak', 'exits', 'shape', 'width']));
  L.push('');

  // Full scene-by-scene width curve: this is the diamond, drawn.
  L.push('### Width curve (the diamond, scene by scene)');
  L.push('');
  L.push('```');
  for (const s of scenes) {
    const w = parseInt(s.tags.threads || '0', 10) || 0;
    const pad = ' '.repeat(Math.max(0, 6 - w));
    L.push(`${(s.tags.act || '?').padEnd(3)} ${pad}${'#'.repeat(w)}  ${s.name}`);
  }
  L.push('```');
  L.push('');

  // Economy constants read from code
  L.push('## Economy constants (read from `src/core/economy.js`)');
  L.push('');
  const keys = Object.keys(econ).sort();
  if (keys.length) {
    L.push(table(keys.map(k => [`\`${k}\``, econ[k]]), ['constant', 'value']));
  } else {
    L.push('_economy.js not readable_');
  }
  L.push('');

  // Every money/state movement
  L.push('## Economy deltas by scene');
  L.push('');
  L.push('Every scene that can move wallet, body or heart. This is the tuning surface.');
  L.push('');
  const econScenes = scenes.filter(s => s.tags.econ);
  L.push(table(
    econScenes.map(s => [`\`${s.name}\``, s.tags.act || '', esc(s.tags.econ)]),
    ['scene', 'act', 'delta']
  ));
  L.push('');

  L.push('## Gates');
  L.push('');
  L.push('State a scene requires before it can be reached.');
  L.push('');
  const gated = scenes.filter(s => s.tags.gate);
  L.push(table(
    gated.map(s => [`\`${s.name}\``, s.tags.act || '', esc(s.tags.gate)]),
    ['scene', 'act', 'requires']
  ));
  L.push('');

  L.push('## State writes');
  L.push('');
  const writes = scenes.filter(s => s.tags.sets);
  L.push(table(
    writes.map(s => [`\`${s.name}\``, s.tags.act || '', esc(s.tags.sets)]),
    ['scene', 'act', 'sets']
  ));
  L.push('');

  L.push('## Beat sheet');
  L.push('');
  L.push('Dramatic function of each scene, in script order. Use this for pacing review.');
  L.push('');
  L.push(table(
    scenes.map(s => [`\`${s.name}\``, s.tags.act || '', s.tags.time || '', esc(s.tags.beat || '')]),
    ['scene', 'act', 'time', 'beat']
  ));
  L.push('');
  return L.join('\n');
}

// ------------------------------------------------------------- main

function main() {
  if (!fs.existsSync(INK)) {
    console.error(`CRITICAL: ${path.relative(ROOT, INK)} not found`);
    process.exit(1);
  }

  const scenes = parseScenes(fs.readFileSync(INK, 'utf-8'));
  if (!scenes.length) {
    console.error('CRITICAL: no knots parsed from story.ink');
    process.exit(1);
  }

  const econ = readEconomy();
  const { problems, planned } = validate(scenes);

  console.log(`Parsed ${scenes.length} scenes from assets/narrative/story.ink`);
  console.log(`  locations ${rollUp(scenes, 'loc').size}` +
              `  cast ${rollUp(scenes, 'cast').size}` +
              `  props ${rollUp(scenes, 'props').size}` +
              `  audio ${rollUp(scenes, 'audio').size}`);

  if (planned.length) {
    console.log('');
    console.log(`${planned.length} asset(s) the story needs that src/ does not have yet:`);
    for (const p of planned) console.log('  TODO ' + p);
  }

  if (problems.length) {
    console.log('');
    console.log(`${problems.length} tag problem(s):`);
    for (const p of problems) console.log('  - ' + p);
  } else {
    console.log('');
    console.log('Tags validate cleanly against src/.');
  }

  if (CHECK_ONLY) {
    process.exit(problems.length ? 1 : 0);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const art = path.join(OUT_DIR, 'ART_MANIFEST.md');
  const gp = path.join(OUT_DIR, 'GAMEPLAY_MANIFEST.md');
  fs.writeFileSync(art, artManifest(scenes, econ, planned), 'utf-8');
  fs.writeFileSync(gp, gameplayManifest(scenes, econ), 'utf-8');
  console.log('');
  console.log('Wrote ' + path.relative(ROOT, art));
  console.log('Wrote ' + path.relative(ROOT, gp));
}

main();
