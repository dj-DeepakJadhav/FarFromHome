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
    el.style.cssText = `
      position: absolute;
      top: 110px;
      left: 14px;
      right: 14px;
      background: #FFFFFF;
      border-left: 4px solid ${color};
      border-right: 2px solid #264653;
      border-top: 2px solid #264653;
      border-bottom: 2px solid #264653;
      color: #264653;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      font-weight: 800;
      font-size: 11px;
      line-height: 1.4;
      text-align: left;
      box-shadow: 0 6px 16px rgba(0,0,0,0.18);
      pointer-events: none;
      z-index: 10000;
      opacity: 0;
      transform: translateY(-10px);
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

  spawnWandererThought(text) {
    this.showThoughtBubble(text, 3800);
  }

  showThoughtBubble(text, duration = null) {
    const existing = document.getElementById('ffh-thought-bubble');
    if (existing) {
      if (existing._typewriterTimer) clearInterval(existing._typewriterTimer);
      existing.remove();
    }

    const el = document.createElement('div');
    el.id = 'ffh-thought-bubble';
    el.innerHTML = `<span style="opacity:0.8; margin-right:4px;">💭</span><em id="thought-bubble-text" style="font-style:italic;"></em>`;
    
    // Position directly over player character head in 3D screen space if in CITY_EXPLORATION
    let screenX = window.innerWidth / 2;
    let screenY = window.innerHeight * 0.45;
    
    if (this.game && this.game.currentPhase === this.game.phases.CITY_EXPLORATION) {
      const cityPhase = this.game.phases.CITY_EXPLORATION;
      const cam = this.game.cameras.mainCamera;
      if (cityPhase && cityPhase.playerPos && cam) {
        const headPos = cityPhase.playerPos.clone();
        headPos.y += 1.8; // Height offset above player head
        headPos.project(cam);
        screenX = (headPos.x * 0.5 + 0.5) * window.innerWidth;
        screenY = (-headPos.y * 0.5 + 0.5) * window.innerHeight;
      }
    }

    // Clamp horizontally to stay cleanly visible on screen
    screenX = Math.max(50, Math.min(window.innerWidth - 50, screenX));

    el.style.cssText = `
      position: fixed;
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
      pointer-events: none;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      max-width: 300px;
      text-align: center;
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -120%) scale(1.0)';
    });

    const textTarget = el.querySelector('#thought-bubble-text');
    let charIdx = 0;
    const charDelay = 32; // Comfortable reading pace (~31 chars/sec)
    
    // Typewriter loop
    el._typewriterTimer = setInterval(() => {
      if (charIdx < text.length) {
        textTarget.textContent += text[charIdx];
        if (charIdx % 3 === 0 && this.game && this.game.speech) {
          this.game.speech.playTalkBlip();
        }
        charIdx++;
      } else {
        clearInterval(el._typewriterTimer);
      }
    }, charDelay);

    // Dynamic duration based on text length: typing time + generous reading time (minimum 4.0s)
    const typingDuration = text.length * charDelay;
    const readingTime = Math.max(3000, text.length * 50);
    const totalDuration = duration || (typingDuration + readingTime);

    setTimeout(() => {
      if (el.parentNode) {
        if (el._typewriterTimer) clearInterval(el._typewriterTimer);
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -100%) scale(0.9)';
        setTimeout(() => el.remove(), 350);
      }
    }, totalDuration);
  }

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
  }

  hideCompassUI() {
    const compass = document.getElementById('ffh-compass-ui');
    if (compass) {
      compass.style.display = 'none';
    }
  }

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
  }

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
      background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.7) 100%);
    `;

    bootDiv.innerHTML = `
      <!-- Title Block at top -->
      <div style="pointer-events: none; text-align: center; margin-bottom: 40px; flex-shrink: 0;">
        <div style="
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 5px;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          margin-bottom: 8px;
          font-family: monospace;
        ">A STUDENT SURVIVAL STORY</div>
        <h1 style="
          color: #FFF;
          font-size: 42px;
          font-weight: 900;
          margin: 0;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-family: monospace, monospace;
          text-shadow: 0 3px 0 rgba(0,0,0,0.6), 0 6px 20px rgba(0,0,0,0.5);
          line-height: 1.1;
        ">FAR FROM<br>HOME</h1>
        <div style="
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-top: 10px;
          font-style: italic;
          letter-spacing: 1px;
        ">Lübeck, Germany · Learn German · Pay Your Tuition</div>
      </div>

      <!-- Frosted glass panel with buttons -->
      <div style="
        pointer-events: auto;
        z-index: 10;
        width: 290px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        background: rgba(255,255,255,0.12);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        padding: 28px 24px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      ">
        <div id="continue-row" style="display: none; flex-direction: row; gap: 8px; width: 100%; align-items: stretch;">
        <button id="btn-continue" style="
          display: block;
          background: #3A86FF;
          color: #FFF;
          border: none;
          padding: 14px 40px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 2px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 5px 0 #1A56C0, 0 8px 20px rgba(58,134,255,0.4);
          transition: all 0.08s ease-in-out;
          font-family: monospace, monospace;
          text-transform: uppercase;
          flex: 1;
        ">▶ CONTINUE</button>

        <button id="btn-delete-save" title="Wipe save & start fresh" style="
          display: none;
          background: rgba(231,111,81,0.18);
          color: #E76F51;
          border: 2px solid rgba(231,111,81,0.5);
          border-radius: 10px;
          width: 48px;
          min-width: 48px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.12s ease;
          flex-shrink: 0;
          line-height: 1;
          padding: 0;
        " onmouseover="this.style.background='rgba(231,111,81,0.35)';this.style.borderColor='#E76F51';"
           onmouseout="this.style.background='rgba(231,111,81,0.18)';this.style.borderColor='rgba(231,111,81,0.5)';">🗑️</button>
        </div>

        <button id="btn-new-game" style="
          background: #ECC238;
          color: #222;
          border: none;
          padding: 14px 40px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 2px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 5px 0 #9E7D1A, 0 8px 20px rgba(236,194,56,0.4);
          transition: all 0.08s ease-in-out;
          font-family: monospace, monospace;
          text-transform: uppercase;
          width: 100%;
        ">✦ NEW GAME</button>
        
        <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.2); margin: 4px 0;"></div>

        <button id="btn-sound" style="
          background: rgba(255,255,255,0.15);
          color: #FFF;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 9px 20px;
          font-size: 13px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.08s ease-in-out;
          font-family: monospace, monospace;
          width: 100%;
          letter-spacing: 1px;
        ">🔊 SOUND: ON</button>
      </div>

      <!-- Bottom tagline -->
      <div style="
        pointer-events: none;
        margin-top: 30px;
        font-size: 10px;
        color: rgba(255,255,255,0.35);
        letter-spacing: 2px;
        text-transform: uppercase;
        font-family: monospace;
      ">META HORIZON CREATOR COMPETITION 2026</div>
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
          let targetAngle = (Math.PI / 4) + Math.PI; // back-facing view
          
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

            cityPhase.camZoom = THREE.MathUtils.lerp(0.52, 1.25, easeT);
            cityPhase.targetCamZoom = THREE.MathUtils.lerp(0.52, 1.25, easeT);
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
            let targetAngle = (Math.PI / 4) + Math.PI; // back-facing view
            while (targetAngle - startAngle > Math.PI) targetAngle -= Math.PI * 2;
            while (targetAngle - startAngle < -Math.PI) targetAngle += Math.PI * 2;

            const startTime = Date.now();
            const duration = 2400; // Snappy cinematic continue flight

            const animLoop = () => {
              const elapsed = Date.now() - startTime;
              const t = Math.min(1.0, elapsed / duration);
              const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

              cityPhase.camZoom = THREE.MathUtils.lerp(0.52, 1.25, easeT);
              cityPhase.targetCamZoom = THREE.MathUtils.lerp(0.52, 1.25, easeT);
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
  }

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
      <div style="display: flex; justify-content: space-between; align-items: flex-start; pointer-events: auto; z-index: 10; gap: 8px;">
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

      <!-- Bottom Audio Word Dock & Items -->
      <div style="display: flex; gap: 8px; justify-content: center; overflow-x: auto; padding: 6px; pointer-events: auto;">
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
        if (currentPrompt && currentPrompt.id) {
          this.game.speech.speakKey(currentPrompt.id.toLowerCase());
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

  showShiftSummaryUI() {
    this.clear();
    const payout = this.game.lastPayout;
    const state = this.game.state;

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
      <div style="text-align: center; border-bottom: 2px dashed #222; padding-bottom: 12px; margin-bottom: 15px;">
        <div style="font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #E76F51; text-transform: uppercase;">KRUMA LOGISTICS GMBH • LÜBECK</div>
        <h2 style="margin: 3px 0 1px 0; font-size: 20px; font-weight: 900; color: #264653;">COURIER PAYSLIP</h2>
        <div style="font-size: 10px; color: #777; font-family: monospace;">LOHNABRECHNUNG • SHIFT #${state.currentShift || 1} • §16b AUFENTHG</div>
        <div style="font-size: 11px; font-style: italic; color: #2A9D8F; margin-top: 4px; font-weight: bold;">
          "Every shift teaches; every victory prepares."
        </div>
      </div>

      ${quotaBanner}

      <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 18px; font-family: monospace; font-size: 12.5px;">
        ${line('Gross Base Wage', payout.grossBaseWage.toFixed(2) + '\u20AC', '#222')}
        ${line(`Picking Accuracy (${payout.packedCount} items)`, '+' + payout.accuracyBonus.toFixed(2) + '\u20AC', '#2A9D8F')}
        ${payout.streakBonus > 0 ? line(`Cobblestone Flow (x${payout.streakMult.toFixed(2)})`, '+' + payout.streakBonus.toFixed(2) + '\u20AC', '#FF6600') : ''}
        ${line('Doorstep Etiquette & Freshness Tip', '+' + payout.etiquetteTip.toFixed(2) + '\u20AC', '#3A86FF')}
        ${payout.damageDeductions > 0 ? line('Transit Damage (Lesson Learned)', '-' + payout.damageDeductions.toFixed(2) + '\u20AC', '#E63946') : ''}
        
        <div style="border-top: 2px solid #222; padding-top: 8px; margin-top: 4px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; font-family: sans-serif;">
          <span>NET PAYOUT DISBURSED</span>
          <span style="color: #FF006E;">+${payout.netPayout.toFixed(2)}€</span>
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
      ">RETURN TO DORM & PLAN NEXT SHIFT ➔</button>
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
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
    `;

    // Objective is exclusively driven by game.state.activeObjective (set by storyRunner).
    // If nothing is set the tracker is hidden — player roams freely until story sets the next goal.
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

          <!-- Cumulative Archetype Badge -->
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
            opacity: ${s.firstObjectiveRevealed ? 1 : 0};
          ">
            ${(() => {
              const d = s.disposition || { hustler: 0, bureaucrat: 0, diplomat: 0 };
              if (d.hustler >= d.bureaucrat && d.hustler >= d.diplomat && d.hustler > 0) return '⚡ Hustler';
              if (d.bureaucrat >= d.hustler && d.bureaucrat >= d.diplomat && d.bureaucrat > 0) return '📑 Bureaucrat';
              if (d.diplomat >= d.hustler && d.diplomat >= d.bureaucrat && d.diplomat > 0) return '🤝 Diplomat';
              return '👤 Profile';
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
  }

  showPOICard(poiData) {
    // Disabled — no POI location card popups ever appear
    const card = document.getElementById('city-poi-card');
    if (card) card.style.display = 'none';
  }

  showDialogueBox(npcEntry, dialogueData, onOptionChosen) {
    const existing = document.getElementById('dialogue-overlay-box');
    if (existing) {
      if (existing._typewriterTimer) clearInterval(existing._typewriterTimer);
      if (window.FFH.game && window.FFH.game.speech) {
        window.FFH.game.speech.stopListening();
      }
      existing.remove();
    }

    const box = document.createElement('div');
    box.id = 'dialogue-overlay-box';
    box.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48vh;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 12px 14px 14px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      z-index: 200;
      overflow: hidden;
    `;

    // Primary spoken line is English for instant emotional clarity and zero reading friction
    let englishText = dialogueData.en || dialogueData.speechEn || dialogueData.text || dialogueData.de || '';

    // Show full options list for story scenes, fallback to 2 for basic NPC chatter
    const options = dialogueData.isStory ? (dialogueData.options || []) : (dialogueData.options || []).slice(0, 3);

    const optionsHtml = options.map((opt, idx) => {
      const primaryLabel = opt.label || opt.en || '';
      return `
        <button class="dialogue-opt-btn" data-idx="${idx}" style="
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid ${idx === 0 ? '#2EC4B6' : '#E76F51'};
          border-radius: 12px;
          padding: 9px 12px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
          transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
          line-height: 1.35;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        ">
          <span style="flex: 1;">${primaryLabel}</span>
          <span style="font-size: 13px; opacity: 0.7;">➔</span>
        </button>
      `;
    }).join('');

    box.innerHTML = `
      <!-- Header: Speaker Name & Role -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #F0F4F8; padding-bottom: 5px; margin-bottom: 4px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${npcEntry.avatarColor || '#2EC4B6'};"></div>
          <div>
            <div style="font-size: 13px; font-weight: 900; color: #264653; line-height: 1.1;">${dialogueData.speaker || npcEntry.name}</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #7F8C8D; text-transform: uppercase; letter-spacing: 0.5px;">${npcEntry.title || 'Town Citizen'}</div>
          </div>
        </div>
        <div id="dialogue-scroll-indicator" style="font-size: 10px; font-weight: 700; color: #2EC4B6; display: none; align-items: center; gap: 4px; animation: bounce 1s infinite;">
          <span>Scroll for options</span> <span>↓</span>
        </div>
      </div>
      
      <!-- Unified Single Scroll Stream Container -->
      <div id="dialogue-scroll-stream" style="
        flex: 1;
        overflow-y: auto;
        padding: 4px 4px 10px 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        scroll-behavior: smooth;
      ">
        ${dialogueData.actionIntro ? `
        <!-- Narrative Context Card (Action Description) -->
        <div style="
          background: #EBF4F6;
          border-left: 4px solid #2EC4B6;
          border-radius: 8px;
          padding: 8px 10px;
          font-style: italic;
          font-size: 11.5px;
          line-height: 1.4;
          color: #264653;
          font-weight: 600;
          flex-shrink: 0;
        ">${dialogueData.actionIntro}</div>
        ` : ''}

        ${englishText ? `
        <!-- Natural Dialogue Bubble -->
        <div style="
          background: #F4F7F6;
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        ">
          <div id="dialogue-typewriter-text" style="
            font-size: 12.5px;
            line-height: 1.45;
            color: #1D3557;
            font-weight: 700;
          "></div>
        </div>
        ` : ''}

        <!-- Natural Conversation Choices inline in scroll stream with smooth fade-in -->
        <div id="dialogue-options-container" style="
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.35s ease, transform 0.35s ease;
          margin-top: 2px;
        ">
          ${optionsHtml}
        </div>
      </div>
    `;

    this.container.appendChild(box);

    const scrollStream = box.querySelector('#dialogue-scroll-stream');
    const textTarget = box.querySelector('#dialogue-typewriter-text');
    const optionsContainer = box.querySelector('#dialogue-options-container');
    const scrollIndicator = box.querySelector('#dialogue-scroll-indicator');
    
    let charIndex = 0;
    const fullSpeech = englishText;
    const npcId = npcEntry?.id || null;

    const revealOptions = () => {
      if (optionsContainer) {
        optionsContainer.style.opacity = '1';
        optionsContainer.style.transform = 'translateY(0)';
      }
      // Check if user needs to scroll to see options
      if (scrollStream && scrollStream.scrollHeight > scrollStream.clientHeight + 15) {
        if (scrollIndicator) scrollIndicator.style.display = 'flex';
      }
    };

    if (scrollStream) {
      scrollStream.addEventListener('scroll', () => {
        const isNearBottom = scrollStream.scrollHeight - scrollStream.scrollTop - scrollStream.clientHeight < 25;
        if (isNearBottom) {
          if (scrollIndicator) scrollIndicator.style.display = 'none';
          if (optionsContainer) {
            optionsContainer.style.opacity = '1';
            optionsContainer.style.transform = 'translateY(0)';
          }
        }
      });
    }

    if (textTarget) {
      box._typewriterTimer = setInterval(() => {
        if (charIndex < fullSpeech.length) {
          textTarget.textContent += fullSpeech[charIndex];
          if (charIndex % 3 === 0 && this.game && this.game.speech) {
            this.game.speech.playTalkBlip(npcId);
          }
          charIndex++;
        } else {
          clearInterval(box._typewriterTimer);
          revealOptions();
          if (scrollStream) {
            scrollStream.scrollTop = scrollStream.scrollHeight;
          }
        }
      }, 28);

      // Clicking anywhere on dialogue skips typewriter to end immediately
      box.addEventListener('click', (e) => {
        if (e.target.closest('.dialogue-opt-btn')) return;
        if (charIndex < fullSpeech.length) {
          clearInterval(box._typewriterTimer);
          textTarget.textContent = fullSpeech;
          charIndex = fullSpeech.length;
          revealOptions();
          if (scrollStream) {
            scrollStream.scrollTop = scrollStream.scrollHeight;
          }
        }
      });
    } else {
      // If there's no dialogue text at all, just reveal options instantly
      revealOptions();
    }

    const buttons = box.querySelectorAll('.dialogue-opt-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (box._typewriterTimer) clearInterval(box._typewriterTimer);
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (this.game && this.game.speech) {
          this.game.speech.playOptionChime(idx);
        }
        const chosen = dialogueData.options[idx];
        if (onOptionChosen) {
          onOptionChosen(chosen);
        }
      });
    });
  }

  showSkillTreeModal() {
    const existing = document.getElementById('skill-tree-modal');
    if (existing) existing.remove();

    const state = this.game.state;
    state.unlockedSkills = state.unlockedSkills || {};
    state.skillPoints = state.skillPoints !== undefined ? state.skillPoints : 1;

    const modal = document.createElement('div');
    modal.id = 'skill-tree-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(13, 27, 42, 0.88);
      backdrop-filter: blur(6px);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      padding: 16px 14px;
      box-sizing: border-box;
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      animation: fadeIn 0.2s ease;
      pointer-events: auto;
    `;

    const renderTree = () => {
      let branchesHtml = '';
      for (const bKey in window.FFH.SKILL_TREE) {
        const branch = window.FFH.SKILL_TREE[bKey];
        const skillsHtml = branch.skills.map((skill, idx) => {
          const isOwned = !!state.unlockedSkills[skill.id];
          const canUnlock = window.FFH.canUnlockSkill ? window.FFH.canUnlockSkill(skill.id, state) : false;
          
          let btnBg = '#ADB5BD';
          let btnText = `LOCKED (${skill.cost} SP)`;
          let btnCursor = 'not-allowed';
          
          if (isOwned) {
            btnBg = '#2A9D8F';
            btnText = 'ACQUIRED ★';
            btnCursor = 'default';
          } else if (canUnlock) {
            btnBg = '#FF006E';
            btnText = `UNLOCK (${skill.cost} SP)`;
            btnCursor = 'pointer';
          }

          return `
            <div style="background: ${isOwned ? '#EBFBEE' : '#FFFFFF'}; border: 2px solid ${isOwned ? '#2A9D8F' : (canUnlock ? '#FF006E' : '#D0DCE5')}; border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <span style="font-size: 20px;">${skill.icon}</span>
                <div>
                  <div style="font-size: 12px; font-weight: 900; color: #264653;">${skill.name}</div>
                  <div style="font-size: 10px; color: #666; line-height: 1.25; margin-top: 1px;">${skill.descEn}</div>
                </div>
              </div>
              <button class="btn-unlock-skill" data-skill="${skill.id}" style="
                background: ${btnBg};
                color: #FFFFFF;
                border: 1.5px solid #264653;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 10px;
                font-weight: 900;
                cursor: ${btnCursor};
                box-shadow: 0 2px 0 #264653;
                white-space: nowrap;
                flex-shrink: 0;
              ">${btnText}</button>
            </div>
          `;
        }).join('');

        branchesHtml += `
          <div style="background: #F8F9FA; border-radius: 12px; border: 2px solid ${branch.color}; padding: 10px 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; border-bottom: 1.5px solid #E9ECEF; padding-bottom: 4px;">
              <span style="font-size: 16px;">${branch.icon}</span>
              <span style="font-size: 13px; font-weight: 900; color: ${branch.color};">${branch.title}</span>
            </div>
            <div style="font-size: 10.5px; color: #777; margin-bottom: 8px; font-style: italic;">${branch.desc}</div>
            ${skillsHtml}
          </div>
        `;
      }

      modal.innerHTML = `
        <div style="background: #FFFFFF; border-radius: 16px; border-top: 4px solid #FF006E; border-bottom: 4px solid #264653; border-left: 2px solid #264653; border-right: 2px solid #264653; display: flex; flex-direction: column; height: 100%; box-shadow: 0 12px 32px rgba(0,0,0,0.4); overflow: hidden;">
          <!-- Header -->
          <div style="padding: 12px 14px; border-bottom: 2px solid #F0F0F0; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 15px; font-weight: 900; color: #1D3557;">🎓 Expat Survival Skill Tree</div>
              <div style="font-size: 11px; color: #FF006E; font-weight: 800;">Available Skill Points: ${state.skillPoints || 0} SP</div>
            </div>
            <button id="btn-close-skills" style="background: #F8F9FA; border: 2px solid #264653; border-radius: 8px; width: 30px; height: 30px; font-weight: 900; color: #264653; cursor: pointer;">✕</button>
          </div>

          <!-- Body -->
          <div id="skills-tree-scroll" style="flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column;">
            ${branchesHtml}
          </div>
        </div>
      `;

      // Wire close button
      modal.querySelector('#btn-close-skills').onclick = () => modal.remove();

      // Wire unlock buttons
      modal.querySelectorAll('.btn-unlock-skill').forEach(btn => {
        btn.onclick = () => {
          const skillId = btn.getAttribute('data-skill');
          if (window.FFH.canUnlockSkill && window.FFH.canUnlockSkill(skillId, state)) {
            const unlocked = window.FFH.unlockSkill(skillId, state);
            if (unlocked) {
              this.game.sfx.playSfx('success');
              this.spawnFloatingText(`⭐ Learned: ${unlocked.name}!`, window.innerWidth / 2, window.innerHeight / 2, '#FF006E');
              this.updatePersistentHUD(state);
              renderTree();
            }
          }
        };
      });
    };

    renderTree();
    (document.getElementById('ui-container') || document.body).appendChild(modal);
  }

  showRideMockScreen() {
    // Redundant now that phase is fully implemented. Leave empty.
  }


  showDictionaryModal() {
    const existing = document.getElementById('dictionary-modal');
    if (existing) existing.remove();

    const unlocked = window.FFH.SpacedRepetition ? window.FFH.SpacedRepetition.getUnlockedWords(this.game.state) : window.FFH.items;
    const dueCount = window.FFH.SpacedRepetition ? window.FFH.SpacedRepetition.getDueWords(this.game.state).length : 0;

    const modal = document.createElement('div');
    modal.id = 'dictionary-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(13, 27, 42, 0.88);
      backdrop-filter: blur(6px);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      padding: 16px 14px;
      box-sizing: border-box;
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      animation: fadeIn 0.2s ease;
      pointer-events: auto;
    `;

    modal.innerHTML = `
      <div style="background: #FFFFFF; border-radius: 16px; border-top: 4px solid #2EC4B6; border-bottom: 4px solid #264653; border-left: 2px solid #264653; border-right: 2px solid #264653; display: flex; flex-direction: column; height: 100%; box-shadow: 0 12px 32px rgba(0,0,0,0.4); overflow: hidden;">
        <!-- Header -->
        <div style="padding: 14px 16px; border-bottom: 2px solid #F0F0F0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 16px; font-weight: 900; color: #1D3557;">📖 Vokabel-Wörterbuch</div>
            <div style="font-size: 10.5px; color: #2A9D8F; font-weight: 800;">${unlocked.length} Wörter Gelernt • Leitner Box (1/47)</div>
          </div>
          <button id="btn-close-dict" style="background: #F8F9FA; border: 2px solid #264653; border-radius: 8px; width: 30px; height: 30px; font-weight: 900; color: #264653; cursor: pointer;">✕</button>
        </div>

        <!-- Practice Banner -->
        <div style="background: #FFF3CD; border-bottom: 2px solid #FFEBAA; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; font-weight: 900; color: #856404;">🎯 Spaced Repetition Practice</div>
            <div style="font-size: 10px; color: #856404;">${dueCount > 0 ? dueCount + ' words ready for review!' : 'All words reviewed for this shift!'}</div>
          </div>
          <button id="btn-start-quiz" style="background: #E76F51; color: #FFF; border: 2px solid #264653; border-radius: 8px; padding: 6px 12px; font-weight: 900; font-size: 11px; cursor: pointer; box-shadow: 0 2px 0 #D65A3C;">🎮 PRACTICE</button>
        </div>

        <!-- Word List / Quiz Container -->
        <div id="dict-content-body" style="flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
        </div>
      </div>
    `;

    document.getElementById('ui-container').appendChild(modal);

    const renderWordList = () => {
      const body = modal.querySelector('#dict-content-body');
      body.innerHTML = unlocked.map(item => {
        const srs = (this.game.state.vocabSRS && this.game.state.vocabSRS[item.id]) || { box: 1 };
        const boxStars = '★'.repeat(srs.box) + '☆'.repeat(4 - srs.box);
        const genderColor = item.gender === 'der' ? '#3A86FF' : item.gender === 'die' ? '#FF006E' : '#8338EC';
        const audioKey = item.audioKey || item.id;
        return `
          <div style="background: #F8F9FA; border: 2px solid #E9ECEF; border-left: 5px solid ${genderColor}; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">${item.icon || '📦'}</span>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #1D3557;">
                  <span style="color: ${genderColor};">${item.gender}</span> ${item.nameDe}
                </div>
                <div style="font-size: 10.5px; color: #6C757D; font-style: italic;">${item.nameEn} • ${item.exampleDe || ''}</div>
              </div>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <button class="btn-dict-audio" data-gender="${item.gender}" data-word="${item.nameDe}" style="background: #FFE8D6; border: 1px solid #E76F51; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer;" title="Preview item acoustic sound">🎵</button>
              <div style="font-size: 9px; color: #F4A261; font-weight: 900;">Box ${srs.box} ${boxStars}</div>
            </div>
          </div>
        `;
      }).join('');

      body.querySelectorAll('.btn-dict-audio').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          if (this.game && this.game.speech) {
            this.game.speech.playOptionChime(idx);
          }
        });
      });
    };

    const renderQuizMinigame = () => {
      const body = modal.querySelector('#dict-content-body');
      const testItem = unlocked[Math.floor(Math.random() * unlocked.length)];
      if (!testItem) return;

      const genders = ['der', 'die', 'das'];
      body.innerHTML = `
        <div style="text-align: center; padding: 12px 0;">
          <div style="font-size: 12px; font-weight: 800; color: #2A9D8F; text-transform: uppercase;">Grammar Gender Flashcard</div>
          <div style="font-size: 48px; margin: 8px 0;">${testItem.icon || '📦'}</div>
          <div style="font-size: 22px; font-weight: 900; color: #1D3557; margin-bottom: 4px;">___ ${testItem.nameDe}</div>
          <div style="font-size: 12px; color: #6C757D; font-style: italic;">${testItem.nameEn}</div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          ${genders.map(g => `
            <button class="btn-quiz-answer" data-choice="${g}" style="
              flex: 1;
              padding: 14px 10px;
              background: ${g === 'der' ? '#3A86FF' : g === 'die' ? '#FF006E' : '#8338EC'};
              color: #FFF;
              border: 2px solid #264653;
              border-radius: 10px;
              font-size: 16px;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 4px 0 #1D3557;
            ">${g}</button>
          `).join('')}
        </div>

        <div id="quiz-feedback" style="margin-top: 16px; text-align: center; font-weight: 900; font-size: 13px; min-height: 24px;"></div>
      `;

      body.querySelectorAll('.btn-quiz-answer').forEach(btn => {
        btn.addEventListener('click', () => {
          const choice = btn.getAttribute('data-choice');
          const isCorrect = choice === testItem.gender;
          const fb = body.querySelector('#quiz-feedback');

          if (window.FFH.SpacedRepetition) {
            window.FFH.SpacedRepetition.recordReview(testItem.id, isCorrect, this.game.state);
          }

          if (isCorrect) {
            this.game.sfx.playSfx('early_success');
            fb.innerHTML = `<span style="color: #2A9D8F;">✓ Richtig! ${testItem.gender} ${testItem.nameDe} (${testItem.nameEn})! (+Box Promoted)</span>`;
          } else {
            this.game.sfx.playSfx('error');
            fb.innerHTML = `<span style="color: #E63946;">✗ Falsch! Es heißt: ${testItem.gender} ${testItem.nameDe} (${testItem.nameEn})</span>`;
          }

          setTimeout(() => {
            renderQuizMinigame();
          }, 1200);
        });
      });
    };

    modal.querySelector('#btn-close-dict').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#btn-start-quiz').addEventListener('click', () => {
      renderQuizMinigame();
    });

    renderWordList();
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

  showWGBuzzerModal(onSuccessCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('wg-buzzer-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'wg-buzzer-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(18, 24, 38, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 3px solid #264653;
        border-radius: 16px;
        width: 100%;
        max-width: 330px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="background: #264653; padding: 14px 16px; color: #FFF; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 1px;">STUDENTEN-WG LÜBECK</div>
            <div style="font-size: 16px; font-weight: 900;">🔔 Klingelanlage (Doorbell)</div>
          </div>
          <button id="btn-close-buzzer" style="background: none; border: none; color: #FFF; font-size: 20px; cursor: pointer;">✕</button>
        </div>

        <div id="buzzer-buttons-container" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 12.5px; color: #4A5568; line-height: 1.4;">
            Which doorbell do you press to find your roommate Nico?
          </div>
        </div>

        <div id="buzzer-status" style="display: none; padding: 10px 16px; font-size: 12px; font-weight: 800; text-align: center;"></div>
      </div>
    `;

    parent.appendChild(modal);

    const statusEl = modal.querySelector('#buzzer-status');
    const containerEl = modal.querySelector('#buzzer-buttons-container');

    modal.querySelector('#btn-close-buzzer').onclick = () => {
      modal.remove();
    };

    // Define the 3 doorbells as modular entries
    const buzzerEntries = [
      {
        id: 'buzzer-btn-1',
        label: '🔘 OG 1: Frau Meier',
        subtext: '*Ruhezeit bitte beachten!*',
        borderLeft: '#E76F51',
        onClick: () => {
          if (this.game.sfx) this.game.sfx.playSfx('doorbell_wrong');
          if (window.FFH.NPCMemoryManager) {
            window.FFH.NPCMemoryManager.recordEncounter('NPC_FRAU_MEIER', 'buzzed_at_wrong_hour', -20, this.game.state);
          }
          statusEl.style.display = 'block';
          statusEl.style.background = '#FFE3E3';
          statusEl.style.color = '#C92A2A';
          statusEl.innerHTML = '🔊 Scratchy Intercom: <em>"NEIN! Ruhezeit! Wer wagt es?!"</em> (-1 Noise Strike)';
        }
      },
      {
        id: 'buzzer-btn-2',
        label: '🔘 EG: Hausmeister Schmidt',
        subtext: '*Sprechstunde Mi 14:00-14:15*',
        borderLeft: '#457B9D',
        onClick: () => {
          if (this.game.sfx) this.game.sfx.playSfx('click');
          statusEl.style.display = 'block';
          statusEl.style.background = '#EDF2F7';
          statusEl.style.color = '#4A5568';
          statusEl.innerHTML = '🔊 Heavy static, a deep sigh, and the receiver hangs up.';
        }
      },
      {
        id: 'buzzer-btn-3',
        label: '🔘 3. OG: WG 3B — Nico & Co.',
        subtext: '*Handwritten note: New flatmate welcome!*',
        borderLeft: '#2EC4B6',
        onClick: () => {
          if (this.game.sfx) this.game.sfx.playSfx('bell');
          statusEl.style.display = 'block';
          statusEl.style.background = '#D3F9D8';
          statusEl.style.color = '#2B8A3E';
          statusEl.innerHTML = '⚡ <strong>BZZZZZZT!</strong> The heavy oak latch clicks open!';

          setTimeout(() => {
            modal.remove();
            if (onSuccessCallback) onSuccessCallback();
          }, 700);
        }
      }
    ];

    // Fisher-Yates shuffle to randomize button order on every visit
    const shuffled = [...buzzerEntries];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Render the randomly positioned buttons
    shuffled.forEach(item => {
      const btn = document.createElement('button');
      btn.id = item.id;
      btn.style.cssText = `
        background: #F8F9FA;
        border: 2px solid #CBD5E0;
        border-left: 6px solid ${item.borderLeft};
        border-radius: 10px;
        padding: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
      `;
      btn.innerHTML = `
        <div style="font-size: 13px; font-weight: 900; color: #2D3748;">${item.label}</div>
        <div style="font-size: 10.5px; color: #718096;">${item.subtext}</div>
      `;
      btn.onclick = item.onClick;
      containerEl.appendChild(btn);
    });
  }

  showMuelltrennungModal(onCompleteCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('muelltrennung-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'muelltrennung-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(18, 24, 38, 0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 3px solid #264653;
        border-radius: 16px;
        width: 100%;
        max-width: 340px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="background: #2A9D8F; padding: 14px 16px; color: #FFF;">
          <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 1px;">KÜCHEN-NOTFALL (KITCHEN CRISIS)</div>
          <div style="font-size: 16px; font-weight: 900;">♻️ Nico's Mülltrennung Test!</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; background: #F8F9FA; padding: 10px; border-radius: 10px; border: 1.5px dashed #CBD5E0;">
            <div style="font-size: 32px;">🥛</div>
            <div style="font-size: 12px; color: #2D3748; line-height: 1.4;">
              <strong>Nico holds an empty plastic yogurt pot with foil lid:</strong><br>
              <em>"Quick! Before Herr Becker inspects the bins, where does this go?!"</em>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Bin 1: Blue (Paper) -->
            <button id="bin-blue" style="
              background: #F0F7FF;
              border: 2px solid #3A86FF;
              border-left: 8px solid #3A86FF;
              border-radius: 10px;
              padding: 10px 12px;
              text-align: left;
              cursor: pointer;
            ">
              <div style="font-size: 13px; font-weight: 900; color: #1D3557;">🟦 Blaue Tonne (Papiermüll)</div>
              <div style="font-size: 10.5px; color: #4A5568;">Paper, newspapers, cardboard boxes</div>
            </button>

            <!-- Bin 2: Yellow (Gelber Sack / Plastic & Metal) -->
            <button id="bin-yellow" style="
              background: #FFFDF0;
              border: 2px solid #ECC238;
              border-left: 8px solid #ECC238;
              border-radius: 10px;
              padding: 10px 12px;
              text-align: left;
              cursor: pointer;
            ">
              <div style="font-size: 13px; font-weight: 900; color: #7A5E0B;">🟨 Gelber Sack (Plastic & Foil Packaging)</div>
              <div style="font-size: 10.5px; color: #4A5568;">Plastic pots, metal cans, foil lids</div>
            </button>

            <!-- Bin 3: Black (Restmüll) -->
            <button id="bin-black" style="
              background: #F8F9FA;
              border: 2px solid #4A5568;
              border-left: 8px solid #4A5568;
              border-radius: 10px;
              padding: 10px 12px;
              text-align: left;
              cursor: pointer;
            ">
              <div style="font-size: 13px; font-weight: 900; color: #2D3748;">⬛ Restmüll (Residual Waste)</div>
              <div style="font-size: 10.5px; color: #4A5568;">Non-recyclable household waste</div>
            </button>
          </div>

          <div id="bin-feedback" style="display: none; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 800; text-align: center;"></div>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    const feedbackEl = modal.querySelector('#bin-feedback');

    const handleChoice = (isCorrect, message, bg, color) => {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = bg;
      feedbackEl.style.color = color;
      feedbackEl.innerHTML = message;

      if (window.FFH.NPCMemoryManager) {
        if (isCorrect) {
          window.FFH.NPCMemoryManager.recordEncounter('NPC_NICO', 'trash_master', 20, this.game.state);
        } else {
          window.FFH.NPCMemoryManager.recordEncounter('NPC_NICO', 'trash_disaster', -15, this.game.state);
        }
      }

      if (this.game.sfx) {
        this.game.sfx.playSfx(isCorrect ? 'success' : 'wrong');
      }

      setTimeout(() => {
        modal.remove();
        if (onCompleteCallback) onCompleteCallback(isCorrect);
      }, 1200);
    };

    modal.querySelector('#bin-blue').onclick = () => {
      handleChoice(false, '❌ Nico screams in a whisper: <em>"NO! Plastic in the paper bin?! Becker will evict us!"</em>', '#FFE3E3', '#C92A2A');
    };

    modal.querySelector('#bin-yellow').onclick = () => {
      handleChoice(true, '🎉 Nico sighs with massive relief: <em>"Brilliant! You\'re a legend. We live to see tomorrow!"</em> (+2 Trust)', '#D3F9D8', '#2B8A3E');
    };

    modal.querySelector('#bin-black').onclick = () => {
      handleChoice(false, '❌ Nico snatches the pot: <em>"Wrong! Gelber Sack! You almost caused a diplomatic crisis!"</em>', '#FFE3E3', '#C92A2A');
    };
  }

  showTuitionLetterModal(onAcknowledgeCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('tuition-letter-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'tuition-letter-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(18, 24, 38, 0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #FFFDF9;
        border: 3px solid #264653;
        border-radius: 14px;
        width: 100%;
        max-width: 330px;
        box-shadow: 0 14px 36px rgba(0,0,0,0.45);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Letter Stamp Header -->
        <div style="background: #264653; padding: 12px 16px; color: #FFF; border-bottom: 3px solid #E76F51; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; color: #FFD166; font-weight: 800; letter-spacing: 1.5px;">OFFICIAL NOTIFICATION</div>
            <div style="font-size: 15px; font-weight: 900;">🏛️ Hochschule Lübeck — Kasse</div>
          </div>
          <div style="font-size: 22px;">📜</div>
        </div>

        <div style="padding: 18px 16px; display: flex; flex-direction: column; gap: 12px;">
          <!-- Official Notice Box -->
          <div style="background: #F8F9FA; border: 1.5px solid #CBD5E0; border-radius: 8px; padding: 12px; font-family: monospace, sans-serif; font-size: 11.5px; color: #2D3748; line-height: 1.5;">
            <div><strong>BETREFF:</strong> Semesterbeitrag (Tuition)</div>
            <div><strong>FÄLLIGKEIT:</strong> Freitag, 17:00 Uhr</div>
            <div style="border-top: 1px dashed #CBD5E0; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between;">
              <span>Tuition Fee Due:</span>
              <span style="font-weight: 900; color: #E76F51;">250.00 €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Current Cash in Pocket:</span>
              <span style="font-weight: 900; color: #2A9D8F;">${(this.game.state.wallet || 20).toFixed(2)} €</span>
            </div>
            <div style="border-top: 1px dashed #CBD5E0; margin: 8px 0;"></div>
            <div style="font-size: 10px; color: #C92A2A; font-weight: 800;">
              *Achtung: Exmatrikulation upon failure to pay.
            </div>
          </div>

          <!-- British Thought Commentary -->
          <div style="background: #FFE8D6; border-left: 4px solid #E76F51; border-radius: 6px; padding: 10px; font-size: 12px; color: #7B241C; line-height: 1.4;">
            💭 <em>"Two hundred and fifty quid?! I’ve got twenty euros and a used yogurt lid. I need to sprint to the University admissions office before they cancel my visa."</em>
          </div>

          <!-- Action Button -->
          <button id="btn-ack-letter" style="
            background: #2EC4B6;
            color: #FFF;
            border: 2px solid #264653;
            border-bottom: 4px solid #1A7A73;
            border-radius: 10px;
            padding: 12px;
            font-size: 13px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            🏃 Sprint to University (Before 17:00)
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-ack-letter').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('click');
      modal.remove();
      if (onAcknowledgeCallback) onAcknowledgeCallback();
    };
  }

  showLockedUniModal(onLeaveCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('locked-uni-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'locked-uni-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(18, 24, 38, 0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #FFFFFF;
        border: 3px solid #264653;
        border-radius: 16px;
        width: 100%;
        max-width: 340px;
        box-shadow: 0 14px 36px rgba(0,0,0,0.45);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Door Header -->
        <div style="background: #264653; padding: 14px 16px; color: #FFF; border-bottom: 3px solid #E76F51; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 1px;">UNIVERSITÄT LÜBECK</div>
            <div style="font-size: 16px; font-weight: 900;">🔒 Geschlossen (Closed: 17:01)</div>
          </div>
          <div style="font-size: 24px;">🚪</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          <!-- Sign on Door -->
          <div style="background: #FFFBEA; border: 2px solid #ECC238; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 14px; font-weight: 900; color: #7A5E0B;">ÖFFNUNGSZEITEN</div>
            <div style="font-size: 12px; color: #2D3748; margin-top: 4px;">
              Dienstag & Donnerstag: 10:00 – 11:30 Uhr<br>
              <strong>Freitags geschlossen.</strong>
            </div>
            <div style="margin-top: 6px; font-size: 11px; color: #C92A2A; font-weight: 800;">
              *Heavy brass padlock on door handles*
            </div>
          </div>

          <!-- Frau Klein Encounter -->
          <div style="display: flex; gap: 10px; background: #F8F9FA; border: 1.5px solid #CBD5E0; border-radius: 10px; padding: 10px;">
            <div style="font-size: 28px;">🥔</div>
            <div style="font-size: 12px; color: #2D3748; line-height: 1.4;">
              <strong>Frau Klein (passing by with potatoes):</strong><br>
              <em>"Looking for the registrar, boy? In Germany, at 16:59:59 the pen leaves the hand! At 17:01, they are already on the sofa drinking herbal tea. Come back tomorrow!"</em>
            </div>
          </div>

          <!-- British Thought -->
          <div style="background: #FFE8D6; border-left: 4px solid #E76F51; border-radius: 6px; padding: 10px; font-size: 11.5px; color: #7B241C; line-height: 1.35;">
            💭 <em>"A ninety-minute work week! Truly the backbone of the republic. Well, I have no money, no enrollment, and night is falling."</em>
          </div>

          <!-- Leave Button -->
          <button id="btn-leave-uni" style="
            background: #E76F51;
            color: #FFF;
            border: 2px solid #264653;
            border-bottom: 4px solid #B2462E;
            border-radius: 10px;
            padding: 12px;
            font-size: 13px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            🌙 Walk into the Evening (Find Work)
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-leave-uni').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('click');
      // Record Frau Klein Shadow of Mordor memory
      if (window.FFH.NPCMemoryManager) {
        window.FFH.NPCMemoryManager.recordEncounter('NPC_FRAU_KLEIN', 'met_at_locked_uni', 10, this.game.state);
      }
      modal.remove();
      if (onLeaveCallback) onLeaveCallback();
    };
  }

  showDayRecapModal(onSleepCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('day-recap-modal');
    if (prev) prev.remove();

    const s = this.game.state;
    const wallet = (s.wallet !== undefined ? s.wallet : 20.0).toFixed(2);
    const goal = (window.FFH.ECONOMY?.TUITION_GOAL || 250).toFixed(2);
    const deficit = Math.max(0, (window.FFH.ECONOMY?.TUITION_GOAL || 250) - (s.wallet || 20)).toFixed(2);

    const modal = document.createElement('div');
    modal.id = 'day-recap-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 15, 26, 0.94);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.4s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #1D2D44;
        border: 3px solid #FFD166;
        border-radius: 16px;
        width: 100%;
        max-width: 340px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #FFFFFF;
      ">
        <!-- Night Header -->
        <div style="background: #0D1B2A; padding: 16px; text-align: center; border-bottom: 2px solid #415A77;">
          <div style="font-size: 28px; margin-bottom: 4px;">🌙</div>
          <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 2px;">TAG 1 VORBEI (DAY 1 CONCLUDED)</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">22:00 Uhr — Gesetzliche Ruhezeit</div>
        </div>

        <div style="padding: 18px 16px; display: flex; flex-direction: column; gap: 12px;">
          <!-- Financial Reality Box -->
          <div style="background: rgba(255,255,255,0.06); border: 1px solid #415A77; border-radius: 10px; padding: 12px; font-family: monospace, sans-serif; font-size: 12px; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Current Wallet:</span>
              <span style="font-weight: 900; color: #2EC4B6;">${wallet} €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Tuition Needed:</span>
              <span style="font-weight: 900; color: #FFD166;">${goal} €</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Remaining Deficit:</span>
              <span style="font-weight: 900; color: #E76F51;">-${deficit} €</span>
            </div>
            <div style="border-top: 1px dashed #415A77; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Days until Deadline:</span>
              <span style="font-weight: 900; color: #FFF;">6 Days</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Pizzeria Rejection:</span>
              <span style="font-weight: 900; color: #E76F51;">1 ("No Italian")</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #A0AEC0;">Bakery Rejection:</span>
              <span style="font-weight: 900; color: #E76F51;">1 ("B1 German")</span>
            </div>
          </div>

          <!-- British Monologue -->
          <div style="background: rgba(255, 209, 102, 0.1); border-left: 4px solid #FFD166; border-radius: 6px; padding: 10px; font-size: 11.5px; color: #FFE8D6; line-height: 1.35;">
            💭 <em>"Turned down at the pizzeria for being too English, rejected at the bakery for missing a B1 certificate. Nina at Kruma Express is my only hope tomorrow morning."</em>
          </div>

          <!-- Sleep Button -->
          <button id="btn-sleep-morning" style="
            background: #2EC4B6;
            color: #0D1B2A;
            border: 2px solid #FFD166;
            border-bottom: 5px solid #1A7A73;
            border-radius: 12px;
            padding: 14px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">
            😴 SLEEP (END OF DAY 1)
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-sleep-morning').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('bell');
      modal.remove();
      // Show Act 1 Completed Celebration Banner
      if (this.spawnFloatingText) {
        this.spawnFloatingText('🎉 ACT 1 COMPLETED! (DAY 1 SURVIVED)', window.innerWidth / 2, window.innerHeight * 0.4, '#FFD166');
      }
      if (onSleepCallback) onSleepCallback();
    };
  }

  showPizzeriaJobModal(onAcknowledgeCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('pizzeria-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'pizzeria-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(18, 24, 38, 0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #FFFDF9;
        border: 3px solid #264653;
        border-radius: 14px;
        width: 100%;
        max-width: 320px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div style="background: #264653; padding: 14px 16px; color: #FFF; text-align: center; border-bottom: 2px solid #E76F51;">
          <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 1.5px;">LA BELLA NAPOLI</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">🍕 Job Inquiry</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 13.5px; color: #2D3748; line-height: 1.5;">
            You walk into the pizzeria, taking a deep breath of fresh garlic and oregano. You ask the owner if he needs a delivery driver.
          </div>
          
          <div style="background: #F4E8D8; border-left: 5px solid #E76F51; border-radius: 4px; padding: 12px; font-size: 13px; color: #2D3748; font-style: italic;">
            "No Italian, no pizza flipping, and your German sounds like a broken lawnmower! Try the bakery down the street, kid!"<br>
            <strong style="display: block; margin-top: 6px; font-style: normal; font-size: 11px; color: #E76F51;">— Mathias Becker (Owner)</strong>
          </div>

          <button id="btn-leave-pizzeria" style="
            background: #E76F51;
            color: #FFFFFF;
            border: none;
            border-bottom: 4px solid #C0392B;
            border-radius: 10px;
            padding: 12px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            Walk Away
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-leave-pizzeria').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('wrong');
      modal.remove();
      if (onAcknowledgeCallback) onAcknowledgeCallback();
    };
  }

  showBakeryJobModal(onAcknowledgeCallback) {
    const parent = document.getElementById('ui-container') || document.body;
    const prev = document.getElementById('bakery-modal');
    if (prev) prev.remove();

    const modal = document.createElement('div');
    modal.id = 'bakery-modal';
    modal.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(18, 24, 38, 0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      pointer-events: auto;
      animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div style="
        background: #FFFDF9;
        border: 3px solid #264653;
        border-radius: 14px;
        width: 100%;
        max-width: 320px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div style="background: #264653; padding: 14px 16px; color: #FFF; text-align: center; border-bottom: 2px solid #E76F51;">
          <div style="font-size: 11px; color: #FFD166; font-weight: 800; letter-spacing: 1.5px;">BÄCKEREI HANSA</div>
          <div style="font-size: 18px; font-weight: 900; margin-top: 2px;">🥨 Job Inquiry</div>
        </div>

        <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 13.5px; color: #2D3748; line-height: 1.5;">
            You enter the bakery, eyeing the warm crusty rye bread. You ask the old lady behind the counter if she needs any help.
          </div>
          
          <div style="background: #F4E8D8; border-left: 5px solid #E76F51; border-radius: 4px; padding: 12px; font-size: 13px; color: #2D3748; font-style: italic;">
            "You want to knead rye bread? You need a B1 German certificate and five years of flour apprenticeship! But Nina at Kruma Express warehouse hires anyone who can cycle without fainting!"<br>
            <strong style="display: block; margin-top: 6px; font-style: normal; font-size: 11px; color: #E76F51;">— Oma Martha</strong>
          </div>

          <button id="btn-leave-bakery" style="
            background: #E76F51;
            color: #FFFFFF;
            border: none;
            border-bottom: 4px solid #C0392B;
            border-radius: 10px;
            padding: 12px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            Walk Away
          </button>
        </div>
      </div>
    `;

    parent.appendChild(modal);

    modal.querySelector('#btn-leave-bakery').onclick = () => {
      if (this.game.sfx) this.game.sfx.playSfx('wrong');
      modal.remove();
      if (onAcknowledgeCallback) onAcknowledgeCallback();
    };
  }
};

