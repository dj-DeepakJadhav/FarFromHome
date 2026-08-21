// Curated town builder: generic buildings assembled from free CC0 kit pieces
// (Kenney "Fantasy Town Kit", see src/data/townModels.js), famous landmarks
// kept as hand-tuned procedural geometry. Builds the whole town once as a
// static group -- at 15-25 buildings there's no need for the old real-data
// streaming approach.
window.FFH = window.FFH || {};

window.FFH.TILE_SIZE = 200; // layout/authoring grid spacing only, not a runtime streaming unit

const _kitCache = new Map();
let _gltfLoader = null;

function loadKitPiece(key) {
  if (_kitCache.has(key)) return _kitCache.get(key);
  if (!_gltfLoader) _gltfLoader = new THREE.GLTFLoader();
  const dataUri = window.FFH.townModels[key];
  const promise = new Promise((resolve, reject) => {
    _gltfLoader.load(dataUri, (gltf) => resolve(gltf.scene), undefined, reject);
  });
  _kitCache.set(key, promise);
  return promise;
}

// One small complete "hut" (4 walls + roof) built once at true kit scale (1
// unit = 1 module), then cloned and non-uniformly scaled per building — far
// more robust than trying to tile modular wall/roof pieces edge-to-edge for
// every building size, at the cost of some stretch distortion on windows.
async function buildHutTemplate(style) {
  const front = style === 'stone' ? 'wall_door' : 'wall_wood_door';
  const back = style === 'stone' ? 'wall_window_shutters' : 'wall_wood_window_shutters';
  const side = style === 'stone' ? 'wall' : 'wall_wood';

  const [frontMesh, backMesh, sideAMesh, sideBMesh, roofMesh, roofEndAMesh, roofEndBMesh] = await Promise.all([
    loadKitPiece(front), loadKitPiece(back), loadKitPiece(side), loadKitPiece(side),
    loadKitPiece('roof_gable'), loadKitPiece('roof_gable_end'), loadKitPiece('roof_gable_end'),
  ]);

  const hut = new THREE.Group();
  const f = frontMesh.clone(); f.rotation.y = -Math.PI / 2; hut.add(f);
  const b = backMesh.clone(); b.rotation.y = Math.PI / 2; hut.add(b);
  const sA = sideAMesh.clone(); sA.rotation.y = 0; hut.add(sA);
  const sB = sideBMesh.clone(); sB.rotation.y = Math.PI; hut.add(sB);

  const roof = roofMesh.clone(); roof.position.y = 1; hut.add(roof);
  const rEndA = roofEndAMesh.clone(); rEndA.position.y = 1; rEndA.rotation.y = -Math.PI / 2; hut.add(rEndA);
  const rEndB = roofEndBMesh.clone(); rEndB.position.y = 1; rEndB.rotation.y = Math.PI / 2; hut.add(rEndB);

  hut.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return hut;
}

let _hutTemplates = null;
async function getHutTemplates() {
  if (!_hutTemplates) {
    _hutTemplates = Promise.all([buildHutTemplate('wood'), buildHutTemplate('stone')])
      .then(([wood, stone]) => ({ wood, stone }));
  }
  return _hutTemplates;
}

// Building "recipes" per venue type: which hut style, and how much to
// stretch the 1x1x1 base hut to reach a footprint/height that reads right
// next to its neighbors.
const BUILDING_RECIPES = {
  darkstore: { style: 'stone', w: 4, d: 3, h: 2.2 },
  office: { style: 'stone', w: 3, d: 3, h: 2.6 },
  shop: { style: 'wood', w: 2.5, d: 2.5, h: 1.6, stall: true },
  dorm: { style: 'wood', w: 4.5, d: 3.5, h: 3.2 },
  house: { style: 'wood', w: 2, d: 2, h: 1.4 },
};

async function createKitBuilding(entry) {
  const recipe = BUILDING_RECIPES[entry.type] || BUILDING_RECIPES.house;
  const templates = await getHutTemplates();
  const hut = templates[recipe.style].clone(true);
  const moduleSize = 6; // world units per kit module
  hut.scale.set(recipe.w, recipe.h, recipe.d);

  const group = new THREE.Group();
  group.add(hut);

  if (recipe.stall) {
    const stallScene = await loadKitPiece(entry.name && entry.name.includes('Kruma') ? 'stall_red' : 'stall_green');
    const stall = stallScene.clone();
    stall.scale.set(1.4, 1.4, 1.4);
    stall.position.set(recipe.w * moduleSize * 0.75, 0, 0);
    group.add(stall);
  }

  group.scale.set(moduleSize, moduleSize, moduleSize);
  group.position.set(entry.x, 0, entry.z);
  group.rotation.y = THREE.MathUtils.degToRad(entry.rotationDeg || 0);
  return group;
}

