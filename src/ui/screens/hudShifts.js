// Shift Gameplay, Manifest, Ride HUD & Shop UI
window.FFH = window.FFH || {};
if (!window.FFH.UI) {
  window.FFH.UI = function(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  };
}

Object.assign(window.FFH.UI.prototype, {
  showWarehouseManifest() {
    this.clear();
    const state = this.game.state;
    const shift = window.FFH.getShift(state.currentShift);

    // Group items for bottom bar
    const itemCounts = {};
    state.activeOrder.forEach(it => {
      if (!itemCounts[it.id]) {
        itemCounts[it.id] = { ...it, total: 0, packedCount: 0, revealed: false };
      }
      itemCounts[it.id].total++;
      if (it.packed) itemCounts[it.id].packedCount++;
      if (it.revealed || it.packed) itemCounts[it.id].revealed = true;
    });

    // Shift 1 is the TEACH stage: the rail and the icon arrive together, so
    // there is nothing to anticipate and no reason to hide the rest of the
    // order. Showing the whole manifest gives the player something to plan
    // with on their first contact with the mechanic. From shift 2 the ramp
    // takes over and items reveal progressively, which is the actual gag.
    // Key off the icon delay the pick phase is actually using, not off
    // currentShift. Act I is one economic shift shown in three ramp stages, so
    // currentShift stays 1 across all three; keying on it would have shown the
    // full manifest during the anticipation stages and killed the ramp.
    const pick = this.game.phases && this.game.phases.PICK;
    const storyDelay = pick && pick.currentStoryParams ? pick.currentStoryParams.iconDelay : undefined;
    const effectiveDelay = (storyDelay !== undefined)
      ? storyDelay
      : (window.FFH.iconRevealDelay ? window.FFH.iconRevealDelay(state.currentShift, state.upgrades) : 0);
    const isTeachStage = (effectiveDelay === 0);

    const uniqueItems = isTeachStage
      ? Object.values(itemCounts)
      : Object.values(itemCounts).filter(it => it.promptStarted || it.revealed || it.packedCount > 0);

    const currentPrompt = state.activeOrder.find(i => !i.packed);
    if (!isTeachStage && currentPrompt && !itemCounts[currentPrompt.id].revealed) {
      itemCounts[currentPrompt.id].isObfuscated = true;
    }

    const totalOrdered = state.activeOrder.length;
    const totalPacked = state.activeOrder.filter(i => i.packed).length;

    const hud = document.createElement('div');
    hud.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      /* Every other full-screen modal sits at 9500+. This one had no z-index at
         all, so the persistent run strip (9000) covered the payslip header. */
      z-index: 9500;
      pointer-events: none;
      font-family: "Comic Sans MS", "Chalkboard SE", "Caveat", -apple-system, sans-serif;
      box-sizing: border-box;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    // Pocket Notepad button. Rendered only when the upgrade is owned, so the
    // €20 purchase produces a visible new control in the shift HUD.
    const hasNotepad = !!(this.game.state.upgrades && this.game.state.upgrades.pocketNotepad);
    const notepadButton = hasNotepad ? `
      <button id="btn-replay-audio" title="Re-pulse the shelf rail (once per shift)" style="
        flex: 0 0 auto;
        width: 44px; height: 44px;
        background: #FFD166;
        border: 2.5px solid #222;
        border-radius: 8px;
        box-shadow: 0 3px 0 #222;
        font-size: 20px;
        cursor: pointer;
        pointer-events: auto;
      ">📋</button>
    ` : '';

    // Checklist entries matching the reference handwriting look
    let checklistLines = '';
    uniqueItems.forEach((item, index) => {
      const isDone = item.packedCount >= item.total;
      const engName = item.nameEn || item.nameDe || 'Item';
      const gerName = item.nameDe || '';
      const gerGender = item.gender || '';
      const displayName = item.isObfuscated ? '???' : `${engName} <span style="font-size: 11px; color: #666; font-weight: normal;">(${gerGender} ${gerName})</span>`;
      checklistLines += `
        <div style="
          font-size: 14px;
          line-height: 1.4;
          color: ${isDone ? '#777' : '#1A1A1A'};
          text-decoration: ${isDone ? 'line-through 2px #222' : 'none'};
          margin-bottom: 6px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span>${index + 1}. ${displayName}</span>
          <span style="font-family: monospace; font-size: 12px; font-weight: 900; background: ${isDone ? '#E2F0D9' : '#F0F0F0'}; border: 1.5px solid #333; padding: 1px 6px; border-radius: 4px;">
            ${item.packedCount}/${item.total}
          </span>
        </div>
      `;
    });

    // Bottom icon pills dock
    let bottomIcons = '';
    uniqueItems.forEach(item => {
      const isDone = item.packedCount >= item.total;
      const displayIcon = item.isObfuscated ? '❔' : item.icon;
      bottomIcons += `
        <div style="
          background: ${isDone ? '#C5E1A5' : '#FFFFFF'};
          border: 2.5px solid #222;
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          box-shadow: 0 3px 0 #222;
          min-width: 44px;
          position: relative;
        ">
          <span style="font-size: 22px;">${displayIcon}</span>
          <span style="font-size: 11px; font-weight: 900; font-family: monospace; color: #111;">
            ${item.packedCount}/${item.total}
          </span>
          ${isDone ? `<span style="position: absolute; top: -5px; right: -5px; font-size: 12px;">✅</span>` : ''}
        </div>
      `;
    });

    const shiftStoryName = shift.name || `Shift #${state.currentShift}`;
    const shiftCustomer = shift.customer || 'Customer';

    hud.innerHTML = `
      <!-- Top Bar: Shift & Timer + Compact Order Status -->
      <!-- Offset below the persistent run strip (day / wallet / tuition bar),
           which owns roughly the top 110px of the screen in every phase. -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; pointer-events: auto; z-index: 10; gap: 8px; margin-top: 104px;">
        <div style="background: #FFFFFF; border: 2.5px solid #222; border-radius: 8px; padding: 6px 10px; box-shadow: 0 3px 0 #222; font-family: sans-serif; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 900; font-size: 13px;">⏱️ <span id="pick-timer-text">${shift.pickTimeLimit}s</span></span>
            <span style="color: #666; font-size: 11px;">(${totalPacked}/${totalOrdered})</span>
          </div>
          <div style="font-size: 9px; font-weight: 800; color: #E76F51; text-transform: uppercase;">
            📦 ${shiftStoryName}
          </div>
          <div style="font-size: 9px; color: #555;">
            👤 ${shiftCustomer}
          </div>
        </div>
        
        <!-- Compact Order Checklist in Top Right -->
        <div style="background: rgba(255,255,255,0.95); border: 2px solid #222; border-radius: 8px; padding: 6px 10px; box-shadow: 0 3px 0 #222; min-width: 140px; font-family: -apple-system, sans-serif;">
          <div style="font-weight: 900; font-size: 10px; color: #555; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">📦 Packing List</div>
          ${checklistLines}
        </div>
      </div>

      <!-- Center Warning (Hurry) -->
      <div id="pick-warning-center" style="display: none; align-self: center; font-size: 20px; font-weight: 900; color: #FFF; background: #FF006E; padding: 6px 16px; border-radius: 8px; border: 2.5px solid #222; margin-top: auto; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
        ⚡ HURRY!
      </div>

      <!-- Bottom Item Dock -->
      <div style="display: flex; gap: 8px; justify-content: center; align-items: center; overflow-x: auto; padding: 6px; pointer-events: auto;">
        ${bottomIcons}
        ${notepadButton}
      </div>
    `;

    this.container.appendChild(hud);

    // Pocket Notepad: one re-pulse per shift. Owning the upgrade is what unlocks
    // it, without it the button stays dead, which is the point of buying it.
    const btnReplay = document.getElementById('btn-replay-audio');
    if (btnReplay) {
      const owned = !!(this.game.state.upgrades && this.game.state.upgrades.pocketNotepad);
      const spent = !!this.game.state.notepadUsedThisShift;
      if (!owned || spent) {
        btnReplay.style.background = '#DDD';
        btnReplay.style.cursor = 'not-allowed';
        btnReplay.style.opacity = owned ? '0.5' : '0.3';
        btnReplay.title = owned ? 'Already used this shift' : 'Buy the Pocket Notepad to unlock';
      } else {
        btnReplay.addEventListener('click', () => {
          this.game.state.notepadUsedThisShift = true;
          btnReplay.style.background = '#DDD';
          btnReplay.style.cursor = 'not-allowed';
          btnReplay.style.opacity = '0.5';

          const currentPrompt = this.game.state.activeOrder ? this.game.state.activeOrder.find(it => !it.packed) : null;
          const pick = this.game.phases && this.game.phases.PICK;
          if (currentPrompt && pick && typeof pick.pulseRailForGender === 'function') {
            pick.pulseRailForGender(currentPrompt.gender);
          }
        });
      }
    }
  }
,

  hideWarehouseManifest() {
    this.clear();
  }
,
  updatePickHUD(timeLeft, totalDuration, freshness) {
    const timerText = document.getElementById('pick-timer-text');
    if (timerText) {
      timerText.innerText = Math.ceil(timeLeft) + 's';
    }
  }
,

  showRideInstructions(onStart) {
    this.clear();
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      padding: 16px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    hud.innerHTML = `
      ${this.runStatusBar()}
      
      <!-- Center Decision Card -->
      <div style="
        width: 100%;
        background: rgba(255, 255, 255, 0.98);
        border: 4px solid #222;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 8px 0 #222, 0 15px 20px rgba(0,0,0,0.3);
        box-sizing: border-box;
        margin: auto 0;
        pointer-events: auto;
        transform: translateY(-20px);
      ">
        <div style="font-size: 13px; font-weight: 900; color: #E76F51; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
          🚴 DELIVERY TRANSIT
        </div>
        <div style="font-size: 16px; font-weight: 900; color: #222; margin-top: 8px; text-align: center; line-height: 1.3;">
          Deliver the groceries safely! Tap left/right or use arrows to steer.
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
          
          <!-- Lane A: Kurzer Weg -->
          <div style="
            background: #F8F9FA;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="font-size: 24px;">🧱</div>
            <div>
              <div style="font-size: 13px; font-weight: 900; color: #E63946;">Cobblestone Road (Left/Center)</div>
              <div style="font-size: 11px; color: #555; margin-top: 2px;">
                Bumpy ride! Damages freshness (-%), but fewer pedestrians. Watch for construction!
              </div>
            </div>
          </div>

          <!-- Lane B: Fahrradweg -->
          <div style="
            background: #F0FAF8;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <div style="font-size: 24px;">🚲</div>
            <div>
              <div style="font-size: 13px; font-weight: 900; color: #2A9D8F;">Bike Lane (Right)</div>
              <div style="font-size: 11px; color: #555; margin-top: 2px;">
                Smooth and fast! Preserves freshness, but watch out for pedestrians blocking the way!
              </div>
            </div>
          </div>

        </div>

        <button id="btn-start-ride" style="
          margin-top: 24px;
          background: #ECC238;
          color: #222;
          border: 3px solid #222;
          width: 100%;
          padding: 14px;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 2px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 5px 0 #9E7D1A;
          text-transform: uppercase;
        ">START RIDING</button>
      </div>
    `;

    this.container.appendChild(hud);

    const btn = document.getElementById('btn-start-ride');
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(4px)';
      btn.style.boxShadow = '0 1px 0 #9E7D1A';
    });
    btn.addEventListener('click', () => {
      this.clear();
      onStart();
    });
  }
