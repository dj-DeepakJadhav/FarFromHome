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

// LEVEL 0: Student Room (Possessions Look & Feel + Room-As-Progress-Bar)
// The room dynamically reflects what the player has purchased with shift earnings.
window.FFH.createLevel0Room = function(state = window.FFH.state) {
  const room = window.FFH.createRoomShell(0xF29688, 0x76C8B8); // Warm salmon-pink wall, mint turquoise floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const upgrades = state?.upgrades || {};
  const isWon = state?.wallet >= (window.FFH.ECONOMY?.TUITION_GOAL || 250);

  // 1. Bedroom Window (Left Wall) with Berlin TV tower background
  const windowFrameMat = window.FFH.createCelMaterial(0x333333);
  const windowGlassMat = window.FFH.createCelMaterial(0xD7F3FE);
  const winFrame = new THREE.Mesh(boxGeo, windowFrameMat);
  winFrame.scale.set(0.12, 1.3, 0.95);
  winFrame.position.set(-1.46, 1.6, 0.3);
  const winGlass = new THREE.Mesh(boxGeo, windowGlassMat);
  winGlass.scale.set(0.14, 1.15, 0.82);
  winGlass.position.set(-1.46, 1.6, 0.3);
  room.add(winFrame, winGlass);

  // 2. Wall Posters (Berlin Fernsehturm & Filmfestival Art)
  const posterMat1 = window.FFH.createCelMaterial(0xF7EDE2);
  const poster1 = new THREE.Mesh(boxGeo, posterMat1);
  poster1.scale.set(0.04, 0.65, 0.45);
  poster1.position.set(-1.47, 1.7, -0.6);
  
  const posterArtMat = window.FFH.createCelMaterial(0xE76F51);
  const posterArt = new THREE.Mesh(boxGeo, posterArtMat);
  posterArt.scale.set(0.05, 0.55, 0.38);
  posterArt.position.set(-1.47, 1.7, -0.6);
  room.add(poster1, posterArt);

  const poster2Mat = window.FFH.createCelMaterial(0xFFD166);
  const poster2 = new THREE.Mesh(boxGeo, poster2Mat);
  poster2.scale.set(0.55, 0.75, 0.04);
  poster2.position.set(-0.5, 1.75, -1.47);
  room.add(poster2);

  // 3. Wall Shelf with Books & Vinyl Records (Back Wall)
  const shelfMat = window.FFH.createCelMaterial(0xD4A373);
  const wallShelf = new THREE.Mesh(boxGeo, shelfMat);
  wallShelf.scale.set(0.9, 0.05, 0.22);
  wallShelf.position.set(0.7, 1.7, -1.38);
  room.add(wallShelf);

  // Vinyl Record on shelf
  const vinylMat = window.FFH.createCelMaterial(0x222222);
  const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), vinylMat);
  vinyl.rotation.x = Math.PI / 2;
  vinyl.position.set(0.85, 1.84, -1.35);
  room.add(vinyl);

  // Hanging Fairy Lights across back wall
  const fairyLine = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.6), window.FFH.createCelMaterial(0x333333));
  fairyLine.rotation.z = Math.PI / 2;
  fairyLine.position.set(0.4, 2.25, -1.45);
  room.add(fairyLine);
  
  const bulbLightMat = window.FFH.createCelMaterial(0xFFE49E);
  for (let x = -0.3; x <= 1.1; x += 0.25) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), bulbLightMat);
    bulb.position.set(x, 2.22 - Math.sin((x + 0.3) * 2.2) * 0.06, -1.43);
    room.add(bulb);
  }

  // BASE STATE: Bare floor mattress, cardboard box, coffee mug
  const mattressMat = window.FFH.createCelMaterial(0xF7EDE2);
  const mattress = new THREE.Mesh(boxGeo, mattressMat);
  mattress.scale.set(1.1, 0.15, 1.7);
  
  const blanketMat = window.FFH.createCelMaterial(0xF6BD60);
  const blanket = new THREE.Mesh(boxGeo, blanketMat);
  blanket.scale.set(1.12, 0.17, 1.1);

  const pillowMat = window.FFH.createCelMaterial(0xFFFFFF);
  const pillow = new THREE.Mesh(boxGeo, pillowMat);
  pillow.scale.set(0.7, 0.1, 0.4);

  let matY = 0.08, blanY = 0.11, pilY = 0.18;

  // TIER 1: Wooden bed frame, Study Desk, Chair & Desk Lamp
  if (upgrades.desk_lamp || isWon) {
    const bedFrameMat = window.FFH.createCelMaterial(0xDDA15E);
    const bedFrame = new THREE.Mesh(boxGeo, bedFrameMat);
    bedFrame.scale.set(1.2, 0.25, 1.8);
    bedFrame.position.set(-0.75, 0.15, -0.4);
    room.add(bedFrame);
    
    matY = 0.32; blanY = 0.35; pilY = 0.44;

    const deskMat = window.FFH.createCelMaterial(0xF5EBE0);
    const desk = new THREE.Mesh(boxGeo, deskMat);
    desk.scale.set(1.1, 0.72, 0.55);
    desk.position.set(0.65, 0.36, -0.9);

    const chairMat = window.FFH.createCelMaterial(0xF4A261);
    const chair = new THREE.Mesh(boxGeo, chairMat);
    chair.scale.set(0.4, 0.45, 0.4);
    chair.position.set(0.65, 0.25, -0.35);

    const lampMat = window.FFH.createCelMaterial(0xE76F51);
    const lamp = new THREE.Mesh(boxGeo, lampMat);
    lamp.scale.set(0.12, 0.35, 0.12);
    lamp.position.set(1.0, 0.92, -0.9);

    const laptopMat = window.FFH.createCelMaterial(0x264653);
    const laptop = new THREE.Mesh(boxGeo, laptopMat);
    laptop.scale.set(0.3, 0.03, 0.2);
    laptop.position.set(0.6, 0.74, -0.9);

    room.add(desk, chair, lamp, laptop);
  } else {
    // Single glowing wire bulb hanging from ceiling
    const bulbWire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2), window.FFH.createCelMaterial(0x333333));
    bulbWire.position.set(0, 2.3, 0);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), window.FFH.createCelMaterial(0xFFEE88));
    bulb.position.set(0, 1.65, 0);
    room.add(bulbWire, bulb);
  }

  mattress.position.set(-0.75, matY, -0.4);
  blanket.position.set(-0.75, blanY, -0.1);
  pillow.position.set(-0.75, pilY, -1.0);
  room.add(mattress, blanket, pillow);

  // Wool rug, potted windowsill plant
  const rugMat = window.FFH.createCelMaterial(0x588157);
  const rug = new THREE.Mesh(boxGeo, rugMat);
  rug.scale.set(1.6, 0.02, 1.4);
  rug.position.set(0.2, 0.01, 0.3);
  
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12), window.FFH.createCelMaterial(0xE76F51));
  pot.position.set(-1.3, 1.05, 0.3);
  const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), window.FFH.createCelMaterial(0x3A5A40));
  plant.position.set(-1.3, 1.18, 0.3);
  
  room.add(rug, pot, plant);

  // Animated Cube Cat sleeping on bed
  const catMat = window.FFH.createCelMaterial(0xE07A5F);
  const catBody = new THREE.Mesh(boxGeo, catMat);
  catBody.scale.set(0.24, 0.22, 0.3);
  catBody.position.set(-0.7, matY + 0.23, -0.6);

  const catHead = new THREE.Mesh(boxGeo, catMat);
  catHead.scale.set(0.18, 0.16, 0.16);
  catHead.position.set(-0.7, matY + 0.38, -0.48);
  room.add(catBody, catHead);

  // Cardboard Moving Box & Coffee Mug
  const boxMat = window.FFH.createCelMaterial(0xD4A373);
  const crate = new THREE.Mesh(boxGeo, boxMat);
  crate.scale.set(0.48, 0.42, 0.48);
  crate.position.set(0.85, 0.21, 0.7);
  
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8), window.FFH.createCelMaterial(0xFFFFFF));
  mug.position.set(0.85, 0.47, 0.7);
  room.add(crate, mug);

  // UPGRADES -----------------------------

  // E-Bike (Wheel leaning on crate)
  const bikeMat = window.FFH.createCelMaterial(upgrades.ebike ? 0x2A9D8F : 0x888888);
  const bikeWheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 16), bikeMat);
  bikeWheel.position.set(1.2, 0.2, 0.5);
  bikeWheel.rotation.y = Math.PI / 4;
  bikeWheel.userData = { upgradeId: 'ebike' };
  room.add(bikeWheel);
  
  // Thermal Bag (bag mesh)
  const bagMat = window.FFH.createCelMaterial(upgrades.thermalBag ? 0xFF6B35 : 0x888888);
  const bag = new THREE.Mesh(boxGeo, bagMat);
  bag.scale.set(0.38, 0.48, 0.3);
  bag.position.set(0.4, 0.24, 0.85);
  bag.rotation.y = -0.4;
  bag.userData = { upgradeId: 'thermalBag' };
  room.add(bag);

  // Shelf Labels (Labels box on crate)
  const labelsMat = window.FFH.createCelMaterial(upgrades.shelfLabels ? 0xE9C46A : 0x888888);
  const labelsBox = new THREE.Mesh(boxGeo, labelsMat);
  labelsBox.scale.set(0.15, 0.1, 0.2);
  labelsBox.position.set(0.85, 0.47, 0.5);
  labelsBox.userData = { upgradeId: 'shelfLabels' };
  room.add(labelsBox);

  // Pocket Notepad (on desk)
  const notepadMat = window.FFH.createCelMaterial(upgrades.pocketNotepad ? 0xFFD166 : 0x888888);
  const notepad = new THREE.Mesh(boxGeo, notepadMat);
  notepad.scale.set(0.15, 0.02, 0.1);
  notepad.position.set(0.4, 0.74, -0.7);
  notepad.userData = { upgradeId: 'pocketNotepad' };
  room.add(notepad);

  // Vocab Cards (on desk)
  const cardsMat = window.FFH.createCelMaterial(upgrades.vocabCards ? 0xFF006E : 0x888888);
  const cards = new THREE.Mesh(boxGeo, cardsMat);
  cards.scale.set(0.12, 0.05, 0.08);
  cards.position.set(0.8, 0.74, -0.7);
  cards.userData = { upgradeId: 'vocabCards' };
  room.add(cards);

  room.userData.updateIdle = (time) => {
    // Gentle cat breathing / tail twitch
    const cat = room.children.find(c => c.geometry && c.scale && c.scale.x > 0.23 && c.scale.x < 0.25);
    if (cat) {
      cat.scale.y = 0.22 + Math.sin(time * 2.5) * 0.015;
    }
  };

  return room;
};

