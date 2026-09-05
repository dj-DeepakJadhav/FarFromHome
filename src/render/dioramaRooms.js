// Modular 3D Isometric Diorama Room Builders for Far From Home
// Base Room Shell & Indoor Plant Helpers (specific rooms decoupled into src/render/rooms/)
window.FFH = window.FFH || {};

// Helper: create cute low-poly potted indoor plant
window.FFH.createIndoorPlant = function() {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.22, 10), window.FFH.createCelMaterial(0xE76F51));
  pot.position.y = 0.11;
  pot.castShadow = true;
  group.add(pot);

  const leafMat = window.FFH.createCelMaterial(0x2A9D8F);
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), leafMat);
    const angle = (i / 5) * Math.PI * 2;
    leaf.scale.set(1.2, 0.4, 0.8);
    leaf.position.set(Math.cos(angle) * 0.08, 0.24 + (i % 2) * 0.05, Math.sin(angle) * 0.08);
    leaf.rotation.set(0.2, angle, 0.3);
    leaf.castShadow = true;
    group.add(leaf);
  }
  return group;
};

// Helper: build standard room shell (floor + baseboards + crown molding + warm lighting)
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

  // Woven Center Area Rug
  const rugMat = window.FFH.createCelMaterial(0xF7EDE2);
  const rug = new THREE.Mesh(boxGeo, rugMat);
  rug.scale.set(1.9, 0.02, 1.5);
  rug.position.set(0, 0.01, 0.1);
  rug.receiveShadow = true;
  room.add(rug);

  // Baseboards / Trim
  const trimMat = window.FFH.createCelMaterial(0xD4A373);
  const trim1 = new THREE.Mesh(boxGeo, trimMat);
  trim1.scale.set(3.2, 0.08, 0.05);
  trim1.position.set(0, 0.04, -1.45);
  const trim2 = new THREE.Mesh(boxGeo, trimMat);
  trim2.scale.set(0.05, 0.08, 3.2);
  trim2.position.set(-1.45, 0.04, 0);
  room.add(trim1, trim2);

  // Crown Molding along Wall Tops
  const crown1 = new THREE.Mesh(boxGeo, trimMat);
  crown1.scale.set(3.2, 0.08, 0.06);
  crown1.position.set(0, 2.52, -1.45);
  const crown2 = new THREE.Mesh(boxGeo, trimMat);
  crown2.scale.set(0.06, 0.08, 3.2);
  crown2.position.set(-1.45, 2.52, 0);
  room.add(crown1, crown2);

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

  // Warm Cozy Interior Point Light (creates depth and soft volumetric illumination)
  const warmLight = new THREE.PointLight(0xFFEAA7, 1.25, 7.0);
  warmLight.position.set(0.3, 2.2, 0.3);
  room.add(warmLight);

  return room;
};
