// Modular 3D Isometric Diorama Room Builders for Far From Home
// Styled with pastel colors, clean Kenney low-poly aesthetic, and cel shader materials
window.FFH = window.FFH || {};

// Helper: build standard room shell (floor + baseboards + 2 corner walls)
window.FFH.createRoomShell = function(wallColor = 0xE8A598, floorColor = 0x489FB5) {
  const room = new THREE.Group();
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Floor Base (3.2x3.2)
  const floorMat = window.FFH.createCelMaterial(floorColor);
  const floor = new THREE.Mesh(boxGeo, floorMat);
  floor.scale.set(3.2, 0.16, 3.2);
  floor.position.set(0, -0.08, 0);
  floor.receiveShadow = true;
  room.add(floor);

  // Wooden Edge Trim / Baseboards
  const trimMat = window.FFH.createCelMaterial(0xF7EDE2);
  const trim1 = new THREE.Mesh(boxGeo, trimMat);
  trim1.scale.set(3.2, 0.08, 0.05);
  trim1.position.set(0, 0.04, -1.45);
  const trim2 = new THREE.Mesh(boxGeo, trimMat);
  trim2.scale.set(0.05, 0.08, 3.2);
  trim2.position.set(-1.45, 0.04, 0);
  room.add(trim1, trim2);

  // Back Wall
  const wallMat = window.FFH.createCelMaterial(wallColor);
  const backWall = new THREE.Mesh(boxGeo, wallMat);
  backWall.scale.set(3.2, 2.6, 0.15);
  backWall.position.set(0, 1.25, -1.5);
  backWall.receiveShadow = true;
  room.add(backWall);

  // Left Wall
  const leftWall = new THREE.Mesh(boxGeo, wallMat);
  leftWall.scale.set(0.15, 2.6, 3.2);
  leftWall.position.set(-1.5, 1.25, 0);
  leftWall.receiveShadow = true;
  room.add(leftWall);

  return room;
};

// 1. UNIVERSITY REGISTRAR (Rita Schneider)
// Official academic counter, stamp rack, document trays, filing cabinets, desk lamp, Uni banner
window.FFH.createUniRoom = function() {
  const room = window.FFH.createRoomShell(0x2A9D8F, 0xE76F51); // Teal academic walls, terracotta floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Official Wooden Counter Desk
  const deskMat = window.FFH.createCelMaterial(0x8D5B4C);
  const desk = new THREE.Mesh(boxGeo, deskMat);
  desk.scale.set(2.2, 0.85, 0.65);
  desk.position.set(-0.2, 0.42, -0.65);
  room.add(desk);

  // Acrylic Privacy Partition
  const glassMat = window.FFH.createCelMaterial(0xD7F3FE);
  const partition = new THREE.Mesh(boxGeo, glassMat);
  partition.scale.set(2.0, 0.55, 0.04);
  partition.position.set(-0.2, 1.12, -0.65);
  room.add(partition);

  // Stamp Rack (Wooden rotating carousel)
  const stampMat = window.FFH.createCelMaterial(0xD62828);
  const stampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 12), window.FFH.createCelMaterial(0x333333));
  stampBase.position.set(-0.9, 0.91, -0.65);
  const stampHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), stampMat);
  stampHandle.position.set(-0.9, 1.02, -0.65);
  room.add(stampBase, stampHandle);

  // Stacks of Official Documents & Dossiers
  const paperMat1 = window.FFH.createCelMaterial(0xFFFFFF);
  const paperMat2 = window.FFH.createCelMaterial(0xF4A261);
  for (let i = 0; i < 4; i++) {
    const doc = new THREE.Mesh(boxGeo, i % 2 === 0 ? paperMat1 : paperMat2);
    doc.scale.set(0.32, 0.03, 0.24);
    doc.position.set(0.45, 0.86 + (i * 0.032), -0.65);
    room.add(doc);
  }

  // Filing Cabinets on Back Wall
  const cabinetMat = window.FFH.createCelMaterial(0x457B9D);
  const cab1 = new THREE.Mesh(boxGeo, cabinetMat);
  cab1.scale.set(0.8, 1.6, 0.45);
  cab1.position.set(1.0, 0.8, -1.25);
  room.add(cab1);

  // University Crest / Seal Wall Plaque
  const plaqueMat = window.FFH.createCelMaterial(0xE9C46A);
  const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), plaqueMat);
  plaque.rotation.x = Math.PI / 2;
  plaque.position.set(-0.3, 1.85, -1.42);
  room.add(plaque);

  // Desk Lamp
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), window.FFH.createCelMaterial(0x264653));
  lampBase.position.set(-0.6, 0.86, -0.75);
  const lampCone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.15, 12), window.FFH.createCelMaterial(0x2EC4B6));
  lampCone.position.set(-0.6, 1.05, -0.75);
  room.add(lampBase, lampCone);

  return room;
};

