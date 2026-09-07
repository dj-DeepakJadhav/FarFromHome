window.FFH = window.FFH || {};

window.FFH.ECONOMY = {
    STARTING_WALLET: 20,
    TUITION_GOAL: 250,
    KAUTION_DEPOSIT: 30,
    HOSTEL_DAILY_RENT: 8,
    MAX_STRIKES: 3,
    VISA_DAYS: 28,

    ACCURACY_BONUS_PER_ITEM: 2.5,  // paid per item packed with no mis-tap on it
    STREAK_STEP: 0.14,              // multiplier gained per consecutive clean pick
    STREAK_MAX: 2.5,               // cap, so a hot streak can at most double pay

    MISPICK_INTEGRITY_COST: 8,     // bag damage for tapping the wrong item
    POTHOLE_INTEGRITY_COST: 15,    // bag damage per hazard hit on the ride
    EARLY_PICK_MULTIPLIER: 2.0     // Accuracy bonus multiplier for pre-icon picks
  };

window.FFH.calculatePayout = function(state) {
  const E = window.FFH.ECONOMY;
  const shift = window.FFH.getShift(state.currentShift);

  const packedCount = state.activeOrder ? state.activeOrder.filter(it => it.packed).length : 0;
  
  // Calculate accuracyPay = sum over packed items
  let accuracyPay = 0;
  if (state.activeOrder) {
    state.activeOrder.forEach(it => {
      if (it.packed) {
        let itemPay = E.ACCURACY_BONUS_PER_ITEM;
        if (it.pickedEarly) {
          itemPay *= E.EARLY_PICK_MULTIPLIER;
          if (state.upgrades.vocabCards) {
            itemPay *= 1.25;
          }
        }
        accuracyPay += itemPay;
      }
    });
  }

  const streakMult = window.FFH.streakMultiplier(state.shiftBestStreak);
  const streakBonus = accuracyPay * (streakMult - 1);
  
  // Calculate tip (simulating etiquette and freshness)
  // tips = (roll(0 .. tipMax) * streakMult * freshnessFactor) + etiquetteTipDelta
  const freshnessFactor = state.freshness / 100;
  const rawTip = Math.random() * shift.tipMax;
  let etiquetteTip = Math.max(0, rawTip * streakMult * freshnessFactor + (state.lastEtiquetteTipDelta || 0));

  // High-Stakes VIP Express Rush 2.5x Tip Multiplier
  if (state.isVipRush) {
    etiquetteTip = etiquetteTip * 2.5;
  }

  // Damage deductions (from bag integrity drop)
  // damage = (100 − bagIntegrity) / 100 * baseWage * 0.5
  const lostIntegrity = 100 - state.bagIntegrity;
  const damageDeductions = (lostIntegrity / 100) * shift.baseWage * 0.5;

  const netPayout = shift.baseWage + accuracyPay + streakBonus + etiquetteTip - damageDeductions;

  return {
    shift: shift,
    packedCount: packedCount,
    streakMult: streakMult,
    grossBaseWage: window.FFH.round2(shift.baseWage),
    accuracyBonus: window.FFH.round2(accuracyPay),
    streakBonus: window.FFH.round2(streakBonus),
    etiquetteTip: window.FFH.round2(etiquetteTip),
    damageDeductions: window.FFH.round2(damageDeductions),
    netPayout: window.FFH.round2(netPayout),
    metQuota: netPayout >= shift.quota
  };
};

window.FFH.finishShift = function(game) {
  const state = game.state;
  const payout = game.lastPayout || window.FFH.calculatePayout(state);

  state.wallet = window.FFH.round2(state.wallet + payout.netPayout);
  state.shiftEarnings = payout.netPayout;
  state.stats.shiftsWorked++;

  // Advance day by 1 for completed courier shift
  state.day = (state.day || 1) + 1;

  // Hostel Rent: €8/night starting Day 3 if player hasn't secured an apartment lease
  if (!state.hasApartment && state.day >= 3) {
    const rent = window.FFH.ECONOMY.HOSTEL_DAILY_RENT || 8;
    state.wallet = window.FFH.round2(Math.max(0, state.wallet - rent));
    if (game.ui && game.ui.spawnFloatingText) {
      game.ui.spawnFloatingText(`🏨 Hostel Bed: -${rent.toFixed(2)}€`, window.innerWidth / 2, window.innerHeight / 2 - 40, '#E76F51');
    }
  }

  // Clear delivery state so the marker resets for the next city exploration
  state.activeDelivery = false;
  state.deliveryTarget = null;

  // Missing the quota, or trashing the bag, costs a strike
  if (!payout.metQuota || state.bagIntegrity <= 0) {
    state.strikes++;
  }

  if (state.strikes >= window.FFH.ECONOMY.MAX_STRIKES) {
    game.transitionTo('LOSE');
  } else if (state.day > window.FFH.ECONOMY.VISA_DAYS) {
    game.transitionTo('LOSE');
  } else {
    // Advance to the next shift immediately so the Shop/Hub sees the correct shift
    state.currentShift++;
    game.transitionTo('SHOP');
  }
  
  if (game.ui && game.ui.updatePersistentHUD) {
    game.ui.updatePersistentHUD(state);
  }
};

