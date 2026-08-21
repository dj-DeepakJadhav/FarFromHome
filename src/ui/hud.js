// HUD overlays renderer
window.FFH.UI = class {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  }

  clear() {
    this.container.innerHTML = '';
  }

  spawnFloatingText(text, clientX, clientY, color = '#2A9D8F') {
    const el = document.createElement('div');
    el.innerText = text;
    el.style.cssText = `
      position: fixed;
      left: ${clientX}px;
      top: ${clientY}px;
      transform: translate(-50%, -50%) scale(0.6);
      color: ${color};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 900;
      font-size: 18px;
      text-shadow: 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 0 4px 8px rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -120px) scale(1.15)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 550);
  }

  showBootScreen() {
    this.clear();

    // Set background color to turquoise sea (matching reference: #5DB7AD)
    if (this.game && this.game.scene) {
      this.game.scene.background = new THREE.Color(0x5DB7AD);
    }

    const bootDiv = document.createElement('div');
    bootDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      padding: 25px 20px 35px 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Check wallet to show progress
    const walletText = this.game.state.wallet > 0 ? `
      <div style="background: rgba(255,255,255,0.9); border: 2px solid #222; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
        Tuition Fund: <span style="color: #FF006E;">${this.game.state.wallet}€</span> / 250€
      </div>
    ` : '';

    bootDiv.innerHTML = `
      <!-- Top Bar: Shader Switcher & Wallet -->
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; pointer-events: auto; z-index: 10;">
        <div style="background: rgba(255,255,255,0.95); border: 2px solid #222; border-radius: 20px; padding: 4px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
          <span style="font-size: 11px; font-weight: bold; color: #333;">🎨 Shader:</span>
          <select id="shader-select" style="background: transparent; border: none; font-size: 12px; font-weight: bold; color: #111; cursor: pointer; outline: none;">
            <option value="MESSENGER_COZY" ${window.FFH.activeShaderStyle === 'MESSENGER_COZY' ? 'selected' : ''}>Messenger Cozy</option>
            <option value="CEL_3BAND" ${window.FFH.activeShaderStyle === 'CEL_3BAND' ? 'selected' : ''}>Berlin Cel (3-Band)</option>
            <option value="INK_OUTLINE" ${window.FFH.activeShaderStyle === 'INK_OUTLINE' ? 'selected' : ''}>Ink & Outline</option>
            <option value="RETRO_POSTER" ${window.FFH.activeShaderStyle === 'RETRO_POSTER' ? 'selected' : ''}>Retro Poster</option>
          </select>
        </div>
        ${walletText}
      </div>

      <!-- Golden Yellow Isometric BEGIN Button matching Reference -->
      <div style="pointer-events: auto; z-index: 10; width: 100%; display: flex; justify-content: center; margin-top: auto; margin-bottom: 20px;">
        <button id="btn-start" style="
          background: #ECC238;
          color: #222;
          border: 3px solid #222;
          padding: 12px 55px;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 3px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 6px 0 #9E7D1A, 0 8px 10px rgba(0,0,0,0.25);
          transition: all 0.08s ease-in-out;
          font-family: monospace, monospace;
          text-transform: uppercase;
        ">BEGIN</button>
      </div>
    `;

    this.container.appendChild(bootDiv);

    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.addEventListener('mousedown', () => {
        btnStart.style.transform = 'translateY(4px)';
        btnStart.style.boxShadow = '0 2px 0 #9E7D1A, 0 4px 6px rgba(0,0,0,0.2)';
      });
      btnStart.addEventListener('mouseup', () => {
        btnStart.style.transform = 'none';
        btnStart.style.boxShadow = '0 6px 0 #9E7D1A, 0 8px 10px rgba(0,0,0,0.25)';
      });
      btnStart.addEventListener('click', () => {
        this.game.sfx.playSfx('success');
        this.game.transitionTo('ROOM_HUB');
      });
    }

    const shaderSelect = document.getElementById('shader-select');
    if (shaderSelect) {
      shaderSelect.addEventListener('change', (e) => {
        window.FFH.setShaderStyle(e.target.value);
      });
    }
  }

  showWinScreen() {
    this.endScreen({
      background: '#3A86FF',
      accent: '#3A86FF',
      badge: '\u{1F393}',
      title: 'TUITION PAID',
      subtitle: 'You made the semester fee.',
      buttonLabel: 'PLAY AGAIN'
    });
  }

  showLoseScreen() {
    this.endScreen({
      background: '#C62828',
      accent: '#C62828',
      badge: '\u{1F4E6}',
      title: 'LET GO',
      subtitle: 'Three bad shifts. The dark store cut your contract.',
      buttonLabel: 'TRY AGAIN'
    });
  }

  // Win and lose differ only in wording and colour - the run summary a judge
  // reads (how far you got, how well you picked) is identical.
  endScreen(opts) {
    this.clear();
    const s = this.game.state;

    const div = document.createElement('div');
    div.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      background: ${opts.background};
      color: white;
      font-family: sans-serif;
      padding: 30px;
      box-sizing: border-box;
    `;

    const stat = (label, value) => `
      <div style="display:flex; justify-content:space-between; font-size:13px; padding:4px 0;">
        <span style="opacity:0.85;">${label}</span>
        <span style="font-weight:bold;">${value}</span>
      </div>
    `;

    div.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 14px;">${opts.badge}</div>
      <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 1px;">${opts.title}</h1>
      <p style="margin-top: 8px; font-size: 14px; opacity: 0.9;">${opts.subtitle}</p>

      <div style="background: rgba(255,255,255,0.18); border: 2px solid white; border-radius: 12px; padding: 16px; margin: 24px 0; width: 100%;">
        <div style="font-size: 34px; font-weight: 900; margin-bottom: 10px;">${window.FFH.round2(s.wallet)}\u20AC</div>
        ${stat('Shifts worked', s.stats.shiftsWorked)}
        ${stat('Items packed', s.stats.itemsPacked)}
        ${stat('Best streak', s.stats.bestStreak)}
        ${stat('Wrong picks', s.stats.totalMispicks)}
      </div>

      <button id="btn-restart" style="
        background: white;
        color: ${opts.accent};
        border: none;
        padding: 15px 45px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      ">${opts.buttonLabel}</button>
    `;

    this.container.appendChild(div);

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.game.sfx.playSfx('success');
      this.game.restartRun();
    });
  }

  // One status strip, rendered identically on every in-shift screen so the
  // player never loses track of goal progress, strikes, or owned gear.
  runStatusBar() {
    const s = this.game.state;
    const goal = window.FFH.ECONOMY.TUITION_GOAL;
    const pct = Math.min(100, (s.wallet / goal) * 100);

    const strikeDots = [];
    for (let i = 0; i < window.FFH.ECONOMY.MAX_STRIKES; i++) {
      const used = i < s.strikes;
      strikeDots.push(`<span style="color:${used ? '#FF3333' : '#ccc'}; font-size:15px;">${used ? '\u25CF' : '\u25CB'}</span>`);
    }

    const gear = window.FFH.shopUpgrades
      .filter(u => s.upgrades[u.id])
      .map(u => `<span style="background:#222; color:#ECC238; border-radius:4px; padding:1px 5px; font-size:9px; font-weight:bold;">${u.icon}</span>`)
      .join(' ');

    return `
      <div style="background: rgba(255,255,255,0.95); border: 3px solid #333; border-radius: 12px; padding: 10px 12px; margin-bottom: 10px; font-family: sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:bold;">
          <span style="color:#333;">SHIFT ${s.currentShift}</span>
          <span>${strikeDots.join(' ')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:4px;">
          <span style="font-size:18px; font-weight:900; color:#FF006E;">${window.FFH.round2(s.wallet)}\u20AC</span>
          <span style="font-size:11px; color:#666;">of ${goal}\u20AC tuition</span>
        </div>
        <div style="height:7px; background:#eee; border:1.5px solid #333; border-radius:4px; margin-top:5px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:#3A86FF;"></div>
        </div>
        ${gear ? `<div style="margin-top:6px;">${gear}</div>` : ''}
      </div>
    `;
  }

  showWarehouseManifest() {
    this.clear();
    const state = this.game.state;
    const shift = window.FFH.getShift(state.currentShift);

    // Group items for bottom bar
    const itemCounts = {};
    state.activeOrder.forEach(it => {
      if (!itemCounts[it.id]) {
        itemCounts[it.id] = { ...it, total: 0, packedCount: 0 };
      }
      itemCounts[it.id].total++;
      if (it.packed) itemCounts[it.id].packedCount++;
    });

    const uniqueItems = Object.values(itemCounts);
    const totalOrdered = state.activeOrder.length;
    const totalPacked = state.activeOrder.filter(i => i.packed).length;

    const hud = document.createElement('div');
    hud.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      font-family: "Comic Sans MS", "Chalkboard SE", "Caveat", -apple-system, sans-serif;
      box-sizing: border-box;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    // Checklist entries matching the reference handwriting look
    let checklistLines = '';
    uniqueItems.forEach((item, index) => {
      const isDone = item.packedCount >= item.total;
      checklistLines += `
        <div style="
          font-size: 15px;
          line-height: 1.4;
          color: ${isDone ? '#777' : '#1A1A1A'};
          text-decoration: ${isDone ? 'line-through 2px #222' : 'none'};
          margin-bottom: 8px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span>${index + 1}. ${item.nameDe} (${item.nameEn})</span>
          <span style="font-family: monospace; font-size: 13px; font-weight: 900; background: ${isDone ? '#E2F0D9' : '#F0F0F0'}; border: 1.5px solid #333; padding: 1px 6px; border-radius: 4px;">
            ${item.packedCount}/${item.total}
          </span>
        </div>
      `;
    });

    // Bottom icon pills dock
    let bottomIcons = '';
    uniqueItems.forEach(item => {
      const isDone = item.packedCount >= item.total;
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
          <span style="font-size: 22px;">${item.icon}</span>
          <span style="font-size: 11px; font-weight: 900; font-family: monospace; color: #111;">
            ${item.packedCount}/${item.total}
          </span>
          ${isDone ? `<span style="position: absolute; top: -5px; right: -5px; font-size: 12px;">✅</span>` : ''}
        </div>
      `;
    });

    hud.innerHTML = `
      <!-- Top Bar: Shift & Timer -->
      <div style="display: flex; justify-content: space-between; align-items: center; pointer-events: auto; z-index: 10;">
        <div style="background: #FFFFFF; border: 2.5px solid #222; border-radius: 8px; padding: 4px 10px; box-shadow: 0 3px 0 #222; font-weight: 900; font-size: 13px; font-family: sans-serif;">
          ⏱️ <span id="pick-timer-text">${shift.pickTimeLimit}s</span>
          <span style="color: #666; font-size: 11px; margin-left: 4px;">(${totalPacked}/${totalOrdered})</span>
        </div>
        
        <!-- Toggle Notepad Button -->
        <button id="btn-toggle-checklist" style="
          background: #FFFFFF;
          border: 2.5px solid #222;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 3px 0 #222;
          font-size: 20px;
        ">📋</button>
      </div>

      <!-- Main Hand-Drawn Whiteboard/Notepad Checklist matching reference art -->
      <div id="checklist-card" style="
        background: #FFFFFF;
        border: 3.5px solid #2B3A42;
        border-radius: 8px;
        box-shadow: 4px 6px 0 rgba(0,0,0,0.25);
        padding: 16px 20px;
        margin: 10px auto;
        width: 88%;
        max-width: 320px;
        pointer-events: auto;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
      ">
        <div style="
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #1A1A1A;
          margin-bottom: 12px;
          border-bottom: 2px solid #EEE;
          padding-bottom: 4px;
        ">
          CHECKLIST:
        </div>
        <div style="display: flex; flex-direction: column;">
          ${checklistLines}
        </div>
      </div>

      <!-- Bottom Quick-Dock Bar with Item Icons & Counts -->
      <div style="
        pointer-events: auto;
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 6px;
        z-index: 10;
      ">
        ${bottomIcons}
      </div>
    `;

    this.container.appendChild(hud);

    // Toggle checklist visibility button
    const toggleBtn = document.getElementById('btn-toggle-checklist');
    const card = document.getElementById('checklist-card');
    if (toggleBtn && card) {
      toggleBtn.addEventListener('click', () => {
        if (card.style.display === 'none') {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }

  hideWarehouseManifest() {
    this.clear();
  }
  updatePickHUD(timeLeft, totalDuration, freshness) {
    const timerText = document.getElementById('pick-timer-text');
    if (timerText) {
      timerText.innerText = Math.ceil(timeLeft) + 's';
    }
  }

  showRouteSelection(onSelect) {
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
        background: rgba(255, 255, 255, 0.96);
        border: 3px solid #222;
        border-radius: 14px;
        padding: 16px;
        box-shadow: 0 5px 0 #222;
        box-sizing: border-box;
        margin: auto 0;
        pointer-events: auto;
      ">
        <div style="font-size: 11px; font-weight: 900; color: #E76F51; text-transform: uppercase; letter-spacing: 0.5px;">
          🚴 ROUTE SELECTION
        </div>
        <div style="font-size: 15px; font-weight: 900; color: #222; margin-top: 4px;">
          Choose your path to the customer:
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
          <!-- Route A: Kurzer Weg -->
          <button id="btn-route-short" style="
            background: #FFF;
            border: 2.5px solid #222;
            border-radius: 10px;
            padding: 12px;
            text-align: left;
            cursor: pointer;
            box-shadow: 0 3px 0 #222;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 900; color: #E63946;">⚡ Kurzer Weg (Cobblestone)</span>
              <span style="font-size: 11px; font-weight: 800; background: #FFD166; padding: 2px 6px; border-radius: 4px;">FAST</span>
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">
              Saves delivery freshness, but bumpy stones risk -15% bag integrity.
            </div>
          </button>

          <!-- Route B: Fahrradweg -->
          <button id="btn-route-bike" style="
            background: #FFF;
            border: 2.5px solid #222;
            border-radius: 10px;
            padding: 12px;
            text-align: left;
            cursor: pointer;
            box-shadow: 0 3px 0 #222;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px; font-weight: 900; color: #2A9D8F;">🚲 Fahrradweg (Bike Lane)</span>
              <span style="font-size: 11px; font-weight: 800; background: #E0E0E0; padding: 2px 6px; border-radius: 4px;">SAFE</span>
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">
              Smooth paved path. Bag stays 100% intact, but takes more travel time.
            </div>
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(hud);

    document.getElementById('btn-route-short')?.addEventListener('click', () => {
      onSelect('kurzer_weg');
    });
    document.getElementById('btn-route-bike')?.addEventListener('click', () => {
      onSelect('fahrradweg');
    });
  }

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
            text.innerText = `"Hallo! Tür ist auf, 3. Stock bitte!"`;
            diagBox.style.borderColor = '#2A9D8F';
          } else {
            speaker.innerText = `⚠️ FALSCHE KLINGEL`;
            text.innerText = `"Falscher Name! Hier wohnt kein ${config.floorCode}!"`;
            diagBox.style.borderColor = '#E63946';
          }
        }

        phase.buzz(idx);
      });
    });
  }

  showShiftSummaryUI() {
    this.clear();
    const phase = this.game.currentPhase;
    const payout = phase.payout;

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

    const quotaBanner = payout.metQuota
      ? `<div style="background:#eef7ee; border:2px solid #2e7d32; color:#2e7d32; border-radius:4px; padding:6px; font-size:12px; font-weight:bold; text-align:center; margin-bottom:14px; font-family: sans-serif;">QUOTA MET (${payout.shift.quota}\u20AC)</div>`
      : `<div style="background:#fdecea; border:2px solid #c62828; color:#c62828; border-radius:4px; padding:6px; font-size:12px; font-weight:bold; text-align:center; margin-bottom:14px; font-family: sans-serif;">BELOW QUOTA (${payout.shift.quota}\u20AC) \u2014 STRIKE</div>`;

    hud.innerHTML = `
      <div style="text-align: center; border-bottom: 2px dashed #999; padding-bottom: 10px; margin-bottom: 16px;">
        <span style="font-weight: 900; font-size: 18px; color: #222; font-family: sans-serif;">KRUMA EXPRESS</span><br>
        <span style="font-size: 11px; color: #666;">RECEIPT - SHIFT ${payout.shift.index + 1}</span>
      </div>

      ${quotaBanner}

      <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px;">
        ${line('Base Wage', payout.grossBaseWage.toFixed(2) + '\u20AC', '#222')}
        ${line(`Accuracy (${payout.packedCount} items)`, '+' + payout.accuracyBonus.toFixed(2) + '\u20AC', '#2A9D8F')}
        ${payout.streakBonus > 0 ? line(`Streak Bonus (x${payout.streakMult.toFixed(2)})`, '+' + payout.streakBonus.toFixed(2) + '\u20AC', '#FF6600') : ''}
        ${line('Etiquette & Freshness Tip', '+' + payout.etiquetteTip.toFixed(2) + '\u20AC', '#3A86FF')}
        ${payout.damageDeductions > 0 ? line('Damage Deductions', '-' + payout.damageDeductions.toFixed(2) + '\u20AC', '#E63946') : ''}
        
        <div style="border-top: 2px solid #222; padding-top: 10px; margin-top: 5px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; font-family: sans-serif;">
          <span>NET PAYOUT</span>
          <span style="color: #FF006E;">+${payout.netPayout.toFixed(2)}\u20AC</span>
        </div>
      </div>

      <button id="btn-finish-shift" style="
        background: #2A9D8F;
        color: white;
        border: 2px solid #222;
        width: 100%;
        padding: 14px;
        font-weight: 900;
        font-size: 15px;
        border-radius: 8px;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 0 #222;
        font-family: sans-serif;
      ">ACCEPT PAYOUT & GO TO ROOM</button>
    `;

    this.container.appendChild(hud);
    
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
      phase.finishShift();
    });
  }

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

  showRoomHubUI() {
    this.clear();
    const s = this.game.state;
    const shift = window.FFH.getShift(s.currentShift);

    if (this.game && this.game.scene) {
      this.game.scene.background = new THREE.Color(0x5DB7AD);
    }

    const hubDiv = document.createElement('div');
    hubDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      padding: 25px 20px 35px 20px;
      box-sizing: border-box;
      font-family: sans-serif;
    `;

    const goal = window.FFH.ECONOMY.TUITION_GOAL;
    const pct = Math.min(100, (s.wallet / goal) * 100);

    let strikeDots = [];
    for (let i = 0; i < window.FFH.ECONOMY.MAX_STRIKES; i++) {
      const used = i < s.strikes;
      strikeDots.push(`<span style="color:${used ? '#FF3333' : '#ccc'}; font-size:16px;">${used ? '●' : '○'}</span>`);
    }

    hubDiv.innerHTML = `
      <!-- Top Bar: Progress & Strikes -->
      <div style="width: 100%; display: flex; flex-direction: column; background: rgba(255,255,255,0.95); border: 3px solid #333; border-radius: 12px; padding: 10px 12px; pointer-events: auto; box-shadow: 0 4px rgba(0,0,0,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:bold;">
          <span style="color:#333;">STUDENT SUBLET STATUS</span>
          <span>${strikeDots.join(' ')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:4px;">
          <span style="font-size:22px; font-weight:900; color:#FF006E;">${window.FFH.round2(s.wallet)}€</span>
          <span style="font-size:12px; color:#666;">of ${goal}€ tuition goal</span>
        </div>
        <div style="height:8px; background:#eee; border:1.5px solid #333; border-radius:4px; margin-top:5px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:#3A86FF;"></div>
        </div>
      </div>

      <!-- Bottom Card: Next Shift details & Start button -->
      <div style="width: 100%; pointer-events: auto; background: rgba(255,255,255,0.96); border: 3px solid #333; border-radius: 12px; padding: 15px; box-shadow: 0 5px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 11px; font-weight: 900; color: #FF6600; text-transform: uppercase;">Next Assignment</div>
        <div style="font-size: 20px; font-weight: 900; color: #222;">${shift.name}</div>
        
        <div style="font-size: 13px; color: #444; line-height: 1.4; border-top: 1.5px dashed #ccc; padding-top: 8px; margin-top: 2px;">
          • Orders size: <strong>${shift.itemsCount} items</strong><br>
          • Target Quota: <strong>${shift.quota}€</strong><br>
          • Shift Base Wage: <strong>${shift.baseWage}€</strong>
        </div>

        <button id="btn-start-shift" style="
          background: #ECC238;
          color: #222;
          border: 3px solid #222;
          padding: 12px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1.5px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 4px 0 #9E7D1A;
          margin-top: 6px;
          transition: all 0.08s ease-in-out;
          font-family: monospace, monospace;
          text-transform: uppercase;
        ">START SHIFT</button>
      </div>
    `;

    this.container.appendChild(hubDiv);

    const btnStart = document.getElementById('btn-start-shift');
    btnStart.addEventListener('mousedown', () => {
      btnStart.style.transform = 'translateY(2px)';
      btnStart.style.boxShadow = '0 2px 0 #9E7D1A';
    });
    btnStart.addEventListener('mouseup', () => {
      btnStart.style.transform = 'none';
      btnStart.style.boxShadow = '0 4px 0 #9E7D1A';
    });
    btnStart.addEventListener('click', () => {
      this.game.sfx.playSfx('success');
      this.game.transitionTo('PICK');
    });
  }

  showRideMockScreen() {
    // Redundant now that phase is fully implemented. Leave empty.
  }
};

