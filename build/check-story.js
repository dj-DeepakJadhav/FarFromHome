#!/usr/bin/env node
// Validates assets/narrative/story.json against the contract in Docs/STORY_FORMAT.md.
// Run before any commit that touches the story. Exits non-zero on error.
//
//   node build/check-story.js          check only
//   node build/check-story.js --fix    also rewrite generated pacing fields
//
// Errors fail the build. Warnings are advisory but should not accumulate.

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'assets', 'narrative', 'story.json');
const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const scenes = doc.scenes;
const byId = new Map(scenes.map(s => [s.id, s]));

const errors = [];
const warnings = [];
const err = (id, m) => errors.push(`${id}: ${m}`);
const warn = (id, m) => warnings.push(`${id}: ${m}`);

// Claims permanently removed from the build. See AGENTS.md 3.1.
const BANNED_PROSE = [
  /\bby ear\b/i,
  /\bthe (audio )?voice (calls|called|comes)\b/i,
  /\bpure audio\b/i, /\baudio recognition\b/i, /\baudio\b.{0,12}\bcue\b/i,
  /\bpick on the sound\b/i, /\blisten for the (article|word|item)\b/i,
  /\bpronunciation\b/i, /\bflashcard/i, /\bvocabulary (quiz|test|system)\b/i,
  /\bspaced repetition\b/i, /\bsort by ear\b/i
];
const DEAD_UI = ['btn-vocab-notebook', 'vocab-modal', 'vocab-list'];

// ---------- targets ----------
function targets(s) {
  const out = [];
  for (const k of ['next', 'divert']) if (typeof s[k] === 'string') out.push(s[k]);
  for (const c of s.choices || []) {
    if (typeof c.to === 'string') out.push(c.to);
    else if (c.to && typeof c.to === 'object') out.push(c.to.tunnel, c.to.then);
  }
  for (const ce of s.conditional_edges || []) if (ce.to) out.push(ce.to);
  return out.filter(Boolean);
}

// ---------- per-scene ----------
const seenIds = new Set();
for (const s of scenes) {
  if (!s.id) { err('<no id>', 'scene has no id'); continue; }
  if (seenIds.has(s.id)) err(s.id, 'duplicate scene id');
  seenIds.add(s.id);

  for (const t of targets(s)) {
    if (!byId.has(t)) err(s.id, `dangling target "${t}"`);
  }

  const exits = targets(s).length;
  if (!exits && !s.terminal && !s.tunnel) err(s.id, 'no way out (needs choices/next/divert, or terminal:true, or tunnel:true)');
  if (s.terminal && !['WIN', 'LOSE'].includes(s.outcome)) err(s.id, 'terminal scene needs outcome "WIN" or "LOSE"');

  // prose + labels
  const text = [];
  const walk = v => {
    if (typeof v === 'string') text.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') for (const k of ['prose', 'label']) if (v[k] !== undefined) walk(v[k]);
  };
  walk(s.prose); walk(s.choices);

  for (const t of text) {
    for (const re of BANNED_PROSE) {
      if (re.test(t)) err(s.id, `banned claim (${re.source}) in: "${t.slice(0, 70)}..."`);
    }
    // hardcoded money -- {wallet} is the only sanctioned way to state a balance
    const m = t.match(/(?<!\{)\b\d+[.,]\d{2}\s*(?:€|EUR)|\b\d+\s*€(?!\s*\})/);
    if (m && !/250|30|45|50|35|25|20|8|2/.test(m[0].replace(/\D/g, '').slice(0, 3))) {
      warn(s.id, `possible hardcoded money "${m[0]}" -- prefer {wallet}€`);
    }
  }

  const u = s.unlocks || {};
  if (u.teaches) err(s.id, 'unlocks.teaches is removed; use unlocks.ramp.icon_delay_s');
  if (s.teaches) err(s.id, 'top-level scene.teaches is not read by the runner; use unlocks.ramp');
  for (const id of u.ui || []) {
    if (DEAD_UI.includes(id)) err(s.id, `unlocks.ui references deleted element "${id}"`);
    if (/vocab/i.test(id)) err(s.id, `unlocks.ui references a vocabulary element "${id}"`);
  }
  for (const a of s.audio || []) {
    if (/voice/i.test(a)) err(s.id, `audio[] entry "${a}" implies recorded speech; none ships`);
  }
}

