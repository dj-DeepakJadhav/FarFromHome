// HUD overlays renderer
window.FFH = window.FFH || {};

if (!window.FFH.UI) {
  window.FFH.UI = function(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  };
}

Object.assign(window.FFH.UI.prototype, {
  clear() {
    if (this.container) this.container.innerHTML = '';
  },

  fadeToBlack(durationMs, callback) {
    let overlay = document.getElementById('fade-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'fade-overlay';
      overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #000; z-index: 10000; opacity: 0; pointer-events: none; transition: opacity ' + durationMs + 'ms ease;';
      document.body.appendChild(overlay);
    }
    // force reflow
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    setTimeout(() => { if (callback) callback(); }, durationMs);
  },

  fadeFromBlack(durationMs, callback) {
    let overlay = document.getElementById('fade-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity ' + durationMs + 'ms ease';
      overlay.style.opacity = '0';
      setTimeout(() => { 
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (callback) callback(); 
      }, durationMs);
    } else {
      if (callback) callback();
    }
  },

  showGenericInteractionModal(template, onCompleteCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('generic-interaction-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'generic-interaction-modal';
    modal.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    let html = '';
    if (template.titleBadge) {
       html += `<div style="font-size: 11px; color: #2EC4B6; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px;">${template.titleBadge}</div>`;
    }
    if (template.title) {
       html += `<div style="font-size: 16px; font-weight: 900; margin-bottom: 8px;">${template.title}</div>`;
    }
    if (template.text) {
       html += `<div style="font-size: 13px; color: #4A5568; line-height: 1.4; margin-bottom: 12px;"><strong>${template.speaker ? template.speaker + ': ' : ''}</strong>${template.text}</div>`;
    }
    if (template.note) {
       html += `<div style="font-size: 12px; color: #718096; font-style: italic; margin-bottom: 12px;">${template.note}</div>`;
    }

    html += `<div id="generic-choices-container" style="display: flex; flex-direction: column; gap: 8px;"></div>`;
    modal.innerHTML = html;
    parent.appendChild(modal);

    const container = modal.querySelector('#generic-choices-container');
    if (template.choices) {
       template.choices.forEach((c, idx) => {
         const btn = document.createElement('button');
         btn.style.cssText = `
           display: flex; flex-direction: column; text-align: left;
           background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid ${c.borderLeft || '#2EC4B6'};
           border-radius: 8px; padding: 12px; font-family: inherit; font-size: 14px; font-weight: 700; color: #2D3748;
         `;
         let btnHtml = `<span>${c.label}</span>`;
         if (c.subtext) btnHtml += `<span style="font-size: 11px; color: #718096; font-weight: 400; margin-top: 4px;">${c.subtext}</span>`;
         btn.innerHTML = btnHtml;
         btn.onclick = () => {
            if (c.action) c.action(this.game);
            
            // Check if this choice should close the modal
            if (c.close !== false) {
               modal.remove();
               if (onCompleteCallback) onCompleteCallback();
            }
         };
         container.appendChild(btn);
       });
    }
  },

  updatePersistentHUD(state) {
    const hud = document.getElementById('persistent-hud');
    if (hud) {
      hud.innerHTML = ''; // Clear and disable overlapping persistent HUD
      
    }
  },

  // "Skip intro" appears only while the prologue is playing, which is a normal
  // affordance a first-time player already understands. It is deliberately not
  // on the main menu: a "start at shift 1" button there asks a new player to
  // choose without any context.
  showSkipIntro() {
    if (document.getElementById('ffh-skip-intro')) return;
    const parent = document.getElementById('game-container') || document.body;
    const el = document.createElement('button');
    el.id = 'ffh-skip-intro';
    el.textContent = 'Skip intro \u203A';
    el.style.cssText = `
      position: absolute;
      right: 10px;
      bottom: 12px;
      z-index: 99998;
      background: rgba(18, 24, 38, 0.72);
      color: rgba(255, 255, 255, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 999px;
      padding: 7px 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    `;
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (this.game && this.game.startFirstShift) {
        this.game.startFirstShift();
      }
    });
    parent.appendChild(el);
  },

  hideSkipIntro() {
    const el = document.getElementById('ffh-skip-intro');
    if (el) el.remove();
  },

  showTutorialBanner(text, color = '#E76F51', duration = 4000) {
    // If the city quest text is present, update it directly with a highlight pulse so there is zero UI overlapping
    const questTextEl = document.getElementById('city-quest-text');
    if (questTextEl) {
      questTextEl.innerHTML = `<span style="color: #E76F51; font-weight: 900;">${text}</span>`;
      return;
    }

    const parent = document.getElementById('game-container') || document.body;
    // Remove any previous banner to prevent overlap
    const prev = document.getElementById('ffh-tutorial-banner');
    if (prev) prev.remove();

    const el = document.createElement('div');
    el.id = 'ffh-tutorial-banner';
    el.innerHTML = `<span style="margin-right: 6px;">💡</span>${text}`;
    // Context-aware positioning: position in lower area (bottom: 75px) above item dock during PICK phase
    const isPickPhase = this.game && (this.game.currentPhase === this.game.phases.PICK || this.game.currentPhase === this.game.phases.PICK_ITEM);
    const topPositionCss = isPickPhase ? 'bottom: 75px; top: auto;' : 'top: 135px;';

    el.style.cssText = `
      position: absolute;
      ${topPositionCss}
      left: 14px;
      right: 14px;
      background: #FFFFFF;
      border-left: 4px solid ${color};
      border-right: 2px solid #264653;
      border-top: 2px solid #264653;
      border-bottom: 2px solid #264653;
      color: #264653;
      padding: ${isPickPhase ? '8px 12px' : '10px 14px'};
      border-radius: 8px;
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      font-weight: 800;
      font-size: ${isPickPhase ? '10.5px' : '11px'};
      line-height: 1.35;
      text-align: left;
      box-shadow: 0 6px 16px rgba(0,0,0,0.22);
      pointer-events: none;
      z-index: 10000;
      opacity: 0;
      transform: translateY(${isPickPhase ? '5px' : '-10px'});
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    parent.appendChild(el);

    // Fade in
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    // Fade out after duration
    setTimeout(() => {
      if (el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        setTimeout(() => el.remove(), 250);
      }
    }, duration);
  },

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
  },

  spawnWandererThought(text) {
    this.showThoughtBubble(text, 3800);
  },

  showThoughtBubble(text, duration = null) {
    const existing = document.getElementById('ffh-thought-bubble');
    if (existing) {
      if (existing._typewriterTimer) clearInterval(existing._typewriterTimer);
      existing.remove();
    }

    const el = document.createElement('div');
    el.id = 'ffh-thought-bubble';
    el.innerHTML = `<em id="thought-bubble-text" style="font-style:italic;"></em>`;
    
    const container = document.getElementById('game-container') || document.body;
    const contW = container.clientWidth || 390;
    const contH = container.clientHeight || 844;

    // Context-Aware Thought Bubble Placement:
    // - Room Phases (DIALOGUE, INTERIOR, SHOP): Positioned in upper 25% viewport (top: 15-20%) so it never overlaps the bottom 48vh conversation drawer or room interactables.
    // - Pick Minigame (PICK_ITEM): Positioned at very top (top: 10%) above rail.
    // - City Exploration (CITY_EXPLORATION): Positioned dynamically over player head in 3D screen space.
    let screenX = contW / 2;
    let screenY = contH * 0.20;
    
    const curPhase = this.game ? this.game.currentPhase : null;
    const curPhaseName = this.game ? (this.game.currentPhaseName || (curPhase && curPhase.constructor ? curPhase.constructor.name : '')) : '';

    if (curPhase && curPhase === this.game.phases.CITY_EXPLORATION) {
      const cityPhase = this.game.phases.CITY_EXPLORATION;
      const cam = this.game.cameras ? this.game.cameras.mainCamera : null;
      if (cityPhase && cityPhase.playerPos && cam) {
        const headPos = cityPhase.playerPos.clone();
        headPos.y += 1.8; // Height offset above player head
        headPos.project(cam);
        screenX = (headPos.x * 0.5 + 0.5) * contW;
        screenY = (-headPos.y * 0.5 + 0.5) * contH - 10; // Slightly above head
      }
    } else if (curPhase && (curPhase === this.game.phases.PICK_ITEM || curPhaseName.includes('Pick'))) {
      screenY = contH * 0.10; // Top of screen above pick shelf
    } else {
      // Room / Dialogue / Shop Phase: Place cleanly in top 22% viewport (room ceiling area)
      screenY = contH * 0.22;
    }

    // Clamp horizontally to stay cleanly visible inside the game viewport
    screenX = Math.max(145, Math.min(contW - 145, screenX));

    el.style.cssText = `
      position: absolute;
      left: ${screenX}px;
      top: ${screenY}px;
      transform: translate(-50%, -100%) scale(0.9);
      background: rgba(18, 24, 38, 0.94);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 2px solid #FFD166;
      border-radius: 16px;
      padding: 10px 16px;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.2px;
      line-height: 1.4;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      pointer-events: auto;
      cursor: pointer;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      width: max-content;
      max-width: 270px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      text-align: center;
    `;
    // Narration is skippable. The bubble used to be pointer-events:none, so a
    // player could not dismiss a line at all and act_one was 37s of dead air.
    el.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      if (window.FFH && typeof window.FFH.advanceProse === 'function') {
        window.FFH.advanceProse();
      } else {
        if (el._typewriterTimer) clearInterval(el._typewriterTimer);
        el.remove();
      }
    });

    container.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -120%) scale(1.0)';
    });

    const textTarget = el.querySelector('#thought-bubble-text');

    // Read all tunable params from CONFIG
    const TB = (window.FFH.CONFIG && window.FFH.CONFIG.ui && window.FFH.CONFIG.ui.thoughtBubble) || {};
    const typewriterEnabled   = TB.typewriterEnabled   !== undefined ? TB.typewriterEnabled   : false;
    const charsPerSec         = TB.typewriterCharsPerSec !== undefined ? TB.typewriterCharsPerSec : 31;
    const blipEveryN          = TB.blipEveryNChars     !== undefined ? TB.blipEveryNChars     : 3;
    const readingTimeMs       = TB.readingTimeMs       !== undefined ? TB.readingTimeMs       : 2800;
    const fadeMs              = TB.fadeMs              !== undefined ? TB.fadeMs              : 300;
    const charDelay           = Math.round(1000 / Math.max(1, charsPerSec));

    // Transition uses configured fade duration
    el.style.transition = `opacity ${fadeMs}ms ease-out, transform ${fadeMs}ms ease-out`;

    let typingDuration = 0;

    if (typewriterEnabled) {
      // Typewriter: reveal one character at a time
      let charIdx = 0;
      typingDuration = text.length * charDelay;

      el._typewriterTimer = setInterval(() => {
        if (charIdx < text.length) {
          textTarget.textContent += text[charIdx];
          if (blipEveryN > 0 && charIdx % blipEveryN === 0 && this.game && this.game.speech) {
            this.game.speech.playTalkBlip();
          }
          charIdx++;
        } else {
          clearInterval(el._typewriterTimer);
        }
      }, charDelay);
    } else {
      // Instant: show all text immediately, no sound ticking
      textTarget.textContent = text;
      typingDuration = 0;
    }

    // Total visible time: typing time + configured reading time
    const totalDuration = duration || (typingDuration + readingTimeMs);

    // Dismiss on tap/click
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    el.title = 'Click to dismiss';
    el.onclick = () => {
      if (el._typewriterTimer) clearInterval(el._typewriterTimer);
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -100%) scale(0.9)';
      setTimeout(() => el.remove(), fadeMs);
    };

    setTimeout(() => {
      if (el.parentNode) {
        if (el._typewriterTimer) clearInterval(el._typewriterTimer);
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -100%) scale(0.9)';
        setTimeout(() => el.remove(), fadeMs + 50);
      }
    }, totalDuration);
  },

  showCompassUI(direction) {
    let compass = document.getElementById('ffh-compass-ui');
    if (!compass) {
      compass = document.createElement('div');
      compass.id = 'ffh-compass-ui';
      compass.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        width: 44px;
        height: 44px;
        background: rgba(18, 24, 38, 0.85);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        color: #ECC238;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: none;
        z-index: 8000;
        transition: transform 0.2s ease-out;
      `;
      compass.innerHTML = '🧭';
      document.body.appendChild(compass);
    }
    compass.style.display = 'flex';
  },

  hideCompassUI() {
    const compass = document.getElementById('ffh-compass-ui');
    if (compass) {
      compass.style.display = 'none';
    }
  },

  triggerStampMoment(docTitle, docEmoji = '📜') {
    // 1. Audio: Amtsschimmel heavy stamp (*CLACK-THUD!*)
    if (this.game && this.game.sfx && this.game.sfx.playSfx) {
      this.game.sfx.playSfx('stamp');
    }

    // 2. Visual: 3D Camera screen shake
    if (this.game && this.game.triggerScreenShake) {
      this.game.triggerScreenShake();
    }

    // 3. Ink Splat & Stamping Stamp Overlay Animation
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 10005;
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(1px);
    `;

    overlay.innerHTML = `
      <div id="stamp-seal" style="
        background: #FFFFFF;
        border: 4px solid #A32218;
        border-radius: 16px;
        padding: 20px 24px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.35);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        transform: scale(2.2) rotate(-8deg);
        opacity: 0;
        transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.22s ease-out;
      ">
        <div style="font-size: 38px;">${docEmoji}</div>
        <div style="font-family: monospace; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; color: #A32218; text-transform: uppercase;">
          ★ AMTLICH BEGLAUBIGT ★
        </div>
        <div style="font-size: 16px; font-weight: 900; color: #1B1A21; text-align: center;">
          ${docTitle}
        </div>
        <div style="font-family: monospace; font-size: 10.5px; color: #2C6A4A; font-weight: 700;">
          [ DOSSIER STAMP SECURED ]
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Trigger slam-down impact animation
    requestAnimationFrame(() => {
      const seal = document.getElementById('stamp-seal');
      if (seal) {
        seal.style.opacity = '1';
        seal.style.transform = 'scale(1.0) rotate(-4deg)';
      }
    });

    // Fade out and clean up
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.style.transition = 'opacity 0.4s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);
      }
    }, 1800);
  },

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
  },

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
  },

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
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
    `;

    // Objective is exclusively driven by game.state.activeObjective (set by storyRunner).
    // If nothing is set the tracker is hidden (player roams freely until story sets the next goal).
    // The header bar starts hidden in a new game until the player's first interaction.
    const showHeader = (s.firstObjectiveRevealed || s.shift_no > 0);

    const objectiveText = s.activeObjective || '';

    this.refreshStats = (state) => {
      const s = state;
      const bodyEl = document.getElementById('stat-val-body');
      const heartEl = document.getElementById('stat-val-heart');
      
      if (bodyEl) {
        bodyEl.textContent = `⚡${s.body !== undefined ? s.body : 100}`;
        bodyEl.style.color = (s.body !== undefined && s.body < 30) ? '#E63946' : '#2A9D8F';
        // Flash red on change
        bodyEl.animate([{ color: '#FF0000', transform: 'scale(1.3)' }, { color: bodyEl.style.color, transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
      }
      
      if (heartEl) {
        heartEl.textContent = `❤️${s.heart !== undefined ? s.heart : 50}`;
        heartEl.style.color = (s.heart !== undefined && s.heart < 30) ? '#E63946' : '#FF006E';
        heartEl.animate([{ color: '#FF0000', transform: 'scale(1.3)' }, { color: heartEl.style.color, transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
      }
      
      const walletEl = document.getElementById('stat-val-wallet');
      if (walletEl && s.wallet !== undefined) {
        walletEl.textContent = `${s.wallet.toFixed(2)}€`;
      }
    };

    this.playObjectiveRevealSequence = (isBootSequence = false) => {
      const headerBar = document.getElementById('city-header-bar');
      const questTracker = document.getElementById('city-quest-tracker');
      const questText = document.getElementById('city-quest-text');
      
      const fadeElements = [
        document.getElementById('hud-day-box'),
        document.getElementById('hud-docs-box'),
        document.getElementById('hud-stats-box'),
        document.getElementById('hud-wallet-box'),
        document.getElementById('archetype-badge')
      ].filter(Boolean);
      
      if (headerBar) {
        if (isBootSequence) {
          headerBar.style.display = 'flex';
          headerBar.animate([
            { transform: 'translateY(-20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
          ], { duration: 600, easing: 'ease-out' });
        }

        const startTyping = () => {
          const textToType = this.game.state.activeObjective || '';
          if (questText) {
            questText.innerHTML = '';
            let i = 0;
            const typeChar = () => {
              if (i < textToType.length) {
                questText.innerHTML += textToType.charAt(i);
                if (this.game.sfx && i % 3 === 0) this.game.sfx.playSfx('click');
                i++;
                setTimeout(typeChar, 30);
              } else {
                onTypingFinished();
              }
            };
            typeChar();
          } else {
            onTypingFinished();
          }
        };

        if (isBootSequence) {
          setTimeout(startTyping, 600);
        } else {
          startTyping();
        }

        const onTypingFinished = () => {
          this.game.state.isTypingObjective = false;
          if (questTracker) {
            questTracker.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
            questTracker.style.boxShadow = '0 0 15px 4px #2EC4B6';
            questTracker.style.transform = 'scale(1.02)';
            if (this.game.sfx) this.game.sfx.playSfx('bell');
            
            setTimeout(() => {
              questTracker.style.boxShadow = 'none';
              questTracker.style.transform = 'none';
            }, 800);
          }

          if (this.game.currentPhase && this.game.currentPhase.revealCompass) {
            this.game.currentPhase.revealCompass();
          }

          if (isBootSequence) {
            fadeElements.forEach((el, index) => {
              setTimeout(() => {
                el.style.opacity = 1;
                el.animate([
                  { transform: 'translateY(-5px)', opacity: 0 },
                  { transform: 'translateY(0)', opacity: 1 }
                ], { duration: 400, easing: 'ease-out' });
              }, index * 250);
            });
            setTimeout(() => {
              s.firstObjectiveRevealed = true;
            }, fadeElements.length * 250 + 500);
          }
        };
      }
    };
    
    // Alias for backward compatibility with cityExplorationPhase.js
    this.triggerFirstObjectiveReveal = () => this.playObjectiveRevealSequence(true);

    explorerDiv.innerHTML = `
      <!-- Top Title & Unified Sleek Objective Header -->
      <div id="city-header-bar" style="
        display: ${showHeader ? 'flex' : 'none'};
        box-sizing: border-box;
        width: 100%;
        background: #FFFFFF;
        border: 2.5px solid #264653;
        border-radius: 12px;
        padding: 8px 12px;
        flex-direction: column;
        gap: 6px;
        color: #264653;
        pointer-events: auto;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        z-index: 100;
      ">
        <!-- Row 1: Day Clock, Wallet, and Dossier Tracker (4 Slots) -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 4px; overflow: visible;">
          <!-- Day Counter -->
          <div id="hud-day-box" style="
            background: #264653;
            color: #FFFFFF;
            border-radius: 8px;
            padding: 4px 6px;
            font-size: 11px;
            font-weight: 900;
            font-family: monospace;
            display: flex;
            align-items: center;
            gap: 2px;
            white-space: nowrap;
            opacity: ${s.firstObjectiveRevealed ? 1 : 0};
          ">
            <span>📅</span>
            <span>DAY ${s.day || 1}/28</span>
          </div>

          <!-- 4-Slot Dossier Tracker -->
          <div id="hud-docs-box" style="
            display: flex;
            align-items: center;
            gap: 3px;
            background: #F0F4F8;
            border: 1.5px solid #264653;
            border-radius: 8px;
            padding: 4px 5px;
            opacity: ${s.firstObjectiveRevealed ? 1 : 0};
          " title="Dossier: Uni, WG Lease, Anmeldung, Bank">
            <span style="font-size: 9px; font-weight: 900; color: #1D3557; margin-right: 1px;">DOCS:</span>
            <!-- Slot 1: Matriculation -->
            <span style="width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid ${s.isMatriculated ? '#2A9D8F' : '#999'}; background: ${s.isMatriculated ? '#2A9D8F' : '#FFF'}; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #FFF; font-weight: 900;" title="University Matriculation">${s.isMatriculated ? '🎓' : ''}</span>
            <!-- Slot 2: Lease -->
            <span style="width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid ${(s.hasApartment || s.has_lease || s.storyFlags?.landlordConfirmationSigned) ? '#2A9D8F' : '#999'}; background: ${(s.hasApartment || s.has_lease || s.storyFlags?.landlordConfirmationSigned) ? '#2A9D8F' : '#FFF'}; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #FFF; font-weight: 900;" title="Landlord Lease Confirmation">${(s.hasApartment || s.has_lease || s.storyFlags?.landlordConfirmationSigned) ? '🏠' : ''}</span>
            <!-- Slot 3: Anmeldung -->
            <span style="width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid ${(s.hasAnmeldung || s.has_anmeldung) ? '#2A9D8F' : '#999'}; background: ${(s.hasAnmeldung || s.has_anmeldung) ? '#2A9D8F' : '#FFF'}; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #FFF; font-weight: 900;" title="Bürgeramt Address Registration">${(s.hasAnmeldung || s.has_anmeldung) ? '📑' : ''}</span>
            <!-- Slot 4: Sperrkonto Bank -->
            <span style="width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid ${(s.isSperrkontoUnlocked || s.has_konto) ? '#2A9D8F' : '#999'}; background: ${(s.isSperrkontoUnlocked || s.has_konto) ? '#2A9D8F' : '#FFF'}; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #FFF; font-weight: 900;" title="Sparkasse Blocked Account Unlocked">${(s.isSperrkontoUnlocked || s.has_konto) ? '💳' : ''}</span>
          </div>

          <!-- Body & Heart Meters -->
          <div id="hud-stats-box" style="
            display: ${(s.actOneStarted || s.shift_no >= 0) ? 'flex' : 'none'};
            align-items: center;
            gap: 3px;
            background: #F8F9FA;
            border: 1.5px solid #264653;
            border-radius: 8px;
            padding: 3px 5px;
            font-size: 10px;
            font-weight: 900;
            font-family: monospace;
            white-space: nowrap;
            opacity: ${s.firstObjectiveRevealed ? 1 : 0};
          " title="Body Stamina & Heart Morale">
            <span id="stat-val-body" style="color: ${s.body < 30 ? '#E63946' : '#2A9D8F'}; transition: color 0.3s ease;">⚡${s.body !== undefined ? s.body : 100}</span>
            <span style="color: #666; margin: 0 1px;">|</span>
            <span id="stat-val-heart" style="color: ${s.heart < 30 ? '#E63946' : '#FF006E'}; transition: color 0.3s ease;">❤️${s.heart !== undefined ? s.heart : 50}</span>
          </div>

          <!-- Wallet Balance -->
          <div id="hud-wallet-box" style="
            background: #F8F9FA;
            border: 2px solid #264653;
            border-radius: 8px;
            padding: 4px 6px;
            display: flex;
            align-items: center;
            gap: 2px;
            white-space: nowrap;
            opacity: ${s.firstObjectiveRevealed ? 1 : 0};
          ">
            <span style="font-size: 12px;">💶</span>
            <div id="stat-val-wallet" style="font-size: 11.5px; font-weight: 900; color: #E76F51; font-family: monospace;">
              ${window.FFH.round2(s.wallet)}€
            </div>
          </div>
        </div>

        <!-- Row 2: Objective Tracker & Personality Archetype Badge -->
        <div style="display: flex; gap: 6px; align-items: stretch; width: 100%;">
          <div id="city-quest-tracker" style="
            box-sizing: border-box;
            flex: 1;
            background: #F0F4F8;
            border-left: 4px solid #2EC4B6;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 11.5px;
            color: #1D3557;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: ${s.activeObjective ? 1 : 0};
            transition: opacity 0.3s ease;
          ">
            <span style="font-size: 13px; flex-shrink: 0;">🎯</span>
            <span id="city-quest-text" style="line-height: 1.3;">${(s.firstObjectiveRevealed && !s.isTypingObjective) ? objectiveText : ''}</span>
          </div>

          <!-- Cumulative Archetype Badge & Pause / Profile Menu Button -->
          <div id="archetype-badge" style="
            background: #2B2D42;
            color: #E9C46A;
            border: 1.5px solid #264653;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            white-space: nowrap;
            cursor: pointer;
            pointer-events: auto;
            opacity: ${s.firstObjectiveRevealed ? 1 : 0};
          " title="Click to Pause Game & Open Menu">
            ${(() => {
              const d = s.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
              if (d.hustler >= d.bureaucrat && d.hustler >= d.diplomat && d.hustler > 0) return '⚡ Hustler';
              if (d.bureaucrat >= d.hustler && d.bureaucrat >= d.diplomat && d.bureaucrat > 0) return '📑 Bureaucrat';
              if (d.diplomat >= d.hustler && d.diplomat >= d.bureaucrat && d.diplomat > 0) return '🤝 Diplomat';
              return '⏸️ Menu';
            })()}
          </div>
        </div>

        <div id="delivery-distance-indicator" style="display: none; align-items: center; justify-content: flex-end; gap: 6px; background: #E8F5E9; padding: 4px 8px; border-radius: 4px; border: 1px solid #2A9D8F;">
          <span style="font-size: 9px; color: #2A9D8F; font-weight: 800; text-transform: uppercase;">Destination:</span>
          <span id="delivery-distance-val" style="font-size: 11px; color: #264653; font-weight: 900;">-- m</span>
          <span id="delivery-distance-arrow" style="font-size: 12px; font-weight: 900; color: #2A9D8F; transform-origin: center; display: inline-block;">⬆</span>
        </div>
      </div>

      <!-- Slide-over POI Card (Hidden permanently) -->
      <div id="city-poi-card" style="
        display: none !important;
        box-sizing: border-box;
        width: calc(100% - 24px);
        background: #FFFFFF;
        border: 2px solid #264653;
        border-top: 3px solid #E76F51;
        border-radius: 16px;
        padding: 14px 16px;
        pointer-events: auto;
        animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        z-index: 1000;
        margin: 0 auto 12px auto;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #EEE; padding-bottom: 4px;">
          <div>
            <div id="poi-card-title" style="font-size: 14px; font-weight: 900; color: #264653;">University of Lübeck</div>
            <div id="poi-card-tag" style="font-size: 10px; font-weight: 800; color: #E76F51; text-transform: uppercase;">Campus Center</div>
          </div>
          <button id="btn-close-poi" style="background: none; border: none; font-size: 14px; cursor: pointer; color: #888; font-weight: 900;">✕</button>
        </div>
        <div id="poi-card-desc" style="font-size: 11.5px; line-height: 1.35; color: #555;">
          Administrative headquarters. Finalize enrollment certificates and pay tuition.
        </div>
        <button id="btn-poi-action" style="
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-radius: 8px;
          background: #E76F51;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 3px 0 #D65A3C;
          transition: transform 0.05s ease, background-color 0.1s ease;
          pointer-events: auto;
        ">Enter Location</button>
      </div>
    `;

    this.container.appendChild(explorerDiv);

    // Wire Skills button
    const skillsBtn = document.getElementById('btn-open-skills');
    if (skillsBtn) {
      skillsBtn.addEventListener('click', () => {
        this.showSkillTreeModal();
      });
    }

    // Wire Profile / Pause Menu Badge button
    const profileBadge = document.getElementById('archetype-badge');
    if (profileBadge) {
      profileBadge.addEventListener('click', () => {
        if (this.game && this.game.sfx) this.game.sfx.playSfx('click');
        if (typeof this.showPauseModal === 'function') {
          this.showPauseModal();
        }
      });
    }

    const testNpcBtn = document.getElementById('btn-test-npc');
    if (testNpcBtn) {
      testNpcBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.game.currentPhase && typeof this.game.currentPhase.cycleTestNPC === 'function') {
          this.game.currentPhase.cycleTestNPC();
        }
      });
    }

    // Wire close POI card
    document.getElementById('btn-close-poi').addEventListener('click', () => {
      document.getElementById('city-poi-card').style.display = 'none';
    });

    // Wire settings menu button
    const btnSettings = document.getElementById('btn-settings-menu');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        if (window.FFH.saveGame) {
          window.FFH.saveGame(this.game);
        }
        this.game.transitionTo('BOOT');
      });
    }
  },

  showPOICard(poiData) {
    // Disabled (no POI location card popups ever appear)
    const card = document.getElementById('city-poi-card');
    if (card) card.style.display = 'none';
  },

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
  },

  showStoryOverlay(overlayData, onChoiceSelected) {
    const existing = document.getElementById('story-overlay-container');
    if (existing) existing.remove();

    const parent = document.getElementById('game-container') || document.body;
    const div = document.createElement('div');
    div.id = 'story-overlay-container';
    div.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const proseHtml = (overlayData.prose || []).map(p => `
      <p style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #1D3557;
        margin: 0 0 12px 0;
        font-weight: 500;
      ">${p}</p>
    `).join('');

    const choicesHtml = (overlayData.choices || []).map((ch, idx) => `
      <button class="btn-story-choice" data-idx="${ch.idx !== undefined ? ch.idx : idx}" style="
        width: 100%;
        background: #FFFFFF;
        color: #1D3557;
        border: 2px solid #264653;
        border-left: 5px solid ${idx === 0 ? '#2EC4B6' : '#E76F51'};
        border-radius: 12px;
        padding: 12px 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        text-align: left;
        line-height: 1.35;
        box-shadow: 0 3px 8px rgba(0,0,0,0.08);
        transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>${ch.label}</span>
      </button>
    `).join('');

    div.innerHTML = `
      <div style="
        max-width: 380px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        ${overlayData.prose && overlayData.prose.length ? `
        <div style="
          margin-bottom: 4px;
        ">
          ${proseHtml}
        </div>
        ` : ''}

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
          ${choicesHtml}
        </div>
      </div>
    `;

    parent.appendChild(div);

    div.querySelectorAll('.btn-story-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (this.game && this.game.sfx) {
          this.game.sfx.playSfx('click');
        }
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
          div.remove();
          if (onChoiceSelected) onChoiceSelected(idx);
        }, 200);
      });
    });
  },

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
});