,

  showRideHUD() {
    this.clear();
    const hud = document.createElement('div');
    hud.id = 'ride-hud';
    hud.style.cssText = `
      position: absolute;
      top: 15px; left: 15px; right: 15px;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    hud.innerHTML = `
      ${this.runStatusBar()}
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <div style="background: rgba(255,255,255,0.9); border: 2.5px solid #222; border-radius: 8px; padding: 6px 10px; font-weight: bold; flex: 1;">
          <div style="font-size: 11px; color: #666;">BAG INTEGRITY</div>
          <div style="height: 12px; background: #eee; border: 1.5px solid #222; border-radius: 6px; margin-top: 4px; overflow: hidden;">
            <div id="hud-integrity-bar" style="width: 100%; height: 100%; background: #2A9D8F; transition: width 0.2s, background 0.2s;"></div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.9); border: 2.5px solid #222; border-radius: 8px; padding: 6px 10px; font-weight: bold; flex: 1;">
          <div style="font-size: 11px; color: #666;">FRESHNESS</div>
          <div style="height: 12px; background: #eee; border: 1.5px solid #222; border-radius: 6px; margin-top: 4px; overflow: hidden;">
            <div id="hud-freshness-bar" style="width: 100%; height: 100%; background: #3A86FF; transition: width 0.2s, background 0.2s;"></div>
          </div>
        </div>
      </div>
    `;
    this.container.appendChild(hud);
  }
,

  updateRideHUD(integrity, freshness) {
    const iBar = document.getElementById('hud-integrity-bar');
    const fBar = document.getElementById('hud-freshness-bar');
    if (iBar) {
      iBar.style.width = Math.max(0, Math.min(100, integrity)) + '%';
      if (integrity < 30) iBar.style.background = '#E63946';
      else if (integrity < 60) iBar.style.background = '#F4A261';
    }
    if (fBar) {
      fBar.style.width = Math.max(0, Math.min(100, freshness)) + '%';
      if (freshness < 30) fBar.style.background = '#E63946';
      else if (freshness < 60) fBar.style.background = '#F4A261';
    }
  }
,

  showIntercomUI() {
    this.clear();
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 20px;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      pointer-events: none;
    `;

    const phase = this.game.currentPhase;
    const config = phase.config;

    let buttonsHtml = '';
    config.residents.forEach((res, i) => {
      buttonsHtml += `
        <button class="buzzer-btn" data-index="${i}" style="
          background: linear-gradient(180deg, #E6C280 0%, #C99E50 100%);
          color: #2B1D0C;
          border: 2px solid #5C3D11;
          border-radius: 6px;
          padding: 10px 14px;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 4px 0 #5C3D11, 0 5px 6px rgba(0,0,0,0.25);
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.05s ease, box-shadow 0.05s ease;
          font-family: monospace, sans-serif;
        ">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #5C3D11;"></span>
            ${res.name}
          </span>
          <span style="font-size: 11px; background: rgba(0,0,0,0.12); padding: 2px 6px; border-radius: 3px; font-weight: bold;">${res.floor}</span>
        </button>
      `;
    });

    hud.innerHTML = `
      ${this.runStatusBar()}
      
      <!-- Vintage Altbau Brass Intercom Plaque -->
      <div style="
        background: linear-gradient(135deg, #ECC880 0%, #D4A359 50%, #B88238 100%);
        border: 4px solid #4A3319;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.4);
        margin-top: 10px;
      ">
        <div style="text-align: center; border-bottom: 2px dashed rgba(74,51,25,0.4); padding-bottom: 8px; margin-bottom: 12px;">
          <div style="font-weight: 900; font-size: 15px; color: #3A230B; letter-spacing: 1px; text-transform: uppercase;">
            🔔 SPRECHANLAGE (ALTBAU)
          </div>
          <div style="font-size: 12px; color: #4A3319; font-weight: 700; margin-top: 2px;">
            Delivery Ticket: <span style="background: #2B1D0C; color: #FFD166; padding: 2px 8px; border-radius: 4px;">${config.floorCode}</span>
          </div>
        </div>

        <div id="buzzer-list" style="display: flex; flex-direction: column; gap: 8px;">
          ${buttonsHtml}
        </div>
      </div>

      <!-- Comic Speech Bubble for Resident Response -->
      <div id="resident-dialogue" style="
        margin-top: auto;
        background: white;
        border: 3px solid #222;
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 4px 0 #222;
        display: none;
        animation: popBubble 0.2s ease-out;
      ">
        <div id="dialogue-speaker" style="font-size: 11px; font-weight: 900; color: #E76F51; text-transform: uppercase;"></div>
        <div id="dialogue-text" style="font-size: 14px; font-weight: 700; color: #222; margin-top: 2px;"></div>
      </div>
    `;

    this.container.appendChild(hud);

    // Wire spring-loaded buttons
    const btns = hud.querySelectorAll('.buzzer-btn');
    btns.forEach(btn => {
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'translateY(3px)';
        btn.style.boxShadow = '0 1px 0 #5C3D11, 0 2px 3px rgba(0,0,0,0.2)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.transform = 'none';
        btn.style.boxShadow = '0 4px 0 #5C3D11, 0 5px 6px rgba(0,0,0,0.25)';
      });
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const isCorrect = idx === config.correctBuzzerIndex;
        
        // Show Comic Dialogue Bubble
        const diagBox = document.getElementById('resident-dialogue');
        const speaker = document.getElementById('dialogue-speaker');
        const text = document.getElementById('dialogue-text');
        if (diagBox && speaker && text) {
          diagBox.style.display = 'block';
          if (isCorrect) {
            speaker.innerText = `🔊 ${config.residents[idx].name} (${config.floorCode})`;
            text.innerText = `"Buzzed in! Front door unlocked, 3rd floor please!"`;
            diagBox.style.borderColor = '#2A9D8F';
          } else {
            speaker.innerText = `⚠️ WRONG BUZZER`;
            text.innerText = `"Wrong name! No delivery for ${config.floorCode} here!"`;
            diagBox.style.borderColor = '#E63946';
          }
        }

        phase.buzz(idx);
      });
    });
  }
