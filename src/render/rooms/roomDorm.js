// Student Dorm & WG Room Dioramas
window.FFH = window.FFH || {};

// LEVEL 0: Student Dorm Room (Possessions Look & Feel + Room-As-Progress-Bar)
window.FFH.createLevel0Room = function(state = window.FFH.state) {
  const room = window.FFH.createRoomShell(0xF29688, 0x76C8B8); // Warm salmon-pink wall, mint turquoise floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const upgrades = state?.upgrades || {};

  // Stoßlüften Bedroom Window (Tilted open with breeze)
  const windowFrameMat = window.FFH.createCelMaterial(0x333333);
  const windowGlassMat = window.FFH.createCelMaterial(0xD7F3FE);
  const winFrame = new THREE.Mesh(boxGeo, windowFrameMat);
  winFrame.scale.set(0.12, 1.3, 0.95);
  winFrame.position.set(-1.46, 1.6, 0.3);
  const winGlass = new THREE.Mesh(boxGeo, windowGlassMat);
  winGlass.scale.set(0.14, 1.15, 0.82);
  winGlass.position.set(-1.46, 1.6, 0.3);
  winGlass.rotation.z = 0.08; // Tilted Kippfenster
  room.add(winFrame, winGlass);

  // Mattress & Bed
  const mattress = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xF7EDE2));
  mattress.scale.set(1.1, 0.15, 1.7);
  mattress.position.set(-0.75, 0.08, -0.4);
  const blanket = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xF6BD60));
  blanket.scale.set(1.12, 0.17, 1.1);
  blanket.position.set(-0.75, 0.12, -0.1);
  const pillow = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xFFFFFF));
  pillow.scale.set(0.7, 0.12, 0.4);
  pillow.position.set(-0.75, 0.18, -1.0);
  room.add(mattress, blanket, pillow);

  // Rug
  const rug = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x588157));
  rug.scale.set(1.6, 0.02, 1.4);
  rug.position.set(0.2, 0.01, 0.3);
  room.add(rug);

  // Cast-Iron German Radiator with Damp Wool Coat (Grit & Immigrant Reality)
  const radMat = window.FFH.createCelMaterial(0xE5E5E5);
  const rad = new THREE.Mesh(boxGeo, radMat);
  rad.scale.set(0.12, 0.55, 0.75);
  rad.position.set(-1.44, 0.35, 1.0);
  const coatMat = window.FFH.createCelMaterial(0x3D5A80);
  const coat = new THREE.Mesh(boxGeo, coatMat);
  coat.scale.set(0.14, 0.45, 0.45);
  coat.position.set(-1.44, 0.45, 1.0);
  room.add(rad, coat);

  // German Student Pfand Bottles Crate in Corner
  const crateMat = window.FFH.createCelMaterial(0xE76F51);
  const pCrate = new THREE.Mesh(boxGeo, crateMat);
  pCrate.scale.set(0.35, 0.22, 0.28);
  pCrate.position.set(1.15, 0.11, -1.15);
  room.add(pCrate);
  const bottleMat = window.FFH.createCelMaterial(0x588157);
  for (let bx = -0.08; bx <= 0.08; bx += 0.08) {
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8), bottleMat);
    bottle.position.set(1.15 + bx, 0.22, -1.15);
    room.add(bottle);
  }

  // 1. E-Bike Upgrade Visualizer
  if (upgrades.ebike) {
    const bikeGroup = new THREE.Group();
    const frameMat = window.FFH.createCelMaterial(0x2A9D8F);
    const wheelMat = window.FFH.createCelMaterial(0x222222);
    const motorMat = window.FFH.createCelMaterial(0xFFD166);

    const fWheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 16), wheelMat);
    fWheel.position.set(0.45, 0.22, 0);
    const rWheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 16), wheelMat);
    rWheel.position.set(-0.45, 0.22, 0);

    const bFrame = new THREE.Mesh(boxGeo, frameMat);
    bFrame.scale.set(0.7, 0.04, 0.04);
    bFrame.position.set(0, 0.32, 0);

    const battery = new THREE.Mesh(boxGeo, motorMat);
    battery.scale.set(0.22, 0.12, 0.08);
    battery.position.set(0.05, 0.28, 0);

    bikeGroup.add(fWheel, rWheel, bFrame, battery);
    bikeGroup.position.set(0.75, 0, 0.75);
    bikeGroup.rotation.y = -Math.PI / 4;
    room.add(bikeGroup);
  }

  // 2. Thermal Insulated Courier Bag Visualizer
  if (upgrades.thermalBag) {
    const bagGroup = new THREE.Group();
    const bagMat = window.FFH.createCelMaterial(0xFF6B35);
    const bagMesh = new THREE.Mesh(boxGeo, bagMat);
    bagMesh.scale.set(0.42, 0.52, 0.32);
    bagMesh.position.set(0, 0.26, 0);
    
    const stripeMat = window.FFH.createCelMaterial(0xE9C46A);
    const stripe = new THREE.Mesh(boxGeo, stripeMat);
    stripe.scale.set(0.44, 0.06, 0.33);
    stripe.position.set(0, 0.26, 0);

    bagGroup.add(bagMesh, stripe);
    bagGroup.position.set(-1.15, 0, 0.95);
    bagGroup.rotation.y = Math.PI / 6;
    room.add(bagGroup);
  }

  // 3. Study Desk & Pocket Notepad Visualizer
  if (upgrades.pocketNotepad) {
    const deskMat = window.FFH.createCelMaterial(0xDDA15E);
    const desk = new THREE.Mesh(boxGeo, deskMat);
    desk.scale.set(0.85, 0.65, 0.45);
    desk.position.set(0.55, 0.32, -1.15);
    
    const padMat = window.FFH.createCelMaterial(0xFFFFFF);
    const pad = new THREE.Mesh(boxGeo, padMat);
    pad.scale.set(0.22, 0.02, 0.18);
    pad.position.set(0.55, 0.66, -1.15);

    const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.1, 8), window.FFH.createCelMaterial(0x2A9D8F));
    lamp.position.set(0.8, 0.75, -1.2);
    lamp.rotation.z = -0.3;

    room.add(desk, pad, lamp);
  }

  // 4. Vocab Cards & Shelf Labels (Study Corkboard on Back Wall)
  if (upgrades.vocabCards || upgrades.shelfLabels) {
    const boardMat = window.FFH.createCelMaterial(0xC58B58);
    const corkboard = new THREE.Mesh(boxGeo, boardMat);
    corkboard.scale.set(0.9, 0.6, 0.03);
    corkboard.position.set(-0.2, 1.75, -1.42);

    const cardColors = [0x2A9D8F, 0xE76F51, 0x7209B7];
    cardColors.forEach((col, idx) => {
      const card = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(col));
      card.scale.set(0.18, 0.14, 0.015);
      card.position.set(-0.45 + (idx * 0.25), 1.75, -1.4);
      room.add(card);
    });

    room.add(corkboard);
  }

  return room;
};

// WG Room: Alias to the detailed Student Room / Sublet
window.FFH.createWGRoom = function(state = window.FFH.state) {
  return window.FFH.createLevel0Room(state);
};
