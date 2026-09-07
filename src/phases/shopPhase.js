// Phase 4: Intermission shop - the reinvest half of the loop.
//
// Upgrades are stored as flags and read at the point of use (RidePhase reads
// state.upgrades.ebike, PickPhase reads state.upgrades.scanner). Nothing here
// mutates shared config data: the old applyUpgradeEffects multiplied values in
// window.FFH.streets in place, which silently compounded across restarts.
window.FFH.ShopPhase = class {
  constructor(game) {
    this.game = game;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  enter() {
    this.isTransitioning = true;
    this.transitionTime = 0;
    
    if (this.game.phases.CITY_EXPLORATION.worldGroup) {
      this.game.phases.CITY_EXPLORATION.worldGroup.visible = false;
    }
    if (this.game.phases.CITY_EXPLORATION.courier) {
      this.game.phases.CITY_EXPLORATION.courier.visible = false;
    }

    // Build the student dorm diorama room with visible upgrades
    const state = this.game.state;
    this.shopRoom = window.FFH.createLevel0Room ? window.FFH.createLevel0Room(state) : window.FFH.createRoomShell(0xF29688, 0x76C8B8);
    this.shopRoom.position.set(0, 0, 0);
    this.game.scene.add(this.shopRoom);

    // Position camera on the Room diorama in upper half of viewport
    const cam = this.game.cameras.mainCamera;
    this.endCamTarget = new THREE.Vector3(0, -0.75, 0);
    const zoomOffset = new THREE.Vector3(10.0, 13.5, 10.0);
    this.endCamPos = new THREE.Vector3().copy(this.endCamTarget).add(zoomOffset);
    this.endCamZoom = 2.15;

    cam.position.copy(this.endCamPos);
    cam.lookAt(this.endCamTarget);
    if (cam.isOrthographicCamera) {
      cam.zoom = this.endCamZoom;
      cam.updateProjectionMatrix();
    }
    this.isTransitioning = false;

    // Render HTML Shop UI
    this.game.ui.clear();
    this.renderShopUI();
  }

  update(delta) {
    const cam = this.game.cameras.mainCamera;
    if (cam.isOrthographicCamera && cam.zoom !== this.endCamZoom) {
      cam.zoom = this.endCamZoom;
      cam.updateProjectionMatrix();
    }
    cam.position.copy(this.endCamPos);
    cam.lookAt(this.endCamTarget);
  }

  renderShopUI() {
    const existing = document.getElementById('shop-ui-overlay');
    if (existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'shop-ui-overlay';
    box.style.cssText = `
      position: absolute;
      bottom: 16px;
      left: 14px;
      right: 14px;
      max-height: 54vh;
      background: #FFFFFF;
      border-top: 3px solid #E76F51;
      border-bottom: 3px solid #264653;
      border-left: 2px solid #264653;
      border-right: 2px solid #264653;
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      pointer-events: auto;
      animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 200;
      overflow-y: auto;
    `;

    const state = this.game.state;
    const goal = window.FFH.ECONOMY?.TUITION_GOAL || 250;

    const isWarm = !!state.storyFlags.radiatorWarmth;
    const canHeat = state.wallet >= 2.0;

    box.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 6px;">
        <div>
          <div style="font-size: 15px; font-weight: 900; color: #264653;">WG Dorm Room & Sanctuary</div>
          <div style="font-size: 10px; font-weight: 800; color: #E76F51; text-transform: uppercase;">Student Life • Upgrades & Respite</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; color: #666; font-weight: 700; text-transform: uppercase;">Your Wallet</div>
          <div style="font-size: 13px; font-weight: 900; color: #E76F51;">${window.FFH.round2(state.wallet)}€</div>
        </div>
      </div>

      <!-- DORM SANCTUARY & SURVIVAL TRADE-OFFS -->
      <div style="background: #F4F1DE; border: 2px solid #264653; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 900; color: #264653;">🪟 DORM CLIMATE & SANCTUARY</span>
          <span style="font-size: 10px; font-weight: 800; color: ${isWarm ? '#2A9D8F' : '#3D5A80'};">
            ${isWarm ? '♨️ Radiator Level 3 (Warm)' : '🥶 Room Cold (Shivering)'}
          </span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-radiator-toggle" style="
            flex: 1;
            padding: 6px 8px;
            font-size: 10px;
            font-weight: 800;
            border-radius: 6px;
            border: 1.5px solid #264653;
            background: ${isWarm ? '#E76F51' : '#F4A261'};
            color: #FFFFFF;
            cursor: pointer;
            box-shadow: 0 2px 0 #264653;
          ">
            ${isWarm ? '🔥 Radiator Active (-€2.00 Paid)' : (canHeat ? '🔥 Turn Radiator to Level 3 (-€2.00)' : '🥶 Shiver (Need €2.00 for Heat)')}
          </button>
          <button id="btn-stosslueften" style="
            flex: 1;
            padding: 6px 8px;
            font-size: 10px;
            font-weight: 800;
            border-radius: 6px;
            border: 1.5px solid #264653;
            background: #2EC4B6;
            color: #FFFFFF;
            cursor: pointer;
            box-shadow: 0 2px 0 #264653;
          ">
            🌬️ 5-Min Stoßlüften (+25 Fresh)
          </button>
        </div>
        <div style="display: flex; gap: 6px; border-top: 1px dashed #CCC; padding-top: 5px;">
          <button id="btn-family-postcard" style="
            flex: 1;
            padding: 4px 6px;
            font-size: 9.5px;
            font-weight: 800;
            border-radius: 5px;
            border: 1px solid #264653;
            background: #FFF;
            color: #264653;
            cursor: pointer;
          ">💌 Postcard from Home</button>
          <button id="btn-fridge-note" style="
            flex: 1;
            padding: 4px 6px;
            font-size: 9.5px;
            font-weight: 800;
            border-radius: 5px;
            border: 1px solid #264653;
            background: #FFF;
            color: #264653;
            cursor: pointer;
          ">📋 Lokker's House Rules</button>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 900; color: #264653; margin-top: 2px;">🚴 EQUIPMENT & GEAR DIRECTORY:</div>
      <div id="shop-items-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
      <button id="btn-room-skills" style="
        width: 100%;
        padding: 9px 12px;
        border: 2px solid #264653;
        border-radius: 8px;
        background: #FF006E;
        color: #FFFFFF;
        font-weight: 900;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 3px 0 #A30046;
        margin-top: 4px;
      ">⭐ Open Expat Skill Tree (${state.skillPoints || 0} SP Available)</button>
      <button id="btn-sleep-morning" style="
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #264653;
        border-radius: 8px;
        background: #2EC4B6;
        color: #FFFFFF;
        font-weight: 900;
        font-size: 13px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 3px 0 #1A7A70;
        margin-top: 4px;
      ">🛏️ Sleep Until Morning (Start Next Day)</button>
      <button id="btn-leave-shop" style="
        width: 100%;
        padding: 10px 14px;
        border: none;
        border-radius: 8px;
        background: #F4A261;
        color: #264653;
        font-weight: 900;
        font-size: 13px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 3px 0 #264653;
        margin-top: 2px;
      ">Leave Room & Explore City</button>
    `;

    const list = box.querySelector('#shop-items-list');
    window.FFH.shopUpgrades.forEach(upg => {
      const isOwned = state.upgrades[upg.id];
      const name = upg.nameEn || upg.name || upg.id;
      const desc = upg.effectEn || upg.desc || '';
      const locName = upg.locationName || 'City Shop';
      
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: ${isOwned ? '#E9ECEF' : '#F8F9FA'};
        padding: 8px 10px;
        border-radius: 8px;
        border: 2px solid ${isOwned ? '#ADB5BD' : '#264653'};
        gap: 8px;
      `;

      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; min-width: 0;';
      info.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 14px;">${upg.icon || '📦'}</span>
          <span style="font-size: 12px; font-weight: 900; color: #264653;">${name}</span>
        </div>
        <div style="font-size: 10px; color: #666; margin-top: 2px; line-height: 1.25;">${desc}</div>
        <div style="font-size: 9.5px; color: #E76F51; font-weight: 800; margin-top: 3px;">📍 ${isOwned ? 'Equipped in Room' : `Available at: ${locName}`}</div>
      `;
      
      const btn = document.createElement('div');
      btn.textContent = isOwned ? "EQUIPPED" : `€${upg.cost.toFixed(2)}`;
      btn.style.cssText = `
        padding: 6px 10px;
        border-radius: 6px;
        font-weight: 900;
        font-size: 11px;
        border: 2px solid #264653;
        background: ${isOwned ? '#2A9D8F' : '#E9C46A'};
        color: ${isOwned ? '#FFFFFF' : '#264653'};
        box-shadow: 0 2px 0 #264653;
        flex-shrink: 0;
        text-align: center;
      `;

      row.appendChild(info);
      row.appendChild(btn);
      list.appendChild(row);
    });

    // Radiator Heating Toggle
    const radBtn = box.querySelector('#btn-radiator-toggle');
    if (radBtn) {
      radBtn.onclick = () => {
        if (!state.storyFlags.radiatorWarmth) {
          if (state.wallet >= 2.0) {
            state.wallet = window.FFH.round2(state.wallet - 2.0);
            state.storyFlags.radiatorWarmth = true;
            state.freshness = Math.min(100, (state.freshness || 100) + 30);
            this.game.sfx.playSfx('success');
            this.game.ui.spawnFloatingText('♨️ Radiator Level 3! Warmth restores +30 Freshness (-€2.00)', window.innerWidth / 2, window.innerHeight / 2, '#E76F51');
            this.renderShopUI();
            this.game.ui.updatePersistentHUD(state);
          } else {
            this.game.sfx.playSfx('error');
            this.game.ui.spawnFloatingText('🥶 Need €2.00 for heat! Shivering under the thin blanket...', window.innerWidth / 2, window.innerHeight / 2, '#3D5A80');
          }
        } else {
          this.game.ui.spawnFloatingText('♨️ The cast-iron radiator is hissing warmly with steam.', window.innerWidth / 2, window.innerHeight / 2, '#E76F51');
        }
      };
    }

    // 5-Minute Shock Ventilation (Stoßlüften) Respite
    const ventBtn = box.querySelector('#btn-stosslueften');
    if (ventBtn) {
      ventBtn.onclick = () => {
        state.storyFlags.stosslueftenCount++;
        state.freshness = Math.min(100, (state.freshness || 100) + 25);
        this.game.sfx.playSfx('success');
        this.game.ui.spawnFloatingText('🌬️ Crisp Baltic breeze! St. Mary\'s bells chime in distance. (+25 Freshness)', window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
      };
    }

    // Family Postcard Modal (Emotional Heartbeat)
    const cardBtn = box.querySelector('#btn-family-postcard');
    if (cardBtn) {
      cardBtn.onclick = () => {
        state.storyFlags.familyPostcardRead = true;
        this.showPostcardModal();
      };
    }

    // Landlord Fridge Note Modal (Authentic Expat Reality)
    const noteBtn = box.querySelector('#btn-fridge-note');
    if (noteBtn) {
      noteBtn.onclick = () => {
        state.storyFlags.fridgeNoteRead = true;
        this.showFridgeNoteModal();
      };
    }

    const skillsBtn = box.querySelector('#btn-room-skills');
    if (skillsBtn) {
      skillsBtn.onclick = () => {
        this.game.ui.showSkillTreeModal();
      };
    }

    const sleepBtn = box.querySelector('#btn-sleep-morning');
    if (sleepBtn) {
      sleepBtn.onclick = () => {
        state.day = (state.day || 1) + 1;
        state.freshness = 100;
        state.body = 100; // Restore stamina every full sleep
        state.collectedPfandIds = []; // Respawn Pfand bottles daily across Lübeck

        this.game.sfx.playSfx('success');
        this.game.ui.spawnFloatingText(`☀️ Tag ${state.day}: Guten Morgen! Stamina & Pfand Bottles Restored.`, window.innerWidth / 2, window.innerHeight / 2, '#FFB703');
        
        // Reset daylight cycle to morning
        if (this.game.phases.CITY_EXPLORATION && this.game.phases.CITY_EXPLORATION.updateAtmosphericTime) {
          this.game.phases.CITY_EXPLORATION.updateAtmosphericTime(0.35);
        }
        this.game.ui.updatePersistentHUD(state);
        this.game.transitionTo('CITY_EXPLORATION');
      };
    }

    const leaveBtn = box.querySelector('#btn-leave-shop');
    leaveBtn.onclick = () => {
      this.game.transitionTo('CITY_EXPLORATION');
    };

    (document.getElementById('ui-container') || document.body).appendChild(box);
  }

  showPostcardModal() {
    const existing = document.getElementById('postcard-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'postcard-modal-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        background: #FFFDF7;
        border: 3px solid #8D5B4C;
        border-radius: 12px;
        padding: 20px;
        max-width: 350px;
        width: 100%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-family: Georgia, serif;
        position: relative;
      ">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #D4A373; padding-bottom: 8px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #8D5B4C; letter-spacing: 1px;">PAR AVION • AIR MAIL</div>
          <div style="font-size: 11px; color: #E76F51; font-weight: bold;">📬 HOME ➔ LÜBECK</div>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #2B2D42; margin-bottom: 12px; font-style: italic;">
          "Dearest child,<br><br>
          We look at the calendar every morning back home. It must be so cold by the Baltic Sea right now! Are you keeping warm? How is the city registration going?<br><br>
          Your father told the whole neighborhood that you are cycling across historic cobblestones delivering for Kruma Express. We know money is tight and every euro is hard-earned. Please remember to eat warm food and take care of your health.<br><br>
          We are so endlessly proud of your courage. One day soon, you will hold that degree."
        </p>
        <div style="text-align: right; font-weight: bold; color: #8D5B4C; font-size: 13px; margin-bottom: 16px;">
          (Maa)& Papa ❤️
        </div>
        <button id="btn-close-postcard" style="
          width: 100%;
          padding: 10px;
          background: #8D5B4C;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-family: sans-serif;
          cursor: pointer;
          font-size: 12px;
        ">KEEP CLOSE TO HEART (CLOSE)</button>
      </div>
    `;

    overlay.querySelector('#btn-close-postcard').onclick = () => overlay.remove();
    (document.getElementById('ui-container') || document.body).appendChild(overlay);
  }

  showFridgeNoteModal() {
    const existing = document.getElementById('fridge-note-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'fridge-note-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        background: #FFF3B0;
        border: 2px solid #333333;
        border-radius: 8px;
        padding: 18px;
        max-width: 350px;
        width: 100%;
        box-shadow: 4px 6px 0 #333333;
        font-family: monospace, sans-serif;
      ">
        <div style="border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 10px; font-weight: 900; font-size: 13px; color: #D62828;">
          📌 HAUSORDNUNG (HANS LOKKER)</div>
        <div style="font-size: 11px; line-height: 1.5; color: #222; margin-bottom: 14px;">
          <strong>1. RUHEZEIT (Quiet Hours):</strong> STRICTLY 22:00 ,  07:00. No loud footsteps or slamming corridor doors!<br><br>
          <strong>2. MÜLLTRENNUNG (Waste Sorting):</strong><br>
          &nbsp;• 🟦 <strong>Blaue Tonne:</strong> Paper, clean cardboard, study notes.<br>
          &nbsp;• 🟨 <strong>Gelber Sack:</strong> Packaging, plastic bottles, yogurt cups.<br>
          &nbsp;• ⬛ <strong>Restmüll:</strong> Residual waste only.<br>
          <em>*Contaminating bins will result in a building-wide penalty!*</em><br><br>
          <strong>3. STOSSLÜFTEN:</strong> Open windows completely for 5 minutes twice daily. Tilted windows in winter waste heating energy!<br><br>
          <strong>4. COURIER BICYCLES:</strong> Muddy tires belong outside in the bike rack, never in the carpeted hallway!
        </div>
        <button id="btn-close-fridge" style="
          width: 100%;
          padding: 10px;
          background: #333333;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          font-family: sans-serif;
          cursor: pointer;
          font-size: 12px;
        ">VERSTANDEN (I UNDERSTAND)</button>
      </div>
    `;

    overlay.querySelector('#btn-close-fridge').onclick = () => overlay.remove();
    (document.getElementById('ui-container') || document.body).appendChild(overlay);
  }

  exit() {
    const existing = document.getElementById('shop-ui-overlay');
    if (existing) existing.remove();
    this.game.ui.clear();
    const cam = this.game.cameras.mainCamera;
    if (cam && cam.isOrthographicCamera) {
      cam.zoom = 1.0;
      cam.updateProjectionMatrix();
    }
    if (this.shopRoom) {
      this.game.scene.remove(this.shopRoom);
      this.shopRoom = null;
    }

    // Restore the city exploration world meshes visibility
    if (this.game.phases.CITY_EXPLORATION.worldGroup) {
      this.game.phases.CITY_EXPLORATION.worldGroup.visible = true;
    }
    if (this.game.phases.CITY_EXPLORATION.courier) {
      this.game.phases.CITY_EXPLORATION.courier.visible = true;
    }
  }
};
