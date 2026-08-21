// Phase 4: Intermission shop - the reinvest half of the loop.
//
// Upgrades are stored as flags and read at the point of use (RidePhase reads
// state.upgrades.ebike, PickPhase reads state.upgrades.scanner). Nothing here
// mutates shared config data: the old applyUpgradeEffects multiplied values in
// window.FFH.streets in place, which silently compounded across restarts.
window.FFH.ShopPhase = class {
  constructor(game) {
    this.game = game;
  }

  enter() {
    while (this.game.scene.children.length > 2) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    this.game.currentCamera = this.game.cameras.warehouseCamera;
    this.game.currentCamera.position.set(8, 7.2, 8);
    this.game.currentCamera.lookAt(0, 0.85, 0);

    this.game.setupTitleDiorama();

    this.game.ui.showShopUI();
  }

  buyUpgrade(upgradeId) {
    const state = this.game.state;
    const upgrade = window.FFH.shopUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const affordable = state.wallet >= upgrade.cost;
    const alreadyOwned = state.upgrades[upgradeId];

    if (affordable && !alreadyOwned) {
      state.wallet = window.FFH.round2(state.wallet - upgrade.cost);
      state.upgrades[upgradeId] = true;
      this.game.sfx.playSfx('success');
      
      // Re-render the room diorama immediately with the new furnishings visible
      this.game.setupTitleDiorama();
    } else {
      this.game.sfx.playSfx('error');
    }

    this.game.ui.showShopUI();
  }

  closeShop() {
    this.exit();

    if (this.game.state.wallet >= window.FFH.ECONOMY.TUITION_GOAL) {
      this.game.transitionTo('WIN');
    } else {
      // Advance to the next shift and display the Room Hub first
      this.game.state.currentShift++;
      this.game.transitionTo('ROOM_HUB');
    }
  }

  exit() {
    this.game.ui.clear();
    this.game.clearTitleDiorama();
  }
};
