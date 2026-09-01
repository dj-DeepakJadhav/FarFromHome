// Procedural 3D Lübeck Altstadt City Map & Architecture Generator
// Uncluttered, realistic urban design: Broad roads, spacious pedestrian boulevards,
// streetside facing building front doors with accessible entrance approaches.
window.FFH = window.FFH || {};

const CITY_PALETTE = {
  terracotta: 0xE76F51,
  mustard:    0xF6BD60,
  mint:       0x76C8B8,
  coral:      0xF29688,
  slate:      0x264653,
  cobble:     0x5C677D,
  bikeGreen:  0x2EC4B6,
  brickRed:   0x9D0208,
  wood:       0x8D5B4C,
  wallSage:   0xCCD5AE,
  wallCream:  0xFAEDCD,
  grassLand:  0x84A98C,
  foliage:    0x2D6A4F,
  foliageDark:0x1B4332
};

window.FFH.CityAssetRegistry = {
  materials: {
    grass:     new THREE.MeshLambertMaterial({ color: CITY_PALETTE.grassLand }),
    cobble:    new THREE.MeshLambertMaterial({ color: CITY_PALETTE.cobble }),
    bikeLane:  new THREE.MeshLambertMaterial({ color: CITY_PALETTE.bikeGreen }),
    bridge:    new THREE.MeshLambertMaterial({ color: 0x6C757D }),
    roofBrick: new THREE.MeshLambertMaterial({ color: CITY_PALETTE.brickRed }),
    roofCopper:new THREE.MeshLambertMaterial({ color: 0x52B788 }),
    wood:      new THREE.MeshLambertMaterial({ color: CITY_PALETTE.wood }),
    trunk:     new THREE.MeshLambertMaterial({ color: 0x4A3525 }),
    foliage:   new THREE.MeshPhongMaterial({ color: CITY_PALETTE.foliage, flatShading: true }),
    foliage2:  new THREE.MeshPhongMaterial({ color: CITY_PALETTE.foliageDark, flatShading: true })
  },

  initMaterials() {
    const P = window.FFH.ProceduralTextures;
    if (!P) return;

    // Apply procedural math-generated hand-drawn textures & normal maps (Project Tomorrow solo dev technique)
    const cobbleTex = P.getCobblestoneTexture();
    const cobbleNorm = P.getCobblestoneNormalMap();
    const roadTex = P.getGermanRoadTexture();
    const roadNorm = P.getGermanRoadNormalMap();
    const roofBrickTex = P.getRoofTileTexture('terracotta');
    const roofBrickNorm = P.getRoofTileNormalMap('terracotta');
    const roofCopperTex = P.getRoofTileTexture('copper');
    const roofCopperNorm = P.getRoofTileNormalMap('copper');
    const sidewalkTex = P.getSidewalkTexture();

    this.materials.cobble = new THREE.MeshStandardMaterial({
      map: cobbleTex,
      normalMap: cobbleNorm,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 0.82,
      metalness: 0.04
    });

    this.materials.bikeLane = new THREE.MeshStandardMaterial({
      map: roadTex,
      normalMap: roadNorm,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 0.78,
      metalness: 0.05
    });

    this.materials.sidewalk = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.85,
      metalness: 0.05
    });

    this.materials.roofBrick = new THREE.MeshStandardMaterial({
      map: roofBrickTex,
      normalMap: roofBrickNorm,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.72,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    this.materials.roofCopper = new THREE.MeshStandardMaterial({
      map: roofCopperTex,
      normalMap: roofCopperNorm,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.65,
      metalness: 0.2
    });
  },

  // 1. Hanseatic Altbau Townhouse with procedural brick facade, window frames & scalloped roof tiles
  // Geometrically recessed roof panels eliminate 100% of co-planar gable/roof z-fighting and flicker!
  createAltbau(variant = 0, floors = 3) {
    const group = new THREE.Group();
    const P = window.FFH.ProceduralTextures;
    
    // Procedural Hanseatic Brick Texture & Tangent-Space Normal Map
    const brickTex = P ? P.getBrickFacadeTexture(variant) : null;
    const brickNorm = P ? P.getBrickFacadeNormalMap(variant) : null;
    const wallColors = [CITY_PALETTE.terracotta, CITY_PALETTE.mustard, CITY_PALETTE.wallSage, CITY_PALETTE.coral, CITY_PALETTE.wallCream];
    const wallMat = brickTex
      ? new THREE.MeshStandardMaterial({
          map: brickTex,
          normalMap: brickNorm,
          normalScale: new THREE.Vector2(0.65, 0.65),
          roughness: 0.82,
          metalness: 0.04
        })
      : new THREE.MeshLambertMaterial({ color: wallColors[variant % wallColors.length] });
    
    const width = 2.4, depth = 2.4, floorH = 2.0;
    const h = floors * floorH;

    // Main Facade Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, h, depth), wallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Sandstone Door Surround Frame & Dark Wooden Door
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xEDE5D8 });
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.72, 0.1), frameMat);
    doorFrame.position.set(0, 0.86, depth / 2 + 0.02);
    
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x3D2619 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.58, 0.08), doorMat);
    door.position.set(0, 0.79, depth / 2 + 0.04);
    
    // Front Welcome Step / Granite Porch
    const stepMat = new THREE.MeshLambertMaterial({ color: 0x7D8A9D });
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.45), stepMat);
    step.position.set(0, 0.04, depth / 2 + 0.22);
    group.add(doorFrame, door, step);

    // Multi-floor Detailed Glowing Windows on Front Facade with Frames & Sills
    const winTex = P ? P.getWindowTexture() : null;
    const winMat = winTex
      ? new THREE.MeshBasicMaterial({ map: winTex })
      : new THREE.MeshBasicMaterial({ color: 0xFFF3B0 });

    for (let f = 1; f < floors; f++) {
      [-0.62, 0.62].forEach(wx => {
        // Sandstone Outer Window Frame
        const casing = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.90, 0.04), frameMat);
        casing.position.set(wx, f * floorH + 0.9, depth / 2 + 0.02);

        // Window Glass Pane with Interior Glow & Mullions
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.80, 0.04), winMat);
        win.position.set(wx, f * floorH + 0.9, depth / 2 + 0.035);

        // Projecting Window Sill
        const sill = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.06, 0.10), frameMat);
        sill.position.set(wx, f * floorH + 0.47, depth / 2 + 0.05);

        group.add(casing, win, sill);
      });
    }

    // Historic Hanseatic Stepped Gable Facade Top (Front & Back Parapets)
    const steps = 4;
    const stepH = 0.55;
    const gableThickness = 0.22;
    const frontZ = depth / 2 - gableThickness / 2;
    const backZ = -depth / 2 + gableThickness / 2;

    for (let s = 0; s < steps; s++) {
      const stepW = width * (1 - s * 0.22);
      
      const gableStepF = new THREE.Mesh(new THREE.BoxGeometry(stepW, stepH, gableThickness), wallMat);
      gableStepF.position.set(0, h + (s * stepH) + stepH / 2, frontZ);
      gableStepF.castShadow = true;
      gableStepF.receiveShadow = true;
      
      const gableStepB = new THREE.Mesh(new THREE.BoxGeometry(stepW, stepH, gableThickness), wallMat);
      gableStepB.position.set(0, h + (s * stepH) + stepH / 2, backZ);
      gableStepB.castShadow = true;
      gableStepB.receiveShadow = true;
      
      group.add(gableStepF, gableStepB);
    }

    // Pitched Roof Panels: Recessed cleanly between front and back parapets to eliminate ALL Z-fighting/flicker!
    const roofDepth = depth - (gableThickness * 2 + 0.06);
    const roofHeight = steps * stepH;
    const roofWidth = width / 2;
    const roofLength = Math.sqrt(roofHeight * roofHeight + roofWidth * roofWidth);
    const roofAngle = Math.atan2(roofHeight, roofWidth);

    const roofMat = this.materials.roofBrick;

    const roofPanelL = new THREE.Mesh(new THREE.BoxGeometry(roofLength + 0.02, 0.08, roofDepth), roofMat);
    roofPanelL.position.set(-roofWidth / 2, h + roofHeight / 2, 0);
    roofPanelL.rotation.z = roofAngle;
    roofPanelL.castShadow = true;
    roofPanelL.receiveShadow = true;
    
    const roofPanelR = new THREE.Mesh(new THREE.BoxGeometry(roofLength + 0.02, 0.08, roofDepth), roofMat);
    roofPanelR.position.set(roofWidth / 2, h + roofHeight / 2, 0);
    roofPanelR.rotation.z = -roofAngle;
    roofPanelR.castShadow = true;
    roofPanelR.receiveShadow = true;
    
    group.add(roofPanelL, roofPanelR);

    return group;
  },

  // 2. Holstentor City Gate (Twin Conical Towers & Great Archway with Crimson Brick & Normal Map)
  createHolstentor() {
    const group = new THREE.Group();
    const P = window.FFH.ProceduralTextures;
    const brickTex = P ? P.getBrickFacadeTexture(5) : null;
    const brickNorm = P ? P.getBrickFacadeNormalMap(5) : null;
    const brickMat = brickTex
      ? new THREE.MeshStandardMaterial({ map: brickTex, normalMap: brickNorm, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.82 })
      : new THREE.MeshLambertMaterial({ color: 0x7F1D1D });
    
    // Twin Massive Conical Brick Towers
    [-1.3, 1.3].forEach(tx => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 6.0, 16), brickMat);
      tower.position.set(tx, 3.0, 0);
      tower.castShadow = true;
      tower.receiveShadow = true;
      
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 16), this.materials.roofBrick);
      cone.position.set(tx, 7.6, 0);
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(tower, cone);
    });

    // Central Archway Gate
    const arch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 1.5), brickMat);
    arch.position.set(0, 2.1, 0);
    arch.castShadow = true;
    arch.receiveShadow = true;
    
    const gateHole = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.5, 1.6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    gateHole.position.set(0, 1.25, 0);
    group.add(arch, gateHole);

    return group;
  },

  // 3. St. Mary's Cathedral (Marienkirche) Twin Spire Landmark
  createMarienkirche() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x5C677D });
    
    const nave = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5.0, 3.5), stoneMat);
    nave.position.y = 2.5;
    nave.castShadow = true;
    
    // Cathedral Portal Entrance
    const portal = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.1), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    portal.position.set(0, 1.0, 1.76);
    group.add(portal);

    // Towering Gothic Spires
    [-0.9, 0.9].forEach(sx => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.95, 7.8, 0.95), stoneMat);
      tower.position.set(sx, 3.9, 1.3);
      tower.castShadow = true;
      
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.85, 4.8, 8), this.materials.roofCopper);
      spire.position.set(sx, 10.2, 1.3);
      spire.castShadow = true;
      group.add(tower, spire);
    });
    group.add(nave);
    return group;
  },

  // 4. Kruma Dark Store Warehouse Hub
  createDarkStore() {
    const group = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), new THREE.MeshLambertMaterial({ color: CITY_PALETTE.slate }));
    wall.position.y = 1.4;
    wall.castShadow = true;

    // Roll-up shutter dispatch door
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.1), new THREE.MeshLambertMaterial({ color: 0xDCE1E3 }));
    shutter.position.set(0, 0.8, 1.31);

    // Glowing Neon Kruma Express Sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.1), new THREE.MeshLambertMaterial({ color: CITY_PALETTE.mustard }));
    sign.position.set(0, 2.1, 1.32);

    group.add(wall, shutter, sign);
    return group;
  },

  // 5. Pizzeria Bella Lübeck
  createPizzeria() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.8, 2.5), new THREE.MeshLambertMaterial({ color: CITY_PALETTE.terracotta }));
    body.position.y = 1.4;
    body.castShadow = true;

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.6, 0.08), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    door.position.set(0, 0.8, 1.26);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 0.85), new THREE.MeshLambertMaterial({ color: 0x9D0208 }));
    awning.position.set(0, 1.6, 1.4);
    awning.rotation.x = 0.25;
    group.add(body, door, awning);
    return group;
  },

  // 6. University Courtyard Campus (with stone drum to eliminate dome coplanar z-fighting)
  createUniversity() {
    const group = new THREE.Group();
    const P = window.FFH.ProceduralTextures;
    const brickTex = P ? P.getBrickFacadeTexture(4) : null;
    const brickNorm = P ? P.getBrickFacadeNormalMap(4) : null;
    const stoneMat = brickTex ? new THREE.MeshStandardMaterial({
      map: brickTex, normalMap: brickNorm, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.85
    }) : new THREE.MeshLambertMaterial({ color: 0xDDA15E });

    const main = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.6, 2.8), stoneMat);
    main.position.y = 1.8;
    main.castShadow = true;
    main.receiveShadow = true;
    
    const portal = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.1), new THREE.MeshLambertMaterial({ color: 0x3D2619 }));
    portal.position.set(0, 0.9, 1.41);
    
    // Stone drum collar elevates the dome cleanly above the roof box to prevent flickering
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.96, 0.22, 16), new THREE.MeshLambertMaterial({ color: 0xEDE5D8 }));
    drum.position.y = 3.6 + 0.11;
    drum.castShadow = true;
    drum.receiveShadow = true;

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.90, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), this.materials.roofCopper);
    dome.position.y = 3.6 + 0.22;
    dome.castShadow = true;
    dome.receiveShadow = true;

    group.add(main, portal, drum, dome);
    return group;
  },

  // 7. Urban Street Tree
  createTree() {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8), this.materials.trunk);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageMat = Math.random() > 0.5 ? this.materials.foliage : this.materials.foliage2;
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.8 - i * 0.15, 1.0, 8), foliageMat);
      cone.position.y = 1.1 + i * 0.55;
      cone.castShadow = true;
      group.add(cone);
    }
    return group;
  },

  // 8. Overhead Urban Pedestrian Bridge / Overpass
  createOverpass() {
    const group = new THREE.Group();
    const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x2A9D8F });
    
    const span = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.7, 1.3), bridgeMat);
    span.position.set(0, 3.6, 0);
    span.castShadow = true;
    
    [-2.4, 2.4].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.6, 8), bridgeMat);
      pillar.position.set(px, 1.8, 0);
      pillar.castShadow = true;
      group.add(pillar);
    });

    group.add(span);
    return group;
  },

  // 9. Street Props: Historical Hanseatic Lamp Post & Electrical Utility Boxes
  createStreetLamp() {
    const group = new THREE.Group();
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x22262B });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xFFB703 }); // Glowing amber core
    const capMat = new THREE.MeshLambertMaterial({ color: 0x1A1C20 });

    // Stone Plinth Base
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.35), new THREE.MeshLambertMaterial({ color: 0x5C677D }));
    plinth.position.y = 0.06;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Iron Column Base Collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.22, 8), ironMat);
    collar.position.y = 0.23;
    collar.castShadow = true;
    group.add(collar);

    // Fluted Column Post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 8), ironMat);
    post.position.y = 1.22;
    post.castShadow = true;
    group.add(post);

    // Decorative Neck / Bracket Arms
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.15, 6), ironMat);
    neck.position.y = 2.18;
    group.add(neck);

    // Hexagonal / Truncated Lantern Glass (Glowing Amber)
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.38, 6), glassMat);
    lantern.position.y = 2.42;
    group.add(lantern);

    // Lantern Iron Cap with Finial Top
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.18, 6), capMat);
    cap.position.y = 2.68;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), ironMat);
    finial.position.y = 2.80;
    group.add(cap, finial);

    // Warm Light Glow Sphere (Soft Halo)
    const glowGeo = new THREE.SphereGeometry(0.45, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFFD166,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 2.42;
    group.add(glow);

    return group;
  },

  createUtilityBox() {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.35), new THREE.MeshLambertMaterial({ color: 0xD8D8D8 }));
    box.position.y = 0.325;
    box.castShadow = true;
    return box;
  },

  createCloud() {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.85 });
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(1.1 + Math.random() * 0.6, 8, 8), cloudMat);
      puff.position.set((i - count / 2) * 1.0, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4);
      cloud.add(puff);
    }
    return cloud;
  },

  createFlowerCluster() {
    const group = new THREE.Group();
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 4);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x386641 });
    const petalGeo = new THREE.SphereGeometry(0.06, 4, 4);
    
    const colors = [0xE63946, 0xF1FAEE, 0xA8DADC, 0x457B9D, 0x1D3557, 0xF4A261, 0xE76F51];
    
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const flower = new THREE.Group();
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.125;
      
      const petalMat = new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
      const head = new THREE.Mesh(petalGeo, petalMat);
      head.position.y = 0.25;
      
      flower.add(stem, head);
      flower.position.set((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8);
      flower.rotation.y = Math.random() * Math.PI;
      group.add(flower);
    }
    return group;
  },

  createButterfly() {
    const group = new THREE.Group();
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xE76F51, side: THREE.DoubleSide });
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 4), bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    const wingGeo = new THREE.PlaneGeometry(0.06, 0.06);
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.03, 0.01, 0);
    leftWing.name = "leftWing";
    
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.03, 0.01, 0);
    rightWing.name = "rightWing";
    
    group.add(leftWing, rightWing);
    group.scale.set(1.5, 1.5, 1.5);
    return group;
  },

  createBird() {
    const group = new THREE.Group();
    const wingMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
    
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.25, 5), bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.1), wingMat);
    leftWing.position.set(-0.125, 0, 0);
    leftWing.name = "leftWing";
    
    const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.1), wingMat);
    rightWing.position.set(0.125, 0, 0);
    rightWing.name = "rightWing";
    
    group.add(leftWing, rightWing);
    return group;
  }
};

