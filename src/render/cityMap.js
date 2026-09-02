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

  // 10. Burgtor North Gate (Late Gothic Fortress Gate with Arched Portal & Hipped Roof)
  createBurgtor() {
    const group = new THREE.Group();
    const P = window.FFH.ProceduralTextures;
    const brickTex = P ? P.getBrickFacadeTexture(5) : null;
    const brickNorm = P ? P.getBrickFacadeNormalMap(5) : null;
    const brickMat = brickTex
      ? new THREE.MeshStandardMaterial({ map: brickTex, normalMap: brickNorm, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.82 })
      : new THREE.MeshLambertMaterial({ color: 0x7F1D1D });

    // Main Fortified Gate Tower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5.2, 2.2), brickMat);
    tower.position.y = 2.6;
    tower.castShadow = true;
    tower.receiveShadow = true;

    // Arched Gate Portal Tunnel
    const gateTunnel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 2.3), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    gateTunnel.position.set(0, 1.4, 0);

    // Decorative stepped parapet crenellations atop tower
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 2.4), new THREE.MeshLambertMaterial({ color: 0xEDE5D8 }));
    parapet.position.set(0, 5.4, 0);
    parapet.castShadow = true;

    // Steep 4-sided Hipped Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.2, 4), this.materials.roofCopper);
    roof.position.set(0, 7.0, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;

    // Central Finial Spire
    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.2, 8), new THREE.MeshLambertMaterial({ color: 0xD4AF37 }));
    finial.position.set(0, 8.8, 0);

    group.add(tower, gateTunnel, parapet, roof, finial);
    return group;
  },

  // 11. Dom zu Lübeck (1173 Romanesque-Gothic Cathedral with Twin Soaring Spires)
  createDom() {
    const group = new THREE.Group();
    const P = window.FFH.ProceduralTextures;
    const brickTex = P ? P.getBrickFacadeTexture(0) : null;
    const brickNorm = P ? P.getBrickFacadeNormalMap(0) : null;
    const brickMat = brickTex
      ? new THREE.MeshStandardMaterial({ map: brickTex, normalMap: brickNorm, normalScale: new THREE.Vector2(0.65, 0.65), roughness: 0.82 })
      : new THREE.MeshLambertMaterial({ color: 0x8C2424 });

    // Massive Central Basilica Nave
    const nave = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.4, 3.8), brickMat);
    nave.position.y = 2.2;
    nave.castShadow = true;
    nave.receiveShadow = true;

    // High Pitched Nave Roof
    const naveRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 4), this.materials.roofBrick);
    naveRoof.position.set(0, 5.4, 0);
    naveRoof.rotation.y = Math.PI / 4;
    naveRoof.scale.set(1.1, 1.0, 1.6);
    naveRoof.castShadow = true;

    // Twin Massive Square Romanesque Towers on Front Facade
    [-0.95, 0.95].forEach(tx => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.05, 6.8, 1.05), brickMat);
      tower.position.set(tx, 3.4, 1.4);
      tower.castShadow = true;
      tower.receiveShadow = true;

      // Tall slender copper spire
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.85, 4.5, 8), this.materials.roofCopper);
      spire.position.set(tx, 8.9, 1.4);
      spire.castShadow = true;
      group.add(tower, spire);
    });

    // Great Cathedral Arched Portal
    const portal = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.15), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    portal.position.set(0, 0.95, 1.92);

    // Bronze Crucifix Finial atop ridge
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), new THREE.MeshLambertMaterial({ color: 0xD4AF37 }));
    crossBar.position.set(0, 6.7, -0.6);
    const crossStem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), new THREE.MeshLambertMaterial({ color: 0xD4AF37 }));
    crossStem.position.set(0, 6.7, -0.6);
    group.add(nave, naveRoof, portal, crossBar, crossStem);

    return group;
  },

  // 12. Filmhaus & Stadthalle Kino (Cultural Cinema with Glowing Marquee)
  createKino() {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xF4E8C1 }); // Cream Art Deco facade
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 2.7), wallMat);
    body.position.y = 1.6;
    body.castShadow = true;
    body.receiveShadow = true;

    // Streamlined Coral Trim Roof Band
    const trim = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.35, 2.85), new THREE.MeshLambertMaterial({ color: 0xE76F51 }));
    trim.position.y = 3.35;
    trim.castShadow = true;

    // Glowing Amber "KINO" Marquee Canopy
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.9), new THREE.MeshLambertMaterial({ color: 0x1A1C20 }));
    marquee.position.set(0, 1.9, 1.45);
    marquee.castShadow = true;

    const marqueeGlow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.25, 0.05), new THREE.MeshBasicMaterial({ color: 0xFFB703 }));
    marqueeGlow.position.set(0, 1.9, 1.91);

    // Glass Double Entrance Doors
    const doors = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.06), new THREE.MeshLambertMaterial({ color: 0x264653 }));
    doors.position.set(0, 0.8, 1.36);

    // Movie Poster Lightboxes on sides
    [-0.95, 0.95].forEach(px => {
      const posterFrame = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.04), new THREE.MeshLambertMaterial({ color: 0x222222 }));
      posterFrame.position.set(px, 1.3, 1.36);
      const posterArt = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.62, 0.05), new THREE.MeshBasicMaterial({ color: px < 0 ? 0xE63946 : 0x457B9D }));
      posterArt.position.set(px, 1.3, 1.37);
      group.add(posterFrame, posterArt);
    });

    group.add(body, trim, marquee, marqueeGlow, doors);
    return group;
  },

  // 13. ZOB & Hauptbahnhof Transit Hub (Modern Glass Canopies & Bus Parking Bay)
  createZOB() {
    const group = new THREE.Group();
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x343A40 });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x8ecae6, transparent: true, opacity: 0.65 });

    // Raised Passenger Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 2.6), new THREE.MeshLambertMaterial({ color: 0xADB5BD }));
    platform.position.y = 0.11;
    platform.receiveShadow = true;

    // Modern Glass Overhang Canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.2), glassMat);
    canopy.position.set(0, 2.2, 0);
    canopy.castShadow = true;

    // Steel Support Pillars
    [-0.9, 0.9].forEach(px => {
      [-0.8, 0.8].forEach(pz => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 8), steelMat);
        pole.position.set(px, 1.1, pz);
        pole.castShadow = true;
        group.add(pole);
      });
    });

    // Digital Departure Board Totem
    const totem = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.6, 0.15), steelMat);
    totem.position.set(0, 0.9, 0.6);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.16), new THREE.MeshBasicMaterial({ color: 0xFFB703 }));
    screen.position.set(0, 1.25, 0.61);

    // Waiting Bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.28, 0.35), new THREE.MeshLambertMaterial({ color: 0x8D6E63 }));
    bench.position.set(0, 0.28, -0.4);

    group.add(platform, canopy, totem, screen, bench);
    return group;
  },

  // 14. 3D Circular Traffic Roundabout Plaza (Kreisverkehr)
  createRoundabout() {
    const group = new THREE.Group();
    const S = window.FFH.TILE_SCALE || 2.6;

    // Cobblestone Circular Apron
    const apronGeo = new THREE.CylinderGeometry(S * 0.48, S * 0.48, 0.36, 24);
    const apron = new THREE.Mesh(apronGeo, this.materials.cobble);
    apron.position.y = -0.04;
    apron.receiveShadow = true;

    // Raised Outer Stone Curb Ring
    const curbRingGeo = new THREE.TorusGeometry(S * 0.26, 0.06, 8, 24);
    const curbRing = new THREE.Mesh(curbRingGeo, new THREE.MeshLambertMaterial({ color: 0x7D8A9D }));
    curbRing.rotation.x = Math.PI / 2;
    curbRing.position.y = 0.16;
    curbRing.castShadow = true;

    // Inner Manicured Garden Center
    const gardenGeo = new THREE.CylinderGeometry(S * 0.25, S * 0.25, 0.12, 20);
    const garden = new THREE.Mesh(gardenGeo, this.materials.grass);
    garden.position.y = 0.18;
    garden.receiveShadow = true;

    // Centerpiece: Historic Stone Monument Fountain
    const fountainPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.35, 12), new THREE.MeshLambertMaterial({ color: 0xEDE5D8 }));
    fountainPlinth.position.y = 0.40;
    fountainPlinth.castShadow = true;

    const fountainBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.25, 0.2, 12), new THREE.MeshLambertMaterial({ color: 0xEDE5D8 }));
    fountainBowl.position.y = 0.65;
    fountainBowl.castShadow = true;

    const waterCore = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.05, 12), new THREE.MeshBasicMaterial({ color: 0x457B9D }));
    waterCore.position.y = 0.72;

    group.add(apron, curbRing, garden, fountainPlinth, fountainBowl, waterCore);
    return group;
  },

  // 15. 3D Arched Hanseatic Bridge with Stone Balustrades (Brücke - 100% Pedestrian & Bike, Zero Car Roads)
  createArchedBridge(isEW = true) {
    const group = new THREE.Group();
    const S = window.FFH.TILE_SCALE || 2.6;

    // Bridge Deck: Historic Cobblestone (Zero asphalt, zero car lane markings)
    const deckGeo = new THREE.BoxGeometry(S, 0.38, S);
    const deck = new THREE.Mesh(deckGeo, this.materials.cobble);
    deck.position.y = 0.06;
    deck.receiveShadow = true;

    // Twin Stone Balustrades / Railings along the water-facing flanks only!
    const balustradeMat = new THREE.MeshLambertMaterial({ color: 0xEDE5D8 });
    const balGeo = isEW 
      ? new THREE.BoxGeometry(S, 0.42, 0.12)
      : new THREE.BoxGeometry(0.12, 0.42, S);

    const bal1 = new THREE.Mesh(balGeo, balustradeMat);
    const bal2 = new THREE.Mesh(balGeo, balustradeMat);

    if (isEW) {
      // East-West bridge: railings protect the North (-Z) and South (+Z) water edges
      bal1.position.set(0, 0.42, -S * 0.46);
      bal2.position.set(0, 0.42, S * 0.46);
    } else {
      // North-South bridge: railings protect the West (-X) and East (+X) water edges
      bal1.position.set(-S * 0.46, 0.42, 0);
      bal2.position.set(S * 0.46, 0.42, 0);
    }
    bal1.castShadow = true;
    bal2.castShadow = true;

    // Brick Arch Piers dipping into the water
    const pierMat = this.materials.roofBrick;
    const pier1 = new THREE.Mesh(new THREE.BoxGeometry(S * 0.9, 0.5, S * 0.9), pierMat);
    pier1.position.y = -0.3;

    group.add(deck, bal1, bal2, pier1);
    return group;
  },

  // 16. Street Props: Historical Hanseatic Lamp Post & Electrical Utility Boxes
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