// --- Procedural landmarks: kept custom, recolored to sit warmly alongside
// --- the kit's cream/red-green palette instead of the old blue/purple set.
const LANDMARK_WALL = 0xE8D9B5;
const LANDMARK_ROOF = 0xB23B23;
const LANDMARK_ACCENT = 0x4E9A7E;

function createHolstentor() {
  const group = new THREE.Group();
  const towerGeo = new THREE.CylinderGeometry(3.2, 3.6, 14, 12);
  const spireGeo = new THREE.ConeGeometry(4, 9, 12);
  const brickMat = window.FFH.createCelMaterial(0x9C5A3C);
  const roofMat = window.FFH.createCelMaterial(LANDMARK_ROOF);

  const left = new THREE.Mesh(towerGeo, brickMat); left.position.set(-6, 7, 0); group.add(left);
  const leftSpire = new THREE.Mesh(spireGeo, roofMat); leftSpire.position.set(-6, 18.5, 0); group.add(leftSpire);
  const right = new THREE.Mesh(towerGeo, brickMat); right.position.set(6, 7, 0); group.add(right);
  const rightSpire = new THREE.Mesh(spireGeo, roofMat); rightSpire.position.set(6, 18.5, 0); group.add(rightSpire);

  const archGeo = new THREE.BoxGeometry(8, 10, 4);
  const arch = new THREE.Mesh(archGeo, brickMat); arch.position.set(0, 5, 0); group.add(arch);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

function createLubeckerDom() {
  const group = new THREE.Group();
  const bodyGeo = new THREE.BoxGeometry(10, 12, 22);
  const body = new THREE.Mesh(bodyGeo, window.FFH.createCelMaterial(LANDMARK_WALL));
  body.position.y = 6;
  group.add(body);

  const spireGeo = new THREE.ConeGeometry(2.6, 16, 8);
  const spireMat = window.FFH.createCelMaterial(LANDMARK_ACCENT);
  const sp1 = new THREE.Mesh(spireGeo, spireMat); sp1.position.set(-3, 20, 9); group.add(sp1);
  const sp2 = new THREE.Mesh(spireGeo, spireMat); sp2.position.set(3, 20, 9); group.add(sp2);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

function createHospital() {
  const group = new THREE.Group();
  const bodyGeo = new THREE.BoxGeometry(20, 10, 14);
  const body = new THREE.Mesh(bodyGeo, window.FFH.createCelMaterial(0xF2EFE6));
  body.position.y = 5;
  group.add(body);

  const crossGeo = new THREE.BoxGeometry(3, 3, 0.4);
  const crossMat = window.FFH.createCelMaterial(0xD03A3A);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.4), crossMat);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 0.4), crossMat);
  crossH.position.set(0, 7, 7.2); crossV.position.set(0, 7, 7.2);
  group.add(crossH, crossV);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

function createHarborMarker() {
  const group = new THREE.Group();
  const dockGeo = new THREE.BoxGeometry(14, 0.6, 6);
  const dock = new THREE.Mesh(dockGeo, window.FFH.createCelMaterial(0x8A6A4A));
  dock.position.y = 0.3;
  group.add(dock);
  return group;
}

const LANDMARK_BUILDERS = {
  gate: createHolstentor,
  church: createLubeckerDom,
  hospital: createHospital,
  harbor: createHarborMarker,
};

// --- Public entry point: dispatch by type, kit-built or procedural ---
window.FFH.createBuildingMesh = async function (entry) {
  if (LANDMARK_BUILDERS[entry.type]) {
    const group = LANDMARK_BUILDERS[entry.type]();
    group.position.set(entry.x, 0, entry.z);
    group.rotation.y = THREE.MathUtils.degToRad(entry.rotationDeg || 0);
    return group;
  }
  return createKitBuilding(entry);
};

// --- Roads / water / plaza — same flat-ribbon technique as before, now fed
// --- from hand-authored point lists instead of bucketed real data.
// Muted gray-green asphalt + wider lanes, matching the reference art's
// road-dominated street-level framing
const ROAD_COLOR = 0x7E8F89;
const ROAD_WIDTH = 9.0;

window.FFH.createRoadSegmentMesh = function (a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  if (len < 0.05) return null;
  const geo = new THREE.PlaneGeometry(len, ROAD_WIDTH);
  const mat = window.FFH.createCelMaterial(ROAD_COLOR);
  mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -1;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = -Math.atan2(dz, dx);
  mesh.position.set((a[0] + b[0]) / 2, 0.3, (a[1] + b[1]) / 2);
  return mesh;
};