// 2. KRUMA EXPRESS DARK STORE (Nina Lindemann)
// High-tech courier hub, dispatch laptop, fruit crates, totes, barcode scanner
window.FFH.createDarkStoreRoom = function() {
  const room = window.FFH.createRoomShell(0x1D3557, 0x457B9D); // Dark navy walls, blue floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Steel Warehouse Racks on Back Wall
  const rackMat = window.FFH.createCelMaterial(0x333333);
  const rack = new THREE.Mesh(boxGeo, rackMat);
  rack.scale.set(2.4, 2.0, 0.4);
  rack.position.set(0, 1.0, -1.25);
  room.add(rack);

  // Glowing Shelf Strips
  const cyanMat = window.FFH.createCelMaterial(0x2EC4B6);
  const pinkMat = window.FFH.createCelMaterial(0xFF006E);
  const purpMat = window.FFH.createCelMaterial(0x9B5DE5);
  [
    { y: 0.5, mat: cyanMat },
    { y: 1.0, mat: pinkMat },
    { y: 1.5, mat: purpMat }
  ].forEach(shelf => {
    const lightBar = new THREE.Mesh(boxGeo, shelf.mat);
    lightBar.scale.set(2.36, 0.04, 0.42);
    lightBar.position.set(0, shelf.y, -1.25);
    room.add(lightBar);
  });

  // Dispatch Terminal Desk
  const dispatchDesk = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x264653));
  dispatchDesk.scale.set(1.4, 0.8, 0.6);
  dispatchDesk.position.set(-0.6, 0.4, 0.1);
  room.add(dispatchDesk);

  // Dispatch Laptop
  const laptopMat = window.FFH.createCelMaterial(0xCCD5AE);
  const laptopBase = new THREE.Mesh(boxGeo, laptopMat);
  laptopBase.scale.set(0.35, 0.03, 0.25);
  laptopBase.position.set(-0.6, 0.82, 0.1);
  const laptopScreen = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x2EC4B6));
  laptopScreen.scale.set(0.35, 0.25, 0.03);
  laptopScreen.position.set(-0.6, 0.95, -0.01);
  room.add(laptopBase, laptopScreen);

  // Fruit & Produce Crates
  const crateMat = window.FFH.createCelMaterial(0xDDA15E);
  const crate1 = new THREE.Mesh(boxGeo, crateMat);
  crate1.scale.set(0.55, 0.35, 0.45);
  crate1.position.set(0.8, 0.18, 0.2);
  const crate2 = new THREE.Mesh(boxGeo, crateMat);
  crate2.scale.set(0.55, 0.35, 0.45);
  crate2.position.set(0.8, 0.53, 0.2);
  room.add(crate1, crate2);

  // Energy Drink Cans (Nina's fuel)
  const canMat = window.FFH.createCelMaterial(0xFFD166);
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), canMat);
  can.position.set(-0.2, 0.86, 0.1);
  room.add(can);

  return room;
};

