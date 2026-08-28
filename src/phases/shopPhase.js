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
    this.onTap = this.onTap.bind(this);
  }

  enter() {
    while (this.game.scene.children.length > 2) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    this.game.currentCamera = this.game.cameras.warehouseCamera;
    this.game.currentCamera.position.set(2.8, 2.8, 3.5);
    this.game.currentCamera.lookAt(0, 0.4, 0);

    this.game.setupTitleDiorama();
    
    // Show top HUD and exit button only
    this.game.ui.showRoomHubUI();
    this.game.ui.spawnFloatingText("TAP OBJECTS TO UPGRADE", window.innerWidth/2, window.innerHeight - 100, '#ECC238');

    window.addEventListener('pointerdown', this.onTap);
  }

  onTap(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; // Ignore UI clicks

    const rect = this.game.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.game.currentCamera);
    
    if (this.game.titleRoom) {
      const intersects = this.raycaster.intersectObjects(this.game.titleRoom.children, true);
      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target && !target.userData.upgradeId) {
          target = target.parent;
        }
        if (target && target.userData.upgradeId) {
          this.buyUpgrade(target.userData.upgradeId);
        }
      }
    }
  }

  buyUpgrade(upgradeId) {
    const state = this.game.state;
    const upgrade = window.FFH.shopUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const affordable = state.wallet >= upgrade.cost;
    const alreadyOwned = state.upgrades[upgradeId];

    if (alreadyOwned) {
      this.game.ui.spawnFloatingText("ALREADY OWNED", window.innerWidth/2, window.innerHeight/2, '#AAAAAA');
      return;
    }

    if (affordable) {
      state.wallet = window.FFH.round2(state.wallet - upgrade.cost);
      state.upgrades[upgradeId] = true;
      this.game.sfx.playSfx('success');
      this.game.ui.spawnFloatingText(`BOUGHT ${upgrade.nameEn}!`, window.innerWidth/2, window.innerHeight/2, '#2A9D8F');
      
      // Re-render the room diorama immediately with the new furnishings visible
      this.game.setupTitleDiorama();
      this.game.ui.showRoomHubUI(); // Update wallet text
    } else {
      this.game.sfx.playSfx('error');
      this.game.ui.spawnFloatingText(`NEED ${upgrade.cost}€`, window.innerWidth/2, window.innerHeight/2, '#E63946');
    }
  }

  exit() {
    window.removeEventListener('pointerdown', this.onTap);
    this.game.ui.clear();
    this.game.clearTitleDiorama();
  }
};
