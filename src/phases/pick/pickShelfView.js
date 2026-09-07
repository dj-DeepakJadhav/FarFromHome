// Pick Phase 3D Shelf & Item Builder
// Extracted from pickPhase.js to keep phase logic modular and lightweight.
window.FFH = window.FFH || {};

window.FFH.buildWarehouseShelf = function({ shift, order, upgrades, shelfWorldPos, scene }) {
  const derBucket = [];
  const dieBucket = [];
  const dasBucket = [];

  // 1. Sort ordered items into gender buckets
  for (const line of order) {
    const itemDef = window.FFH.items.find(it => it.id === line.id);
    if (itemDef) {
      if (itemDef.gender === 'der') derBucket.push(itemDef);
      else if (itemDef.gender === 'die') dieBucket.push(itemDef);
      else if (itemDef.gender === 'das') dasBucket.push(itemDef);
    }
  }

  // 2. Pad each bucket to 4 items with decoys of the same gender
  const pool = window.FFH.getShiftItemPool(shift.index);
  const poolItems = pool.map(id => window.FFH.items.find(it => it.id === id)).filter(Boolean);

  const derPool = poolItems.filter(it => it.gender === 'der');
  const diePool = poolItems.filter(it => it.gender === 'die');
  const dasPool = poolItems.filter(it => it.gender === 'das');

  // Fallbacks in case the shift pool lacks items of a specific gender
  const derAll = window.FFH.items.filter(it => it.gender === 'der');
  const dieAll = window.FFH.items.filter(it => it.gender === 'die');
  const dasAll = window.FFH.items.filter(it => it.gender === 'das');

  while (derBucket.length < 4) {
    const src = derPool.length ? derPool : derAll;
    derBucket.push(src[Math.floor(Math.random() * src.length)]);
  }
  while (dieBucket.length < 4) {
    const src = diePool.length ? diePool : dieAll;
    dieBucket.push(src[Math.floor(Math.random() * src.length)]);
  }
  while (dasBucket.length < 4) {
    const src = dasPool.length ? dasPool : dasAll;
    dasBucket.push(src[Math.floor(Math.random() * src.length)]);
  }

  // 3. Shuffle each bucket independently
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  };
  shuffle(derBucket);
  shuffle(dieBucket);
  shuffle(dasBucket);

  const shelfGroup = new THREE.Group();
  const shelvedMeshes = [];
  const tagRails = [];

  const steelMat = window.FFH.createCelMaterial(0x2B2D42);
  const shelfBoardMat = window.FFH.createCelMaterial(0x8D99AE);

  // 4 Corner Steel Uprights
  const postGeo = new THREE.BoxGeometry(0.1, 3.4, 0.1);
  const offsets = [[-1.8, -0.35], [1.8, -0.35], [-1.8, 0.35], [1.8, 0.35]];
  offsets.forEach(([px, pz]) => {
    const p = new THREE.Mesh(postGeo, steelMat);
    p.position.set(px, 1.3, pz);
    shelfGroup.add(p);
  });

  const shelfGeo = new THREE.BoxGeometry(3.7, 0.08, 0.75);
  const tagGeo = new THREE.BoxGeometry(3.7, 0.05, 0.02);
  const tiers = 3;

  // Row 0 (bottom) = der (0x3A86FF), Row 1 (middle) = die (0xFF006E), Row 2 (top) = das (0x8338EC)
  const railColors = [0x3A86FF, 0xFF006E, 0x8338EC];

  for (let y = 0; y < tiers; y++) {
    const plank = new THREE.Mesh(shelfGeo, shelfBoardMat);
    plank.position.set(0, y * 0.95 + 0.1, 0);
    plank.receiveShadow = true;

    // Price tag rail
    const tagRailMat = window.FFH.createCelMaterial(railColors[y]);
    const tagRail = new THREE.Mesh(tagGeo, tagRailMat);
    tagRail.position.set(0, y * 0.95 + 0.1, 0.38);

    shelfGroup.add(plank, tagRail);
    tagRails.push(tagRail);
  }

  if (shelfWorldPos) {
    shelfGroup.position.copy(shelfWorldPos);
  }

  // Dedicated shelf light rig. The navy warehouse shell swallows ambient
  // light and the Kenney food models are lit (Phong) materials, while the
  // cel-shaded shelf around them is unlit, without their own key + fill
  // the groceries render near-black. Parented to the shelf so the rig
  // follows it and is disposed with it on phase exit.
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(4, 7, 6);
  shelfGroup.add(keyLight);
  const fillLight = new THREE.PointLight(0xfff2d9, 1.2, 7.0);
  fillLight.position.set(0, 1.6, 2.4);
  shelfGroup.add(fillLight);

  // Rotate shelf so its open front (+Z in local space) faces the camera (+X, +Z in world space)
  shelfGroup.rotation.y = Math.PI / 4;

  if (scene) {
    scene.add(shelfGroup);
  }

  const shelfHeights = [0.05, 1.05, 2.05];
  const spread = 1.2;
  const buckets = [derBucket, dieBucket, dasBucket];
  const symbols = ['▲', '●', '■'];

  buckets.forEach((bucket, row) => {
    bucket.forEach((itemDef, col) => {
      const x = -spread + (col / 3) * spread * 2;
      const itemMesh = window.FFH.createItemMesh(itemDef.type, itemDef.hex);
      itemMesh.position.set(x, shelfHeights[row] + 0.4, 0);
      itemMesh.userData = { id: itemDef.id, def: itemDef };

      if (upgrades && upgrades.shelfLabels) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#' + railColors[row].toString(16).padStart(6, '0');
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbols[row], 32, 36);

        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.4, 0.4, 1);
        sprite.position.set(0, 0.4, 0);
        itemMesh.add(sprite);
      }

      shelfGroup.add(itemMesh);
      shelvedMeshes.push(itemMesh);
    });
  });

  return { shelfGroup, shelvedMeshes, tagRails };
};
