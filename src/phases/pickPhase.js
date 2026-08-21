// Phase 1: Warehouse packing.
//
// This is the core action of the whole game: read the order, find the item,
// tap it. Everything else in the loop is pressure and payoff around this.
window.FFH.PickPhase = class {
  constructor(game) {
    this.game = game;
    this.shelfGroup = null;
    this.shelvedMeshes = [];
    this.bagMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activePicksCount = 0;
    this.shift = null;
    this.timeRemaining = 0;
    this.pickDuration = 0;

    this.onTap = this.onTap.bind(this);
  }

  enter() {
    const state = this.game.state;

    // Every per-shift meter resets here.
    window.FFH.resetShiftState(state);

    this.shelvedMeshes = [];
    this.activePicksCount = 0;
    this.shift = window.FFH.getShift(state.currentShift);
    this.timeRemaining = this.shift.pickTimeLimit || 25;
    this.pickDuration = this.timeRemaining;

    // Clear previous phase meshes, keeping lights
    while (this.game.scene.children.length > 2) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    state.activeOrder = this.buildOrder(this.shift);
    this.buildShelf(this.shift, state.activeOrder);

    // Paper bag the picked items drop into
    const bagGeo = new THREE.BoxGeometry(0.8, 1.0, 0.6);
    const bagMat = window.FFH.createCelMaterial(0xD2B48C);
    this.bagMesh = new THREE.Mesh(bagGeo, bagMat);
    this.bagMesh.position.set(0, 0.1, 2.0);
    this.game.scene.add(this.bagMesh);

    // Audio-Leads-Manifest: Speak first item ~1.5s before visual manifest resolves
    const firstUnpacked = state.activeOrder[0];
    if (firstUnpacked && this.game.speech) {
      this.game.speech.speakKey(firstUnpacked.id);
    }

    this.game.ui.showWarehouseManifest();
    window.addEventListener('pointerdown', this.onTap);
  }

  update(delta) {
    if (this.timeRemaining > 0) {
      this.timeRemaining = Math.max(0, this.timeRemaining - delta);
      
      // Decay freshness off elapsed pick time
      const decayRatio = delta / this.pickDuration;
      const state = this.game.state;
      state.freshness = Math.max(0, state.freshness - (decayRatio * 35));

      // Refresh HUD timer and freshness bar
      if (this.game.ui && this.game.ui.updatePickHUD) {
        this.game.ui.updatePickHUD(this.timeRemaining, this.pickDuration, state.freshness);
      }

      // Time expired: end shift with whatever was packed
      if (this.timeRemaining <= 0) {
        this.exit();
        this.game.transitionTo('RIDE');
      }
    }
  }

  // The order ticket. Items may repeat - buildShelf guarantees enough copies.
  buildOrder(shift) {
    const pool = window.FFH.getShiftItemPool(shift.index);
    const order = [];

    for (let i = 0; i < shift.itemsCount; i++) {
      const itemId = pool[Math.floor(Math.random() * pool.length)];
      const itemData = window.FFH.items.find(it => it.id === itemId);
      order.push({ ...itemData, packed: false });
    }
    return order;
  }

  // Fills the shelf so that EVERY ordered item (including duplicates) has a
  // mesh to tap, then pads the remaining slots with decoys.
  //
  // The previous version filled all 12 slots at random from the full deck,
  // independently of the order - so an ordered item could simply not be on the
  // shelf and the phase could never complete. That was a hard soft-lock.
  buildShelf(shift, order) {
    const slotCount = Math.max(shift.shelfSlots, order.length);
    const deck = [];

    // 1. One mesh per ordered line, so duplicates get duplicate meshes
    for (const line of order) {
      deck.push(window.FFH.items.find(it => it.id === line.id));
    }

    // 2. Pad the rest with decoys drawn from this shift pool
    const pool = window.FFH.getShiftItemPool(shift.index);
    while (deck.length < slotCount) {
      const itemId = pool[Math.floor(Math.random() * pool.length)];
      deck.push(window.FFH.items.find(it => it.id === itemId));
    }

    this.shuffle(deck);

    this.shelfGroup = new THREE.Group();

    const steelMat = window.FFH.createCelMaterial(0x2B2D42);
    const shelfBoardMat = window.FFH.createCelMaterial(0x8D99AE);
    const priceTagMat = window.FFH.createCelMaterial(0xEF233C);

    // 4 Corner Steel Uprights
    const postGeo = new THREE.BoxGeometry(0.1, 3.4, 0.1);
    const offsets = [[-1.8, -0.35], [1.8, -0.35], [-1.8, 0.35], [1.8, 0.35]];
    offsets.forEach(([px, pz]) => {
      const p = new THREE.Mesh(postGeo, steelMat);
      p.position.set(px, 1.3, pz);
      this.shelfGroup.add(p);
    });

    const shelfGeo = new THREE.BoxGeometry(3.7, 0.08, 0.75);
    const tagGeo = new THREE.BoxGeometry(3.7, 0.05, 0.02);
    const tiers = 3;
    for (let y = 0; y < tiers; y++) {
      const plank = new THREE.Mesh(shelfGeo, shelfBoardMat);
      plank.position.set(0, y * 0.95 + 0.1, 0);
      plank.receiveShadow = true;
      
      // Price tag rail
      const tagRail = new THREE.Mesh(tagGeo, priceTagMat);
      tagRail.position.set(0, y * 0.95 + 0.1, 0.38);
      
      this.shelfGroup.add(plank, tagRail);
    }

    this.game.scene.add(this.shelfGroup);

    const cols = Math.ceil(deck.length / tiers);
    const shelfHeights = [0.05, 1.05, 2.05];
    const spread = 2.4;

    deck.forEach((itemDef, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = cols === 1 ? 0 : -spread + (col / (cols - 1)) * spread * 2;

      const itemMesh = window.FFH.createItemMesh(itemDef.type, itemDef.hex);
      itemMesh.position.set(x, shelfHeights[Math.min(row, tiers - 1)] + 0.4, 0);
      itemMesh.userData = { id: itemDef.id, def: itemDef };

      this.game.scene.add(itemMesh);
      this.shelvedMeshes.push(itemMesh);
    });
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  onTap(e) {
    const rect = this.game.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.game.cameras.warehouseCamera);
    const intersects = this.raycaster.intersectObjects(this.shelvedMeshes, true);
    if (intersects.length === 0) return;

    // Walk up to the group that carries userData
    let target = intersects[0].object;
    while (target.parent && !target.userData.id) {
      target = target.parent;
    }
    if (!target.userData || !target.userData.id) return;

    const state = this.game.state;
    const itemDef = target.userData.def;
    const neededItem = state.activeOrder.find(it => it.id === target.userData.id && !it.packed);

    if (neededItem) {
      this.onCorrectPick(neededItem, itemDef, target, e.clientX, e.clientY);
    } else {
      this.onMispick(target, e.clientX, e.clientY);
    }
  }

  onCorrectPick(orderLine, itemDef, mesh) {
    const state = this.game.state;

    orderLine.packed = true;
    this.activePicksCount++;

    state.streak++;
    state.stats.itemsPacked++;
    state.shiftBestStreak = Math.max(state.shiftBestStreak, state.streak);
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.streak);

    this.game.sfx.playSfx('success');
    this.game.particles.spawnBurst(mesh.position.x, mesh.position.y, mesh.position.z, itemDef.hex);
    this.game.particles.spawnStarSparkles(mesh.position.x, mesh.position.y, mesh.position.z);
    
    // Spawn floating score / combo text
    const streakLabel = state.streak > 1 ? ` (x${(1 + state.streak * 0.1).toFixed(1)})` : '';
    this.game.ui.spawnFloatingText(`+${itemDef.nameDe}!${streakLabel}`, eClientX || window.innerWidth / 2, eClientY || window.innerHeight / 2, '#2A9D8F');

    this.animateBagDrop(mesh);
    this.game.ui.showWarehouseManifest();

    if (this.activePicksCount >= state.activeOrder.length) {
      setTimeout(() => {
        this.exit();
        this.game.transitionTo('RIDE');
      }, 700);
    }
  }

  onMispick(mesh, eClientX, eClientY) {
    const state = this.game.state;

    state.streak = 0;
    state.mispicks++;
    state.stats.totalMispicks++;
    state.bagIntegrity = Math.max(0, state.bagIntegrity - window.FFH.ECONOMY.MISPICK_INTEGRITY_COST);

    this.game.sfx.playSfx('error');
    this.game.particles.spawnErrorSparks(mesh.position.x, mesh.position.y, mesh.position.z);
    this.game.ui.spawnFloatingText(`❌ FALSCH! (-10%)`, eClientX || window.innerWidth / 2, eClientY || window.innerHeight / 2, '#E63946');
    this.shakeItem(mesh);
    this.game.ui.showWarehouseManifest();
  }

  animateBagDrop(mesh) {
    const startPos = mesh.position.clone();
    const endPos = new THREE.Vector3(0, 0.4, 2.0);
    const duration = 0.45;
    let elapsed = 0;

    const idx = this.shelvedMeshes.indexOf(mesh);
    if (idx !== -1) this.shelvedMeshes.splice(idx, 1);

    const updateTrajectory = () => {
      elapsed += 0.016;
      const t = Math.min(elapsed / duration, 1.0);

      mesh.position.lerpVectors(startPos, endPos, t);
      mesh.position.y += Math.sin(t * Math.PI) * 1.8;
      
      // Squash and stretch
      const squash = Math.sin(t * Math.PI) * 0.3;
      mesh.scale.set(1.0 + squash, 1.0 - squash * 0.5, 1.0 + squash);

      if (t < 1.0) {
        requestAnimationFrame(updateTrajectory);
      } else {
        this.game.scene.remove(mesh);
        // Bag bounce effect on receive
        if (this.bagMesh) {
          this.bagMesh.scale.set(1.2, 0.8, 1.2);
          setTimeout(() => {
            if (this.bagMesh) this.bagMesh.scale.set(1.0, 1.0, 1.0);
          }, 120);
        }
      }
    };
    updateTrajectory();
  }

  shakeItem(mesh) {
    const startX = mesh.position.x;
    let elapsed = 0;
    const duration = 0.2;

    const runShake = () => {
      elapsed += 0.016;
      if (elapsed < duration) {
        mesh.position.x = startX + Math.sin(elapsed * 100) * 0.15;
        requestAnimationFrame(runShake);
      } else {
        mesh.position.x = startX;
      }
    };
    runShake();
  }

  exit() {
    window.removeEventListener('pointerdown', this.onTap);
    this.game.ui.hideWarehouseManifest();
  }
};
