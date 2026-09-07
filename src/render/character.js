// Third-person courier character, built with Kenney character assets and fallback procedural parts.
// Proportioned against a ~1.7-unit height so buildings (8-19 units) tower
// over it the way they do in the reference art.
window.FFH = window.FFH || {};

const CHAR_COLORS = {
  hair: 0x2A2A2E,
  skin: 0xE8C4A0,
  jacket: 0xE8663C,
  skirt: 0x2E4A47,
  legs: 0xE8C4A0,
  shoes: 0xE8B838,
  pack: 0xD9432F,
  packStrap: 0xB8351F,
};

let _charLoader = null;
const _charCache = new Map();

function loadCharModel(key) {
  if (_charCache.has(key)) return _charCache.get(key);
  if (!_charLoader) _charLoader = window.FFH.getSafeGLTFLoader();
  const dataUri = (window.FFH.characterModels && window.FFH.characterModels[key]) || (window.FFH.kenneyAssets && window.FFH.kenneyAssets[key]) || null;
  if (!dataUri) return null;

  const promise = new Promise((resolve, reject) => {
    _charLoader.load(dataUri, (gltf) => {
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      resolve(gltf.scene);
    }, undefined, reject);
  });
  _charCache.set(key, promise);
  return promise;
}

window.FFH.createCourierCharacter = function () {
  const g = new THREE.Group();
  const mat = (hex) => window.FFH.createCelMaterial(hex);

  // Procedural body setup
  const proceduralGroup = new THREE.Group();

  // Torso / hoodie (slightly tapered box reads as a jacket from behind
  const torso)= new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.26), mat(CHAR_COLORS.jacket));
  torso.position.y = 1.09;
  proceduralGroup.add(torso);

  // Hood bunched at the neck
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mat(CHAR_COLORS.jacket));
  hood.position.set(0, 1.33, -0.07);
  hood.scale.set(1.2, 0.7, 1.0);
  proceduralGroup.add(hood);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), mat(CHAR_COLORS.skin));
  head.position.y = 1.5;
  head.scale.set(1.0, 1.1, 1.0);
  proceduralGroup.add(head);

  // Hair cap + the two side buns from the reference silhouette
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), mat(CHAR_COLORS.hair));
  hairCap.position.set(0, 1.515, -0.015);
  hairCap.scale.set(1.02, 1.05, 1.02);
  proceduralGroup.add(hairCap);

  const bunGeo = new THREE.SphereGeometry(0.072, 10, 8);
  const bunL = new THREE.Mesh(bunGeo, mat(CHAR_COLORS.hair));
  bunL.position.set(-0.155, 1.58, -0.02);
  proceduralGroup.add(bunL);
  const bunR = new THREE.Mesh(bunGeo, mat(CHAR_COLORS.hair));
  bunR.position.set(0.155, 1.58, -0.02);
  proceduralGroup.add(bunR);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.42, 8);
  const armL = new THREE.Mesh(armGeo, mat(CHAR_COLORS.jacket));
  armL.position.set(-0.255, 1.05, 0);
  proceduralGroup.add(armL);
  const armR = new THREE.Mesh(armGeo, mat(CHAR_COLORS.jacket));
  armR.position.set(0.255, 1.05, 0);
  proceduralGroup.add(armR);

  // Skirt (cone frustum flares like the reference
  const skirt)= new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.3, 12), mat(CHAR_COLORS.skirt));
  skirt.position.y = 0.72;
  proceduralGroup.add(skirt);

  // Legs + shoes (kept as named refs so the walk cycle can swing them)
  const legGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.5, 8);
  const legL = new THREE.Mesh(legGeo, mat(CHAR_COLORS.legs));
  legL.position.set(-0.1, 0.32, 0);
  proceduralGroup.add(legL);
  const legR = new THREE.Mesh(legGeo, mat(CHAR_COLORS.legs));
  legR.position.set(0.1, 0.32, 0);
  proceduralGroup.add(legR);

  const shoeGeo = new THREE.BoxGeometry(0.115, 0.085, 0.2);
  const shoeL = new THREE.Mesh(shoeGeo, mat(CHAR_COLORS.shoes));
  shoeL.position.set(-0.1, 0.045, 0.03);
  proceduralGroup.add(shoeL);
  const shoeR = new THREE.Mesh(shoeGeo, mat(CHAR_COLORS.shoes));
  shoeR.position.set(0.1, 0.045, 0.03);
  proceduralGroup.add(shoeR);

  g.add(proceduralGroup);

  // Delivery backpack (the hero silhouette element), on the camera-facing side
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.2), mat(CHAR_COLORS.pack));
  pack.position.set(0, 1.11, -0.22);
  g.add(pack);

  const strapGeo = new THREE.BoxGeometry(0.055, 0.4, 0.05);
  const strapL = new THREE.Mesh(strapGeo, mat(CHAR_COLORS.packStrap));
  strapL.position.set(-0.13, 1.13, -0.11);
  g.add(strapL);
  const strapR = new THREE.Mesh(strapGeo, mat(CHAR_COLORS.packStrap));
  strapR.position.set(0.13, 1.13, -0.11);
  g.add(strapR);

  // Use the stylized procedural Nina character (which has a walking animation)
  // instead of the static generic Kenney GLTF model.
  /*
  if (window.FFH.kenneyAssets && window.FFH.kenneyAssets['char_courier']) {
    loadCharModel('char_courier')?.then((scene) => {
      const kenneyChar = scene.clone(true);
      kenneyChar.scale.set(0.75, 0.75, 0.75);
      kenneyChar.position.set(0, 0, 0);
      kenneyChar.rotation.x = -Math.PI / 2; // Rotate upright
      kenneyChar.rotation.y = Math.PI; // Face forward
      g.remove(proceduralGroup);
      g.add(kenneyChar);
    }).catch(() => {});
  }
  */

  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  g.userData.parts = { legL, legR, shoeL, shoeR, armL, armR, torso };
  g.userData.walkPhase = 0;
  return g;
};

// Simple walk cycle: counter-swinging legs/arms plus a small vertical bob.
// `speed01` is 0 (idle) .. 1 (full walk) so it can ease in/out with movement.
window.FFH.updateCourierWalk = function (charGroup, delta, speed01) {
  if (!charGroup || !charGroup.userData.parts) return;
  const p = charGroup.userData.parts;
  const amt = THREE.MathUtils.clamp(speed01, 0, 1);
  charGroup.userData.walkPhase += delta * 9.0 * amt;
  const t = charGroup.userData.walkPhase;
  const swing = Math.sin(t) * 0.5 * amt;

  if (p.legL) p.legL.rotation.x = swing;
  if (p.legR) p.legR.rotation.x = -swing;
  if (p.shoeL) p.shoeL.position.z = 0.03 + Math.sin(t) * 0.1 * amt;
  if (p.shoeR) p.shoeR.position.z = 0.03 - Math.sin(t) * 0.1 * amt;
  if (p.armL) p.armL.rotation.x = -swing * 0.7;
  if (p.armR) p.armR.rotation.x = swing * 0.7;
  if (p.torso) p.torso.rotation.z = Math.sin(t * 2) * 0.02 * amt;
};