// 3. MATHIAS'S ITALIAN PIZZERIA (Mathias Becker)
// Stone deck pizza oven with warm red/orange fire, pizza boxes, dining chairs, chalkboard menu
window.FFH.createPizzeriaRoom = function() {
  const room = window.FFH.createRoomShell(0x9B2226, 0xEE9B00); // Warm terracotta red wall, burnt orange tile floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Stone Deck Pizza Oven (Back Corner)
  const ovenMat = window.FFH.createCelMaterial(0x555555);
  const oven = new THREE.Mesh(boxGeo, ovenMat);
  oven.scale.set(1.2, 1.4, 0.8);
  oven.position.set(0.85, 0.7, -1.05);
  
  // Oven fire cavity with glowing embers
  const fireMat = window.FFH.createCelMaterial(0xFF5400);
  const fireCavity = new THREE.Mesh(boxGeo, fireMat);
  fireCavity.scale.set(0.7, 0.4, 0.3);
  fireCavity.position.set(0.85, 0.65, -0.68);
  room.add(oven, fireCavity);

  // Wooden Service Counter
  const counterMat = window.FFH.createCelMaterial(0x8D5B4C);
  const counter = new THREE.Mesh(boxGeo, counterMat);
  counter.scale.set(1.8, 0.85, 0.6);
  counter.position.set(-0.5, 0.42, -0.6);
  room.add(counter);

  // Stacks of Fresh Pizza Boxes
  const boxMat = window.FFH.createCelMaterial(0xFDF0D5);
  for (let y = 0.88; y <= 1.2; y += 0.07) {
    const pBox = new THREE.Mesh(boxGeo, boxMat);
    pBox.scale.set(0.42, 0.055, 0.42);
    pBox.position.set(-0.9, y, -0.6);
    room.add(pBox);
  }

  // Olive Oil Bottles & Condiments
  const bottleMat = window.FFH.createCelMaterial(0x588157);
  const oilBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 8), bottleMat);
  oilBottle.position.set(-0.3, 0.96, -0.6);
  room.add(oilBottle);

  // Hanging Chalkboard Menu
  const boardMat = window.FFH.createCelMaterial(0x222222);
  const menu = new THREE.Mesh(boxGeo, boardMat);
  menu.scale.set(1.1, 0.8, 0.04);
  menu.position.set(-0.4, 1.8, -1.42);
  room.add(menu);

  return room;
};

// 4. OMA MARTHA'S BAKERY (Martha Webber)
// Fresh bread displays, wicker baskets, pastry counter, chalkboard price list
window.FFH.createBakeryRoom = function() {
  const room = window.FFH.createRoomShell(0xDDA15E, 0xBC6C25); // Warm pastry beige wall, wooden bakery floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Glass Display Bakery Showcase
  const glassMat = window.FFH.createCelMaterial(0xD7F3FE);
  const showcase = new THREE.Mesh(boxGeo, glassMat);
  showcase.scale.set(1.8, 0.85, 0.65);
  showcase.position.set(-0.4, 0.42, -0.6);
  const baseMat = window.FFH.createCelMaterial(0x8D5B4C);
  const woodBase = new THREE.Mesh(boxGeo, baseMat);
  woodBase.scale.set(1.8, 0.2, 0.65);
  woodBase.position.set(-0.4, 0.1, -0.6);
  room.add(showcase, woodBase);

  // Loaves of Sourdough & Baguettes in Display
  const breadMat = window.FFH.createCelMaterial(0xE9C46A);
  for (let x = -1.0; x <= 0.2; x += 0.3) {
    const loaf = new THREE.Mesh(boxGeo, breadMat);
    loaf.scale.set(0.2, 0.12, 0.35);
    loaf.position.set(x, 0.45, -0.6);
    room.add(loaf);
  }

  // Wicker Bread Baskets on Wall Shelf
  const basketMat = window.FFH.createCelMaterial(0xCCD5AE);
  const basketShelf = new THREE.Mesh(boxGeo, baseMat);
  basketShelf.scale.set(1.2, 0.06, 0.35);
  basketShelf.position.set(0.8, 1.1, -1.25);
  const basket = new THREE.Mesh(boxGeo, basketMat);
  basket.scale.set(0.5, 0.25, 0.3);
  basket.position.set(0.8, 1.25, -1.25);
  room.add(basketShelf, basket);

  // Flour Sack on Floor
  const sackMat = window.FFH.createCelMaterial(0xF7EDE2);
  const sack = new THREE.Mesh(boxGeo, sackMat);
  sack.scale.set(0.4, 0.5, 0.35);
  sack.position.set(1.0, 0.25, 0.4);
  room.add(sack);

  // Chalkboard Price List
  const boardMat = window.FFH.createCelMaterial(0x264653);
  const priceBoard = new THREE.Mesh(boxGeo, boardMat);
  priceBoard.scale.set(0.8, 0.9, 0.03);
  priceBoard.position.set(-0.5, 1.8, -1.42);
  room.add(priceBoard);

  return room;
};

