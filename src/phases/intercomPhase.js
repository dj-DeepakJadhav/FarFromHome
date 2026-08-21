// Phase 3: Doorstep - find the right buzzer, then get paid.
//
// The payout is the harvest half of the loop. Every number in it comes from
// something the player actually did (picking accuracy, streak, how long they
// took on the road), which is why the etiquette coin-flip dialogue was cut.
window.FFH.IntercomPhase = class {
  constructor(game) {
    this.game = game;
    this.config = null;
    this.subPhase = 'BUZZER'; // 'BUZZER' | 'SUMMARY'
    this.wrongBuzzes = 0;
    this.payout = null;
  }

  enter() {
    // Clear the ride meshes, keeping the two lights
    while (this.game.scene.children.length > 2) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    this.config = window.FFH.getIntercom(this.game.state.currentShift);
    this.subPhase = 'BUZZER';
    this.wrongBuzzes = 0;
    this.payout = null;

    const panelGeo = new THREE.BoxGeometry(1.6, 2.4, 0.2);
    const panelMat = window.FFH.createCelMaterial(0xD4AF37); // brass
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 1.2, 0);
    this.game.scene.add(panel);

    this.game.currentCamera = this.game.cameras.warehouseCamera;
    this.game.currentCamera.position.set(0, 1.2, 4);
    this.game.currentCamera.lookAt(0, 1.2, 0);

    this.game.ui.showIntercomUI();
  }

  buzz(index) {
    if (this.subPhase !== 'BUZZER') return;

    if (index === this.config.correctBuzzerIndex) {
      this.game.sfx.playSfx('success');
      this.subPhase = 'SUMMARY';
      this.payout = this.calculatePayout();
      setTimeout(() => this.game.transitionTo('DEBRIEF_RECEIPT'), 600);
    } else {
      // Wrong buzzer costs freshness - you are standing at the door burning time
      this.wrongBuzzes++;
      this.game.state.freshness = Math.max(0, this.game.state.freshness - 6);
      this.game.sfx.playSfx('error');
      this.game.ui.showIntercomUI();
    }
  }

  // Single source of truth for shift income. The HUD renders this object; it
  // does not recompute the numbers itself (that drift is how the old summary
  // screen and finishShift disagreed).
  calculatePayout() {
    const state = this.game.state;
    const E = window.FFH.ECONOMY;
    const shift = window.FFH.getShift(state.currentShift);

    const packedCount = state.activeOrder ? state.activeOrder.filter(it => it.packed).length : 0;
    
    // Calculate Base components
    const grossBaseWage = shift.baseWage;
    const accuracyBonus = packedCount * E.ACCURACY_BONUS_PER_ITEM;
    
    // Streak and tip
    const streakMult = window.FFH.streakMultiplier(state.shiftBestStreak);
    const streakBonus = accuracyBonus * (streakMult - 1);
    
    // Calculate tip (simulating etiquette and freshness)
    const etiquetteTip = shift.tipMax * (state.freshness / 100);

    // Damage deductions (from bag integrity drop)
    // 100% integrity = 0 damage. Below 100 means lost integrity.
    const lostIntegrity = 100 - state.bagIntegrity;
    const damageDeductions = (lostIntegrity / 100) * (grossBaseWage + accuracyBonus + etiquetteTip) * 0.5; // Max 50% penalty

    const netPayout = grossBaseWage + accuracyBonus + streakBonus + etiquetteTip - damageDeductions;

    return {
      shift: shift,
      packedCount: packedCount,
      streakMult: streakMult,
      grossBaseWage: window.FFH.round2(grossBaseWage),
      accuracyBonus: window.FFH.round2(accuracyBonus),
      streakBonus: window.FFH.round2(streakBonus),
      etiquetteTip: window.FFH.round2(etiquetteTip),
      damageDeductions: window.FFH.round2(damageDeductions),
      netPayout: window.FFH.round2(netPayout),
      metQuota: netPayout >= shift.quota
    };
  }

  finishShift() {
    const state = this.game.state;
    const payout = this.payout || this.calculatePayout();

    state.wallet = window.FFH.round2(state.wallet + payout.netPayout);
    state.shiftEarnings = payout.netPayout;
    state.stats.shiftsWorked++;

    // Missing the quota, or trashing the bag, costs a strike
    if (!payout.metQuota || state.bagIntegrity <= 0) {
      state.strikes++;
    }

    this.exit();

    if (state.strikes >= window.FFH.ECONOMY.MAX_STRIKES) {
      this.game.transitionTo('LOSE');
    } else if (state.wallet >= window.FFH.ECONOMY.TUITION_GOAL) {
      this.game.transitionTo('WIN');
    } else {
      this.game.transitionTo('SHOP');
    }
  }

  exit() {
    this.game.ui.clear();
  }
};