,

  showShiftSummaryUI(options = {}) {
    this.clear();
    const state = this.game.state;
    const isDayEnd = !!options.isDayEnd;
    const dayNum = options.day || state.day || 1;

    let payout = this.game.lastPayout;
    const letterRound = state.lastLetterRound;

    // Build synthetic payout structure if this is a general day-end or post round
    if (!payout) {
      if (letterRound) {
        payout = {
          shift: { quota: 0 },
          grossBaseWage: letterRound.pay || 0,
          packedCount: letterRound.delivered || 0,
          accuracyBonus: 0,
          streakBonus: 0,
          streakMult: 1,
          etiquetteTip: 0,
          damageDeductions: 0,
          netPayout: letterRound.pay || 0,
          metQuota: true,
          isLetterRound: true
        };
      } else {
        payout = {
          shift: { quota: 0 },
          grossBaseWage: 0,
          packedCount: 0,
          accuracyBonus: 0,
          streakBonus: 0,
          streakMult: 1,
          etiquetteTip: 0,
          damageDeductions: 0,
          netPayout: 0,
          metQuota: true,
          isExplorationDay: true
        };
      }
    }

    const hud = document.createElement('div');
    hud.style.cssText = `
      position: absolute;
      top: 40px;
      left: 15px;
      right: 15px;
      background: rgba(255,255,255,0.98);
      border: 3px solid #333;
      border-radius: 12px;
      padding: 20px;
      font-family: monospace, sans-serif;
      box-shadow: 0 5px 15px rgba(0,0,0,0.25);
    `;

    const line = (label, value, color) => `
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
        <span style="color: #555;">${label}</span>
        <span style="font-weight: bold; ${color ? 'color:' + color + ';' : ''}">${value}</span>
      </div>
    `;

    let quotaBanner = '';
    if (payout.isLetterRound) {
      quotaBanner = `<div style="background:#eef7ee; border:2px solid #2e7d32; color:#2e7d32; border-radius:4px; padding:6px; font-size:12px; font-weight:bold; text-align:center; margin-bottom:14px; font-family: sans-serif;">POST ROUND COMPLETE • ${payout.packedCount} LETTERS DELIVERED</div>`;
    } else if (payout.isExplorationDay) {
      quotaBanner = `<div style="background:#f0f4f8; border:2px solid #4a6fa5; color:#2b4c7e; border-radius:4px; padding:6px; font-size:12px; font-weight:bold; text-align:center; margin-bottom:14px; font-family: sans-serif;">CITY ARRIVAL & ORIENTATION • DAY #${dayNum}</div>`;
    } else {
      quotaBanner = payout.metQuota
        ? `<div style="background:#eef7ee; border:2px solid #2e7d32; color:#2e7d32; border-radius:4px; padding:6px; font-size:12px; font-weight:bold; text-align:center; margin-bottom:14px; font-family: sans-serif;">QUOTA MET (${(payout.shift && payout.shift.quota) || 20}\u20AC)</div>`
        : `<div style="background:#fdecea; border:2px solid #c62828; color:#c62828; border-radius:4px; padding:6px; font-size:12px; font-weight:bold; text-align:center; margin-bottom:14px; font-family: sans-serif;">BELOW QUOTA (${(payout.shift && payout.shift.quota) || 20}\u20AC) \u2014 STRIKE</div>`;
    }

    const ledger = window.FFH.buildReceiptLedger(state, payout, {
      day: dayNum,
      settled: !!options.settled
    });
    const { dailyCosts, explorationIncome, income: receiptIncome, netChange: takeHome } = ledger;

    const headerSub = isDayEnd
      ? `TAGESABRECHNUNG • DAY #${dayNum} • EXPENSES & EARNINGS`
      : `LOHNABRECHNUNG • SHIFT #${state.currentShift || 1} • §16b AUFENTHG`;

    const title = isDayEnd ? 'END OF DAY FINANCIAL SUMMARY' : 'COURIER PAYSLIP';

    let earningsSection = '';
    if (payout.isLetterRound) {
      earningsSection = `
        ${line('Post Delivery Earnings', '+' + payout.grossBaseWage.toFixed(2) + '\u20AC', '#2A9D8F')}
        ${line(`Letters Delivered (${payout.packedCount})`, 'Standard Rate', '#555')}
      `;
    } else if (payout.isExplorationDay) {
      earningsSection = `
        ${line('Courier / Post Income', '0.00\u20AC', '#777')}
        ${line('Pfand Returns & City Finds', '+' + explorationIncome.toFixed(2) + '\u20AC', explorationIncome > 0 ? '#2A9D8F' : '#777')}
        ${line('Activity', 'Arrival, City Walk & Registration', '#555')}
      `;
    } else {
      earningsSection = `
        ${line('Gross Base Wage', (payout.grossBaseWage || 0).toFixed(2) + '\u20AC', '#222')}
        ${line(`Picking Accuracy (${payout.packedCount || 0} items)`, '+' + (payout.accuracyBonus || 0).toFixed(2) + '\u20AC', '#2A9D8F')}
        ${payout.streakBonus > 0 ? line(`Cobblestone Flow (x${(payout.streakMult || 1).toFixed(2)})`, '+' + payout.streakBonus.toFixed(2) + '\u20AC', '#FF6600') : ''}
        ${line('Doorstep Etiquette & Freshness Tip', '+' + (payout.etiquetteTip || 0).toFixed(2) + '\u20AC', '#3A86FF')}
        ${payout.damageDeductions > 0 ? line('Transit Damage (Lesson Learned)', '-' + payout.damageDeductions.toFixed(2) + '\u20AC', '#E63946') : ''}
      `;
    }

    hud.innerHTML = `
      <div style="text-align: center; border-bottom: 2px dashed #222; padding-bottom: 12px; margin-bottom: 15px;">
        <div style="font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #E76F51; text-transform: uppercase;">KRUMA LOGISTICS GMBH • LÜBECK</div>
        <h2 style="margin: 3px 0 1px 0; font-size: 19px; font-weight: 900; color: #264653;">${title}</h2>
        <div style="font-size: 10px; color: #777; font-family: monospace;">${headerSub}</div>
        <div style="font-size: 11px; font-style: italic; color: #2A9D8F; margin-top: 4px; font-weight: bold;">
          "Your time. Itemised."
        </div>
      </div>

      ${quotaBanner}

      <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 18px; font-family: monospace; font-size: 12.5px;">
        ${earningsSection}
        
        <div style="border-top: 2px solid #222; padding-top: 8px; margin-top: 4px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; font-family: sans-serif;">
          <span>${isDayEnd ? "TODAY'S EARNINGS" : "SHIFT EARNINGS"}</span>
          <span style="color: #FF006E;">+${receiptIncome.toFixed(2)}€</span>
        </div>

        ${dailyCosts.length ? dailyCosts.map(c => line('  ' + c.label, '-' + c.amount.toFixed(2) + '\u20AC', '#E63946')).join('') : line('  Daily Living Costs', '0.00€', '#555')}

        <div style="border-top: 2px solid #222; padding-top: 8px; margin-top: 4px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; font-family: sans-serif;">
          <span>NET CHANGE</span>
          <span id="receipt-take-home" style="color: ${takeHome >= 0 ? '#2A9D8F' : '#E63946'};">${takeHome >= 0 ? '+' : ''}${takeHome.toFixed(2)}€</span>
        </div>
      </div>

      <div style="margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #555; margin-bottom: 4px; font-weight: bold;">
          <span>TUITION PROGRESS (SEMESTERBEITRAG)</span>
          <span id="tuition-text">${this.game.state.wallet.toFixed(2)}€ / ${window.FFH.ECONOMY.TUITION_GOAL}€</span>
        </div>
        <div style="width: 100%; height: 14px; background: #ddd; border: 2px solid #222; border-radius: 7px; overflow: hidden; position: relative;">
          <div id="tuition-bar" style="width: ${Math.min(100, (this.game.state.wallet / window.FFH.ECONOMY.TUITION_GOAL) * 100)}%; height: 100%; background: #F6BD60; transition: width 1s ease-out;"></div>
        </div>
      </div>

      <button id="btn-finish-shift" style="
        background: #2A9D8F;
        color: white;
        border: 2.5px solid #264653;
        width: 100%;
        padding: 13px;
        font-weight: 900;
        font-size: 14px;
        border-radius: 10px;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 0 #264653;
        font-family: sans-serif;
        letter-spacing: 0.5px;
      ">${options.settled ? 'PAY RECEIVED. CONTINUE' : (isDayEnd ? 'CONTINUE TO SLEEP' : 'RETURN TO DORM & PLAN NEXT SHIFT')}</button>
    `;

    this.container.appendChild(hud);
    if (this.setHudHidden) this.setHudHidden(true);
    if (this.clearTransientOverlays) this.clearTransientOverlays();

    // Animate tuition bar and play SFX
    setTimeout(() => {
      if (!hud.isConnected) return;
      // This includes only money that has not reached the wallet yet (Kruma),
      // and subtracts the next day's costs exactly as the sleep tunnel does.
      const newWallet = ledger.projectedWallet;
      const goal = window.FFH.ECONOMY.TUITION_GOAL;
      const bar = document.getElementById('tuition-bar');
      if (bar) bar.style.width = Math.min(100, (newWallet / goal) * 100) + '%';

      const tText = document.getElementById('tuition-text');
      const from = this.game.state.wallet;
      const startAt = performance.now();
      const tick = (now) => {
        if (!hud.isConnected || !tText) return;
        const t = Math.min(1, (now - startAt) / 1100);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = from + (newWallet - from) * eased;
        tText.textContent = val.toFixed(2) + '€ / ' + goal + '€';
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      this.game.sfx.playSfx('early_success'); // Coin chime sound
    }, 500);

    const btn = document.getElementById('btn-finish-shift');
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(2px)';
      btn.style.boxShadow = '0 2px 0 #222';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'none';
      btn.style.boxShadow = '0 4px 0 #222';
    });
    btn.addEventListener('click', () => {
      // Tactile cash register sound logic
      this.game.sfx.playSfx('success'); // or 'kaching' if we add one
      if (this.setHudHidden) this.setHudHidden(false);

      // If the story opened this as part of a day_end, hand control back to it
      // rather than running the standalone shift-to-shop flow.
      const sr = this.game.storyRunner;
      if (sr && typeof sr._resumeAfterReceipt === 'function') {
        this.clear();
        sr._resumeAfterReceipt();
        return;
      }
      window.FFH.finishShift(this.game);
    });
  }