// Re-add legacy ACT1_STAGES so existing save files and edge logic don't throw undefined errors.
// StoryRunner handles narrative progression now, but these strings are still used in state.act1Stage.
window.FFH.ACT1_STAGES = {
  ARRIVAL_ZOB: 'ARRIVAL_ZOB',
  TRANSIT_TO_WG: 'TRANSIT_TO_WG',
  WG_BUZZER: 'WG_BUZZER',
  WG_INTERIOR: 'WG_INTERIOR',
  MUELL_INTRO: 'MUELL_INTRO',
  TRANSIT_TO_UNI: 'TRANSIT_TO_UNI',
  UNI_RUSH: 'uni_rush',
  PIZZERIA: 'pizzeria_job',
  BAKERY: 'bakery_job',
  KRUMA_FLYER: 'kruma_flyer',
  DONE: 'DONE'
};

// A fresh run. Called on boot and on restart (nothing may persist between runs),
// which is why this returns a new object rather than mutating one in place.
window.FFH.createRunState = function () {
  return {
    act1Stage: window.FFH.ACT1_STAGES.ARRIVAL_ZOB,
    wallet: window.FFH.ECONOMY.STARTING_WALLET,
    currentShift: 1,
    day: 1,
    body: 100,
    heart: 50,
    knots: 4,
    shift_no: 0,
    r_nico: 0,
    r_martha: 0,
    r_nina: 0,
    r_mathias: 0,
    r_lokker: 0,
    r_vogel: 0,
    r_klaus: 0,
    paid_kaution: false,
    has_lease: false,
    has_anmeldung: false,
    has_konto: false,
    matriculated: false,
    knows_trennung: false,
    knows_the_circle: false,
    met_anke: false,
    circle_cut: false,
    owes_mathias: 0.0,
    night_route_taken: 0,
    helped_nico: false,
    nico_gone: false,
    klaus_quit: false,
    told_truth_home: false,
    fined_trennung: false,
    // Modular Story Channel Architecture ('british' with 'b_' identifier vs 'legacy' fallback)
    activeStoryChannel: 'british',
    storyChannelPrefix: 'b_',
    // Story Quest and Progression State
    questStep: 0,
    activeQuests: ['main_visa_survival'],
    completedQuests: [],
    storyFlags: {
      chosePath: null, // 'academic', 'hustler', 'diplomat'
      hasBakeryCroissant: false,
      bribedLokker: false,
      separatedTrashCorrectly: false,
      stosslueftenCount: 0,
      mathiasPizzaOrderCount: 0,
      heardPizzeriaGossip: false,
      helpedNicoDorm: false,
      askedBeamtendeutsch: false,
      confrontedMathias: false,
      knowsNinaShortcut: false,
      vogelAppointmentBooked: false,
      landlordConfirmationSigned: false,
      paidSemesterFee: false,
      radiatorWarmth: false,
      hasCharacterReference: false,
      tookSchwarzarbeit: false,
      helpedMarthaEmergency: false,
      familyPostcardRead: false,
      fridgeNoteRead: false,
      moralDecisions: []
    },
    inventory: [], // Items collected from NPCs (e.g. 'fresh_croissant', 'landlord_paper', 'anmeldung_stamp')
    hasJob: false,
    isMatriculated: false,
    hasApartment: false,
    hasAnmeldung: false,
    isSperrkontoUnlocked: false,
    hasVisaExtended: false,
    // Cumulative Personality Heuristics (Tony Howard-Arias GDC Framework)
    disposition: {
      hustler: 0,
      bureaucrat: 0,
      diplomat: 0
    },

    // German Academic Semester Intake (Randomized WiSe vs SoSe)
    semester: Math.random() < 0.5 ? 'WINTER' : 'SUMMER',
    semesterName: 'Wintersemester (WiSe)',
    semesterEmoji: '❄️',

    // German Legal Employment & 20-Hour Rule (§16b AufenthG)
    weeklyHoursWorked: 4,
    maxLegalHours: 20,
    zollRisk: 0,
    primaryEmployer: 'KRUMA_EXPRESS',

    // Expat Adaptation Skill Tree Progression
    skillPoints: 1,
    unlockedSkills: {},
    bikeSpeedMult: 1.0,
    pickGraceTimeBonus: 0,
    vipTipMultiplier: 2.5,
    wageBonusPercent: 0,
    shopDiscount: 0,
    pfandBonusMult: 1.0,
    stosslueftenBonus: 25,

    npcRelationships: {
      NPC_RITA: 50,
      NPC_MATHIAS: 50,
      NPC_MARTHA: 50,
      NPC_NINA: 50,
      NPC_LOKKER: 50,
      NPC_NICO: 50,
      NPC_VOGEL: 50,
      NPC_WEBER: 50,
      NPC_LINDEMANN: 50,
      NPC_KLAUS: 50,
      NPC_ANKE: 50
    },
    npcMemory: {
      NPC_RITA: [],
      NPC_MATHIAS: [],
      NPC_MARTHA: [],
      NPC_NINA: [],
      NPC_LOKKER: [],
      NPC_NICO: [],
      NPC_VOGEL: [],
      NPC_WEBER: [],
      NPC_LINDEMANN: [],
      NPC_KLAUS: [],
      NPC_ANKE: []
    },

    // Per-shift, reset by resetShiftState() at the top of every PICK phase
    bagIntegrity: 100,
    freshness: 100,
    activeOrder: null,
    streak: 0,
    shiftBestStreak: 0,
    mispicks: 0,
    shiftEarnings: 0,
    lastEtiquetteTipDelta: 0,
    notepadUsedThisShift: false,

    upgrades: {
      ebike: false,
      thermalBag: false,
      shelfLabels: false,
      pocketNotepad: false,
      vocabCards: false
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

// Clear the per-shift meters. Called at the start of every PICK phase (without)// this, integrity and freshness only ever decay and shift 4 starts unwinnable.
window.FFH.resetShiftState = function (state) {
  state.bagIntegrity = 100;
  state.freshness = 100;
  state.activeOrder = null;
  state.streak = 0;
  state.shiftBestStreak = 0;
  state.mispicks = 0;
  state.shiftEarnings = 0;
  state.lastEtiquetteTipDelta = 0;
  state.notepadUsedThisShift = false;
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

window.FFH.saveGame = function(game, slotId = 1, customName = null) {
  try {
    let spawnPos = null;
    let timeOfDay = 0.35;
    if (game.phases && game.phases.CITY_EXPLORATION) {
      const cp = game.phases.CITY_EXPLORATION;
      if (cp.playerPos) {
        spawnPos = { x: cp.playerPos.x, y: cp.playerPos.y, z: cp.playerPos.z };
      }
      if (cp.timeOfDay !== undefined) {
        timeOfDay = cp.timeOfDay;
      }
    }

    const s = game.state;
    const Stages = window.FFH.ACT1_STAGES || {};
    let objectiveStage = s.act1Stage || Stages.ARRIVAL_ZOB;

    if (s.day >= 2 || s.act1Stage === Stages.DAY1_SLEEP) {
      objectiveStage = 'day2_kruma';
      if (!spawnPos) spawnPos = { x: 7.8, z: 28.0 };
    } else if (s.act1Stage === Stages.RETURN_TO_WG) {
      objectiveStage = 'return_to_wg_sleep';
      if (!spawnPos) spawnPos = { x: 7.8, z: 20.0 };
    } else if (s.act1Stage === Stages.JOB_HUNT_BAKERY) {
      objectiveStage = 'bakery_hunt';
      if (!spawnPos) spawnPos = { x: 28.6, z: 25.0 };
    } else if (s.act1Stage === Stages.JOB_HUNT_PIZZA) {
      objectiveStage = 'pizzeria_hunt';
      if (!spawnPos) spawnPos = { x: 20.8, z: 18.0 };
    } else if (s.act1Stage === Stages.UNI_LOCKED || s.act1Stage === Stages.TRANSIT_TO_UNI) {
      objectiveStage = 'uni_rush';
      if (!spawnPos) spawnPos = { x: 7.8, z: 28.0 };
    } else if (s.act1Stage === Stages.WG_ROOM4 || s.act1Stage === Stages.WG_DOOR) {
      objectiveStage = 'nico_room4';
      if (!spawnPos) spawnPos = { x: 7.8, z: 28.0 };
    }

    const stageOrder = [
      Stages.ARRIVAL_ZOB,
      Stages.TRANSIT_TO_WG,
      Stages.WG_DOOR,
      Stages.WG_ROOM4,
      Stages.TRANSIT_TO_UNI,
      Stages.UNI_LOCKED,
      Stages.JOB_HUNT_PIZZA,
      Stages.JOB_HUNT_BAKERY,
      Stages.RETURN_TO_WG,
      Stages.DAY1_SLEEP
    ];
    const finishedObjectivesCount = Math.max(0, stageOrder.indexOf(s.act1Stage));

    const timestamp = new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
    const slotLabel = customName || `Day ${s.day || 1} • ${(s.wallet || 0).toFixed(2)}€ (${timestamp})`;

    const saveData = {
      slotId: slotId,
      slotLabel: slotLabel,
      timestamp: timestamp,
      savedAtMs: Date.now(),
      state: game.state,
      spawnPos: spawnPos,
      timeOfDay: timeOfDay,
      objectiveStage: objectiveStage,
      finishedObjectivesCount: finishedObjectivesCount,
      activeObjective: game.state.activeObjective || null,
      pendingStoryTarget: (game.storyRunner && game.storyRunner.pendingStoryTarget) ? game.storyRunner.pendingStoryTarget : null,
      phaseKey: game.currentPhase ? game.currentPhase.constructor.name : 'CITY_EXPLORATION'
    };

    if (saveData.phaseKey === 'DialoguePhase') {
      saveData.phaseKey = 'CITY_EXPLORATION';
    } else if (saveData.phaseKey === 'CityExplorationPhase') {
      saveData.phaseKey = 'CITY_EXPLORATION';
    } else if (saveData.phaseKey === 'PickPhase') {
      saveData.phaseKey = 'PICK';
    } else if (saveData.phaseKey === 'RidePhase') {
      saveData.phaseKey = 'RIDE';
    } else if (saveData.phaseKey === 'ShopPhase') {
      saveData.phaseKey = 'SHOP';
    }

    // Save into auto slot key AND slot-specific key
    localStorage.setItem(`FFH_SAVE_SLOT_${slotId}`, JSON.stringify(saveData));
    localStorage.setItem('FFH_SAVE_GAME', JSON.stringify(saveData)); // backward compat default

    console.log(`[SaveSystem] Saved Slot ${slotId} ('${slotLabel}') at stage '${objectiveStage}'.`);
    return saveData;
  } catch(e) {
    console.error("Failed to save game:", e);
    return null;
  }
};

window.FFH.loadGame = function(game, slotId = null) {
  try {
    let key = 'FFH_SAVE_GAME';
    if (slotId) {
      key = `FFH_SAVE_SLOT_${slotId}`;
    }
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const saveData = JSON.parse(raw);
    if (!saveData || !saveData.state) return false;

    if (!saveData.state.act1Stage) {
      console.warn("[SaveSystem] Legacy save detected. Cleaning invalid slot.");
      localStorage.removeItem(key);
      return false;
    }

    game.state = Object.assign(window.FFH.createRunState(), saveData.state);
    window.FFH.state = game.state;

    if (saveData.pendingStoryTarget && game.storyRunner) {
      game.storyRunner.pendingStoryTarget = saveData.pendingStoryTarget;
    }
    if (saveData.activeObjective) {
      game.state.activeObjective = saveData.activeObjective;
    }

    return {
      phaseKey: saveData.phaseKey || 'CITY_EXPLORATION',
      spawnPos: saveData.spawnPos,
      timeOfDay: saveData.timeOfDay,
      objectiveStage: saveData.objectiveStage,
      finishedObjectivesCount: saveData.finishedObjectivesCount || 0
    };
  } catch(e) {
    console.error("Failed to load game:", e);
    return false;
  }
};

window.FFH.getSaveSlots = function() {
  const slots = [1, 2, 3];
  return slots.map(id => {
    const raw = localStorage.getItem(`FFH_SAVE_SLOT_${id}`);
    if (!raw) return { id, empty: true };
    try {
      const data = JSON.parse(raw);
      return {
        id,
        empty: false,
        label: data.slotLabel || `Slot ${id}`,
        day: data.state ? data.state.day : 1,
        wallet: data.state ? data.state.wallet : 20,
        objective: data.activeObjective || 'Explore Lübeck',
        timestamp: data.timestamp || 'Saved'
      };
    } catch(e) {
      return { id, empty: true };
    }
  });
};
