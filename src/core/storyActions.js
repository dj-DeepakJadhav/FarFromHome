// Story Evaluation & Expression Helpers
// Extracted from storyRunner.js to keep the runner focused on state machine logic.
window.FFH = window.FFH || {};

window.FFH.evaluateStoryExpr = function(expr, state) {
  if (typeof expr === 'boolean') return expr;
  if (typeof expr === 'number') return expr;
  if (expr === 'true') return true;
  if (expr === 'false') return false;

  try {
    const keys = Object.keys(state);
    const values = Object.values(state);
    const fn = new Function(...keys, 'return (' + expr + ');');
    return fn(...values);
  } catch (e) {
    console.warn('StoryRunner: Failed to evaluate expr ' + expr + ':', e);
    return null;
  }
};

window.FFH.checkStoryGate = function(gate, state) {
  if (!gate) return true;
  try {
    let jsGate = gate
      .replace(/\bnot\s+/g, '!')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||');
    
    const keys = Object.keys(state);
    const values = Object.values(state);
    const fn = new Function(...keys, 'return Boolean(' + jsGate + ');');
    return fn(...values);
  } catch (e) {
    console.warn('StoryRunner: Failed to evaluate gate ' + gate + ':', e);
    return true;
  }
};

window.FFH.interpolateStoryText = function(text, state) {
  if (!text) return '';
  return text.replace(/\{([^}]+)\}/g, (match, expr) => {
    if (expr.includes(':')) {
      const parts = expr.split(':');
      const cond = parts[0].trim();
      const branch = parts[1].split('|');
      const ifTrue = branch[0] || '';
      const ifFalse = branch[1] || '';
      const res = window.FFH.checkStoryGate(cond, state);
      return res ? ifTrue : ifFalse;
    }
    const val = window.FFH.evaluateStoryExpr(expr, state);
    if (val !== null && val !== undefined) {
      if (typeof val === 'number') {
        return val.toFixed(2).replace(/\.00$/, '');
      }
      return String(val);
    }
    return match;
  });
};

window.FFH.STORY_LOC_POSITIONS = {
  // TILE_SCALE = 2.6; grid reference: LUBECK_CITY_GRID
  'B_ZOB':        { x: 10.4, z:  5.2 },
  'B_BANK':       { x: 41.6, z:  5.2 },
  'B_UNI':        { x: 20.8, z: 15.6 },
  'B_BAKERY':     { x:  7.8, z: 18.2 },
  'B_BURGTOR':    { x: 36.4, z: 18.2 },
  'B_RATHAUS':    { x: 23.4, z: 23.4 },
  'B_PIZZA':      { x: 28.6, z: 23.4 },
  'B_WG':         { x:  7.8, z: 26.0 },
  'B_AUSLAENDER': { x: 36.4, z: 26.0 },
  'B_BIKESHOP':   { x:  7.8, z: 31.2 },
  'B_KINO':       { x: 26.0, z: 31.2 },
  'B_HOLSTEN':    { x: 18.2, z: 33.8 },
  'B_MARIEN':     { x: 57.2, z: 33.8 },
  'B_DOM':        { x: 26.0, z: 44.2 },
  'B_DARKSTORE':  { x:  7.8, z: 46.8 },
  'LM_ALTSTADT':  { x: 20.8, z: 18.2 },
  'LM_CANAL':     { x: 20.8, z: 31.2 },
  'LM_MARKTPLATZ':{ x: 26.0, z: 23.4 }
};

// Objectives and Scene Routing Table
window.FFH = window.FFH || {};

window.FFH.STORY_OBJECTIVE_MAP = {
  'act_one':          '🧳 Find Room 4 (Student WG)(drag your suitcase south)',
  'b_act_one':        '🧳 Find Room 4 (Student WG)(drag your suitcase south)',
  'wg_door':          '🏠 Find Room 4 (Student WG)(south)',
  'wg_door_scenic':   '🏠 Find Room 4 (Student WG)(south)',
  'wg_door_fast':     '🏠 Find Room 4 (Student WG)(south)',
  'nico_sends_kruma': '🎓 Check out Lübeck University (east across the bridge)',
  'uni_closed':       '🎓 Check out Lübeck University (east across the bridge)',
  'pizzeria_job':     '🍕 Try the pizzeria near the market (ask about work)',
  'bakery_job':       '🥐 Try the bakery (ask about work)',
  'shift_1_teach':    '📦 Kruma Express (Nina is expecting you)(behind the Holstentor)'
};

window.FFH.STORY_LOC_NAMES = {
  'B_ZOB': 'Train Station (ZOB)',
  'B_WG': 'Student WG (Room 4)',
  'B_UNI': 'Lübeck University',
  'B_PIZZA': 'Pizzeria Bella',
  'B_BAKERY': 'Bakery Hansa',
  'B_DARKSTORE': 'Kruma Express Dark Store',
  'B_BANK': 'Sparkasse Bank',
  'B_RATHAUS': 'Bürgeramt (Town Hall)',
  'B_AUSLAENDER': 'Ausländerbehörde (Immigration)',
  'LM_MARKTPLATZ': 'Marktplatz (Town Square)',
  'LM_CANAL': 'Canal Bridge',
  'LM_ALTSTADT': 'Altstadt Center'
};

// British Story Beat Mappings
window.FFH = window.FFH || {};

window.FFH.BRITISH_BEAT_MAP = {};

// British Story Special Handlers
window.FFH = window.FFH || {};

window.FFH.handleBritishSpecialBeats = function(resolvedId, game) {
  return false;
};

// British POI Fallback Map
window.FFH = window.FFH || {};

window.FFH.BRITISH_POI_FALLBACK = {};

// NPC Speaker Name Mapping
window.FFH = window.FFH || {};

window.FFH.NPC_SPEAKER_MAP = {
  'NPC_NICO': 'Nico',
  'NPC_RITA': 'Rita Schneider',
  'NPC_NINA': 'Nina Voss',
  'NPC_LOKKER': 'Herr Hans Lokker',
  'NPC_VOGEL': 'Herr Vogel',
  'NPC_MARTHA': 'Martha',
  'NPC_PIZZERIA_OWNER': 'Pizzeria Owner',
  'NPC_MATHIAS': 'Mathias Becker',
  'NPC_LINDEMANN': 'Dr. Lindemann'
};

// Health Check Helper
window.FFH = window.FFH || {};

window.FFH.checkStoryHealth = function(s, ui) {
  if (s.body !== undefined && s.body <= 0) {
    s.body = 15;
    s.wallet = Math.max(0, s.wallet - 8);
    if (ui && ui.spawnFloatingText) {
      ui.spawnFloatingText('⚠️ Physical Collapse! Rested 1 day (-8€)', window.innerWidth / 2, window.innerHeight / 2, '#E63946');
    }
  }
  if (s.heart !== undefined && s.heart <= 0) {
    s.heart = 20;
    if (ui && ui.spawnFloatingText) {
      ui.spawnFloatingText('💔 Severe Despair! Nico checked in on you.', window.innerWidth / 2, window.innerHeight / 2, '#E63946');
    }
  }
};