// LEVEL 1: Dark Store Mini-Market
// Supermarket shelves, fruit crates, shopping cart, grocery items
window.FFH.createLevel1Room = function() {
  const room = window.FFH.createRoomShell(0x8ECAE6, 0xD4A373); // Sky blue wall, beige tile floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // 1. Tall Steel Market Shelf Unit (Back Wall)
  const shelfMat = window.FFH.createCelMaterial(0x4A4E51);
  const shelfBack = new THREE.Mesh(boxGeo, shelfMat);
  shelfBack.scale.set(2.4, 2.0, 0.4);
  shelfBack.position.set(0, 1.0, -1.2);
  room.add(shelfBack);

  // Shelf horizontal dividers
  const woodMat = window.FFH.createCelMaterial(0xCCD5AE);
  for (let y = 0.4; y <= 1.8; y += 0.5) {
    const plank = new THREE.Mesh(boxGeo, woodMat);
    plank.scale.set(2.35, 0.06, 0.42);
    plank.position.set(0, y, -1.2);
    room.add(plank);
  }

  // 2. Fruit Crates & Produce Display
  const crateMat = window.FFH.createCelMaterial(0xDDA15E);
  const crate1 = new THREE.Mesh(boxGeo, crateMat);
  crate1.scale.set(0.6, 0.35, 0.5);
  crate1.position.set(-0.8, 0.18, 0.2);
  
  const crate2 = new THREE.Mesh(boxGeo, crateMat);
  crate2.scale.set(0.6, 0.35, 0.5);
  crate2.position.set(-0.8, 0.18, 0.8);
  room.add(crate1, crate2);

  // 3. Low-Poly Grocery Items placed on shelves and in crates
  const redAppleMat = window.FFH.createCelMaterial(0xE63946);
  const milkMat = window.FFH.createCelMaterial(0x457B9D);
  const breadMat = window.FFH.createCelMaterial(0xE9C46A);

  // Apples in crate
  for (let i = -0.15; i <= 0.15; i += 0.15) {
    const apple = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), redAppleMat);
    apple.position.set(-0.8 + i, 0.4, 0.2);
    room.add(apple);
  }

  // Milk cartons on shelf
  for (let x = -0.7; x <= 0.7; x += 0.35) {
    const milk = new THREE.Mesh(boxGeo, milkMat);
    milk.scale.set(0.14, 0.28, 0.14);
    milk.position.set(x, 0.56, -1.18);
    room.add(milk);
  }

  // Bread loaves on upper shelf
  for (let x = -0.6; x <= 0.6; x += 0.4) {
    const bread = new THREE.Mesh(boxGeo, breadMat);
    bread.scale.set(0.25, 0.16, 0.18);
    bread.position.set(x, 1.05, -1.18);
    room.add(bread);
  }

  // 4. Shopping Basket / Cart
  const cartMat = window.FFH.createCelMaterial(0xE76F51);
  const cart = new THREE.Mesh(boxGeo, cartMat);
  cart.scale.set(0.6, 0.5, 0.45);
  cart.position.set(0.6, 0.3, 0.4);
  cart.rotation.y = -0.2;
  room.add(cart);

  return room;
};

