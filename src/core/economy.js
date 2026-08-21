// Run economy, state shape, and the numbers the whole game tunes against.
//
// This file loads first (see build/assemble.js) and owns the FFH namespace.

window.FFH = {
  // Every tunable that affects whether a run is winnable lives here, not
  // scattered across phases. Design authority: Docs/09_Canonical_Tables.md §2.
  ECONOMY: {
    STARTING_WALLET: 20,
    TUITION_GOAL: 250,
    MAX_STRIKES: 3,

    ACCURACY_BONUS_PER_ITEM: 2.5,  // paid per item packed with no mis-tap on it
    STREAK_STEP: 0.14,              // multiplier gained per consecutive clean pick
    STREAK_MAX: 2.5,               // cap, so a hot streak can at most double pay

    MISPICK_INTEGRITY_COST: 8,     // bag damage for tapping the wrong item
    POTHOLE_INTEGRITY_COST: 15     // bag damage per hazard hit on the ride
  }
};

// A fresh run. Called on boot and on restart — nothing may persist between runs,
// which is why this returns a new object rather than mutating one in place.
window.FFH.createRunState = function () {
  return {
    wallet: window.FFH.ECONOMY.STARTING_WALLET,
    currentShift: 1,
    strikes: 0,

    // Per-shift, reset by resetShiftState() at the top of every PICK phase
    bagIntegrity: 100,
    freshness: 100,
    activeOrder: null,
    streak: 0,
    shiftBestStreak: 0,
    mispicks: 0,
    shiftEarnings: 0,

    upgrades: {
      ebike: false,
      insulatedBag: false,
      scanner: false
    },

    // Surfaced on the win/lose screen
    stats: {
      shiftsWorked: 0,
      itemsPacked: 0,
      totalMispicks: 0,
      bestStreak: 0
    }
  };
};

// Clear the per-shift meters. Called at the start of every PICK phase — without
// this, integrity and freshness only ever decay and shift 4 starts unwinnable.
window.FFH.resetShiftState = function (state) {
  state.bagIntegrity = 100;
  state.freshness = 100;
  state.activeOrder = null;
  state.streak = 0;
  state.shiftBestStreak = 0;
  state.mispicks = 0;
  state.shiftEarnings = 0;
};

// Streak multiplier applied to accuracy and tip income.
window.FFH.streakMultiplier = function (streak) {
  const E = window.FFH.ECONOMY;
  return Math.min(E.STREAK_MAX, 1 + streak * E.STREAK_STEP);
};

// Money is rounded to cents everywhere it is stored or displayed.
window.FFH.round2 = function (n) {
  return Math.round(n * 100) / 100;
};

window.FFH.state = window.FFH.createRunState();
