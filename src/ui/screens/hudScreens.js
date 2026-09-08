// Title, Boot, Win & Lose Screens
window.FFH = window.FFH || {};
if (!window.FFH.UI) {
  window.FFH.UI = function(game) {
    this.game = game;
    this.container = document.getElementById('ui-container');
  };
}

Object.assign(window.FFH.UI.prototype, {
  showSaveSlotsModal() {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('ffh-slots-modal');
    if (prev) prev.remove();

    const slots = window.FFH.getSaveSlots ? window.FFH.getSaveSlots() : [];
    const modal = document.createElement('div');
    modal.id = 'ffh-slots-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      z-index: 10005;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      pointer-events: auto;
      animation: fadeIn 0.2s ease-out;
    `;

    let slotsHtml = '';
    slots.forEach(slot => {
      slotsHtml += `
        <div style="
          background: #F8F9FA;
          border: 2px solid ${slot.empty ? '#CBD5E1' : '#2EC4B6'};
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        ">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 13px; font-weight: 900; color: #1D3557;">
              💾 Slot ${slot.id}: ${slot.empty ? 'Empty Slot' : `Day ${slot.day} Checkpoint`}
            </div>
            <div style="font-size: 11px; color: #64748B; font-weight: 700;">
              ${slot.empty ? 'No saved game data' : `Wallet: <span style="color:#2A9D8F;">${slot.wallet.toFixed(2)}€</span> • ${slot.timestamp}`}
            </div>
            ${!slot.empty ? `<div style="font-size: 10px; color: #E76F51; font-weight: 800; margin-top: 2px;">🎯 ${slot.objective}</div>` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${!slot.empty ? `
              <button class="btn-load-slot-action" data-slot="${slot.id}" style="
                background: #2EC4B6; color: #FFF; border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 900; cursor: pointer;
              ">▶️ Load</button>
              <button class="btn-wipe-slot-action" data-slot="${slot.id}" style="
                background: #E63946; color: #FFF; border: none; border-radius: 8px; padding: 4px 8px; font-size: 10px; font-weight: 900; cursor: pointer;
              ">🗑️ Clear</button>
            ` : `
              <span style="font-size: 11px; color: #94A3B8; font-style: italic;">Empty</span>
            `}
          </div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 3.5px solid #264653;
        border-radius: 20px;
        width: 100%;
        max-width: 340px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.35);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="background: #264653; padding: 16px; text-align: center; color: #FFFFFF;">
          <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.5px;">💾 SAVE GAME SLOTS</div>
          <div style="font-size: 11px; color: #E9C46A; font-weight: 700; margin-top: 2px;">Select Checkpoint to Playtest & Debug</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          ${slotsHtml}

          <button id="btn-close-slots-modal" style="
            background: #475569; color: #FFFFFF; border: none; border-radius: 10px;
            padding: 12px; font-size: 13px; font-weight: 900; cursor: pointer; margin-top: 4px;
          ">✕ Close</button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    document.getElementById('btn-close-slots-modal').onclick = () => modal.remove();

    modal.querySelectorAll('.btn-load-slot-action').forEach(btn => {
      btn.onclick = () => {
        const slotId = parseInt(btn.getAttribute('data-slot'), 10);
        modal.remove();
        this.clear();
        this.game.clearTitleDiorama();

        const loadResult = window.FFH.loadGame(this.game, slotId);
        if (loadResult) {
          const targetPhase = loadResult.phaseKey || 'CITY_EXPLORATION';
          this.game.transitionTo(targetPhase, {
            spawnPos: loadResult.spawnPos,
            timeOfDay: loadResult.timeOfDay
          });
        }
      };
    });

    modal.querySelectorAll('.btn-wipe-slot-action').forEach(btn => {
      btn.onclick = () => {
        const slotId = parseInt(btn.getAttribute('data-slot'), 10);
        localStorage.removeItem(`FFH_SAVE_SLOT_${slotId}`);
        if (this.game.sfx) this.game.sfx.playSfx('wrong');
        this.showSaveSlotsModal(); // re-render
      };
    });
  },
  showBootScreen() {
    this.clear();

    // Let the 3D scene render in the background (do NOT set a solid color)// The city will be visible behind the menu panel
    // Only a genuine fallback now. setupTitleDiorama paints the sky from the
    // game's own palette; overwriting it here is what pinned the title screen
    // to a flat skyblue and made it look unrelated to the city behind it.
    if (this.game && this.game.scene && !this.game.scene.background) {
      this.game.scene.background = new THREE.Color(0x87CEEB); // no diorama built
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
      justify-content: center;
      pointer-events: none;
      padding: 25px 20px 35px 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: radial-gradient(circle at 50% 42%, rgba(13, 27, 42, 0.18) 0%, rgba(13, 27, 42, 0.45) 55%, rgba(13, 27, 42, 0.88) 100%);
    `;

    bootDiv.innerHTML = `
      <style>
        .astryx-btn {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .ffh-chunk {
          border: 3px solid #14213D;
          border-radius: 14px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          cursor: pointer;
          width: 100%;
          padding: 15px 18px;
          font-size: 15px;
        }
        .ffh-chunk:active {
          transform: translateY(4px) !important;
          box-shadow: 0 1px 0 #14213D !important;
        }
        .ffh-primary { background: #F6BD60; color: #14213D; box-shadow: 0 5px 0 #14213D; }
        .ffh-secondary { background: #FFFFFF; color: #14213D; box-shadow: 0 5px 0 #14213D; }
        .ffh-ghost {
          background: rgba(20, 33, 61, 0.72);
          color: #FFFFFF;
          border: 2px solid rgba(255,255,255,0.42);
          box-shadow: none;
          font-size: 13px;
          padding: 11px 18px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      </style>

      <button id="btn-sound" class="astryx-btn" title="Sound" style="
        pointer-events: auto;
        position: absolute;
        top: 18px;
        right: 18px;
        width: 42px;
        height: 42px;
        padding: 0;
        border-radius: 50%;
        background: rgba(20, 33, 61, 0.55);
        border: 2px solid rgba(255,255,255,0.35);
        color: #FFFFFF;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 20;
      "></button>

      <div style="pointer-events: none; text-align: center; margin-bottom: 46px; flex-shrink: 0;">
        <div style="
          display: inline-block;
          background: #14213D;
          border: 3px solid #FFFFFF;
          border-radius: 16px;
          padding: 14px 22px 12px 22px;
          box-shadow: 0 8px 0 rgba(0,0,0,0.28);
        ">
          <h1 style="
            color: #FFFFFF;
            font-size: 40px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 3px;
            text-transform: uppercase;
            line-height: 1.05;
          ">Far From<br>Home</h1>
          <div style="
            margin-top: 9px;
            color: #F6BD60;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 3.5px;
            text-transform: uppercase;
          ">Kruma Express</div>

          <div style="
            margin: 12px auto 0 auto;
            width: 46px;
            height: 2px;
            background: rgba(255,255,255,0.28);
          "></div>

          <div style="
            margin-top: 11px;
            color: rgba(255,255,255,0.92);
            font-size: 12px;
            font-weight: 600;
            line-height: 1.65;
            letter-spacing: 0.2px;
          ">Twenty euros. Twenty eight days.<br>One very German city.</div>
        </div>
      </div>

      <div style="
        pointer-events: auto;
        z-index: 10;
        width: 250px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 11px;
      ">
        <div id="continue-row" style="display: none; flex-direction: column; gap: 11px; width: 100%;">
          <button id="btn-continue" class="astryx-btn ffh-chunk ffh-primary">Continue</button>
          <button id="btn-load-slots" class="astryx-btn ffh-chunk ffh-ghost">Load Game</button>
        </div>

        <button id="btn-new-game" class="astryx-btn ffh-chunk ffh-secondary">New Game</button>
      </div>

      <div style="
        pointer-events: none;
        position: absolute;
        bottom: 22px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 9.5px;
        color: rgba(255,255,255,0.42);
        font-weight: 600;
        letter-spacing: 1.2px;
      ">Meta Horizon Creator Competition 2026</div>
    `;

    this.container.appendChild(bootDiv);

    const btnContinue = document.getElementById('btn-continue');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnSound = document.getElementById('btn-sound');
    const btnDeleteSave = document.getElementById('btn-delete-save');
    const continueRow = document.getElementById('continue-row');

    // Continue and Load Game only exist once there is something to load.
    // With no save, New Game becomes the primary (gold) action instead of the
    // secondary one, so the front door always has exactly one obvious button.
    // Wiping a save lives per-slot inside the Load Game modal, which is where
    // a player looks for it; a trash can on the main menu read as a dev tool.
    const hasSave = !!(localStorage.getItem('FFH_SAVE_GAME')
      || localStorage.getItem('FFH_SAVE_SLOT_1')
      || localStorage.getItem('FFH_SAVE_SLOT_2')
      || localStorage.getItem('FFH_SAVE_SLOT_3'));
    if (hasSave) {
      if (continueRow) continueRow.style.display = 'flex';
    } else if (btnNewGame) {
      btnNewGame.classList.remove('ffh-secondary');
      btnNewGame.classList.add('ffh-primary');
    }
    if (btnDeleteSave) btnDeleteSave.style.display = 'none';

    const btnLoadSlots = document.getElementById('btn-load-slots');
    if (btnLoadSlots) {
      btnLoadSlots.addEventListener('click', () => {
        this.showSaveSlotsModal();
      });
    }

    // Delete save: tap once to arm (turns red), tap again to confirm wipe
    let deleteSaveArmed = false;
    // Ensure background music & audio contexts start on first user touch/click gesture on boot screen
    const ensureMusicStarted = () => {
      if (this.game && typeof this.game.unlockAudio === 'function') {
        this.game.unlockAudio();
      } else if (this.game && this.game.sfx && typeof this.game.sfx.startMusic === 'function') {
        this.game.sfx.startMusic();
      }
    };

    if (btnDeleteSave) {
      btnDeleteSave.addEventListener('click', () => {
        if (!deleteSaveArmed) {
          deleteSaveArmed = true;
          btnDeleteSave.textContent = '💀';
          btnDeleteSave.style.background = '#E76F51';
          btnDeleteSave.style.color = '#FFF';
          btnDeleteSave.style.borderColor = '#C0392B';
          btnDeleteSave.title = 'Tap again to confirm (save will be wiped)!';
          // Auto-disarm after 2s
          setTimeout(() => {
            if (deleteSaveArmed) {
              deleteSaveArmed = false;
              btnDeleteSave.textContent = '🗑️';
              btnDeleteSave.style.background = 'rgba(231,111,81,0.18)';
              btnDeleteSave.style.color = '#E76F51';
              btnDeleteSave.style.borderColor = 'rgba(231,111,81,0.5)';
              btnDeleteSave.title = 'Wipe save & start fresh';
            }
          }, 2000);
        } else {
          // Confirmed (wipe save)
          localStorage.removeItem('FFH_SAVE_GAME');
          if (this.game.sfx) this.game.sfx.playSfx('wrong');
          continueRow.style.display = 'none';
          // Flash the new game button as a hint
          btnNewGame.style.boxShadow = '0 5px 0 #9E7D1A, 0 0 20px rgba(236,194,56,0.8)';
          setTimeout(() => { btnNewGame.style.boxShadow = '0 5px 0 #9E7D1A, 0 8px 20px rgba(236,194,56,0.4)'; }, 600);
        }
      });
    }

    if (btnNewGame) {
      btnNewGame.addEventListener('click', () => {
        ensureMusicStarted();
        this.game.sfx.playSfx('success');
        this.game.state = window.FFH.createRunState();
        window.FFH.state = this.game.state;
        
        // Clear title screen UI
        this.clear();
        this.game.clearTitleDiorama();

        // 1. Boot into city exploration phase
        this.game.transitionTo('CITY_EXPLORATION');
        
        const cityPhase = this.game.phases.CITY_EXPLORATION;
        if (cityPhase) {
          // 2. Lock inputs during start sequence
          cityPhase.inputDisabled = true;
          
          // 3. Start high zoomed-out overview position showing city diorama first
          cityPhase.camZoom = 0.52;
          cityPhase.targetCamZoom = 0.52;
          // Extract current angle from mainCamera relative to player spawn (10.4, 5.2)
          const cam = this.game.cameras.mainCamera;
          const dx = cam.position.x - 10.4;
          const dz = cam.position.z - 5.2;
          cityPhase.camCurrentAngle = Math.atan2(dx, dz);
          cityPhase.updateCamera(true);

          // 4. Smoothly pan & spin camera into close back-facing 3rd-person position over 3 seconds
          const startAngle = cityPhase.camCurrentAngle;
          // Land at CONFIG.camera.startAngleDeg (degrees → radians), fallback to 225° (PI/4 + PI)
          const landDeg = window.FFH.CONFIG?.camera?.startAngleDeg ?? 225;
          let targetAngle = landDeg * Math.PI / 180;
          
          // Normalize targetAngle to take the shortest rotation path
          while (targetAngle - startAngle > Math.PI) targetAngle -= Math.PI * 2;
          while (targetAngle - startAngle < -Math.PI) targetAngle += Math.PI * 2;

          const startTime = Date.now();
          const duration = 3000;

          // Perform smooth animation tick loop
          const animLoop = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(1.0, elapsed / duration);
            
            // Smooth easeInOutCubic easing for ultra-smooth camera flight
            const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            const entryZoom = window.FFH.CONFIG?.camera?.defaultZoom ?? 1.5;
            cityPhase.camZoom = THREE.MathUtils.lerp(0.52, entryZoom, easeT);
            cityPhase.targetCamZoom = THREE.MathUtils.lerp(0.52, entryZoom, easeT);
            cityPhase.camCurrentAngle = THREE.MathUtils.lerp(startAngle, targetAngle, easeT);
            cityPhase.updateCamera(true);

            if (t < 1.0) {
              requestAnimationFrame(animLoop);
            } else {
              // 5. Camera has settled close to character back view (enable inputs)& hold angle
              cityPhase.cameraHoldTimer = 4.0;
              cityPhase.inputDisabled = false;
              
              if (this.game.storyRunner) {
                this.game.storyRunner.startScene('act_one');
              }
            }
          };

          requestAnimationFrame(animLoop);
        }
      });
    }

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        ensureMusicStarted();
        this.game.sfx.playSfx('success');
        const loadResult = window.FFH.loadGame(this.game);
        const nextPhase = (loadResult && loadResult.phaseKey) ? loadResult.phaseKey : 'CITY_EXPLORATION';
        
        // Clear title screen UI
        this.clear();
        this.game.clearTitleDiorama();

        // Boot into target phase with restored position & lighting
        this.game.transitionTo(nextPhase, {
          spawnPos: loadResult ? loadResult.spawnPos : null,
          timeOfDay: loadResult ? loadResult.timeOfDay : undefined
        });

        if (nextPhase === 'CITY_EXPLORATION') {
          const cityPhase = this.game.phases.CITY_EXPLORATION;
          if (cityPhase) {
            cityPhase.inputDisabled = true;
            cityPhase.camZoom = 0.52;
            cityPhase.targetCamZoom = 0.52;

            const targetPos = cityPhase.playerPos;
            const cam = this.game.cameras.mainCamera;
            const dx = cam.position.x - targetPos.x;
            const dz = cam.position.z - targetPos.z;
            cityPhase.camCurrentAngle = Math.atan2(dx, dz);
            cityPhase.updateCamera(true);

            const startAngle = cityPhase.camCurrentAngle;
            // Land at CONFIG.camera.startAngleDeg (degrees → radians), fallback to 225°
            const landDeg = window.FFH.CONFIG?.camera?.startAngleDeg ?? 225;
            let targetAngle = landDeg * Math.PI / 180;
            while (targetAngle - startAngle > Math.PI) targetAngle -= Math.PI * 2;
            while (targetAngle - startAngle < -Math.PI) targetAngle += Math.PI * 2;

            const startTime = Date.now();
            const duration = 2400; // Snappy cinematic continue flight

            const animLoop = () => {
              const elapsed = Date.now() - startTime;
              const t = Math.min(1.0, elapsed / duration);
              const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

              const entryZoom = window.FFH.CONFIG?.camera?.defaultZoom ?? 1.5;
              cityPhase.camZoom = THREE.MathUtils.lerp(0.52, entryZoom, easeT);
              cityPhase.targetCamZoom = THREE.MathUtils.lerp(0.52, entryZoom, easeT);
              cityPhase.camCurrentAngle = THREE.MathUtils.lerp(startAngle, targetAngle, easeT);
              cityPhase.updateCamera(true);

              if (t < 1.0) {
                requestAnimationFrame(animLoop);
              } else {
                cityPhase.cameraHoldTimer = 3.0;
                cityPhase.inputDisabled = false;

                // Animate UI elements with the loaded stats
                if (this.game.ui && this.game.ui.playObjectiveRevealSequence) {
                  this.game.ui.playObjectiveRevealSequence(true);
                }
                if (this.game.ui && this.game.ui.refreshStats) {
                  this.game.ui.refreshStats(this.game.state);
                }
              }
            };

            requestAnimationFrame(animLoop);
          }
        }
      });
    }
    
    if (btnSound) {
      // Inline SVG rather than an emoji, so it inherits colour and stays crisp.
      let soundEnabled = false;
      const updateBtnSoundText = () => {
        const isMuted = !!(window.FFH.CONFIG?.audio?.bgMusicMuted || window.FFH.CONFIG?.audio?.sfxMuted);
        const musicPlaying = !!(this.game?.sfx?.isMusicPlaying && this.game.sfx.isMusicPlaying());
        if (isMuted) soundEnabled = false;
        if (!isMuted && musicPlaying) soundEnabled = true;
        const speaker = '<path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>';
        const waves = '<path d="M16 8.5a4 4 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>';
        const slash = '<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>';
        btnSound.innerHTML =
          '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">'
          + speaker + (soundEnabled ? waves : slash) + '</svg>';
        btnSound.style.opacity = soundEnabled ? '1' : '0.55';
        btnSound.setAttribute('aria-label', soundEnabled ? 'Sound on' : 'Tap to enable sound');
        btnSound.title = soundEnabled ? 'Sound on' : 'Tap to enable sound';
      };
      updateBtnSoundText();
      btnSound.addEventListener('click', () => {
        // Browsers require a direct gesture before they allow music. The first
        // press therefore enables sound; only later presses toggle it off.
        const nextMuted = soundEnabled;
        if (this.game) {
          if (this.game.sfx) {
            if (typeof this.game.sfx.setMusicMuted === 'function') {
              this.game.sfx.setMusicMuted(nextMuted);
            }
            if (typeof this.game.sfx.setSfxMuted === 'function') {
              this.game.sfx.setSfxMuted(nextMuted);
            }
          }
          if (this.game.speech) {
            this.game.speech.muted = nextMuted;
          }
        }
        soundEnabled = !nextMuted;
        if (!nextMuted) ensureMusicStarted();
        updateBtnSoundText();
      });
    }

    const shaderSelect = document.getElementById('shader-select');
    if (shaderSelect) {
      shaderSelect.addEventListener('change', (e) => {
        window.FFH.setShaderStyle(e.target.value);
      });
    }
  }
,

  showWinScreen() {
    this.clear();
    const s = this.game.state;
    const div = document.createElement('div');
    div.style.cssText = `
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; text-align: center; background: #1D3557; color: #FFF; font-family: sans-serif;
      padding: 24px; box-sizing: border-box; pointer-events: auto; overflow-y: auto;
    `;

    // 3.4 Four Ending Epilogues based on player decisions & disposition
    const disp = s.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
    let endingTitle = 'Hanseatic Citizen';
    let endingDesc = 'You navigated the entire German immigration gauntlet with flawless integrity, paying every cent of tuition and winning the respect of Lübeck.';
    let endingIcon = '🎓';

    if (s.storyFlags?.hasCharacterReference || (disp.diplomat > disp.hustler && disp.diplomat > disp.bureaucrat)) {
      endingTitle = 'The Community Pillar (Diplomat Ending)';
      endingDesc = 'Dr. Lindemann read Oma Martha\'s Leumundszeugnis with tears in her eyes. By prioritizing people over raw profit and braving the sleet for Frau Helga, you earned a permanent home among Hanseatic neighbors.';
      endingIcon = '🤝';
    } else if (s.storyFlags?.receivedAstaGrant || (disp.bureaucrat > disp.hustler && disp.bureaucrat > disp.diplomat)) {
      endingTitle = 'The Uncompromising Jurist (Bureaucrat Ending)';
      endingDesc = 'Armed with §16b AufenthG statutory defenses and meticulous paperwork co-filed with AStA, you out-bureaucratized the bureaucracy. Your residence permit stands unquestioned.';
      endingIcon = '⚖️';
    } else if (s.storyFlags?.tookSchwarzarbeit || disp.hustler > 0) {
      endingTitle = 'The Baltic Speed Demon (Hustler Ending)';
      endingDesc = 'From 20€ to survival against impossible odds. You braved sub-zero cobblestone alleys, out-hustled the courier clock, and convinced Dr. Lindemann with sheer grit and resilience.';
      endingIcon = '⚡';
    }

    div.innerHTML = `
      <div style="font-size: 40px; margin-bottom: 6px;">${endingIcon}</div>
      <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 6px 0; color: #48CAE4; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">AUFENTHALTSTITEL ERTEILT!</h1>
      <div style="font-size: 13px; color: #FFD166; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">${endingTitle}</div>

      <div style="background: #FFF; color: #222; border: 3px solid #222; border-radius: 12px; width: 100%; max-width: 320px; padding: 16px; box-shadow: 4px 6px 0 rgba(0,0,0,0.4); text-align: left; position: relative;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 8px; margin-bottom: 10px;">
          <div style="font-weight: 900; font-size: 12px; color: #1D3557;">BUNDESREPUBLIK DEUTSCHLAND</div>
          <div style="font-size: 16px;">🇩🇪</div>
        </div>
        
        <p style="font-size: 12px; color: #333; line-height: 1.5; margin: 0 0 12px 0;">
          ${endingDesc}
        </p>

        <div style="display: flex; justify-content: space-between; border-top: 1.5px dashed #DDD; padding-top: 8px; font-size: 11px; color: #555; font-family: monospace;">
          <span>Days: ${s.day || 1}/28</span>
          <span>Shifts: ${s.stats?.shiftsWorked || 0}</span>
          <span>Wallet: €${s.wallet.toFixed(2)}</span>
        </div>
        
        <div style="position: absolute; bottom: -12px; right: 10px; font-size: 32px; transform: rotate(-15deg); opacity: 0.9;">
          🛡️
        </div>
      </div>

      <button id="btn-restart" style="
        margin-top: 20px; background: #E76F51; color: #FFF; border: 3px solid #222; border-radius: 8px;
        padding: 12px 28px; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 #222;
      ">PLAY AGAIN</button>
    `;

    this.container.appendChild(div);

    document.getElementById('btn-restart').addEventListener('click', () => {
      window.location.reload();
    });
  }
,

  showLoseScreen() {
    const s = this.game.state;
    if (s.day > (window.FFH.ECONOMY.VISA_DAYS || 28)) {
      // Day 28 Visa Expiry Ending: "The Return Flight"
      this.endScreen({
        background: '#2B2D42',
        accent: '#E63946',
        badge: '✈️',
        title: 'THE RETURN FLIGHT',
        subtitle: `Day 28 arrived before your dossier was completed. Your temporary entry visa has expired and you must return home. Germany will be waiting when you try again.`,
        buttonLabel: 'START OVER'
      });
    } else {
      this.endScreen({
        background: '#C62828',
        accent: '#C62828',
        badge: '📦',
        title: 'LET GO',
        subtitle: 'Three bad shifts. The dark store cut your contract.',
        buttonLabel: 'TRY AGAIN'
      });
    }
  },

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
});
