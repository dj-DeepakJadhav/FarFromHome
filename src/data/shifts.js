// Shift configuration.
//
// Shifts repeat indefinitely and escalate — the genre is defined by the
// organisers as a "repeating invest-harvest-upgrade loop with visible growth",
// so there is no fixed list of three. Everything is a curve in getShift(n).

window.FFH.SHIFT_NAMES = [
  'Morning Training',
  'Mid-Morning',
  'Lunch Rush',
  'Afternoon Run',
  'Evening Peak',
  'Night Shift',
  'Late Express'
];

// n is 1-based. Returns the full tuning block for that shift.
window.FFH.getShift = function (n) {
  const itemsCount = Math.min(8, 3 + Math.floor(n / 2));

  // Seconds per item shrinks as shifts escalate, with a floor so late shifts
  // stay humanly possible rather than becoming a coin flip.
  const secondsPerItem = Math.max(2.2, 4.5 - n * 0.15);

  return {
    index: n,
    name: window.FFH.SHIFT_NAMES[Math.min(n - 1, window.FFH.SHIFT_NAMES.length - 1)],
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
  const all = window.FFH.items.map(it => it.id);
  return all.slice(0, Math.min(all.length, 3 + n));
};
