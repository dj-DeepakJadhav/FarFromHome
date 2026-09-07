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

  // Pad without replacement. This used to pick a random decoy each time, so a
  // four-slot tier routinely came out as the same cheese three times over and
  // the shelf looked far emptier than the catalogue actually is. Prefer decoys
  // not already on the tier, and only repeat once the gender is exhausted.
  const padBucket = (bucket, poolOfGender, allOfGender) => {
    const source = (poolOfGender.length ? poolOfGender : allOfGender).slice();
    for (let i = source.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = source[i]; source[i] = source[j]; source[j] = t;
    }
    const used = new Set(bucket.map(it => it.id));
    for (const cand of source) {
      if (bucket.length >= 4) break;
      if (!used.has(cand.id)) { bucket.push(cand); used.add(cand.id); }
    }
    // Gender has fewer than four distinct items available: fall back to repeats.
    while (bucket.length < 4 && (poolOfGender.length || allOfGender.length)) {
      const src = poolOfGender.length ? poolOfGender : allOfGender;
      bucket.push(src[Math.floor(Math.random() * src.length)]);
    }
  };

  padBucket(derBucket, derPool, derAll);
  padBucket(dieBucket, diePool, dieAll);
  padBucket(dasBucket, dasPool, dasAll);

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
  // The rail carries the legend, so it needs enough height for type. It was
  // 0.05 and blank, which left the player with three coloured strips and no
  // way to learn that purple means das. The article names are permanent shelf
  // furniture, not a tutorial: they read identically on shift 1 and shift 12.
  const tagGeo = new THREE.BoxGeometry(3.7, 0.17, 0.02);
  const tiers = 3;

  // Row 0 (bottom) = der (0x3A86FF), Row 1 (middle) = die (0xFF006E), Row 2 (top) = das (0x8338EC)
  const railColors = [0x3A86FF, 0xFF006E, 0x8338EC];
  const railArticles = ['DER', 'DIE', 'DAS'];
  const railSymbols = ['\u25B2', '\u25CF', '\u25A0'];

  // Repeat the label along the rail so it stays legible whichever part of the
  // shelf the camera favours, and at any zoom.
  const makeRailTexture = (colorHex, article, symbol) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    // White ground with navy type, tinted at runtime by material.color. The
    // rail's anticipation pulse works by flashing material.color to white
    // (pickFeedback), so the colour has to live on the material, not baked
    // into the texture, or the pulse multiplies white by white and vanishes.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#14213D';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = symbol + '  ' + article;
    const slots = 4;
    for (let i = 0; i < slots; i++) {
      ctx.fillText(label, (canvas.width / slots) * (i + 0.5), canvas.height / 2 + 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  };

  for (let y = 0; y < tiers; y++) {
    const plank = new THREE.Mesh(shelfGeo, shelfBoardMat);
    plank.position.set(0, y * 0.95 + 0.1, 0);
    plank.receiveShadow = true;

    const tagRailMat = new THREE.MeshBasicMaterial({
      map: makeRailTexture(railColors[y], railArticles[y], railSymbols[y]),
      color: railColors[y]
    });
    const tagRail = new THREE.Mesh(tagGeo, tagRailMat);
    tagRail.position.set(0, y * 0.95 + 0.14, 0.38);

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
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
  keyLight.position.set(4, 7, 6);
  shelfGroup.add(keyLight);
  const fillLight = new THREE.PointLight(0xfff2d9, 0.55, 7.0);
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
      // Slow idle spin. A static grocery seen from one angle is often just a
      // pale blob; turning it lets the silhouette read. Speeds and phases are
      // varied so the shelf does not look like a single rotating rig.
      itemMesh.userData = {
        id: itemDef.id,
        def: itemDef,
        spinSpeed: 0.35 + Math.random() * 0.25,
        spinPhase: Math.random() * Math.PI * 2
      };
      itemMesh.rotation.y = itemMesh.userData.spinPhase;

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
        // Sits just above the item, not floating up into the next tier's rail.
        sprite.scale.set(0.26, 0.26, 1);
        sprite.position.set(0, 0.30, 0);
        itemMesh.add(sprite);
      }

      shelfGroup.add(itemMesh);
      shelvedMeshes.push(itemMesh);
    });
  });

  return { shelfGroup, shelvedMeshes, tagRails };
};