// LEVEL 2: Italian Pizzeria Restaurant Pickup
window.FFH.createLevel2Room = function() {
  const room = window.FFH.createRoomShell(0xF4A261, 0x264653); // Terracotta wall, dark slate floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Restaurant Service Counter
  const counterMat = window.FFH.createCelMaterial(0xE76F51);
  const counter = new THREE.Mesh(boxGeo, counterMat);
  counter.scale.set(2.4, 0.9, 0.6);
  counter.position.set(0, 0.45, -0.6);
  room.add(counter);

  // Pizza Box Stacks
  const pizzaBoxMat = window.FFH.createCelMaterial(0xFDF0D5);
  for (let y = 0.95; y <= 1.25; y += 0.08) {
    const pBox = new THREE.Mesh(boxGeo, pizzaBoxMat);
    pBox.scale.set(0.45, 0.06, 0.45);
    pBox.position.set(-0.6, y, -0.6);
    room.add(pBox);
  }

  // Beverage Bottles
  const wineMat = window.FFH.createCelMaterial(0x7209B7);
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), wineMat);
  bottle.position.set(0.5, 1.08, -0.6);
  room.add(bottle);

  return room;
};

// LEVEL 3: Doorstep Intercom Delivery
window.FFH.createLevel3Room = function() {
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

// LEVEL 4: Furniture Store Longing (Showroom)
window.FFH.createLevel4Room = function() {
  const room = window.FFH.createRoomShell(0xD8E2DC, 0xFAEDCD); // Warm pastel grey wall, wooden floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Cozy Modern Yellow Sofa
  const sofaMat = window.FFH.createCelMaterial(0xE9C46A);
  const sofaBase = new THREE.Mesh(boxGeo, sofaMat);
  sofaBase.scale.set(1.6, 0.45, 0.75);
  sofaBase.position.set(0, 0.22, -0.7);
  
  const sofaBack = new THREE.Mesh(boxGeo, sofaMat);
  sofaBack.scale.set(1.6, 0.55, 0.22);
  sofaBack.position.set(0, 0.65, -0.98);
  room.add(sofaBase, sofaBack);

  // Floor Standing Lamp
  const lampMat = window.FFH.createCelMaterial(0x264653);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), lampMat);
  lampPole.position.set(1.0, 0.9, -0.8);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 12), window.FFH.createCelMaterial(0xE76F51));
  lampShade.position.set(1.0, 1.7, -0.8);
  room.add(lampPole, lampShade);

  // Small Coffee Table
  const tableMat = window.FFH.createCelMaterial(0xD4A373);
  const table = new THREE.Mesh(boxGeo, tableMat);
  table.scale.set(0.8, 0.35, 0.5);
  table.position.set(0, 0.18, 0.6);
  room.add(table);

  return room;
};