,

  showShopUI() {
    this.clear();
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: absolute;
      top: 20px;
      left: 15px;
      right: 15px;
      bottom: 20px;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
      pointer-events: none;
    `;

    const phase = this.game.currentPhase;

    const renderUpgrade = (u) => {
      const owned = this.game.state.upgrades[u.id];
      const canAfford = this.game.state.wallet >= u.cost;

      let btnStyle = '';
      let btnText = '';

      if (owned) {
        btnStyle = 'background: #ccc; color: #666; cursor: not-allowed;';
        btnText = 'OWNED';
      } else if (canAfford) {
        btnStyle = 'background: #FF6600; color: white; cursor: pointer;';
        btnText = `BUY (${u.cost}€)`;
      } else {
        btnStyle = 'background: #e0e0e0; color: #999; cursor: not-allowed;';
        btnText = `BUY (${u.cost}€)`;
      }

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.9); border: 2.5px solid #333; border-radius: 8px; padding: 10px; box-shadow: 0 3px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">${u.icon}</span>
            <div>
              <span style="font-weight: bold; font-size: 13px;">${u.nameEn}</span>
              <span style="font-size: 10px; display: block; color: #666; max-width: 160px; line-height: 1.2; margin-top: 2px;">
                ${u.effectEn}
              </span>
            </div>
          </div>
          <button class="buy-btn" data-id="${u.id}" style="
            border: 2px solid #222;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
            pointer-events: ${owned ? 'none' : 'auto'};
            ${btnStyle}
          ">${btnText}</button>
        </div>
      `;
    };

    const gearUpgrades = window.FFH.shopUpgrades
      .filter(u => u.category === 'equipment')
      .map(renderUpgrade)
      .join('');

    const comfortsUpgrades = window.FFH.shopUpgrades
      .filter(u => u.category !== 'equipment')
      .map(renderUpgrade)
      .join('');

    hud.innerHTML = `
      <!-- Shop Header -->
      <div style="background: rgba(255,255,255,0.95); border: 3px solid #333; border-radius: 12px; padding: 15px; margin-bottom: 12px; text-align: center;">
        <div style="font-weight: bold; color: #FF6600; font-size: 18px; font-family: sans-serif;">INTERMISSION SHOP</div>
        <div style="font-size: 13px; font-weight: bold; color: #333; margin-top: 5px;">
          Available Cash: <span style="color: #FF006E; font-size: 16px;">${this.game.state.wallet}€</span>
        </div>
      </div>

      <!-- Upgrades List -->
      <div style="display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto; padding-right: 5px;">
        <div style="font-size: 11px; font-weight: bold; color: #222; text-transform: uppercase; margin-bottom: -4px;">Courier Equipment</div>
        ${gearUpgrades}
        <div style="font-size: 11px; font-weight: bold; color: #222; text-transform: uppercase; margin-top: 8px; margin-bottom: -4px;">Room Comforts</div>
        ${comfortsUpgrades}
      </div>

      <!-- Close Action -->
      <button id="btn-close-shop" style="
        background: #333;
        color: white;
        border: none;
        padding: 14px;
        font-weight: bold;
        font-size: 15px;
        border-radius: 8px;
        cursor: pointer;
        pointer-events: auto;
        margin-top: 15px;
        box-shadow: 0 4px #111;
      ">LEAVE SHOP</button>
    `;

    this.container.appendChild(hud);

    // Wire purchase handlers
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        phase.buyUpgrade(id);
      });
    });

    // Wire close
    document.getElementById('btn-close-shop').addEventListener('click', () => {
      phase.closeShop();
    });
  }
});
