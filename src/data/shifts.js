// Shift configuration.
//
// Shifts repeat indefinitely and escalate (the genre is defined by the)// organisers as a "repeating invest-harvest-upgrade loop with visible growth",
// so there is no fixed list of three. Everything is a curve in getShift(n).

window.FFH.SHIFT_STORIES = [
  {
    name: 'Hostel Morning Rush',
    customer: 'Nico (Hostel Roommate)',
    briefing: 'Nico and the jetlagged international students at the hostel need breakfast supplies before orientation! Deliver fast.',
    npcKey: 'NPC_NICO'
  },
  {
    name: 'Oma Martha\'s Bakery Emergency',
    customer: 'Oma Martha (Bakery Hansa)',
    briefing: 'Oma Martha is baking fresh Franzbrötchen and ran out of crucial baking ingredients. Save the morning batch!',
    npcKey: 'NPC_MARTHA'
  },
  {
    name: 'WG Flat Party Surge',
    customer: 'Hans Lokker (WG Flat Caretaker)',
    briefing: 'The student flat is setting up for their weekend party. Deliver all party groceries before 22:00 Ruhezeit!',
    npcKey: 'NPC_LOKKER'
  },
  {
    name: 'Rathaus Bureaucracy Rush',
    customer: 'Herr Vogel (City Registrar)',
    briefing: 'Herr Vogel is stamping registration forms at the Rathaus and urgently needs coffee and snacks to maintain order!',
    npcKey: 'NPC_VOGEL'
  },
  {
    name: 'Hansa Rad Workshop Fuel',
    customer: 'Mathias Becker (Bike Mechanic)',
    briefing: 'Mathias has bike gears disassembled across the workshop floor and needs quick sustenance to finish tuning your bike!',
    npcKey: 'NPC_MATHIAS'
  },
  {
    name: 'Sparkasse Midday Run',
    customer: 'Frau Weber (Bank Manager)',
    briefing: 'Frau Weber is auditing student Sperrkonto accounts and requested lunch delivered on time!',
    npcKey: 'NPC_WEBER'
  },
  {
    name: 'Ausländerbehörde Final Sprint',
    customer: 'Dr. Lindemann (Immigration Officer)',
    briefing: 'Dr. Lindemann\'s office requested an urgent express delivery before the final visa review session!',
    npcKey: 'NPC_LINDEMANN'
  }
];

window.FFH.SHIFT_NAMES = window.FFH.SHIFT_STORIES.map(s => s.name);

// n is 1-based. Returns the full tuning block for that shift.
window.FFH.getShift = function (n) {
  const itemsCount = Math.min(8, 3 + Math.floor(n / 2));

  // Seconds per item shrinks as shifts escalate, with a floor so late shifts
  // stay humanly possible rather than becoming a coin flip.
  const secondsPerItem = Math.max(2.2, 4.5 - n * 0.15);
  const storyIdx = Math.min(n - 1, window.FFH.SHIFT_STORIES.length - 1);
  const story = window.FFH.SHIFT_STORIES[storyIdx];

  return {
    index: n,
    name: story.name,
    customer: story.customer,
    briefing: story.briefing,
    npcKey: story.npcKey,
    itemsCount: itemsCount,
    pickTimeLimit: Math.round(itemsCount * secondsPerItem),
    shelfSlots: 12,                                  // 3 tiers x 4 columns
    freshnessDecay: Math.min(0.75, 0.30 + n * 0.03),
    baseWage: 10 + 3 * n,
    tipMax: 4 + n,
    // Sits deliberately ABOVE base wage: clearing it requires actual picking
    // performance (streak, freshness), not just showing up.
    quota: Math.round(18 + 4.5 * n)
  };
};

// Item pool widens as shifts escalate so early orders stay learnable.
window.FFH.getShiftItemPool = function (n) {
  // This used to slice the front of the whole item list, which is not filtered
  // by category: from shift 8 the slice reached `fahrrad` and the grocery shelf
  // started stocking bicycles, keys and rental contracts. Draw from Food only,
  // and take an equal number per gender so every tier can fill its four slots.
  const food = window.FFH.items.filter(it => it.category === 'Food');
  // At least four per gender so every tier can fill its four slots with
  // distinct items on shift 1, widening as shifts escalate.
  const perGender = Math.min(8, 4 + Math.floor(n / 2));
  const pool = [];
  ['der', 'die', 'das'].forEach(g => {
    food.filter(it => it.gender === g)
        .slice(0, perGender)
        .forEach(it => pool.push(it.id));
  });
  return pool;
};

// TEACH on shift 1, ANTICIPATE on shift 2, TEST from shift 3 on.
window.FFH.rampStage = function (n) {
  if (n <= 1) return 'TEACH';
  if (n === 2) return 'ANTICIPATE';
  return 'TEST';
};

window.FFH.iconRevealDelay = function (n, upgrades) {
  const base = { TEACH: 0.0, ANTICIPATE: 1.5, TEST: 2.5 }[window.FFH.rampStage(n)];
  // Vocab Cards trade a shorter listening window for a bigger early-pick payout.
  return Math.max(0, base - (upgrades && upgrades.vocabCards ? 0.8 : 0));
};
