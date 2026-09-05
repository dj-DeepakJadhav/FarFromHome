// Civic & Institutional Room Dioramas (University, Dark Store, Rathaus, Sparkasse, Ausländerbehörde, Doorway)
window.FFH = window.FFH || {};

// 1. UNIVERSITY REGISTRAR (Rita Schneider)
window.FFH.createUniRoom = function() {
  const room = window.FFH.createRoomShell(0x2A9D8F, 0xE76F51);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const deskMat = window.FFH.createCelMaterial(0x8D5B4C);
  const desk = new THREE.Mesh(boxGeo, deskMat);
  desk.scale.set(2.2, 0.85, 0.65);
  desk.position.set(-0.2, 0.42, -0.65);
  room.add(desk);

  const glassMat = window.FFH.createCelMaterial(0xD7F3FE);
  const partition = new THREE.Mesh(boxGeo, glassMat);
  partition.scale.set(2.0, 0.55, 0.04);
  partition.position.set(-0.2, 1.12, -0.65);
  room.add(partition);

  const stampMat = window.FFH.createCelMaterial(0xD62828);
  const stampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 12), window.FFH.createCelMaterial(0x333333));
  stampBase.position.set(-0.9, 0.91, -0.65);
  const stampHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), stampMat);
  stampHandle.position.set(-0.9, 1.02, -0.65);
  room.add(stampBase, stampHandle);

  const paperMat1 = window.FFH.createCelMaterial(0xFFFFFF);
  const paperMat2 = window.FFH.createCelMaterial(0xF4A261);
  for (let i = 0; i < 4; i++) {
    const doc = new THREE.Mesh(boxGeo, i % 2 === 0 ? paperMat1 : paperMat2);
    doc.scale.set(0.32, 0.03, 0.24);
    doc.position.set(0.45, 0.86 + (i * 0.032), -0.65);
    room.add(doc);
  }

  const cabinetMat = window.FFH.createCelMaterial(0x457B9D);
  const cab1 = new THREE.Mesh(boxGeo, cabinetMat);
  cab1.scale.set(0.8, 1.6, 0.45);
  cab1.position.set(1.0, 0.8, -1.25);
  room.add(cab1);

  const plaqueMat = window.FFH.createCelMaterial(0xE9C46A);
  const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), plaqueMat);
  plaque.rotation.x = Math.PI / 2;
  plaque.position.set(-0.3, 1.85, -1.42);
  room.add(plaque);

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), window.FFH.createCelMaterial(0x264653));
  lampBase.position.set(-0.6, 0.86, -0.75);
  const lampCone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.15, 12), window.FFH.createCelMaterial(0x2EC4B6));
  lampCone.position.set(-0.6, 1.05, -0.75);
  room.add(lampBase, lampCone);

  return room;
};

// 2. KRUMA EXPRESS DARK STORE (Nina Voss)
window.FFH.createDarkStoreRoom = function() {
  const room = window.FFH.createRoomShell(0x1D3557, 0x457B9D);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const rackMat = window.FFH.createCelMaterial(0x333333);
  const rack = new THREE.Mesh(boxGeo, rackMat);
  rack.scale.set(2.4, 2.0, 0.4);
  rack.position.set(0, 1.0, -1.25);
  room.add(rack);

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

  const dispatchDesk = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x264653));
  dispatchDesk.scale.set(1.4, 0.8, 0.6);
  dispatchDesk.position.set(-0.6, 0.4, 0.1);
  room.add(dispatchDesk);

  const laptopMat = window.FFH.createCelMaterial(0xCCD5AE);
  const laptopBase = new THREE.Mesh(boxGeo, laptopMat);
  laptopBase.scale.set(0.35, 0.03, 0.25);
  laptopBase.position.set(-0.6, 0.82, 0.1);
  const laptopScreen = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x2EC4B6));
  laptopScreen.scale.set(0.35, 0.25, 0.03);
  laptopScreen.position.set(-0.6, 0.95, -0.01);
  room.add(laptopBase, laptopScreen);

  const crateMat = window.FFH.createCelMaterial(0xDDA15E);
  const crate1 = new THREE.Mesh(boxGeo, crateMat);
  crate1.scale.set(0.55, 0.35, 0.45);
  crate1.position.set(0.8, 0.18, 0.2);
  const crate2 = new THREE.Mesh(boxGeo, crateMat);
  crate2.scale.set(0.55, 0.35, 0.45);
  crate2.position.set(0.8, 0.53, 0.2);
  room.add(crate1, crate2);

  const canMat = window.FFH.createCelMaterial(0xFFD166);
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), canMat);
  can.position.set(-0.2, 0.86, 0.1);
  room.add(can);

  return room;
};