window.FFH.createRiverMesh = function (points, width) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], -0.6, p[1])));
  const tubeGeo = new THREE.TubeGeometry(curve, Math.max(16, points.length * 6), width / 2, 8, false);
  const mat = window.FFH.createCelMaterial(0x3B828E);
  mat.polygonOffset = true; mat.polygonOffsetFactor = 1; mat.polygonOffsetUnits = 1;
  return new THREE.Mesh(tubeGeo, mat);
};

window.FFH.createPlazaMesh = function (plaza) {
  const geo = new THREE.PlaneGeometry(plaza.width, plaza.depth);
  const mesh = new THREE.Mesh(geo, window.FFH.createCelMaterial(0xD8CBA8));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(plaza.x, 0.05, plaza.z);
  mesh.receiveShadow = true;
  return mesh;
};

// --- Sky dome + clouds (unchanged from the earlier flat-world attempt) ---
window.FFH.createSkyDome = function (radius) {
  const geo = new THREE.SphereGeometry(radius || 800, 24, 16);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      // Muted teal, matching the reference art's desaturated sky rather than
      // a bright saturated blue
      uTop: { value: new THREE.Color(0x69BFBE) },
      uHorizon: { value: new THREE.Color(0xBFE0DA) },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      varying vec3 vPos;
      void main() {
        float h = clamp(normalize(vPos).y * 1.4 + 0.15, 0.0, 1.0);
        gl_FragColor = vec4(mix(uHorizon, uTop, h), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -1000;
  return mesh;
};

window.FFH.createCloudField = function () {
  const group = new THREE.Group();
  const puffMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 14; i++) {
    const cloud = new THREE.Group();
    const puffCount = 3 + (i % 3);
    for (let j = 0; j < puffCount; j++) {
      const r = 18 + (j % 3) * 6;
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), puffMat);
      puff.position.set(j * 22 - puffCount * 10, Math.sin(j * 1.7) * 6, Math.cos(j * 2.1) * 8);
      puff.scale.y = 0.55;
      cloud.add(puff);
    }
    const angle = (i / 14) * Math.PI * 2;
    const dist = 900 + (i % 4) * 220;
    cloud.position.set(Math.cos(angle) * dist, 260 + (i % 5) * 30, Math.sin(angle) * dist);
    group.add(cloud);
  }
  return group;
};

// --- Build the whole curated town once, statically ---
window.FFH.buildTown = async function (layout) {
  const group = new THREE.Group();

  layout.plazas.forEach((p) => group.add(window.FFH.createPlazaMesh(p)));
  group.add(window.FFH.createRiverMesh(layout.river.points, layout.river.width));
  layout.roads.forEach((r) => {
    for (let i = 0; i < r.points.length - 1; i++) {
      const m = window.FFH.createRoadSegmentMesh(r.points[i], r.points[i + 1]);
      if (m) group.add(m);
    }
  });

  const buildingMeshes = await Promise.all(layout.buildings.map((entry) => window.FFH.createBuildingMesh(entry)));
  buildingMeshes.forEach((m) => group.add(m));

  return group;
};

window.FFH.resolveTownPlayerStart = function (layout) {
  const ps = layout.playerStart || {};
  return { x: ps.x || 0, z: ps.z || 0 };
};

// Half-extents of a placed building's footprint, in world units — used to
// verify nothing (the player spawn especially) ends up inside a building.
window.FFH.buildingHalfExtents = function (entry) {
  const recipe = BUILDING_RECIPES[entry.type];
  const moduleSize = 6;
  if (recipe) return { hx: (recipe.w * moduleSize) / 2, hz: (recipe.d * moduleSize) / 2 };
  // Procedural landmarks: approximate generous boxes
  const LANDMARK_EXTENTS = { gate: { hx: 11, hz: 4 }, church: { hx: 6, hz: 12 }, hospital: { hx: 11, hz: 8 }, harbor: { hx: 8, hz: 4 } };
  return LANDMARK_EXTENTS[entry.type] || { hx: 8, hz: 8 };
};

window.FFH.isPointInsideAnyBuilding = function (layout, x, z, margin) {
  const m = margin || 0;
  return layout.buildings.filter((b) => {
    const e = window.FFH.buildingHalfExtents(b);
    return Math.abs(x - b.x) < e.hx + m && Math.abs(z - b.z) < e.hz + m;
  }).map((b) => b.name);
};