// LEVEL 5: Pet & Comfort Toy Store
window.FFH.createLevel5Room = function() {
  const room = window.FFH.createRoomShell(0xFFCDB2, 0xB5E2FA); // Warm peach wall, soft blue floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Tiered Display Stand
  const standMat = window.FFH.createCelMaterial(0xE5989B);
  const stand1 = new THREE.Mesh(boxGeo, standMat);
  stand1.scale.set(1.4, 0.35, 0.8);
  stand1.position.set(0, 0.18, -0.6);

  const stand2 = new THREE.Mesh(boxGeo, standMat);
  stand2.scale.set(1.0, 0.35, 0.45);
  stand2.position.set(0, 0.52, -0.8);
  room.add(stand1, stand2);

  // Cube Pets (Cat & Dog)
  const catMat = window.FFH.createCelMaterial(0x2B2D42);
  const cat = new THREE.Mesh(boxGeo, catMat);
  cat.scale.set(0.28, 0.28, 0.28);
  cat.position.set(-0.3, 0.5, -0.6);
  
  const dogMat = window.FFH.createCelMaterial(0xD4A373);
  const dog = new THREE.Mesh(boxGeo, dogMat);
  dog.scale.set(0.3, 0.3, 0.3);
  dog.position.set(0.3, 0.52, -0.6);
  room.add(cat, dog);

  return room;
};