// 5. HANS LOKKER'S SUBLET APARTMENT OFFICE (Hans Lokker)
// Key rack, quiet-hours clock on wall, recycling sorting bins (Ruhezeit enforcer)
window.FFH.createWGRoom = function() {
  const room = window.FFH.createRoomShell(0x588157, 0x3A5A40); // Olive green wall, dark forest green floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Caretaker Wooden Desk
  const desk = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x606C38));
  desk.scale.set(1.6, 0.8, 0.65);
  desk.position.set(-0.4, 0.4, -0.6);
  room.add(desk);

  // Master Key Rack on Wall
  const keyRackMat = window.FFH.createCelMaterial(0xDDA15E);
  const keyRack = new THREE.Mesh(boxGeo, keyRackMat);
  keyRack.scale.set(0.7, 0.4, 0.04);
  keyRack.position.set(-0.4, 1.7, -1.42);
  room.add(keyRack);

  // Wall Clock (Strict 22:00 Ruhezeit indicator)
  const clockMat = window.FFH.createCelMaterial(0xFFFFFF);
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), clockMat);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(0.6, 1.85, -1.42);
  room.add(clock);

  // German Recycling Sorting Bins (Paper, Bio, Plastic, Glass)
  const binColors = [0x2A9D8F, 0xE76F51, 0xFFD166]; // Blue (Paper), Brown (Bio), Yellow (Plastik)
  binColors.forEach((col, idx) => {
    const bin = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(col));
    bin.scale.set(0.28, 0.45, 0.3);
    bin.position.set(0.6 + (idx * 0.32), 0.22, 0.6);
    room.add(bin);
  });

  return room;
};

// 6. RATHAUS BÜRGERAMT (Herr Vogel - Peak Bureaucrat)
// Formal municipal counter, hygiene glass partition, ticket dispenser (Wartemarke), eagle seal
window.FFH.createRathausRoom = function() {
  const room = window.FFH.createRoomShell(0x457B9D, 0x1D3557); // Formal steel blue walls, dark granite floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Massive Official Stone Counter
  const counter = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x8D99AE));
  counter.scale.set(2.2, 0.9, 0.65);
  counter.position.set(-0.2, 0.45, -0.6);
  room.add(counter);

  // Glass Window with Speaking Hole
  const glass = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xD7F3FE));
  glass.scale.set(2.0, 0.6, 0.04);
  glass.position.set(-0.2, 1.2, -0.6);
  room.add(glass);

  // Queue Number Ticket Dispenser (Wartemarken-Automat)
  const dispenserMat = window.FFH.createCelMaterial(0xE63946);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), window.FFH.createCelMaterial(0x333333));
  stand.position.set(1.0, 0.5, 0.3);
  const dispenserHead = new THREE.Mesh(boxGeo, dispenserMat);
  dispenserHead.scale.set(0.25, 0.3, 0.2);
  dispenserHead.position.set(1.0, 1.05, 0.3);
  room.add(stand, dispenserHead);

  // Official German Eagle Plaque
  const eagleMat = window.FFH.createCelMaterial(0xFFD166);
  const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), eagleMat);
  plaque.rotation.x = Math.PI / 2;
  plaque.position.set(-0.2, 1.9, -1.42);
  room.add(plaque);

  return room;
};

// 7. SPARKASSE BANK (Frau Weber)
// Polished banking counter, money safe, currency rate display
window.FFH.createBankRoom = function() {
  const room = window.FFH.createRoomShell(0xD62828, 0x003049); // Sparkasse red wall, navy floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Polished Marble Teller Counter
  const counter = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xF7EDE2));
  counter.scale.set(2.0, 0.9, 0.65);
  counter.position.set(-0.3, 0.45, -0.6);
  room.add(counter);

  // Steel Money Vault Safe in Corner
  const safeMat = window.FFH.createCelMaterial(0x333333);
  const safe = new THREE.Mesh(boxGeo, safeMat);
  safe.scale.set(0.7, 1.2, 0.6);
  safe.position.set(0.9, 0.6, -1.1);
  const safeWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), window.FFH.createCelMaterial(0xFFD166));
  safeWheel.position.set(0.9, 0.6, -0.78);
  room.add(safe, safeWheel);

  // Digital Interest Rate / Currency Wall Display
  const screenMat = window.FFH.createCelMaterial(0x003049);
  const screen = new THREE.Mesh(boxGeo, screenMat);
  screen.scale.set(1.0, 0.6, 0.04);
  screen.position.set(-0.3, 1.8, -1.42);
  room.add(screen);

  return room;
};