// Continuous Single Water Plane Shader
window.FFH.createSeamlessWaterPlane = function(width = 110, height = 110) {
  const waterGeo = new THREE.PlaneGeometry(width, height, 48, 48);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color(0x1D3557) },
      uShallowColor: { value: new THREE.Color(0x457B9D) },
      uFoamColor: { value: new THREE.Color(0xA8DADC) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.x * 0.3 + uTime * 1.4) * cos(pos.y * 0.3 + uTime * 1.1) * 0.14;
        pos.z += wave;
        vElevation = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uFoamColor;
      varying vec2 vUv;
      varying float vElevation;
      void main() {
        float mixVal = smoothstep(-0.08, 0.08, vElevation);
        vec3 col = mix(uDeepColor, uShallowColor, mixVal);
        if (vElevation > 0.06) {
          col = mix(col, uFoamColor, 0.4);
        }
        gl_FragColor = vec4(col, 0.94);
      }
    `,
    transparent: true
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(24, -0.25, 24);
  waterMesh.receiveShadow = true;
  return { waterMesh, waterMat };
};

// Uncluttered, spacious 20x20 City Layout with 2.6 unit tile scaling
// Every building is situated directly alongside a road or green plaza, oriented to face its street approach.
window.FFH.MAP_SIZE = 20;
window.FFH.TILE_SCALE = 2.6;

window.FFH.LUBECK_CITY_GRID = [
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','BR','BR','W','W','W','W','W','BR','BR','W','W','W','W','W'],
  ['W','W','G','T','G','R_B','R_B','R_B','R_B','R_B','R_B','R_B','R_B','R_B','R_B','G','T','G','W','W'],
  ['W','G','B_HOLSTEN','G','G','R_B','G','A1','G','A2','G','B_DARKSTORE','G','A3','R_B','G','B_HOSPITAL','G','W','W'],
  ['W','G','G','T','G','R_B','G','G','G','G','G','G','G','G','R_B','G','G','T','W','W'],
  ['W','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','W','W'],
  ['W','G','A4','G','R_C','G','T','G','R_C','G','B_MARIEN','G','R_C','G','T','G','A1','G','W','W'],
  ['W','T','B_WG','G','R_C','G','G','G','R_C','G','G','G','R_C','G','G','G','B_BAKERY','T','W','W'],
  ['W','G','G','G','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','G','G','W','W'],
  ['W','W','R_B','R_B','R_B','G','A2','G','R_C','G','B_RATHAUS','G','R_C','G','A3','G','R_B','R_B','W','W'],
  ['W','G','B_PIZZA','G','R_B','G','G','G','R_C','G','G','G','R_C','G','G','G','A4','G','W','W'],
  ['W','G','G','T','R_B','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_C','R_B','G','T','W','W'],
  ['W','T','A1','G','R_B','R_C','G','T','G','G','T','G','R_C','R_B','G','G','B_UNI','G','W','W'],
  ['W','G','G','G','R_B','R_C','G','G','G','G','G','G','R_C','R_B','G','T','G','G','W','W'],
  ['W','W','G','T','R_B','R_B','R_B','R_B','R_B','R_B','R_B','R_B','R_B','R_B','G','G','T','G','W','W'],
  ['W','W','W','W','W','W','BR','BR','W','W','W','W','W','BR','BR','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
];

window.FFH.POI_METADATA = {
  'B_HOLSTEN':    { name: 'Holstentor West Gate', tag: 'Historic Landmark', desc: '1464 Brick Gothic western gate. The iconic entryway into the Altstadt island.', action: 'Explore Gate' },
  'B_MARIEN':     { name: 'St. Mary\'s (Marienkirche)', tag: 'Cathedral', desc: 'The architectural mother of Brick Gothic churches with towering 120m dual spires.', action: 'Visit Spire' },
  'B_DARKSTORE':  { name: 'Kruma Dark Store #104', tag: 'Warehouse Hub', desc: 'Your grocery pick & delivery workplace. Grab your next courier shift manifest!', action: 'Start Shift' },
  'B_WG':         { name: 'Student Sublet (Your WG)', tag: 'Sanctuary', desc: 'Your cozy bedroom base with the glowing desk lamp, study books, and sleeping cat.', action: 'Enter Room' },
  'B_RATHAUS':    { name: 'Bürgeramt & Rathaus', tag: 'City Hall', desc: 'Historic town hall. Register your address (Anmeldung) to unlock your banking rights.', action: 'Inspect Status' },
  'B_PIZZA':      { name: 'Pizzeria Bella Lübeck', tag: 'Food Pickup', desc: 'Charming terracotta restaurant counter for rapid food delivery dispatches.', action: 'Order Lunch' },
  'B_BAKERY':     { name: 'Bäckerei Hansa', tag: 'Artisan Shop', desc: 'Local artisan bakery baking fresh sourdough crust loaves (das Brot).', action: 'Buy Bread' },
  'B_HOSPITAL':   { name: 'Krankenhaus Altstadt', tag: 'Medical VIP', desc: 'High-stakes express delivery target for Station 4B night shifts.', action: 'View Delivery Target' },
  'B_UNI':        { name: 'Universität zu Lübeck', tag: 'University', desc: 'Goal: Bank 250.00€ tuition fees (Semesterbeitrag) to pass enrollment!', action: 'Check Tuition' }
};

// Calculate optimal building rotation so its front door faces the nearest road tile
function getBuildingRotationTowardsRoad(grid, x, z) {
  const S = window.FFH.MAP_SIZE;
  const isRoad = (gx, gz) => {
    if (gx < 0 || gx >= S || gz < 0 || gz >= S) return false;
    const t = grid[gz][gx];
    return t === 'R_C' || t === 'R_B' || t === 'BR';
  };

  // Check 4 adjacent directions: +Z (South), -Z (North), +X (East), -X (West)
  if (isRoad(x, z + 1)) return 0;          // Front door (+Z) faces South towards road
  if (isRoad(x, z - 1)) return Math.PI;    // Front door (+Z) rotates 180 to face North
  if (isRoad(x + 1, z)) return -Math.PI / 2; // Faces East
  if (isRoad(x - 1, z)) return Math.PI / 2;  // Faces West
  return 0;
}

window.FFH.buildLubeckCityWorld = function() {
  const worldGroup = new THREE.Group();
  const interactiveMeshes = [];
  const clouds = [];
  const registry = window.FFH.CityAssetRegistry;
  const S = window.FFH.TILE_SCALE;

  // Initialize procedural textures
  registry.initMaterials();

  // Single continuous Water Base Plane
  const { waterMesh, waterMat } = window.FFH.createSeamlessWaterPlane(90, 90);
  worldGroup.add(waterMesh);

  const tileGeo = new THREE.BoxGeometry(S, 0.35, S);
  const curbMat = new THREE.MeshLambertMaterial({ color: 0x7D8A9D });

  for (let z = 0; z < window.FFH.MAP_SIZE; z++) {
    for (let x = 0; x < window.FFH.MAP_SIZE; x++) {
      const type = window.FFH.LUBECK_CITY_GRID[z][x];
      const posX = x * S;
      const posZ = z * S;

      if (type === 'W') continue;

      const tileGroup = new THREE.Group();
      tileGroup.position.set(posX, 0, posZ);

      const isRoad = (gx, gz) => {
        if (gx < 0 || gx >= window.FFH.MAP_SIZE || gz < 0 || gz >= window.FFH.MAP_SIZE) return false;
        const t = window.FFH.LUBECK_CITY_GRID[gz][gx];
        return t === 'R_C' || t === 'R_B' || t === 'BR';
      };

      const roadE = isRoad(x + 1, z);
      const roadW = isRoad(x - 1, z);
      const roadN = isRoad(x, z - 1);
      const roadS = isRoad(x, z + 1);

      let groundMat = registry.materials.grass;
      let roadRotation = 0;

      if (type === 'R_C') {
        groundMat = registry.materials.cobble;
      } else if (type === 'R_B') {
        groundMat = registry.materials.bikeLane;
        // Directional alignment: East-West roads rotate 90 deg so car lanes & Radweg flow continuously
        if ((roadE || roadW) && !(roadN && roadS)) {
          roadRotation = Math.PI / 2;
        } else {
          roadRotation = 0;
        }
      } else if (type === 'BR') {
        groundMat = registry.materials.bikeLane;
        roadRotation = 0; // Bridges cross the Trave river North-South
      } else if (type === 'G') {
        groundMat = registry.materials.sidewalk || registry.materials.grass;
      }

      const base = new THREE.Mesh(tileGeo, groundMat);
      base.position.y = -0.05;
      base.rotation.y = roadRotation;
      base.receiveShadow = true;
      tileGroup.add(base);

      // Add stone curb border between road and pavement (matching 3D isometric diorama mockup)
      if (type === 'R_C' || type === 'R_B') {
        if (z > 0 && window.FFH.LUBECK_CITY_GRID[z - 1][x] === 'G') {
          const curbN = new THREE.Mesh(new THREE.BoxGeometry(S, 0.08, 0.12), curbMat);
          curbN.position.set(0, 0.14, -S / 2 + 0.06);
          curbN.castShadow = true;
          curbN.receiveShadow = true;
          tileGroup.add(curbN);
        }
        if (z < window.FFH.MAP_SIZE - 1 && window.FFH.LUBECK_CITY_GRID[z + 1][x] === 'G') {
          const curbS = new THREE.Mesh(new THREE.BoxGeometry(S, 0.08, 0.12), curbMat);
          curbS.position.set(0, 0.14, S / 2 - 0.06);
          curbS.castShadow = true;
          curbS.receiveShadow = true;
          tileGroup.add(curbS);
        }
        if (x > 0 && window.FFH.LUBECK_CITY_GRID[z][x - 1] === 'G') {
          const curbW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, S), curbMat);
          curbW.position.set(-S / 2 + 0.06, 0.14, 0);
          curbW.castShadow = true;
          curbW.receiveShadow = true;
          tileGroup.add(curbW);
        }
        if (x < window.FFH.MAP_SIZE - 1 && window.FFH.LUBECK_CITY_GRID[z][x + 1] === 'G') {
          const curbE = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, S), curbMat);
          curbE.position.set(S / 2 - 0.06, 0.14, 0);
          curbE.castShadow = true;
          curbE.receiveShadow = true;
          tileGroup.add(curbE);
        }
      }

      // Procedural Architecture & Landmarks with dynamic road-facing rotation
      let bldgGroup = null;
      if (type.startsWith('A')) {
        const variant = parseInt(type[1]) || 1;
        bldgGroup = registry.createAltbau(variant, 2 + (variant % 2));
      } else if (type === 'B_HOLSTEN') {
        bldgGroup = registry.createHolstentor();
      } else if (type === 'B_MARIEN') {
        bldgGroup = registry.createMarienkirche();
      } else if (type === 'B_DARKSTORE') {
        bldgGroup = registry.createDarkStore();
      } else if (type === 'B_PIZZA') {
        bldgGroup = registry.createPizzeria();
      } else if (type === 'B_UNI') {
        bldgGroup = registry.createUniversity();
      } else if (type === 'B_WG') {
        bldgGroup = registry.createAltbau(3, 2);
      } else if (type === 'B_BAKERY' || type === 'B_HOSPITAL' || type === 'B_RATHAUS') {
        bldgGroup = registry.createAltbau(1, 3);
      } else if (type === 'T') {
        tileGroup.add(registry.createTree());
      }

      if (bldgGroup) {
        // Rotate building so front entrance faces the street
        const rot = getBuildingRotationTowardsRoad(window.FFH.LUBECK_CITY_GRID, x, z);
        bldgGroup.rotation.y = rot;
        tileGroup.add(bldgGroup);
      }

      // Add atmospheric street furniture cleanly on sidewalk curbs/grass verges beside roads
      if (type === 'G' && (x + z) % 4 === 0) {
        // Place lamp posts on green sidewalk borders facing the road
        const isBesideRoad = (gx, gz) => {
          if (gx < 0 || gx >= window.FFH.MAP_SIZE || gz < 0 || gz >= window.FFH.MAP_SIZE) return false;
          const t = window.FFH.LUBECK_CITY_GRID[gz][gx];
          return t === 'R_C' || t === 'R_B';
        };
        
        if (isBesideRoad(x + 1, z) || isBesideRoad(x - 1, z) || isBesideRoad(x, z + 1) || isBesideRoad(x, z - 1)) {
          const lamp = registry.createStreetLamp();
          lamp.position.set(0, 0, 0);
          tileGroup.add(lamp);
        }
      }

      // Overhead pedestrian overpass across the main boulevard
      if (x === 8 && z === 5) {
        tileGroup.add(registry.createOverpass());
      }

      // Spawn Flowers on Grass verges
      if (type === 'G' && Math.random() < 0.35) {
        tileGroup.add(registry.createFlowerCluster());
      }

      tileGroup.userData = {
        gridX: x, gridZ: z, type: type,
        poi: window.FFH.POI_METADATA[type] || (type.startsWith('A') ? { name: `Altbau Townhouse #${x}-${z}`, tag: 'Residence', desc: 'Charming stepped-gable residential apartment block.', action: 'Say Hallo' } : null)
      };

      worldGroup.add(tileGroup);
      if (tileGroup.userData.poi) {
        interactiveMeshes.push(tileGroup);
      }
    }
  }

  // Floating Sky Clouds
  for (let c = 0; c < 6; c++) {
    const cloud = registry.createCloud();
    cloud.position.set(Math.random() * 45, 14 + Math.random() * 4, Math.random() * 45);
    cloud.userData = { speed: 0.5 + Math.random() * 0.6 };
    clouds.push(cloud);
    worldGroup.add(cloud);
  }

  // Spawning Butterflies over Grass tiles
  const butterflies = [];
  const grassTiles = [];
  for (let z = 0; z < window.FFH.MAP_SIZE; z++) {
    for (let x = 0; x < window.FFH.MAP_SIZE; x++) {
      if (window.FFH.LUBECK_CITY_GRID[z][x] === 'G') {
        grassTiles.push({ x: x * S, z: z * S });
      }
    }
  }
  for (let b = 0; b < 10; b++) {
    if (grassTiles.length === 0) break;
    const tile = grassTiles[Math.floor(Math.random() * grassTiles.length)];
    const bf = registry.createButterfly();
    bf.position.set(
      tile.x + (Math.random() - 0.5) * S,
      0.2 + Math.random() * 0.8,
      tile.z + (Math.random() - 0.5) * S
    );
    bf.userData = {
      baseX: bf.position.x,
      baseZ: bf.position.z,
      seed: Math.random() * 100
    };
    butterflies.push(bf);
    worldGroup.add(bf);
  }

  // Spawning soaring Birds
  const birds = [];
  for (let b = 0; b < 6; b++) {
    const bird = registry.createBird();
    // Soaring high above town
    bird.position.set(
      Math.random() * 40,
      8.0 + Math.random() * 4.0,
      Math.random() * 40
    );
    bird.userData = {
      centerX: 20 + (Math.random() - 0.5) * 10,
      centerZ: 20 + (Math.random() - 0.5) * 10,
      radius: 6 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5
    };
    birds.push(bird);
    worldGroup.add(bird);
  }

  return { worldGroup, interactiveMeshes, waterMat, clouds, butterflies, birds };
};