// Continuous Single Water Plane Shader: Stylized Cel Water
// Inspired by cortiz2894/stylized-components waterFloor:
// - Animated Voronoi F1 vs SmoothF1 cell caustics
// - FBM noise flow distortion
// - 3-stop cel-shaded color ramp (deep azure -> turquoise cyan -> crisp white foam caustics)
window.FFH.createSeamlessWaterPlane = function(width = 110, height = 110) {
  const waterGeo = new THREE.PlaneGeometry(width, height, 1, 1);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:           { value: 0 },
      uScale:          { value: 0.28 },
      uSmoothness:     { value: 0.46 },
      uEdgeThreshold:  { value: 0.09 },
      uEdgeSoftness:   { value: 0.08 },
      uFlowX:          { value: 0.06 },
      uFlowZ:          { value: -0.18 },
      uCellSpeed:      { value: 0.55 },
      uNoiseScale:     { value: 0.85 },
      uNoiseFlowSpeed: { value: 0.12 },
      uDistortAmount:  { value: 0.28 },
      uDeepColor:      { value: new THREE.Color(0x27A3D8) }, // Rich anime azure (#27a3d8)
      uMidColor:       { value: new THREE.Color(0x59C0E8) }, // Soft vibrant cyan (#59c0e8)
      uMidPos:         { value: 0.31 },
      uHighlight:      { value: new THREE.Color(0xFFFFFF) }, // Pure white caustics
      uOpacity:        { value: 0.96 },
      uDeepOpacity:    { value: 0.88 },
      uCamXZ:          { value: new THREE.Vector2(31.2, 31.2) },
      uFadeDistance:   { value: 400.0 },
      uFadeStrength:   { value: 1.2 }
    },
    vertexShader: `
      varying vec2 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos     = worldPos.xz;
        gl_Position   = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uScale;
      uniform float uSmoothness;
      uniform float uEdgeThreshold;
      uniform float uEdgeSoftness;
      uniform float uFlowX;
      uniform float uFlowZ;
      uniform float uCellSpeed;
      uniform float uNoiseScale;
      uniform float uNoiseFlowSpeed;
      uniform float uDistortAmount;
      uniform vec3  uDeepColor;
      uniform vec3  uMidColor;
      uniform float uMidPos;
      uniform vec3  uHighlight;
      uniform float uOpacity;
      uniform float uDeepOpacity;
      uniform float uFadeDistance;
      uniform float uFadeStrength;
      uniform vec2  uCamXZ;

      varying vec2 vWorldPos;

      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
      }

      float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * h * k / 6.0;
      }

      vec2 cellPt(vec2 seed) {
        return 0.5 + 0.5 * sin(uTime * uCellSpeed + 6.2831 * seed);
      }

      float voronoiF1(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        float md = 8.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 n  = vec2(float(x), float(y));
            vec2 pt = cellPt(hash2(i + n));
            md = min(md, length(n + pt - f));
          }
        }
        return md;
      }

      float voronoiSF1(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        float res = 8.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 n  = vec2(float(x), float(y));
            vec2 pt = cellPt(hash2(i + n));
            res = smin(res, length(n + pt - f), uSmoothness);
          }
        }
        return res;
      }

      float nHash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(nHash(i),                  nHash(i + vec2(1.0, 0.0)), f.x),
          mix(nHash(i + vec2(0.0, 1.0)), nHash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 2; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main() {
        // 1. Noise distortion
        vec2 noiseUV  = vWorldPos * uNoiseScale + vec2(uTime * uNoiseFlowSpeed, 0.0);
        float noiseFac = fbm(noiseUV);
        vec2 distort   = vec2(noiseFac - 0.5) * uDistortAmount;

        // 2. Voronoi UV: base river flow + noise distortion
        vec2 uv = vWorldPos * uScale + vec2(uFlowX, uFlowZ) * uTime + distort;

        float f1   = voronoiF1(uv);
        float sf1  = voronoiSF1(uv);

        // F1 − SmoothF1: 0 at cell centers → positive at cell boundaries
        float edge = f1 - sf1;

        // Cel-shaded ColorRamp: hard step at threshold
        float t = smoothstep(
          uEdgeThreshold - uEdgeSoftness,
          uEdgeThreshold + uEdgeSoftness,
          edge
        );

        // 3-stop ColorRamp: deepColor → midColor → highlight
        float safeMP = max(uMidPos, 1e-4);
        float seg0   = clamp(t / safeMP, 0.0, 1.0);
        float seg1   = clamp((t - safeMP) / max(1.0 - safeMP, 1e-4), 0.0, 1.0);
        float inSeg1 = step(safeMP, t);
        vec3 color   = mix(
          mix(uDeepColor, uMidColor, seg0),
          mix(uMidColor,  uHighlight, seg1),
          inSeg1
        );

        // Distance fade
        float dist = length(vWorldPos - uCamXZ);
        float fade = 1.0 - pow(clamp(dist / uFadeDistance, 0.0, 1.0), uFadeStrength);

        float alpha = mix(uDeepOpacity, 1.0, t) * uOpacity * fade;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(31.2, -0.10, 31.2);
  waterMesh.receiveShadow = true;
  return { waterMesh, waterMat };
};

// 24x24 Authentic Lübeck City Layout faithfully recreating the user's new hand-painted map (Docs/new handmade map.jpg):
// - Solid Mainland Perimeter (North, West, South, East) with residential quarters, gardens & facilities
// - Enclosed Water Moat / Canal Loop wrapping around the Central Altstadt Island
// - 6 Designated Historic Bridges: North Bridge, BurgTor (NE), East Bridge, South Bridge, Bakery (WN), HolstenTor (WS)
// - Exact POI Placements:
//     West Mainland: ZOB (top-left), Bakery (mid-left), WG (residential), West Garden, Darkstore (bottom-left)
//     Central Island: UNI (north tip), BurgTor (NE gate), HolstenTor (west gate), Kino (center), Dom (south tip)
//     East Mainland: Church (St. Mary's), East Garden (top-right)
window.FFH.MAP_SIZE = 24;
window.FFH.TILE_SCALE = 2.6;

window.FFH.LUBECK_CITY_GRID = [
  // Row 0: North Mainland Border
  ['G','G','A1','G','T','G','G','G','G','G','R_C','R_C','G','G','G','G','G','G','T','G','A2','G','G','G'],
  // Row 1: North Mainland (ZOB approach & East Garden)
  ['G','A2','R_C','R_C','R_C','G','G','G','G','T','R_C','R_C','T','G','G','G','G','G','G','T','G','T','G','G'],
  // Row 2: North Mainland (ZOB & East Garden)
  ['G','G','B_ZOB','G','R_C','G','G','G','G','G','R_C','R_C','G','G','G','G','G','G','G','G','T','G','G','G'],
  // Row 3: North Mainland Approach to North Bridge
  ['A1','G','R_C','G','R_C','G','G','G','G','G','R_B','R_B','G','G','G','G','G','G','G','G','A3','G','T','G'],
  // Row 4: NORTH CANAL LOOP & NORTH BRIDGE
  ['G','G','R_C','G','G','W','W','W','W','W','BR','BR','W','W','W','W','W','W','W','G','R_C','G','G','G'],
  // Row 5: Island North Apex
  ['G','T','R_C','G','G','W','G','G','R_C','R_C','R_C','R_C','R_C','R_C','G','G','W','W','G','G','R_C','T','G','G'],
  // Row 6: Island North (UNI)
  ['G','G','R_C','G','G','W','G','G','R_C','G','B_UNI','G','R_C','G','G','G','W','W','G','G','R_C','G','A4','G'],
  // Row 7: West-North Bridge (Bakery) & East BurgTor Bridge
  ['A2','G','B_BAKERY','R_C','R_B','BR','BR','R_B','R_C','R_C','R_C','R_C','R_C','R_B','B_BURGTOR','R_B','BR','BR','R_B','R_C','R_C','G','T','G'],
  // Row 8: West Mainland & Upper Island Core
  ['G','T','R_C','G','G','W','G','G','R_C','G','A1','G','R_C','G','G','G','W','W','G','G','R_C','G','G','G'],
  // Row 9: West Mainland & Island Market Center (Rathaus & Pizza)
  ['G','G','R_C','G','G','W','G','G','R_C','B_RATHAUS','R_C','B_PIZZA','R_C','G','G','G','W','W','G','G','R_C','T','G','G'],
  // Row 10: West Mainland (Student WG Room)
  ['A1','G','B_WG','R_C','R_C','W','G','G','R_C','R_C','R_C','R_C','R_C','G','G','G','W','W','G','G','R_C','G','A1','G'],
  // Row 11: West Mainland & Island Kino Avenue
  ['G','T','R_C','G','G','W','G','G','R_C','G','A2','G','R_C','G','G','G','W','W','G','G','R_C','G','T','G'],
  // Row 12: West Mainland (Garden) & Island Kino
  ['G','G','R_C','T','G','W','G','G','R_C','G','B_KINO','G','R_C','G','G','G','W','W','G','G','R_C','G','G','G'],
  // Row 13: West-South HolstenTor Bridge & East Church Bridge
  ['G','T','R_C','G','R_B','BR','BR','B_HOLSTEN','R_B','R_C','R_C','R_C','R_C','R_B','R_B','R_B','BR','BR','R_B','R_C','R_C','B_MARIEN','G','G'],
  // Row 14: West Mainland (Garden) & Lower Island Core
  ['G','T','G','T','G','W','G','G','R_C','G','A3','G','R_C','G','G','G','W','W','G','G','R_C','G','A2','G'],
  // Row 15: West Mainland (Garden) & Lower Island
  ['G','G','T','G','G','W','G','G','R_C','R_C','R_C','R_C','R_C','G','G','G','W','W','G','G','R_C','T','G','G'],
  // Row 16: West Mainland Road to Darkstore
  ['G','A3','R_C','G','G','W','G','G','R_C','G','A4','G','R_C','G','G','G','W','W','G','G','R_C','G','G','G'],
  // Row 17: Island South Tip (Dom zu Lübeck)
  ['G','G','R_C','G','G','W','G','G','R_C','G','B_DOM','G','R_C','G','G','G','W','W','G','G','R_C','G','A3','G'],
  // Row 18: West Mainland (Kruma Darkstore #104)
  ['A4','G','B_DARKSTORE','R_C','R_C','W','G','G','G','R_C','R_C','G','G','G','G','G','W','W','G','G','R_C','T','G','G'],
  // Row 19: SOUTH CANAL LOOP & SOUTH BRIDGE
  ['G','T','R_C','G','G','W','W','W','W','W','BR','BR','W','W','W','W','W','W','W','G','R_C','G','G','G'],
  // Row 20: South Mainland Approach to South Bridge
  ['G','G','R_C','G','G','G','G','G','G','G','R_B','R_B','G','G','G','G','G','G','G','G','R_C','G','A4','G'],
  // Row 21: South Mainland Villas & Promenade
  ['G','A1','R_C','R_C','R_C','G','G','G','T','R_C','R_C','R_C','T','G','G','G','G','R_C','R_C','R_C','R_C','G','T','G'],
  // Row 22: South Mainland Parkland
  ['G','G','T','G','R_C','T','G','G','G','G','R_C','R_C','G','G','G','G','T','G','R_C','G','T','G','G','G'],
  // Row 23: South Mainland Border
  ['G','G','G','G','A2','G','G','G','G','G','G','G','G','G','G','G','G','G','A3','G','G','G','G','G']
];

window.FFH.POI_METADATA = {
  'B_HOLSTEN':    { name: 'Holstentor West Gate', tag: 'Historic Gateway', desc: '1464 Brick Gothic fortress gate defending the western bridge crossing into the Altstadt island.', action: 'Explore Gate' },
  'B_BURGTOR':    { name: 'Burgtor North Gate', tag: 'Citadel Gate', desc: '1444 Late-Gothic citadel gate defending the north-eastern bridge crossing.', action: 'Inspect Fortress' },
  'B_ZOB':        { name: 'ZOB & Hauptbahnhof', tag: 'Transit Hub', desc: 'Lübeck Central Bus Station & Train Terminal on the northwest mainland where your journey began.', action: 'Check Bus Schedule' },
  'B_MARIEN':     { name: 'St. Mary\'s (Church)', tag: 'Historic Cathedral', desc: 'The architectural mother of Brick Gothic churches on the east mainland.', action: 'Visit Church' },
  'B_DOM':        { name: 'Dom zu Lübeck (Cathedral)', tag: 'Romanesque Cathedral', desc: 'Historic 1173 cathedral founded by Henry the Lion, anchoring the southern tip of the island.', action: 'Walk Courtyard' },
  'B_UNI':        { name: 'Universität zu Lübeck', tag: 'University Campus', desc: 'North island university campus. Bank 250.00€ tuition fees (Semesterbeitrag) to pass enrollment!', action: 'Check Tuition' },
  'B_KINO':       { name: 'Filmhaus & Stadthalle Kino', tag: 'Cultural Cinema', desc: 'Beloved local cinema and student film society venue at the center of the island.', action: 'View Showtimes' },
  'B_DARKSTORE':  { name: 'Kruma Dark Store #104', tag: 'Warehouse Hub', desc: 'Your grocery pick & delivery workplace on the southwest mainland. Grab your shift manifest!', action: 'Start Shift' },
  'B_WG':         { name: 'Student Sublet (Your WG)', tag: 'Sanctuary', desc: 'Your cozy bedroom base on the west mainland with desk lamp, study books, and sleeping cat.', action: 'Enter Room' },
  'B_RATHAUS':    { name: 'Bürgeramt & Rathaus', tag: 'City Hall', desc: 'Historic town hall on the island market square. Register your address (Anmeldung) to unlock banking rights.', action: 'Inspect Status' },
  'B_PIZZA':      { name: 'Pizzeria Bella Lübeck', tag: 'Food Pickup', desc: 'Charming terracotta restaurant counter on the island for rapid food deliveries.', action: 'Order Lunch' },
  'B_BAKERY':     { name: 'Bäckerei Hansa (Bekary)', tag: 'Artisan Shop', desc: 'Local artisan bakery on the west mainland beside the northwest bridge. Fresh bread daily!', action: 'Buy Bread' },
  'B_HOSPITAL':   { name: 'Krankenhaus Altstadt', tag: 'Medical VIP', desc: 'High-stakes express delivery target for Station 4B night shifts.', action: 'View Delivery Target' }
};

// Calculate optimal building rotation so its front door faces the nearest road tile
function getBuildingRotationTowardsRoad(grid, x, z) {
  const S = window.FFH.MAP_SIZE;
  const isRoad = (gx, gz) => {
    if (gx < 0 || gx >= S || gz < 0 || gz >= S) return false;
    const t = grid[gz][gx];
    return t === 'R_C' || t === 'R_B' || t === 'BR' || t === 'R_R';
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
  const { waterMesh, waterMat } = window.FFH.createSeamlessWaterPlane(110, 110);
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
        return t === 'R_C' || t === 'R_B' || t === 'BR' || t === 'R_R';
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
        roadRotation = 0;
      } else if (type === 'BR') {
        const grid = window.FFH.LUBECK_CITY_GRID;
        const M = window.FFH.MAP_SIZE;
        const isWaterN = (z > 0 && grid[z - 1][x] === 'W');
        const isWaterS = (z < M - 1 && grid[z + 1][x] === 'W');
        const isEW = (isWaterN || isWaterS);
        tileGroup.add(registry.createArchedBridge(isEW));
      } else if (type === 'R_R') {
        tileGroup.add(registry.createRoundabout());
      } else if (type === 'G') {
        groundMat = registry.materials.sidewalk || registry.materials.grass;
      }

      if (type !== 'BR' && type !== 'R_R') {
        const base = new THREE.Mesh(tileGeo, groundMat);
        base.position.y = -0.05;
        base.rotation.y = roadRotation;
        base.receiveShadow = true;
        tileGroup.add(base);
      }

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
      } else if (type === 'B_BURGTOR') {
        bldgGroup = registry.createBurgtor();
      } else if (type === 'B_DOM') {
        bldgGroup = registry.createDom();
      } else if (type === 'B_KINO') {
        bldgGroup = registry.createKino();
      } else if (type === 'B_ZOB') {
        bldgGroup = registry.createZOB();
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