// 8. AUSLÄNDERBEHÖRDE IMMIGRATION OFFICE (Dr. Lindemann)
// Formal conference desk, state flags, citizenship certificate dossier
window.FFH.createAuslaenderRoom = function() {
  const room = window.FFH.createRoomShell(0x264653, 0x2A9D8F); // Formal dark teal walls, mint floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Heavy Executive Desk
  const desk = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x457B9D));
  desk.scale.set(1.8, 0.85, 0.7);
  desk.position.set(-0.3, 0.42, -0.6);
  room.add(desk);

  // Miniature German & EU Flagpole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), window.FFH.createCelMaterial(0xFFD166));
  pole.position.set(0.4, 1.1, -0.6);
  const flag = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xE76F51));
  flag.scale.set(0.18, 0.12, 0.02);
  flag.position.set(0.48, 1.25, -0.6);
  room.add(pole, flag);

  // Complete 4-Document Dossier Holder
  const dossier = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xF4A261));
  dossier.scale.set(0.35, 0.06, 0.28);
  dossier.position.set(-0.4, 0.88, -0.6);
  room.add(dossier);

  return room;
};

// 9. DOORSTEP INTERCOM HANDOFF (Customer Doorway Delivery)
window.FFH.createDoorwayRoom = function() {
  const room = window.FFH.createRoomShell(0xCCD5AE, 0xD4A373); // Sage green wall, stone floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Resident Door
  const doorMat = window.FFH.createCelMaterial(0x582F0E);
  const door = new THREE.Mesh(boxGeo, doorMat);
  door.scale.set(1.0, 2.1, 0.1);
  door.position.set(-0.2, 1.05, -1.4);
  room.add(door);

  // Intercom Buzzer Panel
  const buzzerMat = window.FFH.createCelMaterial(0xD4A373);
  const buzzer = new THREE.Mesh(boxGeo, buzzerMat);
  buzzer.scale.set(0.2, 0.35, 0.06);
  buzzer.position.set(0.6, 1.2, -1.4);
  room.add(buzzer);

  return room;
};

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

    // Glowing E-Motor Battery Block
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
    
    // Reflective Safety Stripes
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
    
    // Notepad & Pen
    const padMat = window.FFH.createCelMaterial(0xFFFFFF);
    const pad = new THREE.Mesh(boxGeo, padMat);
    pad.scale.set(0.22, 0.02, 0.18);
    pad.position.set(0.55, 0.66, -1.15);

    // Green Banker Desk Lamp
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

    // Colorful Vocabulary Flashcards pinned to board
    const cardColors = [0x2A9D8F, 0xE76F51, 0x7209B7]; // Blue (der), Pink (die), Purple (das)
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

// WAREHOUSE: Dedicated Warehouse Minigame Room
window.FFH.createWarehouseRoom = function() {
  const room = window.FFH.createRoomShell(0x2B2D42, 0x8D99AE);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const crateMat = window.FFH.createCelMaterial(0xD4A373);
  for (let x = -1.1; x <= -0.5; x += 0.5) {
    const c = new THREE.Mesh(boxGeo, crateMat);
    c.scale.set(0.45, 0.45, 0.45);
    c.position.set(x, 0.22, -1.0);
    room.add(c);
  }
  return room;
};

// BIKE SHOP: Dedicated Hansa Rad Bicycle Shop Diorama with dynamic upgrade displays
window.FFH.createBikeShopRoom = function(state = window.FFH.state) {
  const room = window.FFH.createRoomShell(0x003049, 0x780000);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const bench = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xDDA15E));
  bench.scale.set(1.4, 0.75, 0.6);
  bench.position.set(-0.6, 0.37, -0.9);
  room.add(bench);
  const tireMat = window.FFH.createCelMaterial(0x333333);
  for (let x = -0.5; x <= 0.5; x += 0.5) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 24), tireMat);
    tire.position.set(x, 1.6, -1.4);
    room.add(tire);
  }

  // Mechanic Toolboard & Wrenches
  const toolboardMat = window.FFH.createCelMaterial(0x333333);
  const tb = new THREE.Mesh(boxGeo, toolboardMat);
  tb.scale.set(1.0, 0.6, 0.03);
  tb.position.set(0.6, 1.6, -1.42);
  room.add(tb);

  return room;
};
