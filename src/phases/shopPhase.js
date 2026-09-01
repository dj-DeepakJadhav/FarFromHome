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

    // Build the bike shop diorama room
    const state = this.game.state;
    this.shopRoom = window.FFH.createBikeShopRoom ? window.FFH.createBikeShopRoom() : window.FFH.createRoomShell(0xF4A261, 0x264653);
    this.shopRoom.position.set(0, 0, 0);
    this.game.scene.add(this.shopRoom);

    // Position camera on the Bike Shop diorama in upper half of viewport
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

    box.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 6px;">
        <div>
          <div style="font-size: 15px; font-weight: 900; color: #264653;">Hansa Rad Bike & Gear Shop</div>
          <div style="font-size: 10px; font-weight: 800; color: #E76F51; text-transform: uppercase;">Equipment Upgrades</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; color: #666; font-weight: 700; text-transform: uppercase;">Your Wallet</div>
          <div style="font-size: 12px; font-weight: 900; color: #E76F51;">${window.FFH.round2(state.wallet)}€</div>
        </div>
      </div>
      <div id="shop-items-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
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
        margin-top: 4px;
      ">Leave Shop</button>
    `;

    const list = box.querySelector('#shop-items-list');
    window.FFH.shopUpgrades.forEach(upg => {
      const isOwned = state.upgrades[upg.id];
      const isAffordable = state.wallet >= upg.cost;
      const name = upg.nameEn || upg.name || upg.id;
      const desc = upg.effectEn || upg.desc || '';
      
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
      `;
      
      const btn = document.createElement('button');
      btn.textContent = isOwned ? "OWNED" : `€${upg.cost.toFixed(2)}`;
      btn.style.cssText = `
        padding: 6px 10px;
        border-radius: 6px;
        font-weight: 900;
        font-size: 11px;
        border: 2px solid #264653;
        background: ${isOwned ? '#ADB5BD' : (isAffordable ? '#2EC4B6' : '#FF6B6B')};
        color: ${isOwned ? '#495057' : '#FFFFFF'};
        cursor: ${isOwned ? 'default' : 'pointer'};
        box-shadow: 0 2px 0 #264653;
        flex-shrink: 0;
      `;

      if (!isOwned) {
        btn.onclick = () => {
          if (isAffordable) {
            state.wallet = window.FFH.round2(state.wallet - upg.cost);
            state.upgrades[upg.id] = true;
            this.game.sfx.playSfx('success');
            this.renderShopUI();
            this.game.ui.updatePersistentHUD(state);
          } else {
            this.game.sfx.playSfx('error');
          }
        };
      }

      row.appendChild(info);
      row.appendChild(btn);
      list.appendChild(row);
    });

    const leaveBtn = box.querySelector('#btn-leave-shop');
    leaveBtn.onclick = () => {
      this.game.transitionTo('CITY_EXPLORATION');
    };

    (document.getElementById('ui-container') || document.body).appendChild(box);
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
