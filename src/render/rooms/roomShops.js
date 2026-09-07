// Commercial & Shop Room Dioramas (Bakery, Pizzeria, Bike Shop, Warehouse)
window.FFH = window.FFH || {};

// MATHIAS'S ITALIAN PIZZERIA (Mathias Becker)
window.FFH.createPizzeriaRoom = function() {
  const room = window.FFH.createRoomShell(0x9B2226, 0xEE9B00);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const ovenMat = window.FFH.createCelMaterial(0x555555);
  const oven = new THREE.Mesh(boxGeo, ovenMat);
  oven.scale.set(1.2, 1.4, 0.8);
  oven.position.set(0.85, 0.7, -1.05);
  
  const fireMat = window.FFH.createCelMaterial(0xFF5400);
  const fireCavity = new THREE.Mesh(boxGeo, fireMat);
  fireCavity.scale.set(0.7, 0.4, 0.3);
  fireCavity.position.set(0.85, 0.65, -0.68);
  room.add(oven, fireCavity);

  const counterMat = window.FFH.createCelMaterial(0x8D5B4C);
  const counter = new THREE.Mesh(boxGeo, counterMat);
  counter.scale.set(1.8, 0.85, 0.6);
  counter.position.set(-0.5, 0.42, -0.6);
  room.add(counter);

  const boxMat = window.FFH.createCelMaterial(0xFDF0D5);
  for (let y = 0.88; y <= 1.2; y += 0.07) {
    const pBox = new THREE.Mesh(boxGeo, boxMat);
    pBox.scale.set(0.42, 0.055, 0.42);
    pBox.position.set(-0.9, y, -0.6);
    room.add(pBox);
  }

  const bottleMat = window.FFH.createCelMaterial(0x588157);
  const oilBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 8), bottleMat);
  oilBottle.position.set(-0.3, 0.96, -0.6);
  room.add(oilBottle);

  const boardMat = window.FFH.createCelMaterial(0x222222);
  const menu = new THREE.Mesh(boxGeo, boardMat);
  menu.scale.set(1.1, 0.8, 0.04);
  menu.position.set(-0.4, 1.8, -1.42);
  room.add(menu);

  return room;
};

// OMA MARTHA'S BAKERY (Martha Beck)
window.FFH.createBakeryRoom = function() {
  const room = window.FFH.createRoomShell(0xDDA15E, 0xBC6C25);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const glassMat = window.FFH.createCelMaterial(0xD7F3FE);
  const showcase = new THREE.Mesh(boxGeo, glassMat);
  showcase.scale.set(1.8, 0.85, 0.65);
  showcase.position.set(-0.4, 0.42, -0.6);
  const baseMat = window.FFH.createCelMaterial(0x8D5B4C);
  const woodBase = new THREE.Mesh(boxGeo, baseMat);
  woodBase.scale.set(1.8, 0.2, 0.65);
  woodBase.position.set(-0.4, 0.1, -0.6);
  room.add(showcase, woodBase);

  const breadMat = window.FFH.createCelMaterial(0xE9C46A);
  for (let x = -1.0; x <= 0.2; x += 0.3) {
    const loaf = new THREE.Mesh(boxGeo, breadMat);
    loaf.scale.set(0.2, 0.12, 0.35);
    loaf.position.set(x, 0.45, -0.6);
    room.add(loaf);
  }

  const basketMat = window.FFH.createCelMaterial(0xCCD5AE);
  const basketShelf = new THREE.Mesh(boxGeo, baseMat);
  basketShelf.scale.set(1.2, 0.06, 0.35);
  basketShelf.position.set(0.8, 1.1, -1.25);
  const basket = new THREE.Mesh(boxGeo, basketMat);
  basket.scale.set(0.5, 0.25, 0.3);
  basket.position.set(0.8, 1.25, -1.25);
  room.add(basketShelf, basket);

  const boardMat = window.FFH.createCelMaterial(0x264653);
  const priceBoard = new THREE.Mesh(boxGeo, boardMat);
  priceBoard.scale.set(0.8, 0.9, 0.03);
  priceBoard.position.set(-0.5, 1.8, -1.42);
  room.add(priceBoard);

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
  // Cool overhead fluorescents: the navy shell absorbs the warm room light,
  // so the pick shelf (lit Standard/Phong Kenney models) needs its own rig.
  // The fluorescent tube geometry was removed. It sat at y=2.45, exactly where
  // the top-tier groceries are, so it drew two white bars straight through the
  // shelf; raised clear of the shelf it still floated free of the peaked roof
  // and read as debris. The light itself is what the shelf actually needs.
  const coolLight = new THREE.PointLight(0xEAF6FF, 0.8, 9.0);
  coolLight.position.set(0, 2.4, 0.4);
  room.add(coolLight);

  // The shared room shell is 3.2 wide with 2.6 high walls, but the pick shelf is
  // 3.7 wide and 3.4 tall, so the shelf physically did not fit: its uprights
  // punched through the ceiling line and the crown molding at y=2.52 cut across
  // the top tier, reading as stray beams over the groceries. Scale the shell so
  // it actually contains the shelf.
  room.scale.set(1.55, 1.55, 1.55);
  return room;
};

// BIKE SHOP: Dedicated Hansa Rad Bicycle Shop Diorama
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

  const toolboardMat = window.FFH.createCelMaterial(0x333333);
  const tb = new THREE.Mesh(boxGeo, toolboardMat);
  tb.scale.set(1.0, 0.6, 0.03);
  tb.position.set(0.6, 1.6, -1.42);
  room.add(tb);

  return room;
};