// LEVEL 6: Christmas Celebration with Friends
window.FFH.createLevel6Room = function() {
  const room = window.FFH.createRoomShell(0x8D0801, 0x1B4332); // Deep holiday red wall, festive pine floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  // Decorated Christmas Tree
  const pineMat = window.FFH.createCelMaterial(0x2D6A4F);
  const t1 = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.9, 8), pineMat);
  t1.position.set(-0.8, 0.6, -0.8);
  const t2 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.75, 8), pineMat);
  t2.position.set(-0.8, 1.15, -0.8);
  const t3 = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), pineMat);
  t3.position.set(-0.8, 1.6, -0.8);
  
  // Gold Star on top
  const starMat = window.FFH.createCelMaterial(0xFFD166);
  const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), starMat);
  star.position.set(-0.8, 2.0, -0.8);
  room.add(t1, t2, t3, star);

  // Gift Boxes under tree
  const giftMat1 = window.FFH.createCelMaterial(0xEF476F);
  const giftMat2 = window.FFH.createCelMaterial(0x118AB2);
  const g1 = new THREE.Mesh(boxGeo, giftMat1);
  g1.scale.set(0.3, 0.25, 0.3);
  g1.position.set(-0.4, 0.13, -0.7);

  const g2 = new THREE.Mesh(boxGeo, giftMat2);
  g2.scale.set(0.26, 0.22, 0.26);
  g2.position.set(-0.8, 0.11, -0.3);
  room.add(g1, g2);

  // Holiday Feast Table
  const tableMat = window.FFH.createCelMaterial(0xFAEDCD);
  const table = new THREE.Mesh(boxGeo, tableMat);
  table.scale.set(1.4, 0.6, 0.9);
  table.position.set(0.4, 0.3, 0.1);
  room.add(table);

  return room;
};
