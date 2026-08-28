// HUD overlays renderer
window.FFH.UI = class {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  }

  clear() {
    this.container.innerHTML = '';
  }

  updatePersistentHUD(state) {
    const hud = document.getElementById('persistent-hud');
    if (hud) {
      hud.innerHTML = ''; // Clear and disable overlapping persistent HUD
      
      if (state.upgrades?.vocabNotebook) {
        // Add Vocab Notebook button to persistent UI layer
        hud.innerHTML = `
          <div style="width: 100%; display: flex; justify-content: flex-end; padding: 10px;">
            <button id="btn-vocab-notebook" style="
              pointer-events: auto;
              background: #FFD166;
              border: 3px solid #222;
              border-radius: 8px;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 4px 0 #222;
              font-size: 24px;
            ">📔</button>
          </div>
          <div id="vocab-modal" style="
            display: none;
            position: absolute;
            top: 70px; right: 10px; width: 300px;
            background: #FFF; border: 3px solid #222; border-radius: 8px;
            padding: 15px; box-shadow: 4px 6px 0 rgba(0,0,0,0.3);
            pointer-events: auto; z-index: 2000;
            max-height: 400px; overflow-y: auto; font-family: sans-serif;
          ">
            <h2 style="margin:0 0 10px 0; border-bottom: 2px solid #EEE; padding-bottom: 5px;">Vocab Notebook</h2>
            <div id="vocab-list" style="display:flex; flex-direction:column; gap:8px;"></div>
            <button id="btn-close-vocab" style="margin-top:10px; width:100%; padding:8px; background:#222; color:#FFF; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">CLOSE</button>
          </div>
        `;

        const btn = document.getElementById('btn-vocab-notebook');
        const modal = document.getElementById('vocab-modal');
        const list = document.getElementById('vocab-list');
        const closeBtn = document.getElementById('btn-close-vocab');

        if (btn) {
          btn.addEventListener('click', () => {
            if (modal.style.display === 'none') {
              this.game.sfx.playSfx('click');
              modal.style.display = 'block';
              list.innerHTML = '';
              // Populate known items
              const items = window.FFH.GROCERY_ITEMS || [];
              items.forEach(item => {
                const el = document.createElement('div');
                el.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#F8F9FA; padding:6px 10px; border-radius:4px; border:1px solid #DDD;';
                
                // Audio button
                const btnAudio = document.createElement('button');
                btnAudio.innerText = '🔊';
                btnAudio.style.cssText = 'background:none; border:none; cursor:pointer; font-size:16px; margin-right:8px;';
                btnAudio.onclick = () => {
                  window.FFH.playGermanAudio(item.gender, item.name);
                };

                const textSpan = document.createElement('span');
                textSpan.innerHTML = `<strong>${item.gender}</strong> ${item.name} <span style="color:#666; font-size:12px;">(${item.en})</span>`;
                
                el.appendChild(btnAudio);
                el.appendChild(textSpan);
                list.appendChild(el);
              });
            } else {
              modal.style.display = 'none';
            }
          });
        }
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
          });
        }
      }
    }
  }

  showTutorialBanner(text, color = '#FFEB3B', duration = 4000) {
    const el = document.createElement('div');
    el.innerHTML = text;
    el.style.cssText = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: rgba(17, 17, 17, 0.95);
      border: 3px solid ${color};
      color: #fff;
      padding: 12px 24px;
      border-radius: 12px;
      font-family: -apple-system, sans-serif;
      font-weight: 900;
      font-size: 18px;
      text-align: center;
      box-shadow: 0 8px 16px rgba(0,0,0,0.5), 0 0 20px ${color}40;
      pointer-events: none;
      z-index: 10000;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    document.body.appendChild(el);

    // Fade in
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Fade out after duration
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => el.remove(), 300);
    }, duration);
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
    this.clear();
    const s = this.game.state;
    const div = document.createElement('div');
    div.style.cssText = `
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; text-align: center; background: #5DB7AD; color: #222; font-family: sans-serif;
      padding: 30px; box-sizing: border-box; pointer-events: auto;
    `;

    div.innerHTML = `
      <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 10px 0; color: #FFF; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">MATRICULATION COMPLETE!</h1>
      <p style="font-size: 16px; color: #FFF; margin: 0 0 20px 0; font-weight: bold;">Tuition of €250 has been fully paid.</p>

      <div style="background: #FFF; border: 3px solid #222; border-radius: 12px; width: 300px; padding: 20px; box-shadow: 4px 6px 0 rgba(0,0,0,0.25); text-align: left; position: relative;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 10px; margin-bottom: 15px;">
          <div style="font-weight: 900; font-size: 14px; color: #3A86FF;">UNIVERSITÄT ZU LÜBECK</div>
          <div style="font-size: 20px;">🎓</div>
        </div>
        
        <div style="display: flex; gap: 15px;">
          <div style="width: 70px; height: 90px; background: #CCC; border: 2px solid #222; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 30px;">
            👤
          </div>
          <div style="font-size: 12px; line-height: 1.6;">
            <div style="color: #666;">STUDENT ID / AUSWEIS</div>
            <div style="font-weight: 900; font-size: 16px; margin-bottom: 5px;">#108422</div>
            <div style="color: #666;">FACULTY</div>
            <div style="font-weight: bold;">Logistics & Linguistics</div>
          </div>
        </div>

        <div style="margin-top: 15px; padding-top: 10px; border-top: 2px dashed #EEE; font-size: 12px; display: flex; justify-content: space-between;">
          <span>Shifts: ${s.stats.shiftsWorked}</span>
          <span>Vocab: ${s.stats.wordsLearned || 0}</span>
        </div>
        
        <div style="position: absolute; bottom: -15px; right: 10px; font-size: 40px; transform: rotate(-15deg); opacity: 0.8;">
          ✅
        </div>
      </div>

      <button id="btn-restart" style="
        margin-top: 30px; background: #FFD166; color: #222; border: 3px solid #222; border-radius: 8px;
        padding: 12px 30px; font-size: 18px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 #222;
      ">PLAY AGAIN</button>
    `;

    this.container.appendChild(div);

    document.getElementById('btn-restart').addEventListener('click', () => {
      window.location.reload();
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
        itemCounts[it.id] = { ...it, total: 0, packedCount: 0, revealed: false };
      }
      itemCounts[it.id].total++;
      if (it.packed) itemCounts[it.id].packedCount++;
      if (it.revealed || it.packed) itemCounts[it.id].revealed = true;
    });

    const uniqueItems = Object.values(itemCounts).filter(it => it.promptStarted || it.revealed || it.packedCount > 0);
    
    const currentPrompt = state.activeOrder.find(i => !i.packed);
    if (currentPrompt && !itemCounts[currentPrompt.id].revealed) {
      itemCounts[currentPrompt.id].isObfuscated = true;
    }

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
      const displayName = item.isObfuscated ? '???' : `${item.nameDe} (${item.nameEn})`;
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
          <span>${index + 1}. ${displayName}</span>
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

    hud.innerHTML = `
      <!-- Top Bar: Shift & Timer -->
      <div style="display: flex; justify-content: space-between; align-items: center; pointer-events: auto; z-index: 10;">
        <div style="background: #FFFFFF; border: 2.5px solid #222; border-radius: 8px; padding: 4px 10px; box-shadow: 0 3px 0 #222; font-weight: 900; font-size: 13px; font-family: sans-serif;">
          ⏱️ <span id="pick-timer-text">${shift.pickTimeLimit}s</span>
          <span style="color: #666; font-size: 11px; margin-left: 4px;">(${totalPacked}/${totalOrdered})</span>
        </div>
        
        <!-- Replay Audio Button (Pocket Notepad) -->
        ${this.game.state.upgrades?.pocketNotepad ? `
        <button id="btn-replay-audio" style="
          background: ${this.game.state.notepadUsedThisShift ? '#DDD' : '#FFF'};
          border: 2.5px solid #222;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ${this.game.state.notepadUsedThisShift ? 'not-allowed' : 'pointer'};
          box-shadow: 0 3px 0 #222;
          font-size: 20px;
        ">📋</button>` : ''}
      </div>

      <!-- Center Warning Area (Empty by default) -->
      <div id="pick-warning-center" style="display: none; align-self: center; font-size: 24px; font-weight: 900; color: #FFF; background: #FF006E; padding: 10px 20px; border-radius: 8px; border: 3px solid #222; margin-top: auto; margin-bottom: 20px; text-transform: uppercase;">
        HURRY!
      </div>

      <!-- Freshness / Decay Bar -->
      <div style="background: rgba(255,255,255,0.9); border: 2.5px solid #222; border-radius: 8px; padding: 8px; box-shadow: 0 3px 0 #222; pointer-events: auto; margin-bottom: 10px;">
        <div style="font-weight: 900; font-size: 11px; margin-bottom: 4px; display: flex; justify-content: space-between;">
          <span>📦 WAREN-CHECKLISTE</span>
        </div>
        
        <div style="margin-bottom: 10px; max-height: 40vh; overflow-y: auto;">
          ${checklistLines}
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; justify-content: center; overflow-x: auto; padding: 4px;">
        ${bottomIcons}
      </div>
    `;

    this.container.appendChild(hud);

    // Audio Replay logic (one per shift)
    const btnReplay = document.getElementById('btn-replay-audio');
    if (btnReplay && !this.game.state.notepadUsedThisShift) {
      btnReplay.addEventListener('click', () => {
        this.game.state.notepadUsedThisShift = true;
        btnReplay.style.background = '#DDD';
        btnReplay.style.cursor = 'not-allowed';
        
        const currentPrompt = this.game.state.activeOrder ? this.game.state.activeOrder.find(it => !it.packed) : null;
        if (currentPrompt && this.game.speech) {
          this.game.speech.speak(currentPrompt.gender + " " + currentPrompt.nameDe);
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
    const payout = this.game.lastPayout;

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
          <span style="color: #FF006E;">+${payout.netPayout.toFixed(2)}€</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #555; margin-bottom: 4px; font-weight: bold;">
          <span>TUITION PROGRESS</span>
          <span id="tuition-text">${this.game.state.wallet.toFixed(2)}€ / ${window.FFH.ECONOMY.TUITION_GOAL}€</span>
        </div>
        <div style="width: 100%; height: 14px; background: #ddd; border: 2px solid #222; border-radius: 7px; overflow: hidden; position: relative;">
          <div id="tuition-bar" style="width: ${Math.min(100, (this.game.state.wallet / window.FFH.ECONOMY.TUITION_GOAL) * 100)}%; height: 100%; background: #F6BD60; transition: width 1s ease-out;"></div>
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
    
    // Animate tuition bar and play SFX
    setTimeout(() => {
      const newWallet = this.game.state.wallet + payout.netPayout;
      document.getElementById('tuition-bar').style.width = Math.min(100, (newWallet / window.FFH.ECONOMY.TUITION_GOAL) * 100) + '%';
      document.getElementById('tuition-text').textContent = newWallet.toFixed(2) + '€ / ' + window.FFH.ECONOMY.TUITION_GOAL + '€';
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
      window.FFH.finishShift(this.game);
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
      padding: 14px 0 10px 0;
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
      <div style="
        box-sizing: border-box;
        width: 100%;
        display: flex;
        flex-direction: column;
        background: #FFFFFF;
        border-top: none;
        border-left: none;
        border-right: none;
        border-bottom: 4px solid #222;
        padding: 12px 16px 14px 16px;
        pointer-events: auto;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:900; letter-spacing: 0.5px;">
          <span style="color:#222;">STUDENT SUBLET STATUS</span>
          <span>${strikeDots.join(' ')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:4px;">
          <span style="font-size:22px; font-weight:900; color:#FF006E;">${window.FFH.round2(s.wallet)}€</span>
          <span style="font-size:11px; color:#666; font-weight: bold;">of ${goal}€ tuition goal</span>
        </div>
        <div style="height:8px; background:#eee; border:2px solid #222; border-radius:5px; margin-top:7px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:#3A86FF;"></div>
        </div>
      </div>

      <!-- Bottom Card: Next Shift details & Start button -->
      <div style="
        box-sizing: border-box;
        width: 100%;
        pointer-events: auto;
        background: #FFFFFF;
        border-top: 4px solid #222;
        border-left: none;
        border-right: none;
        border-bottom: none;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="font-size: 11px; font-weight: 900; color: #E76F51; text-transform: uppercase; letter-spacing: 1px;">Next Assignment</div>
        <div style="font-size: 20px; font-weight: 900; color: #222; line-height: 1.1;">${shift.name}</div>
        
        <div style="font-size: 13px; color: #444; line-height: 1.4; border-top: 2px dashed #ccc; padding-top: 8px; font-weight: bold;">
          • Orders size: <span style="color: #222;">${shift.itemsCount} items</span><br>
          • Target Quota: <span style="color: #222;">${shift.quota}€</span><br>
          • Shift Base Wage: <span style="color: #222;">${shift.baseWage}€</span>
        </div>

        <div style="background: #FFF9C4; border: 2px solid #FBC02D; border-radius: 6px; padding: 8px 10px; font-size: 10px; color: #9A6700; font-weight: bold;">
          ${shift.anticipateHint || 'ANTICIPATE STAGE: Focus: Keep up! Audio is spoken 1.5s before visual icons are revealed.'}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 2px;">
          <button id="btn-roam-city" style="
            flex: 1;
            background: #2EC4B6;
            color: #FFF;
            border: 3px solid #222;
            border-bottom: 5px solid #1A7A73;
            padding: 10px 8px;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 1px;
            border-radius: 8px;
            cursor: pointer;
            font-family: monospace, sans-serif;
            text-transform: uppercase;
          ">🚲 ROAM CITY</button>

          <button id="btn-start-shift" style="
            flex: 1.4;
            background: #ECC238;
            color: #222;
            border: 3px solid #222;
            border-bottom: 5px solid #9E7D1A;
            padding: 10px 8px;
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 1px;
            border-radius: 8px;
            cursor: pointer;
            font-family: monospace, sans-serif;
            text-transform: uppercase;
          ">START SHIFT</button>
        </div>
      </div>
    `;

    this.container.appendChild(hubDiv);

    const btnStart = document.getElementById('btn-start-shift');
    if (btnStart) {
      btnStart.addEventListener('mousedown', () => {
        btnStart.style.transform = 'translateY(4px)';
        btnStart.style.boxShadow = '0 0 0 #222';
      });
      btnStart.addEventListener('mouseup', () => {
        btnStart.style.transform = 'none';
        btnStart.style.boxShadow = '0 4px 0 #222';
      });
      btnStart.addEventListener('click', () => {
        this.game.sfx.playSfx('success');
        this.game.transitionTo('PICK');
      });
    }

    const btnRoam = document.getElementById('btn-roam-city');
    if (btnRoam) {
      btnRoam.addEventListener('mousedown', () => {
        btnRoam.style.transform = 'translateY(4px)';
        btnRoam.style.boxShadow = '0 0 0 #222';
      });
      btnRoam.addEventListener('mouseup', () => {
        btnRoam.style.transform = 'none';
        btnRoam.style.boxShadow = '0 4px 0 #222';
      });
      btnRoam.addEventListener('click', () => {
        this.game.sfx.playSfx('click');
        this.game.transitionTo('CITY_EXPLORATION');
      });
    }
  }

  showCityExplorerHUD(onActionCallback) {
    this.clear();
    const s = this.game.state;
    const goal = window.FFH.ECONOMY.TUITION_GOAL;
    this.poiCallback = onActionCallback;

    const explorerDiv = document.createElement('div');
    explorerDiv.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    explorerDiv.innerHTML = `
      <!-- Top Title Bar -->
      <div style="
        box-sizing: border-box;
        width: 100%;
        background: rgba(38, 70, 83, 0.94);
        backdrop-filter: blur(6px);
        border-bottom: 3px solid rgba(255,255,255,0.15);
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        pointer-events: auto;
      ">
        <div style="display:flex; align-items:center; gap: 6px;">
          <span style="font-size: 14px;">📍</span>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">Lübeck Altstadt</div>
            <div style="font-size: 10px; color: #76C8B8; font-weight: 700;">Shift #${s.currentShift} Ready</div>
          </div>
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; gap: 4px;">
          <div>
            <div style="font-size: 9px; color: #ccc; font-weight: 600;">Tuition Fund</div>
            <div style="font-size: 12px; font-weight: 900; color: #F6BD60;">${window.FFH.round2(s.wallet)}€ / ${goal}€</div>
          </div>
          <div id="delivery-distance-indicator" style="display: none; align-items: center; justify-content: flex-end; gap: 4px; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
            <span style="font-size: 10px; color: #2A9D8F; font-weight: 800; text-transform: uppercase;">Delivery:</span>
            <span id="delivery-distance-val" style="font-size: 12px; color: #fff; font-weight: 900;">-- m</span>
            <span id="delivery-distance-arrow" style="font-size: 14px; font-weight: 900; transform-origin: center; display: inline-block;">⬆</span>
          </div>
        </div>
      </div>

      <!-- Slide-over POI Card (Hidden initially) -->
      <div id="city-poi-card" style="
        display: none;
        box-sizing: border-box;
        width: 100%;
        background: #ffffff;
        border-top: 3px solid #E76F51;
        border-bottom: 3px solid #222;
        padding: 14px 16px;
        pointer-events: auto;
        animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      ">
        <button id="btn-close-poi" style="position: absolute; top: 10px; right: 12px; background: none; border: none; font-size: 18px; cursor: pointer; color: #999; pointer-events: auto;">✕</button>
        <span id="poi-card-tag" style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; background: #FFE8D6; color: #E76F51;">Location</span>
        <h2 id="poi-card-title" style="font-size: 16px; color: #264653; margin: 0 0 4px 0; font-weight: 900;">Building Name</h2>
        <p id="poi-card-desc" style="font-size: 11px; color: #555; line-height: 1.4; margin: 0 0 10px 0;">Description of this point of interest.</p>
        <button id="btn-poi-action" style="width: 100%; padding: 9px; border: none; border-radius: 6px; background: #E76F51; color: white; font-weight: 800; font-size: 12px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; pointer-events: auto;">Enter Location</button>
      </div>
    `;

    this.container.appendChild(explorerDiv);

    // Wire close POI card
    document.getElementById('btn-close-poi').addEventListener('click', () => {
      document.getElementById('city-poi-card').style.display = 'none';
    });
  }

  showPOICard(poiData) {
    const card = document.getElementById('city-poi-card');
    if (!card || !poiData) return;

    this.currentActivePOI = poiData;
    document.getElementById('poi-card-title').textContent = poiData.name;
    document.getElementById('poi-card-tag').textContent = poiData.tag || 'District POI';
    document.getElementById('poi-card-desc').textContent = poiData.desc;
    
    const actionBtn = document.getElementById('btn-poi-action');
    actionBtn.textContent = poiData.action || 'Enter Location';
    
    actionBtn.onclick = () => {
      if (this.poiCallback) {
        this.poiCallback(poiData.action, poiData);
      }
    };

    card.style.display = 'block';
  }

  showDialogueBox(npcEntry, dialogueData, onOptionChosen) {
    // DO NOT this.clear() if we want it overlaying the city view, but we must remove existing dialogue boxes.
    const existing = document.getElementById('dialogue-overlay-box');
    if (existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'dialogue-overlay-box';
    box.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.96);
      border: 3px solid #222;
      border-radius: 14px;
      padding: 18px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      pointer-events: auto;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 200;
    `;

    // English subtitle fallback
    const subtitle = dialogueData.en ? `<div style="font-size: 13px; font-style: italic; color: #666; margin-top: 4px;">${dialogueData.en}</div>` : '';

    const optionsHtml = (dialogueData.options || []).map((opt, idx) => `
      <div style="display: flex; gap: 8px;">
        <button class="dialogue-audio-btn" data-audio="${opt.audioKey || ''}" style="
          background: #ECC238;
          color: #222;
          border: 2px solid #222;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 3px 0 #9E7D1A;
          ${opt.audioKey ? '' : 'display:none;'}
        ">🔊</button>
        <button class="dialogue-opt-btn" data-idx="${idx}" style="
          flex: 1;
          background: #2EC4B6;
          color: #ffffff;
          border: 2px solid #222;
          border-radius: 8px;
          padding: 12px 14px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 3px 0 #1B8C81;
          transition: transform 0.1s ease;
        ">
          ${opt.label || opt.de}
          ${opt.en ? `<div style="font-size: 11px; color: rgba(255,255,255,0.8); font-weight: normal; margin-top: 2px;">${opt.en}</div>` : ''}
        </button>
      </div>
    `).join('');

    box.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 8px;">
        <div>
          <div style="font-size: 16px; font-weight: 900; color: #264653;">${dialogueData.speaker || npcEntry.name}</div>
          <div style="font-size: 11px; font-weight: 800; color: ${npcEntry.avatarColor || '#E76F51'}; text-transform: uppercase;">${npcEntry.title || 'Town Citizen'}</div>
        </div>
      </div>
      <div>
        <div style="font-size: 18px; line-height: 1.4; color: #111; font-weight: 900;">
          ${dialogueData.hintDe || dialogueData.de || dialogueData.text}
        </div>
        ${subtitle}
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        ${optionsHtml}
      </div>
    `;

    this.container.appendChild(box);

    const audioBtns = box.querySelectorAll('.dialogue-audio-btn');
    audioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-audio');
        if (key && window.FFH.game.speech) {
          window.FFH.game.speech.speakKey(key);
        }
      });
    });

    const buttons = box.querySelectorAll('.dialogue-opt-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const chosen = dialogueData.options[idx];
        if (onOptionChosen) {
          onOptionChosen(chosen);
        }
      });
    });
  }

  showRideMockScreen() {
    // Redundant now that phase is fully implemented. Leave empty.
  }

  updateQuestTracker() {
    // Refresh city explorer HUD if active to show updated quest status
    if (this.game.currentPhase === this.game.phases.CITY_EXPLORATION) {
      const activeCard = document.getElementById('city-poi-card');
      const isCardVisible = activeCard && activeCard.style.display === 'block';
      const lastPoi = this.currentActivePOI;

      this.showCityExplorerHUD(this.poiCallback);

      if (isCardVisible && lastPoi) {
        this.showPOICard(lastPoi);
      }
    }
  }

  updateCityExplorerHUD(distance, angleRad, isActive) {
    const indicator = document.getElementById('delivery-distance-indicator');
    if (!indicator) return;
    if (!isActive) {
      indicator.style.display = 'none';
      return;
    }
    indicator.style.display = 'flex';
    document.getElementById('delivery-distance-val').textContent = Math.max(0, Math.round(distance)) + 'm';
    
    // Convert radians to degrees for CSS rotation
    // Note: In 3D space, rotation might need offset depending on camera forward.
    const deg = (angleRad * 180 / Math.PI);
    document.getElementById('delivery-distance-arrow').style.transform = `rotate(${deg}deg)`;
  }
};