// ---------- reachability ----------
const reach = new Set(['act_one']);
const stack = ['act_one'];
while (stack.length) {
  const s = byId.get(stack.pop());
  if (!s) continue;
  for (const t of targets(s)) if (byId.has(t) && !reach.has(t)) { reach.add(t); stack.push(t); }
}
for (const s of scenes) if (!reach.has(s.id)) warn(s.id, 'unreachable from act_one');

// ---------- act I timeline must move forward ----------
const actOnePath = [];
{
  let cur = 'act_one';
  const seen = new Set();
  while (cur && byId.has(cur) && !seen.has(cur)) {
    seen.add(cur);
    const s = byId.get(cur);
    if (s.act === 'I') actOnePath.push(s);
    cur = targets(s)[0];
  }
}
for (let i = 0; i < actOnePath.length - 1; i++) {
  const a = actOnePath[i], b = actOnePath[i + 1];
  const ta = (a.stage || {}).time, tb = (b.stage || {}).time;
  if (ta && tb && tb < ta) err(b.id, `stage.time ${tb} goes backwards from ${a.id} (${ta})`);
}

// ---------- generated pacing ----------
const path0 = [];
{
  let cur = 'act_one';
  const seen = new Set();
  while (cur && byId.has(cur) && !seen.has(cur)) { seen.add(cur); path0.push(byId.get(cur)); cur = targets(byId.get(cur))[0]; }
}
let total = 0;
const expected = new Map();
path0.forEach((s, i) => { total += s.duration_s || 0; expected.set(s.id, { cumulative_s: total, critical_path_index: i }); });

let drift = 0;
for (const s of scenes) {
  const e = expected.get(s.id);
  if (e) {
    if (s.cumulative_s !== e.cumulative_s || s.critical_path_index !== e.critical_path_index) drift++;
    if (process.argv.includes('--fix')) { s.cumulative_s = e.cumulative_s; s.critical_path_index = e.critical_path_index; }
  } else if (s.cumulative_s !== undefined || s.critical_path_index !== undefined) {
    drift++;
    if (process.argv.includes('--fix')) { delete s.cumulative_s; delete s.critical_path_index; }
  }
}
if (drift && !process.argv.includes('--fix')) {
  warn('pacing', `${drift} scene(s) have stale generated cumulative_s/critical_path_index -- run with --fix`);
}
if (process.argv.includes('--fix')) {
  const aha = byId.get(doc.pacing.aha_scene);
  if (aha) doc.pacing.aha_cumulative_s = aha.cumulative_s;
  fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + '\n');
  console.log('Rewrote generated pacing fields.');
}

// ---------- report ----------
const aha = byId.get(doc.pacing.aha_scene);
console.log(`Scenes: ${scenes.length} | reachable: ${reach.size} | critical path: ${path0.length}`);
if (aha) {
  const at = aha.cumulative_s;
  console.log(`Aha ("${doc.pacing.aha_scene}") at ${at}s against a ${doc.pacing.budget_s}s budget` +
    (at > doc.pacing.budget_s ? '  <-- OVER (needs the fast-start path; see Docs/TASKS.md)' : '  OK'));
}
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach(w => console.log('  ! ' + w)); }
if (errors.length) {
  console.error(`\n${errors.length} ERROR(S):`);
  errors.forEach(e => console.error('  x ' + e));
  process.exit(1);
}
console.log('\nstory.json OK.');
