// Title, Boot, Win & Lose Screens
window.FFH = window.FFH || {};

Object.assign(window.FFH.UI.prototype, {
  showBootScreen() {
    this.clear();

    // Let the 3D scene render in the background — do NOT set a solid color
    // The city will be visible behind the menu panel
    if (this.game && this.game.scene) {
      this.game.scene.background = new THREE.Color(0x87CEEB); // soft sky fallback if no renderer yet
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
      background: radial-gradient(circle at 50% 40%, rgba(13, 27, 42, 0) 0%, rgba(13, 27, 42, 0.25) 50%, rgba(13, 27, 42, 0.8) 100%);
    `;

    bootDiv.innerHTML = `
      <style>
        .astryx-btn {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
        }
        .astryx-btn:active {
          transform: scale(0.96) !important;
          opacity: 0.8 !important;
        }
      </style>

      <div style="pointer-events: none; text-align: center; margin-bottom: 70px; flex-shrink: 0;">
        <h1 style="
          color: #1D3557;
          -webkit-text-stroke: 2px #FFFFFF;
          font-size: 54px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 6px;
          text-transform: uppercase;
          line-height: 1.15;
          text-shadow: 0 16px 32px rgba(29, 53, 87, 0.4);
        ">FAR FROM<br>HOME</h1>
      </div>

      <div style="
        pointer-events: auto;
        z-index: 10;
        width: 260px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      ">
        <div id="continue-row" style="display: none; flex-direction: row; gap: 8px; width: 100%;">
          <button id="btn-continue" class="astryx-btn" style="
            display: block;
            background: rgba(255, 255, 255, 0.95);
            color: #000000;
            border: none;
            padding: 15px 20px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 1px;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
            flex: 1;
          ">Continue</button>

          <button id="btn-delete-save" title="Wipe save & start fresh" class="astryx-btn" style="
            display: none;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            width: 50px;
            min-width: 50px;
            font-size: 18px;
            cursor: pointer;
            flex-shrink: 0;
            padding: 0;
          ">🗑️</button>
        </div>

        <button id="btn-new-game" class="astryx-btn" style="
          background: rgba(255, 255, 255, 0.95);
          color: #000000;
          border: none;
          padding: 15px 20px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 1px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
          width: 100%;
        ">New Game</button>
        
        <button id="btn-sound" class="astryx-btn" style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
          letter-spacing: 0.5px;
        ">Sound: On</button>
      </div>

      <div style="
        pointer-events: none;
        position: absolute;
        bottom: 24px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 10px;
        color: rgba(255,255,255,0.3);
        font-weight: 500;
        letter-spacing: 1px;
      ">Meta Horizon Creator Competition 2026</div>
    `;

    this.container.appendChild(bootDiv);

    const btnContinue = document.getElementById('btn-continue');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnSound = document.getElementById('btn-sound');
    const btnDeleteSave = document.getElementById('btn-delete-save');
    const continueRow = document.getElementById('continue-row');

    // Show continue row only if a save exists
    if (localStorage.getItem('FFH_SAVE_GAME')) {
      continueRow.style.display = 'flex';
      btnDeleteSave.style.display = 'block';
    }

    // Delete save: tap once to arm (turns red), tap again to confirm wipe
    let deleteSaveArmed = false;
    if (btnDeleteSave) {
      btnDeleteSave.addEventListener('click', () => {
        if (!deleteSaveArmed) {
          deleteSaveArmed = true;
          btnDeleteSave.textContent = '💀';
          btnDeleteSave.style.background = '#E76F51';
          btnDeleteSave.style.color = '#FFF';
          btnDeleteSave.style.borderColor = '#C0392B';
          btnDeleteSave.title = 'Tap again to confirm — save will be wiped!';
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
          // Confirmed — wipe save
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
      btnNewGame.addEventListener('mousedown', () => {
        btnNewGame.style.transform = 'translateY(4px)';
        btnNewGame.style.boxShadow = '0 2px 0 #9E7D1A, 0 4px 6px rgba(0,0,0,0.2)';
      });
      btnNewGame.addEventListener('mouseup', () => {
        btnNewGame.style.transform = 'none';
        btnNewGame.style.boxShadow = '0 6px 0 #9E7D1A, 0 8px 10px rgba(0,0,0,0.25)';
      });
      btnNewGame.addEventListener('click', () => {
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

            cityPhase.camZoom = THREE.MathUtils.lerp(0.52, 2.88, easeT);
            cityPhase.targetCamZoom = THREE.MathUtils.lerp(0.52, 2.88, easeT);
            cityPhase.camCurrentAngle = THREE.MathUtils.lerp(startAngle, targetAngle, easeT);
            cityPhase.updateCamera(true);

            if (t < 1.0) {
              requestAnimationFrame(animLoop);
            } else {
              // 5. Camera has settled close to character back view — enable inputs & hold angle
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
      btnContinue.addEventListener('mousedown', () => {
        btnContinue.style.transform = 'translateY(4px)';
        btnContinue.style.boxShadow = '0 2px 0 #1A56C0, 0 4px 6px rgba(0,0,0,0.2)';
      });
      btnContinue.addEventListener('mouseup', () => {
        btnContinue.style.transform = 'none';
        btnContinue.style.boxShadow = '0 6px 0 #1A56C0, 0 8px 10px rgba(0,0,0,0.25)';
      });
      btnContinue.addEventListener('click', () => {
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

              cityPhase.camZoom = THREE.MathUtils.lerp(0.52, 2.88, easeT);
              cityPhase.targetCamZoom = THREE.MathUtils.lerp(0.52, 2.88, easeT);
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
      let soundEnabled = true;
      btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btnSound.innerText = soundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
        // Note: Full audio muting would require plumbing through AudioEngine
        if (this.game.sfx) this.game.sfx.muted = !soundEnabled;
        if (this.game.speech) this.game.speech.muted = !soundEnabled;
      });
    }

    const shaderSelect = document.getElementById('shader-select');
    if (shaderSelect) {
      shaderSelect.addEventListener('change', (e) => {
        window.FFH.setShaderStyle(e.target.value);
      });
    }
  },

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
  },

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
