// HUD overlays renderer
window.FFH = window.FFH || {};

if (!window.FFH.UI) {
  window.FFH.UI = function(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  };
}

Object.assign(window.FFH.UI.prototype, {
  spawnFloatingText(text, clientX, clientY, color = '#2A9D8F') {
    const parent = document.getElementById('game-container') || document.body;
    const rect = parent.getBoundingClientRect();
    const label = document.createElement('div');
    label.textContent = text;
    label.setAttribute('role', 'status');
    label.style.cssText = `position:absolute;z-index:10001;pointer-events:none;
      max-width:90%;padding:6px 10px;border:2px solid #14213D;border-radius:8px;
      background:#fff;font:800 14px sans-serif;text-align:center;`;
    label.style.color = color;
    label.style.left = Math.max(rect.width * 0.25, Math.min(rect.width * 0.75, clientX - rect.left)) + 'px';
    label.style.top = Math.max(24, Math.min(rect.height - 48, clientY - rect.top)) + 'px';
    label.style.transform = 'translate(-50%, -100%)';
    parent.appendChild(label);
    const animation = label.animate([
      { opacity: 1, transform: 'translate(-50%, -100%)' },
      { opacity: 0, transform: 'translate(-50%, -180%)' }
    ], { duration: 1000, easing: 'ease-out' });
    animation.onfinish = () => label.remove();
  },

  showPickOutcome(kind, detail = '') {
    const parent = document.getElementById('game-container') || document.body;
    const previous = document.getElementById('ffh-pick-outcome');
    if (previous) previous.remove();

    const outcomes = {
      early: { label: 'EARLY PICK  ×2.0', color: '#FFB703', border: '#8A5B00' },
      correct: { label: 'CORRECT PICK', color: '#2A9D8F', border: '#145A55' },
      wrong: { label: 'WRONG SHELF', color: '#E63946', border: '#8D1D2A' }
    };
    const outcome = outcomes[kind] || outcomes.correct;
    const el = document.createElement('div');
    el.id = 'ffh-pick-outcome';
    el.setAttribute('role', 'status');
    el.innerHTML = `<strong>${outcome.label}</strong>${detail ? `<span>${detail}</span>` : ''}`;
    el.style.cssText = `
      position:absolute; left:50%; bottom:128px; transform:translate(-50%, 10px) scale(.94);
      z-index:10002; pointer-events:none; min-width:150px; box-sizing:border-box;
      padding:8px 12px; border:3px solid ${outcome.border}; border-radius:10px;
      background:#FFFFFF; color:${outcome.border}; text-align:center;
      box-shadow:0 4px 0 ${outcome.border}, 0 9px 16px rgba(0,0,0,.2);
      opacity:0; transition:opacity .16s ease-out, transform .16s ease-out;
      font-family:var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      font-size:12px; letter-spacing:.35px;
    `;
    const detailEl = el.querySelector('span');
    if (detailEl) detailEl.style.cssText = 'display:block;margin-top:2px;color:#264653;font-size:10px;font-weight:800;letter-spacing:0;';
    parent.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, 0) scale(1)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -8px) scale(.98)';
      setTimeout(() => el.remove(), 180);
    }, 1100);
  },

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

  // The run readout, owned in one place and rendered into #game-container so
  // that ui.clear() cannot wipe it on a phase change. This was previously a
  // stub that blanked #persistent-hud and drew nothing, which is why the day
  // counter and wallet disappeared the moment you entered a conversation.
  //
  // Energy and Heart are deliberately absent. They have no consequence in Acts
  // I and II: nothing gates on heart anywhere, and body is read by a single
  // Act III condition. The state and the story effects are untouched.
  // Full-screen modals own the whole screen. The run strip is redundant behind
  // one (the shift receipt shows the wallet and the tuition bar itself) and its
  // objective line is usually stale in that moment. Suppression survives
  // re-renders because updatePersistentHUD re-applies it after rebuilding.
  // Cancel anything transient that would sit on top of a modal: an in-flight
  // narration bubble (z-index 99999, so it beats every modal) and any tutorial
  // banner. A payslip should not have the previous shift's narration over it.
  clearTransientOverlays() {
    if (this.game && this.game.storyRunner && this.game.storyRunner.cancelProseQueue) {
      this.game.storyRunner.cancelProseQueue();
    }
    const bubble = document.getElementById('ffh-thought-bubble');
    if (bubble) {
      if (bubble._typewriterTimer) clearInterval(bubble._typewriterTimer);
      bubble.remove();
    }
    const banner = document.getElementById('ffh-tutorial-banner');
    if (banner) banner.remove();
  },

  // The run strip sits at z-index 9000 and has now collided with three
  // different modals (the payslip, the pause sheet, a POI card). Rather than
  // patch each of ~14 modal creators, watch the DOM: while any modal is on
  // screen the strip yields, and it comes back when the modal closes.
  //
  // Matches any element whose id ends in "-modal", plus the handful of
  // full-screen surfaces that predate that convention.
  startHudModalWatch() {
    if (this._modalWatch) return;
    const MODAL_IDS = ['city-poi-card', 'ffh-shift-receipt', 'ffh-slots-modal'];
    const anyModalOpen = () => {
      const nodes = document.querySelectorAll('[id$="-modal"], #' + MODAL_IDS.join(', #'));
      for (const n of nodes) {
        const s = getComputedStyle(n);
        if (s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05) return true;
      }
      return false;
    };
    const sync = () => {
      const open = anyModalOpen();
      if (open !== this._modalWasOpen) {
        this._modalWasOpen = open;
        this.setHudHidden(open);
      }
    };
    const parent = document.getElementById('game-container') || document.body;
    this._modalWatch = new MutationObserver(sync);
    this._modalWatch.observe(parent, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    sync();
  },

  setHudHidden(hidden) {
    this._hudHidden = !!hidden;
    const el = document.getElementById('ffh-persistent-hud');
    if (el) el.style.display = this._hudHidden ? 'none' : 'flex';
  },

  // Money that snaps from one number to another does not read as a transaction.
  // Counting it makes the economy legible, which matters most in a silent video.
  countUp(el, from, to, ms, suffix) {
    if (!el) return;
    if (el._countTimer) cancelAnimationFrame(el._countTimer);
    const start = performance.now();
    const delta = to - from;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (from + delta * eased).toFixed(2) + (suffix || '');
      if (t < 1) {
        el._countTimer = requestAnimationFrame(tick);
      } else {
        el._countTimer = null;
      }
    };
    el._countTimer = requestAnimationFrame(tick);
  },

  updatePersistentHUD(state) {
    const s = state || (this.game && this.game.state);
    if (!s) return;

    const parent = document.getElementById('game-container') || document.body;
    let hud = document.getElementById('ffh-persistent-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'ffh-persistent-hud';
      hud.style.cssText = `
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        z-index: 9000;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      parent.appendChild(hud);
      this.startHudModalWatch();

      // Delegated: updatePersistentHUD rebuilds its markup constantly, so
      // per-element listeners would be lost on the next wallet change.
      hud.addEventListener('click', (ev) => {
        const menu = ev.target.closest('#ffh-hud-menu');
        if (menu) {
          if (this.game && this.game.sfx) this.game.sfx.playSfx('click');
          if (typeof this.showPauseModal === 'function') this.showPauseModal();
          return;
        }
      });
    }

    const goal = (window.FFH.ECONOMY && window.FFH.ECONOMY.TUITION_GOAL) || 250;
    const wallet = window.FFH.round2(s.wallet || 0);
    const pct = Math.max(0, Math.min(100, (wallet / goal) * 100));
    const days = (window.FFH.ECONOMY && window.FFH.ECONOMY.VISA_DAYS) || 28;

    const hasLease = !!(s.hasApartment || s.has_lease || (s.storyFlags && s.storyFlags.landlordConfirmationSigned));
    const docs = [
      { on: !!(s.isMatriculated || s.matriculated), label: 'University' },
      { on: hasLease, label: 'Lease' },
      { on: !!(s.hasAnmeldung || s.has_anmeldung), label: 'Anmeldung' },
      { on: !!(s.isSperrkontoUnlocked || s.has_konto), label: 'Bank' }
    ];
    const docBoxes = docs.map(d => `
      <span title="${d.label}" style="
        width: 13px; height: 13px; border-radius: 3px;
        border: 2px solid ${d.on ? '#2A9D8F' : '#9AA5B1'};
        background: ${d.on ? '#2A9D8F' : '#FFFFFF'};
        display: inline-block;
        transition: background 0.35s ease, border-color 0.35s ease;
      "></span>`).join('');

    const objective = s.activeObjective ? String(s.activeObjective) : '';
    const storyScene = this.game.storyRunner && this.game.storyRunner.currentScene;
    const showSkip = storyScene && storyScene.act === 'I' && !s.gender_shelf_sort;

    // Range to the objective is stored on the UI, not read out of the DOM.
    // updatePersistentHUD rebuilds its innerHTML on every call, so anything
    // written straight into those nodes was wiped the next time the wallet
    // moved. This is the minimap replacement, so it has to survive re-renders.
    const range = this._objRange || { active: false, metres: '--m', deg: 0 };

    hud.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 3px solid #14213D;
        border-radius: 12px;
        box-shadow: 0 4px 0 #14213D;
        padding: 7px 10px 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="font-size: 11px; font-weight: 900; color: #14213D; letter-spacing: 0.6px;">
            DAY ${s.day || 1}/${days}
          </span>
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="display: flex; align-items: center; gap: 4px;">${docBoxes}</span>
            <button id="ffh-hud-menu" title="Pause & menu" style="
              pointer-events: auto;
              width: 26px; height: 22px;
              padding: 0;
              border: 2px solid #14213D;
              border-radius: 6px;
              background: #14213D;
              color: #F6BD60;
              font-size: 11px;
              font-weight: 900;
              line-height: 1;
              cursor: pointer;
            ">II</button>
          </span>
        </div>

        <div>
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 3px;">
            <span id="ffh-hud-wallet" style="font-size: 13px; font-weight: 900; color: #14213D; font-variant-numeric: tabular-nums;">
              ${wallet.toFixed(2)}€
            </span>
            <span style="font-size: 10px; font-weight: 800; color: #6B7280;">
              of ${goal}€ tuition
            </span>
          </div>
          <div style="height: 8px; background: #E5E7EB; border-radius: 999px; overflow: hidden; border: 1px solid #14213D;">
            <div id="ffh-tuition-fill" style="
              width: ${pct}%;
              height: 100%;
              background: #F6BD60;
              transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            "></div>
          </div>
        </div>
        <div id="ffh-objective-row" style="
          display: ${objective ? 'flex' : 'none'};
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 2px;
          padding-top: 6px;
          border-top: 2px dashed #C7CEDB;
          font-size: 11px;
          font-weight: 800;
          color: #14213D;
          line-height: 1.3;
        ">
          <span style="flex: 1; min-width: 0;">${objective}</span>
          <span id="ffh-objective-range" style="
            display: ${range.active ? 'inline-flex' : 'none'};
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
            font-variant-numeric: tabular-nums;
            color: #2A9D8F;
            font-weight: 900;
          ">
            <span id="ffh-objective-dist">${range.metres}</span>
            <span id="ffh-objective-arrow" style="display: inline-block; transform-origin: center; transform: rotate(${range.deg}deg);">\u2B06</span>
          </span>
        </div>
      </div>

    `;
  },

  // Full-screen modals own the whole screen. The run strip is redundant behind
  // one (the shift receipt shows the wallet and the tuition bar itself) and its
  // objective line is usually stale in that moment. Suppression survives
  // re-renders because updatePersistentHUD re-applies it after rebuilding.
  // Cancel anything transient that would sit on top of a modal: an in-flight
  // narration bubble (z-index 99999, so it beats every modal) and any tutorial
  // banner. A payslip should not have the previous shift's narration over it.
  clearTransientOverlays() {
    if (this.game && this.game.storyRunner && this.game.storyRunner.cancelProseQueue) {
      this.game.storyRunner.cancelProseQueue();
    }
    const bubble = document.getElementById('ffh-thought-bubble');
    if (bubble) {
      if (bubble._typewriterTimer) clearInterval(bubble._typewriterTimer);
      bubble.remove();
    }
    const banner = document.getElementById('ffh-tutorial-banner');
    if (banner) banner.remove();
  },

  setHudHidden(hidden) {
    this._hudHidden = !!hidden;
    const el = document.getElementById('ffh-persistent-hud');
    if (el) el.style.display = this._hudHidden ? 'none' : 'flex';
  },

  // Money that snaps from one number to another does not read as a transaction.
  // Counting it makes the economy legible, which matters most in a silent video.
  countUp(el, from, to, ms, suffix) {
    if (!el) return;
    if (el._countTimer) cancelAnimationFrame(el._countTimer);
    const start = performance.now();
    const delta = to - from;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (from + delta * eased).toFixed(2) + (suffix || '');
      if (t < 1) {
        el._countTimer = requestAnimationFrame(tick);
      } else {
        el._countTimer = null;
      }
    };
    el._countTimer = requestAnimationFrame(tick);
  },

  updatePersistentHUD(state) {
    const s = state || (this.game && this.game.state);
    if (!s) return;

    const parent = document.getElementById('game-container') || document.body;
    let hud = document.getElementById('ffh-persistent-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'ffh-persistent-hud';
      hud.style.cssText = `
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        z-index: 9000;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      parent.appendChild(hud);

      // Delegated: updatePersistentHUD rebuilds its markup constantly, so
      // per-element listeners would be lost on the next wallet change.
      hud.addEventListener('click', (ev) => {
        const menu = ev.target.closest('#ffh-hud-menu');
        if (menu) {
          if (this.game && this.game.sfx) this.game.sfx.playSfx('click');
          if (typeof this.showPauseModal === 'function') this.showPauseModal();
          return;
        }
      });
    }

    const goal = (window.FFH.ECONOMY && window.FFH.ECONOMY.TUITION_GOAL) || 250;
    const wallet = window.FFH.round2(s.wallet || 0);
    const pct = Math.max(0, Math.min(100, (wallet / goal) * 100));
    const days = (window.FFH.ECONOMY && window.FFH.ECONOMY.VISA_DAYS) || 28;

    const hasLease = !!(s.hasApartment || s.has_lease || (s.storyFlags && s.storyFlags.landlordConfirmationSigned));
    const docs = [
      { on: !!(s.isMatriculated || s.matriculated), label: 'University' },
      { on: hasLease, label: 'Lease' },
      { on: !!(s.hasAnmeldung || s.has_anmeldung), label: 'Anmeldung' },
      { on: !!(s.isSperrkontoUnlocked || s.has_konto), label: 'Bank' }
    ];
    const docBoxes = docs.map((d, i) => `
      <span id="ffh-doc-${i}" title="${d.label}" style="
        width: 13px; height: 13px; border-radius: 3px;
        border: 2px solid ${d.on ? '#2A9D8F' : '#9AA5B1'};
        background: ${d.on ? '#2A9D8F' : '#FFFFFF'};
        display: inline-block;
        transition: background 0.35s ease, border-color 0.35s ease;
      "></span>`).join('');

    const objective = s.activeObjective ? String(s.activeObjective) : '';
    const storyScene = this.game.storyRunner && this.game.storyRunner.currentScene;
    const showSkip = storyScene && storyScene.act === 'I' && !s.gender_shelf_sort;

    // Range to the objective is stored on the UI, not read out of the DOM.
    // updatePersistentHUD rebuilds its innerHTML on every call, so anything
    // written straight into those nodes was wiped the next time the wallet
    // moved. This is the minimap replacement, so it has to survive re-renders.
    const range = this._objRange || { active: false, metres: '--m', deg: 0 };

    hud.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 3px solid #14213D;
        border-radius: 12px;
        box-shadow: 0 4px 0 #14213D;
        padding: 7px 10px 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span id="ffh-hud-day" style="font-size: 11px; font-weight: 900; color: #14213D; letter-spacing: 0.6px;">
            DAY ${s.day || 1}/${days}
          </span>
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="display: flex; align-items: center; gap: 4px;">${docBoxes}</span>
            <button id="ffh-hud-menu" title="Pause & menu" style="
              pointer-events: auto;
              width: 26px; height: 22px;
              padding: 0;
              border: 2px solid #14213D;
              border-radius: 6px;
              background: #14213D;
              color: #F6BD60;
              font-size: 11px;
              font-weight: 900;
              line-height: 1;
              cursor: pointer;
            ">II</button>
          </span>
        </div>

        <div>
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 3px;">
            <span id="ffh-hud-wallet" style="font-size: 13px; font-weight: 900; color: #14213D; font-variant-numeric: tabular-nums;">
              ${wallet.toFixed(2)}€
            </span>
            <span style="font-size: 10px; font-weight: 800; color: #6B7280;">
              of ${goal}€ tuition
            </span>
          </div>
          <div style="height: 8px; background: #E5E7EB; border-radius: 999px; overflow: hidden; border: 1px solid #14213D;">
            <div id="ffh-tuition-fill" style="
              width: ${pct}%;
              height: 100%;
              background: #F6BD60;
              transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            "></div>
          </div>
        </div>
        <div id="ffh-objective-row" style="
          display: ${objective ? 'flex' : 'none'};
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 2px;
          padding-top: 6px;
          border-top: 2px dashed #C7CEDB;
          font-size: 11px;
          font-weight: 800;
          color: #14213D;
          line-height: 1.3;
        ">
          <span style="flex: 1; min-width: 0;">${objective}</span>
          <span id="ffh-objective-range" style="
            display: ${range.active ? 'inline-flex' : 'none'};
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
            font-variant-numeric: tabular-nums;
            color: #2A9D8F;
            font-weight: 900;
          ">
            <span id="ffh-objective-dist">${range.metres}</span>
            <span id="ffh-objective-arrow" style="display: inline-block; transform-origin: center; transform: rotate(${range.deg}deg);">\u2B06</span>
          </span>
        </div>
      </div>

    `;

    // Feedback for values that just changed. This must run AFTER the rebuild
    // above: innerHTML replaces every node, so the doc boxes' CSS transition
    // could never fire, because the element animating was always brand new
    // with no previous state. Previous values are kept on the UI object rather
    // than read back out of the DOM.
    this.flashHudChanges(s, wallet, docs);
  },

  // Pulse the HUD where a number moved, and float a delta chip beside it.
  // Chips live in their own overlay, a sibling of #ffh-persistent-hud, so the
  // next wallet change cannot wipe them mid-animation.
  flashHudChanges(s, wallet, docs) {
    const docMask = docs.map(d => (d.on ? 1 : 0)).join('');
    const prev = this._hudPrev;
    this._hudPrev = { wallet, day: s.day || 1, docMask };
    if (!prev) return;                      // first render: nothing to compare

    const pulse = (el, color) => {
      if (!el || !el.animate) return;
      el.animate([
        { transform: 'scale(1)',    filter: 'brightness(1)' },
        { transform: 'scale(1.28)', filter: 'brightness(1.5)' },
        { transform: 'scale(1)',    filter: 'brightness(1)' }
      ], { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      if (color) {
        const before = el.style.color;
        el.style.color = color;
        setTimeout(() => { el.style.color = before; }, 520);
      }
    };

    // Wallet: count the number toward its new value and float the delta.
    if (Math.abs(wallet - prev.wallet) >= 0.01) {
      const delta = window.FFH.round2(wallet - prev.wallet);
      const up = delta > 0;
      const walletEl = document.getElementById('ffh-hud-wallet');
      if (walletEl) {
        this.countUp(walletEl, prev.wallet, wallet, 850, '\u20AC');
        pulse(walletEl, up ? '#2A9D8F' : '#E63946');
      }
      this.spawnHudChip((up ? '+' : '') + delta.toFixed(2) + '\u20AC',
                        up ? '#2A9D8F' : '#E63946');
    }

    // Day rollover.
    if ((s.day || 1) !== prev.day) {
      pulse(document.getElementById('ffh-hud-day'), '#F6BD60');
      this.spawnHudChip('DAY ' + (s.day || 1), '#F6BD60');
    }

    // A document box turning green is the point of the whole run, so it gets
    // the loudest cue in the HUD.
    if (docMask !== prev.docMask) {
      docs.forEach((d, i) => {
        if (d.on && prev.docMask[i] === '0') {
          const box = document.getElementById('ffh-doc-' + i);
          if (box && box.animate) {
            box.animate([
              { transform: 'scale(1)',   boxShadow: '0 0 0 0 rgba(42,157,143,0.9)' },
              { transform: 'scale(1.9)', boxShadow: '0 0 0 9px rgba(42,157,143,0)' },
              { transform: 'scale(1)',   boxShadow: '0 0 0 0 rgba(42,157,143,0)' }
            ], { duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          }
          this.spawnHudChip(d.label.toUpperCase() + ' SECURED', '#2A9D8F');
          if (this.game && this.game.sfx && this.game.sfx.playSfx) {
            this.game.sfx.playSfx('success');
          }
        }
      });
    }
  },

  // A short-lived chip that rises and fades just under the HUD card.
  spawnHudChip(text, color) {
    const parent = document.getElementById('game-container') || document.body;
    let layer = document.getElementById('ffh-hud-feedback');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'ffh-hud-feedback';
      layer.style.cssText = `
        position: absolute; top: 84px; left: 0; right: 0;
        z-index: 9001; pointer-events: none;
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      `;
      parent.appendChild(layer);
    }
    const chip = document.createElement('div');
    chip.textContent = text;
    chip.style.cssText = `
      background: #FFFFFF; color: ${color};
      border: 2.5px solid ${color}; border-radius: 999px;
      padding: 3px 11px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px; font-weight: 900; letter-spacing: 0.4px;
    `;
    layer.appendChild(chip);
    if (chip.animate) {
      const anim = chip.animate([
        { opacity: 0, transform: 'translateY(8px) scale(0.9)' },
        { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.18 },
        { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.7 },
        { opacity: 0, transform: 'translateY(-14px) scale(0.96)' }
      ], { duration: 1500, easing: 'ease-out' });
      anim.onfinish = () => chip.remove();
    } else {
      setTimeout(() => chip.remove(), 1500);
    }
  },

  showTutorialBanner(text, color = '#E76F51', duration = null) {
    // Used to hijack #city-quest-text when it existed, which also meant a
    // tutorial line silently overwrote the player's objective. That element is
    // gone and the objective is owned by the persistent strip, so this always
    // draws its own banner now.
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

    // Dynamic character-length reading speed for banners:
    const charCount = (text || '').length;
    const bannerDuration = (duration !== null && typeof duration === 'number')
      ? duration
      : Math.min(10000, Math.max(3000, 1500 + charCount * 65));

    // Fade out after duration
    setTimeout(() => {
      if (el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        setTimeout(() => el.remove(), 250);
      }
    }, bannerDuration);
  },

  showDialogProgress(currentStep, totalSteps) {
    // Intentionally un-implemented.
  },

  spawnWandererThought(text) {
    this.showThoughtBubble(text);
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
      // Clear of the persistent HUD strip, which occupies roughly the top 100px.
      screenY = contH * 0.26;
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
      background: #FFFFFF;
      border: 3px solid #14213D;
      border-radius: 14px;
      padding: 10px 16px;
      color: #14213D;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 0.2px;
      line-height: 1.4;
      box-shadow: 0 5px 0 #14213D, 0 10px 18px rgba(0, 0, 0, 0.28);
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
    const fadeMs              = TB.fadeMs              !== undefined ? TB.fadeMs              : 300;
    const charDelay           = Math.round(1000 / Math.max(1, charsPerSec));

    // Dynamic Reading Speed calculation based on character count:
    // Base reaction/perception delay (1.5s) + 65ms per character (~15 chars/sec / ~180 WPM), bounded between 2.5s and 12.0s
    const baseBufferMs  = TB.baseBufferMs  !== undefined ? TB.baseBufferMs  : 1500;
    const msPerChar     = TB.msPerChar     !== undefined ? TB.msPerChar     : 65;
    const minDurationMs = TB.minDurationMs !== undefined ? TB.minDurationMs : 2500;
    const maxDurationMs = TB.maxDurationMs !== undefined ? TB.maxDurationMs : 12000;

    const charCount = (text || '').length;
    const calculatedReadingMs = Math.min(maxDurationMs, Math.max(minDurationMs, baseBufferMs + (charCount * msPerChar)));

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

    // Total visible time: use dynamic calculated reading time, or larger if explicit duration passed
    const totalDuration = (duration && typeof duration === 'number')
      ? Math.max(duration, typingDuration + calculatedReadingMs)
      : (typingDuration + calculatedReadingMs);

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

    // Count from whatever was last on screen, so a payout or a purchase reads
    // as money moving rather than a number blinking to a new value.
    const prev = (this._hudLastWallet === undefined) ? wallet : this._hudLastWallet;
    if (Math.abs(prev - wallet) > 0.005) {
      this.countUp(document.getElementById('ffh-hud-wallet'), prev, wallet, 900, '\u20AC');
    }
    this._hudLastWallet = wallet;

    if (this._hudHidden) hud.style.display = 'none';
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
      // Energy and Heart are no longer rendered (no consequence in Acts I-II),
      // so the #stat-val-body / #stat-val-heart writes that used to live here
      // were updating elements that do not exist. State is untouched.
      const walletEl = document.getElementById('stat-val-wallet');
      if (walletEl && s.wallet !== undefined) {
        walletEl.textContent = `${s.wallet.toFixed(2)}€`;
      }
    };

    // The objective now lives in the persistent run strip, so this no longer
    // types text into #city-quest-text or pulses #city-quest-tracker: both were
    // removed with the old city header bar, and the 82 lines that animated them
    // had been running against nulls ever since. What callers actually rely on
    // is the state flip and the reveal chime.
    this.playObjectiveRevealSequence = (isBootSequence = false) => {
      const s = this.game && this.game.state;
      if (!s) return;

      s.isTypingObjective = false;
      s.firstObjectiveRevealed = true;

      if (this.updatePersistentHUD) this.updatePersistentHUD(s);
      if (isBootSequence && this.game.sfx) this.game.sfx.playSfx('bell');
    };

    this.triggerFirstObjectiveReveal = () => this.playObjectiveRevealSequence(true);

    explorerDiv.innerHTML = `
      <!-- Top Title & Unified Sleek Objective Header -->
      <!-- Day, wallet, docs and the objective all live in the persistent run
           strip now (updatePersistentHUD). This bar used to carry duplicates of
           all four, so it rendered as a second white card behind the strip with
           its own objective line in a different colour. It is now just an
           invisible holder for the Menu badge, parked below the strip. -->
      <div id="city-header-bar" style="
        display: none;
        box-sizing: border-box;
        width: 100%;
        margin-top: 104px;
        background: transparent;
        border: none;
        padding: 0;
        flex-direction: column;
        gap: 6px;
        align-items: flex-end;
        color: #264653;
        pointer-events: auto;
        z-index: 100;
      ">
        <!-- Row 1: Day Clock, Wallet, and Dossier Tracker (4 Slots) -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 4px; overflow: visible;">
          <!-- Day Counter -->
          <div style="display:none"></div>
        </div>

        <div id="delivery-distance-indicator" style="display: none; align-items: center; justify-content: flex-end; gap: 6px; background: #E8F5E9; padding: 4px 8px; border-radius: 4px; border: 1px solid #2A9D8F;">
          <span style="font-size: 9px; color: #2A9D8F; font-weight: 800; text-transform: uppercase;">Destination:</span>
          <span id="delivery-distance-val" style="font-size: 11px; color: #264653; font-weight: 900;">-- m</span>
          <span id="delivery-distance-arrow" style="font-size: 12px; font-weight: 900; color: #2A9D8F; transform-origin: center; display: inline-block;">⬆</span>
        </div>
      </div>

      <button id="ffh-city-view-button" type="button" aria-label="Rotate city view" title="Rotate city view" style="
        position:absolute; right:12px; bottom:92px; width:48px; height:48px;
        border:3px solid #14213D; border-radius:50%; background:#FFFFFF;
        color:#264653; box-shadow:0 4px 0 #14213D, 0 8px 14px rgba(0,0,0,.2);
        font:900 18px/1 sans-serif; pointer-events:auto; cursor:pointer; z-index:101;
      ">↻</button>

    `;

    this.container.appendChild(explorerDiv);

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

    const cityViewButton = document.getElementById('ffh-city-view-button');
    if (cityViewButton) {
      cityViewButton.addEventListener('pointerdown', (event) => event.stopPropagation());
      cityViewButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const city = this.game && this.game.phases && this.game.phases.CITY_EXPLORATION;
        if (city && city.cameraController && city.cameraController.rotateStep) {
          city.cameraController.rotateStep();
          if (this.game.sfx) this.game.sfx.playSfx('click');
        }
      });
    }
  },

  showPOICard(poiData) {
    // Disabled (no POI location card popups ever appear)
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

  // Range and heading to the current objective. This is the deliberate
  // alternative to a minimap, so it lives inside the objective pill in the
  // persistent strip: what you are doing and how far away it is, together.
  // The legacy #delivery-distance-indicator is still updated for any caller
  // that looks for it, but it stays hidden so the two cannot disagree.
  updateCityExplorerHUD(distance, angleRad, isActive) {
    const metres = Math.max(0, Math.round(distance)) + 'm';
    const deg = (angleRad * 180 / Math.PI);

    this._objRange = { active: !!isActive, metres: metres, deg: deg };

    const range = document.getElementById('ffh-objective-range');
    if (range) {
      range.style.display = isActive ? 'inline-flex' : 'none';
      const d = document.getElementById('ffh-objective-dist');
      const a = document.getElementById('ffh-objective-arrow');
      if (d) d.textContent = metres;
      if (a) a.style.transform = `rotate(${deg}deg)`;
    }

    const indicator = document.getElementById('delivery-distance-indicator');
    if (indicator) {
      indicator.style.display = 'none';
      const v = document.getElementById('delivery-distance-val');
      const ar = document.getElementById('delivery-distance-arrow');
      if (v) v.textContent = metres;
      if (ar) ar.style.transform = `rotate(${deg}deg)`;
    }
  }
});