// 6. RATHAUS BÜRGERAMT (Herr Vogel)
window.FFH.createRathausRoom = function() {
  const room = window.FFH.createRoomShell(0x457B9D, 0x1D3557);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const counter = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x8D99AE));
  counter.scale.set(2.2, 0.9, 0.65);
  counter.position.set(-0.2, 0.45, -0.6);
  room.add(counter);

  const glass = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xD7F3FE));
  glass.scale.set(2.0, 0.6, 0.04);
  glass.position.set(-0.2, 1.2, -0.6);
  room.add(glass);

  const dispenserMat = window.FFH.createCelMaterial(0xE63946);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), window.FFH.createCelMaterial(0x333333));
  stand.position.set(1.0, 0.5, 0.3);
  const dispenserHead = new THREE.Mesh(boxGeo, dispenserMat);
  dispenserHead.scale.set(0.25, 0.3, 0.2);
  dispenserHead.position.set(1.0, 1.05, 0.3);
  room.add(stand, dispenserHead);

  const eagleMat = window.FFH.createCelMaterial(0xFFD166);
  const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), eagleMat);
  plaque.rotation.x = Math.PI / 2;
  plaque.position.set(-0.2, 1.9, -1.42);
  room.add(plaque);

  return room;
};

// 7. SPARKASSE BANK (Frau Weber)
window.FFH.createBankRoom = function() {
  const room = window.FFH.createRoomShell(0xD62828, 0x003049);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const counter = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xF7EDE2));
  counter.scale.set(2.0, 0.9, 0.65);
  counter.position.set(-0.3, 0.45, -0.6);
  room.add(counter);

  const safeMat = window.FFH.createCelMaterial(0x333333);
  const safe = new THREE.Mesh(boxGeo, safeMat);
  safe.scale.set(0.7, 1.2, 0.6);
  safe.position.set(0.9, 0.6, -1.1);
  const safeWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), window.FFH.createCelMaterial(0xFFD166));
  safeWheel.position.set(0.9, 0.6, -0.78);
  room.add(safe, safeWheel);

  const screenMat = window.FFH.createCelMaterial(0x003049);
  const screen = new THREE.Mesh(boxGeo, screenMat);
  screen.scale.set(1.0, 0.6, 0.04);
  screen.position.set(-0.3, 1.8, -1.42);
  room.add(screen);

  return room;
};

// 8. AUSLÄNDERBEHÖRDE IMMIGRATION OFFICE (Dr. Lindemann)
window.FFH.createAuslaenderRoom = function() {
  const room = window.FFH.createRoomShell(0x264653, 0x2A9D8F);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const desk = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x457B9D));
  desk.scale.set(1.8, 0.85, 0.7);
  desk.position.set(-0.3, 0.42, -0.6);
  room.add(desk);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), window.FFH.createCelMaterial(0xFFD166));
  pole.position.set(0.4, 1.1, -0.6);
  const flag = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xE76F51));
  flag.scale.set(0.18, 0.12, 0.02);
  flag.position.set(0.48, 1.25, -0.6);
  room.add(pole, flag);

  const dossier = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xF4A261));
  dossier.scale.set(0.35, 0.06, 0.28);
  dossier.position.set(-0.4, 0.88, -0.6);
  room.add(dossier);

  return room;
};

// 9. DOORSTEP INTERCOM HANDOFF (Customer Doorway Delivery)
window.FFH.createDoorwayRoom = function() {
  const room = window.FFH.createRoomShell(0xCCD5AE, 0xD4A373);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const doorMat = window.FFH.createCelMaterial(0x582F0E);
  const door = new THREE.Mesh(boxGeo, doorMat);
  door.scale.set(1.0, 2.1, 0.1);
  door.position.set(-0.2, 1.05, -1.4);
  room.add(door);

  const buzzerMat = window.FFH.createCelMaterial(0xD4A373);
  const buzzer = new THREE.Mesh(boxGeo, buzzerMat);
  buzzer.scale.set(0.2, 0.35, 0.06);
  buzzer.position.set(0.6, 1.2, -1.4);
  room.add(buzzer);

  return room;
};
