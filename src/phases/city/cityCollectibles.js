// CityCollectibles: Manages 3D Pfand bottles (€0.25 pickups), bobbing/spinning, proximity detection, and wallet rewards.
window.FFH = window.FFH || {};

window.FFH.CityCollectibles = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;

    this.pfandCollectibles = [];
    this.pfandGroup = null;
  }

  setup() {
    this.pfandCollectibles = [];
    if (!this.game.state.collectedPfandIds) {
      this.game.state.collectedPfandIds = [];
    }

    const bottleSpawns = [
      { id: 'pfand_station', x: 12.0, z: 8.5 },      // Just south of ZOB
      { id: 'pfand_bridge', x: 14.5, z: 18.0 },       // Near bridge approach
      { id: 'pfand_wg_bench', x: 9.2, z: 24.5 },      // Outside near WG dorm
      { id: 'pfand_market', x: 21.0, z: 24.0 },        // Corner of Rathaus / Market
      { id: 'pfand_bakery', x: 6.5, z: 19.5 }         // Near Bakery Hansa entrance
    ];

    const bottleGroup = new THREE.Group();
    bottleGroup.name = 'pfand_collectibles_group';

    const glassMat = new THREE.MeshLambertMaterial({ color: 0x2D6A4F, transparent: true, opacity: 0.88 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xFFD166 });
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xFFD166, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.65,
      depthWrite: false 
    });

    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 10);
    const neckGeo = new THREE.CylinderGeometry(0.035, 0.06, 0.12, 8);
    const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8);
    const ringGeo = new THREE.RingGeometry(0.22, 0.40, 16);

    bottleSpawns.forEach(spawn => {
      if (this.game.state.collectedPfandIds.includes(spawn.id)) return;

      const itemContainer = new THREE.Group();
      itemContainer.position.set(spawn.x, 0.06, spawn.z);

      const groundRing = new THREE.Mesh(ringGeo, ringMat.clone());
      groundRing.rotation.x = -Math.PI / 2;
      groundRing.position.y = 0.01;
      itemContainer.add(groundRing);

      const bottleMesh = new THREE.Group();
      const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
      bodyMesh.position.y = 0.14;
      const neckMesh = new THREE.Mesh(neckGeo, glassMat);
      neckMesh.position.y = 0.32;
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 0.39;
      
      bottleMesh.add(bodyMesh, neckMesh, capMesh);
      bottleMesh.position.y = 0.12;
      itemContainer.add(bottleMesh);

      bottleGroup.add(itemContainer);

      this.pfandCollectibles.push({
        id: spawn.id,
        x: spawn.x,
        z: spawn.z,
        container: itemContainer,
        bottleMesh: bottleMesh,
        groundRing: groundRing,
        collected: false
      });
    });

    this.game.scene.add(bottleGroup);
    this.pfandGroup = bottleGroup;
  }

  update(delta, timeSec) {
    if (!this.pfandCollectibles || this.pfandCollectibles.length === 0) return;

    const px = this.phase.playerPos.x;
    const pz = this.phase.playerPos.z;
    const PICKUP_RADIUS = 1.35;

    for (let i = this.pfandCollectibles.length - 1; i >= 0; i--) {
      const item = this.pfandCollectibles[i];
      if (item.collected) continue;

      item.bottleMesh.rotation.y += delta * 2.2;
      item.bottleMesh.position.y = 0.14 + Math.sin(timeSec * 4 + i) * 0.04;
      
      const ringScale = 1.0 + Math.sin(timeSec * 5 + i) * 0.18;
      item.groundRing.scale.set(ringScale, ringScale, ringScale);
      item.groundRing.material.opacity = 0.45 + Math.sin(timeSec * 5 + i) * 0.25;

      const dist = Math.hypot(px - item.x, pz - item.z);
      if (dist < PICKUP_RADIUS) {
        item.collected = true;
        this.game.state.collectedPfandIds.push(item.id);
        
        this.game.state.wallet = window.FFH.round2((this.game.state.wallet || 20) + 0.25);
        if (this.game.ui && this.game.ui.refreshStats) {
          this.game.ui.refreshStats(this.game.state);
        }
        if (this.game.ui && this.game.ui.updatePersistentHUD) {
          this.game.ui.updatePersistentHUD(this.game.state);
        }

        if (this.game.sfx && this.game.sfx.playSfx) {
          this.game.sfx.playSfx('register');
        }

        if (this.game.ui && this.game.ui.spawnFloatingText) {
          this.game.ui.spawnFloatingText('+0.25€ Pfand Deposit! 🍾', window.innerWidth / 2, window.innerHeight * 0.45, '#4CAF50');
        }

        const pfandThoughts = [
          "Wait... there's 25 cents on this empty bottle? In London this is rubbish. Here I'm practically an investment banker.",
          "Another Pfand bottle! That's 25 cents closer to paying university tuition.",
          "Picking up beer bottles on the street... my parents would be so proud of my academic progress."
        ];
        const randomThought = pfandThoughts[Math.floor(Math.random() * pfandThoughts.length)];
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought(randomThought);
        }

        item.container.visible = false;
        if (item.container.parent) {
          item.container.parent.remove(item.container);
        }
      }
    }
  }

  dispose() {
    if (this.pfandGroup) {
      this.game.scene.remove(this.pfandGroup);
      this.pfandGroup = null;
    }
    this.pfandCollectibles = [];
  }
};
