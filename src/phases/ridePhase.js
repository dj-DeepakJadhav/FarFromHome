// Phase 2: Route Resource Choice & Transit.
//
// In alignment with Docs/00_DESIGN_CONSTITUTION.md:
// Instead of an on-rails hazard cutscene, the courier chooses a route:
// - Kurzer Weg (Short/Cobblestone): Fast, preserves freshness, risks bag integrity.
// - Fahrradweg (Bike Lane): Slower, more freshness decay, 100% bag integrity intact.
window.FFH.RidePhase = class {
  constructor(game) {
    this.game = game;
    this.transitTime = 0;
    this.isTransiting = false;
    this.streetGroup = null;
    this.courierGroup = null;
    this.bikeMesh = null;
    this.currentChoice = null;
  }

  enter() {
    while (this.game.scene.children.length > 2) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    this.isTransiting = false;
    this.transitTime = 0;
    this.buildTransitScene();

    // Show Route Selection HUD
    this.game.ui.showRouteSelection((routeChoice) => {
      this.executeRoute(routeChoice);
    });
  }

  buildTransitScene() {
    this.streetGroup = new THREE.Group();

    // 1. Street road strip (Cobblestone / Asphalt)
    const roadMat = window.FFH.createCelMaterial(0x3D405B);
    const road = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 14), roadMat);
    road.position.set(0, -0.1, 0);
    this.streetGroup.add(road);

    // Green bike lane strip
    const bikeLaneMat = window.FFH.createCelMaterial(0x2A9D8F);
    const bikeLane = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 14), bikeLaneMat);
    bikeLane.position.set(0.8, -0.09, 0);
    this.streetGroup.add(bikeLane);

    // 2. Altbau Buildings on left and right sides
    const buildingColors = [0xE07A5F, 0xF4F1DE, 0xF2CC8F, 0x81B29A];
    for (let z = -6; z <= 6; z += 3.2) {
      const colL = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const bL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.5, 2.8), window.FFH.createCelMaterial(colL));
      bL.position.set(-2.8, 2.1, z);
      this.streetGroup.add(bL);

      const colR = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const bR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.5, 2.8), window.FFH.createCelMaterial(colR));
      bR.position.set(2.8, 2.1, z);
      this.streetGroup.add(bR);
    }

    this.game.scene.add(this.streetGroup);

    // 3. 3D Courier Character on Bike
    this.courierGroup = window.FFH.createCourierCharacter();
    this.courierGroup.position.set(0, 0, 0);
    this.courierGroup.rotation.y = Math.PI; // Face forward
    
    // Bike frame
    const bikeMat = window.FFH.createCelMaterial(0xFF6B35);
    const bikeFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 1.4), bikeMat);
    bikeFrame.position.set(0, 0.4, 0);
    
    const wheelMat = window.FFH.createCelMaterial(0x222222);
    const wheelF = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12), wheelMat);
    wheelF.rotation.z = Math.PI / 2;
    wheelF.position.set(0, 0.3, 0.6);
    const wheelB = wheelF.clone();
    wheelB.position.set(0, 0.3, -0.6);
    
    this.bikeMesh = new THREE.Group();
    this.bikeMesh.add(bikeFrame, wheelF, wheelB);
    this.courierGroup.add(this.bikeMesh);

    this.game.scene.add(this.courierGroup);
  }

  executeRoute(choice) {
    const state = this.game.state;
    this.isTransiting = true;
    this.currentChoice = choice;

    const packedItems = state.activeOrder ? state.activeOrder.filter(i => i.packed) : [];
    let baseFreshnessDecay = 0;
    let integrityDamage = 0;

    if (choice === 'kurzer_weg') {
      baseFreshnessDecay = 5;
      packedItems.forEach(item => {
        if (item.fragility === 'FRAGILE') integrityDamage += 15;
        if (item.fragility === 'PERISHABLE') baseFreshnessDecay += 5;
      });
      
      if (integrityDamage > 0) {
        this.game.triggerScreenShake();
        this.game.sfx?.playSfx('error');
      } else {
        this.game.sfx?.playSfx('slide');
      }
    } else {
      baseFreshnessDecay = 18;
      packedItems.forEach(item => {
        if (item.fragility === 'PERISHABLE') baseFreshnessDecay += 12;
      });
      this.game.sfx?.playSfx('slide');
    }

    // Apply insulated courier bag effect (halved decay)
    if (state.upgrades.insulatedBag) {
      baseFreshnessDecay = window.FFH.round2(baseFreshnessDecay * 0.5);
    }

    state.freshness = Math.max(0, state.freshness - baseFreshnessDecay);
    state.bagIntegrity = Math.max(0, state.bagIntegrity - integrityDamage);

    // E-bike speeds up delivery and reduces real-time transit delay
    const transitTimeout = state.upgrades.ebike ? 1400 : 2400;

    setTimeout(() => {
      this.exit();
      this.game.transitionTo('INTERCOM');
    }, transitTimeout);
  }

  update(delta) {
    if (this.isTransiting) {
      this.transitTime += delta;
      
      // 1. Scroll street backwards for speed feeling
      if (this.streetGroup) {
        let speed = this.currentChoice === 'kurzer_weg' ? 6.0 : 4.0;
        if (this.game.state.upgrades.ebike) speed *= 1.6; // Visual speed increase for ebike
        this.streetGroup.position.z = (this.transitTime * speed) % 3.2;
      }

      // 2. Animate Courier pedaling & bike wobble
      if (this.courierGroup) {
        const pedalingSpeed = this.game.state.upgrades.ebike ? 2.0 : 1.2;
        window.FFH.updateCourierWalk(this.courierGroup, delta, pedalingSpeed);
        
        // Cobblestone bump jitter if taking Kurzer Weg
        if (this.currentChoice === 'kurzer_weg') {
          this.courierGroup.position.y = Math.sin(this.transitTime * 35) * 0.05;
          this.courierGroup.rotation.z = Math.sin(this.transitTime * 20) * 0.08;
        } else {
          // Smooth bike lean in bike lane
          this.courierGroup.position.x = 0.8; // On green lane
          this.courierGroup.position.y = Math.sin(this.transitTime * 6) * 0.02;
          this.courierGroup.rotation.z = 0.04;
        }
      }
    }
  }

  exit() {
    this.isTransiting = false;
    if (this.streetGroup) this.game.scene.remove(this.streetGroup);
    if (this.courierGroup) this.game.scene.remove(this.courierGroup);
  }
};
