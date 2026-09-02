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

  // 15. 3D Arched Hanseatic Bridge with Extra-Height Stone Balustrades (Brücke - 100% Pedestrian & Bike, Zero Car Roads)
  createArchedBridge(isEW = true) {
    const group = new THREE.Group();
    const S = window.FFH.TILE_SCALE || 2.6;

    // Bridge Deck: Historic Cobblestone (Zero asphalt, zero car lane markings)
    const deckGeo = new THREE.BoxGeometry(S, 0.38, S);
    const deck = new THREE.Mesh(deckGeo, this.materials.cobble);
    deck.position.y = 0.06;
    deck.receiveShadow = true;

    // Extra-Height Stone Balustrades / Parapets along the water-facing flanks (increased height per request)
    const balustradeMat = new THREE.MeshLambertMaterial({ color: 0xEDE5D8 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xF7F3EB });
    const balHeight = 0.72; // Extra height (up from 0.42)
    const balThickness = 0.16;
    const balY = 0.44;

    const balGeo = isEW 
      ? new THREE.BoxGeometry(S, balHeight, balThickness)
      : new THREE.BoxGeometry(balThickness, balHeight, S);

    const bal1 = new THREE.Mesh(balGeo, balustradeMat);
    const bal2 = new THREE.Mesh(balGeo, balustradeMat);

    if (isEW) {
      // East-West bridge: railings protect the North (-Z) and South (+Z) water edges
      bal1.position.set(0, balY, -S * 0.46);
      bal2.position.set(0, balY, S * 0.46);
    } else {
      // North-South bridge: railings protect the West (-X) and East (+X) water edges
      bal1.position.set(-S * 0.46, balY, 0);
      bal2.position.set(S * 0.46, balY, 0);
    }
    bal1.castShadow = true;
    bal2.castShadow = true;

    // Decorative Coping Stone Caps on the top of each balustrade
    const capGeo = isEW
      ? new THREE.BoxGeometry(S * 1.01, 0.09, balThickness + 0.06)
      : new THREE.BoxGeometry(balThickness + 0.06, 0.09, S * 1.01);
    const cap1 = new THREE.Mesh(capGeo, capMat);
    const cap2 = new THREE.Mesh(capGeo, capMat);
    cap1.position.set(bal1.position.x, balY + balHeight * 0.5 + 0.04, bal1.position.z);
    cap2.position.set(bal2.position.x, balY + balHeight * 0.5 + 0.04, bal2.position.z);
    cap1.castShadow = true;
    cap2.castShadow = true;

    // Decorative Stone Corner Plinths on the bridge ends
    const postGeo = new THREE.BoxGeometry(0.24, balHeight + 0.12, 0.24);
    const p1 = new THREE.Mesh(postGeo, capMat);
    const p2 = new THREE.Mesh(postGeo, capMat);
    const p3 = new THREE.Mesh(postGeo, capMat);
    const p4 = new THREE.Mesh(postGeo, capMat);
    if (isEW) {
      p1.position.set(-S * 0.48, balY + 0.04, -S * 0.46);
      p2.position.set(S * 0.48, balY + 0.04, -S * 0.46);
      p3.position.set(-S * 0.48, balY + 0.04, S * 0.46);
      p4.position.set(S * 0.48, balY + 0.04, S * 0.46);
    } else {
      p1.position.set(-S * 0.46, balY + 0.04, -S * 0.48);
      p2.position.set(-S * 0.46, balY + 0.04, S * 0.48);
      p3.position.set(S * 0.46, balY + 0.04, -S * 0.48);
      p4.position.set(S * 0.46, balY + 0.04, S * 0.48);
    }

    // Brick Arch Piers & Open Water Archway (allows water to visibly flow right through under the bridge)
    const pierMat = this.materials.roofBrick;
    if (isEW) {
      // East-West road: water flows North-South under the bridge
      const abutW = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.75, S * 0.96), pierMat);
      abutW.position.set(-S * 0.42, -0.375, 0);
      abutW.castShadow = true;
      abutW.receiveShadow = true;

      const abutE = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.75, S * 0.96), pierMat);
      abutE.position.set(S * 0.42, -0.375, 0);
      abutE.castShadow = true;
      abutE.receiveShadow = true;

      const archGeo = new THREE.CylinderGeometry(S * 0.36, S * 0.36, S * 0.94, 12, 1, false, 0, Math.PI);
      const arch = new THREE.Mesh(archGeo, pierMat);
      arch.rotation.z = Math.PI * 0.5;
      arch.position.y = -0.12;
      group.add(deck, bal1, bal2, cap1, cap2, p1, p2, p3, p4, abutW, abutE, arch);
    } else {
      // North-South road: water flows East-West under the bridge
      const abutN = new THREE.Mesh(new THREE.BoxGeometry(S * 0.96, 0.75, 0.36), pierMat);
      abutN.position.set(0, -0.375, -S * 0.42);
      abutN.castShadow = true;
      abutN.receiveShadow = true;

      const abutS = new THREE.Mesh(new THREE.BoxGeometry(S * 0.96, 0.75, 0.36), pierMat);
      abutS.position.set(0, -0.375, S * 0.42);
      abutS.castShadow = true;
      abutS.receiveShadow = true;

      const archGeo = new THREE.CylinderGeometry(S * 0.36, S * 0.36, S * 0.94, 12, 1, false, 0, Math.PI);
      const arch = new THREE.Mesh(archGeo, pierMat);
      arch.rotation.x = Math.PI * 0.5;
      arch.position.y = -0.12;
      group.add(deck, bal1, bal2, cap1, cap2, p1, p2, p3, p4, abutN, abutS, arch);
    }
    return group;
  },

  // 15B. Matching Perimeter Stone Border Wall Around Whole Playable Map
  createWorldPerimeterBorder(mapSize, tileScale) {
    const group = new THREE.Group();
    const S = tileScale || 2.6;
    const totalSize = mapSize * S;
    const halfS = S * 0.5;
    const minCoord = -halfS;
    const maxCoord = (mapSize - 1) * S + halfS;
    const center = minCoord + totalSize * 0.5;

    const wallHeight = 0.72; // Matching extra-height bridge balustrade
    const wallThickness = 0.22;
    const wallY = wallHeight * 0.5;

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xEDE5D8 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xF7F3EB });

    // North Wall & South Wall (spanning along X)
    const ewWallGeo = new THREE.BoxGeometry(totalSize, wallHeight, wallThickness);
    const ewCapGeo = new THREE.BoxGeometry(totalSize + 0.1, 0.09, wallThickness + 0.08);

    const northWall = new THREE.Mesh(ewWallGeo, stoneMat);
    northWall.position.set(center, wallY, minCoord);
    northWall.castShadow = true;
    northWall.receiveShadow = true;

    const northCap = new THREE.Mesh(ewCapGeo, capMat);
    northCap.position.set(center, wallHeight + 0.04, minCoord);
    northCap.castShadow = true;

    const southWall = new THREE.Mesh(ewWallGeo, stoneMat);
    southWall.position.set(center, wallY, maxCoord);
    southWall.castShadow = true;
    southWall.receiveShadow = true;

    const southCap = new THREE.Mesh(ewCapGeo, capMat);
    southCap.position.set(center, wallHeight + 0.04, maxCoord);
    southCap.castShadow = true;

    // West Wall & East Wall: segmented to leave 2 empty water entrances on the right (East) and 2 empty water exits on the left (West) at Row 4 and Row 19!
    const g1_start = 3.5 * S;
    const g1_end   = 4.5 * S;
    const g2_start = 18.5 * S;
    const g2_end   = 19.5 * S;

    const segments = [
      { start: minCoord, end: g1_start }, // North segment
      { start: g1_end,   end: g2_start }, // Middle segment between the 2 canals
      { start: g2_end,   end: maxCoord }  // South segment
    ];

    segments.forEach(seg => {
      const segLen = seg.end - seg.start;
      const segCenterZ = (seg.start + seg.end) * 0.5;

      const segWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, segLen);
      const segCapGeo = new THREE.BoxGeometry(wallThickness + 0.08, 0.09, segLen + 0.02);

      // West wall segment (with 2 empty water exits on left)
      const wWall = new THREE.Mesh(segWallGeo, stoneMat);
      wWall.position.set(minCoord, wallY, segCenterZ);
      wWall.castShadow = true;
      wWall.receiveShadow = true;
      const wCap = new THREE.Mesh(segCapGeo, capMat);
      wCap.position.set(minCoord, wallHeight + 0.04, segCenterZ);
      wCap.castShadow = true;

      // East wall segment (with 2 empty water entrances on right)
      const eWall = new THREE.Mesh(segWallGeo, stoneMat);
      eWall.position.set(maxCoord, wallY, segCenterZ);
      eWall.castShadow = true;
      eWall.receiveShadow = true;
      const eCap = new THREE.Mesh(segCapGeo, capMat);
      eCap.position.set(maxCoord, wallHeight + 0.04, segCenterZ);
      eCap.castShadow = true;

      group.add(wWall, wCap, eWall, eCap);
    });

    // 4 Grand Water-Gate Portal Piers flanking each empty water entrance/exit on West and East
    const gatePillarGeo = new THREE.BoxGeometry(0.34, wallHeight + 0.22, 0.34);
    const gateZPositions = [g1_start, g1_end, g2_start, g2_end];
    gateZPositions.forEach(gz => {
      const wp = new THREE.Mesh(gatePillarGeo, capMat);
      wp.position.set(minCoord, (wallHeight + 0.22) * 0.5, gz);
      wp.castShadow = true;
      const ep = new THREE.Mesh(gatePillarGeo, capMat);
      ep.position.set(maxCoord, (wallHeight + 0.22) * 0.5, gz);
      ep.castShadow = true;
      group.add(wp, ep);
    });

    group.add(northWall, northCap, southWall, southCap);

    // 4 Grand Corner Stone Pilasters
    const cornerGeo = new THREE.BoxGeometry(0.38, wallHeight + 0.18, 0.38);
    const corners = [
      [minCoord, minCoord],
      [maxCoord, minCoord],
      [minCoord, maxCoord],
      [maxCoord, maxCoord]
    ];
    corners.forEach(([cx, cz]) => {
      const cMesh = new THREE.Mesh(cornerGeo, capMat);
      cMesh.position.set(cx, (wallHeight + 0.18) * 0.5, cz);
      cMesh.castShadow = true;
      group.add(cMesh);
    });

    // Periodic Decorative Pilasters every 4 tiles along the walls
    const postGeo = new THREE.BoxGeometry(0.28, wallHeight + 0.10, 0.28);
    for (let i = 4; i < mapSize; i += 4) {
      const coord = minCoord + i * S;
      const pN = new THREE.Mesh(postGeo, capMat);
      pN.position.set(coord, (wallHeight + 0.10) * 0.5, minCoord);
      const pS = new THREE.Mesh(postGeo, capMat);
      pS.position.set(coord, (wallHeight + 0.10) * 0.5, maxCoord);
      const pW = new THREE.Mesh(postGeo, capMat);
      pW.position.set(minCoord, (wallHeight + 0.10) * 0.5, coord);
      const pE = new THREE.Mesh(postGeo, capMat);
      pE.position.set(maxCoord, (wallHeight + 0.10) * 0.5, coord);
      group.add(pN, pS, pW, pE);
    }

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

  // 17. Forest & Countryside Foliage / Nature Assets
  createPineTree(scale = 1.0, foliageColor = 0x1B4332) {
    const group = new THREE.Group();
    const trunkMat = this.materials.trunk || new THREE.MeshLambertMaterial({ color: 0x5C4033 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.19, 1.4, 6), trunkMat);
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({ color: foliageColor });
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85 - i * 0.18, 1.05, 7), foliageMat);
      cone.position.y = 1.15 + i * 0.6;
      cone.castShadow = true;
      group.add(cone);
    }
    group.scale.set(scale, scale, scale);
    return group;
  },

  createDeciduousTree(scale = 1.0, foliageColor = 0x40916C) {
    const group = new THREE.Group();
    const trunkMat = this.materials.trunk || new THREE.MeshLambertMaterial({ color: 0x5C4033 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 1.2, 6), trunkMat);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({ color: foliageColor });
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.92, 1), foliageMat);
    foliage.position.y = 1.65;
    foliage.castShadow = true;
    group.add(foliage);

    group.scale.set(scale, scale, scale);
    return group;
  },

  createForestRock(scale = 1.0) {
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x6C757D });
    const geo = new THREE.DodecahedronGeometry((scale || 0.6) * 0.8, 0);
    geo.scale(1.25, 0.65, 1.0);
    const mesh = new THREE.Mesh(geo, rockMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  },

  // 18. Outer Forest Landscape (Lush green woods and rolling hills replacing barren water)
  createOuterForestLandscape(mapSize, tileScale) {
    const group = new THREE.Group();
    const S = tileScale || 2.6;
    const minCoord = -S * 0.5; // -1.3
    const maxCoord = (mapSize - 1) * S + S * 0.5; // 61.1
    const g1_start = 3.5 * S; // 9.1
    const g1_end   = 4.5 * S; // 11.7
    const g2_start = 18.5 * S; // 48.1
    const g2_end   = 19.5 * S; // 50.7

    const platformDepth = 1.0;
    const grassMat = this.materials.grass;
    const quayMat = new THREE.MeshLambertMaterial({ color: 0x685D54 });
    const chunkMats = [quayMat, quayMat, grassMat, quayMat, quayMat, quayMat];

    const farWest  = -38.0;
    const farEast  = 98.0;
    const farNorth = -38.0;
    const farSouth = 88.0;

    // 1. Terrain Chunks framing the city and leaving open river channels
    const chunks = [
      // North Forest Landscape (where clouds originate and drift across city)
      { x: (farWest + farEast) * 0.5, z: (farNorth + minCoord) * 0.5, w: farEast - farWest, d: minCoord - farNorth },
      // West Flank (North of River Exit 1)
      { x: (farWest + minCoord) * 0.5, z: (minCoord + g1_start) * 0.5, w: minCoord - farWest, d: g1_start - minCoord },
      // West Flank (Between River Exit 1 & 2)
      { x: (farWest + minCoord) * 0.5, z: (g1_end + g2_start) * 0.5, w: minCoord - farWest, d: g2_start - g1_end },
      // West Flank (South of River Exit 2)
      { x: (farWest + minCoord) * 0.5, z: (g2_end + farSouth) * 0.5, w: minCoord - farWest, d: farSouth - g2_end },
      // East Flank (North of River Entrance 1)
      { x: (maxCoord + farEast) * 0.5, z: (minCoord + g1_start) * 0.5, w: farEast - maxCoord, d: g1_start - minCoord },
      // East Flank (Between River Entrance 1 & 2)
      { x: (maxCoord + farEast) * 0.5, z: (g1_end + g2_start) * 0.5, w: farEast - maxCoord, d: g2_start - g1_end },
      // East Flank (South of River Entrance 2)
      { x: (maxCoord + farEast) * 0.5, z: (g2_end + farSouth) * 0.5, w: farEast - maxCoord, d: farSouth - g2_end }
    ];

    chunks.forEach(c => {
      const geo = new THREE.BoxGeometry(c.w, platformDepth, c.d);
      const mesh = new THREE.Mesh(geo, chunkMats);
      mesh.position.set(c.x, -platformDepth * 0.5, c.z);
      mesh.receiveShadow = true;
      mesh.userData.isOuterScenery = true;
      group.add(mesh);
    });

    // 2. Rolling Green Hills along the Northern Horizon
    const hillMat = new THREE.MeshLambertMaterial({ color: 0x4F772D });
    const hills = [
      { x: -18, z: -25, r: 8.0, h: 2.2 },
      { x: 5,   z: -28, r: 9.5, h: 2.8 },
      { x: 28,  z: -26, r: 8.5, h: 2.4 },
      { x: 52,  z: -29, r: 10.0, h: 3.0 },
      { x: 75,  z: -24, r: 8.0, h: 2.2 },
      { x: -28, z: -15, r: 7.0, h: 2.0 },
      { x: 86,  z: -12, r: 7.5, h: 2.0 }
    ];
    hills.forEach(h => {
      const hillGeo = new THREE.SphereGeometry(h.r, 9, 7);
      hillGeo.scale(1, h.h / h.r, 1);
      const hillMesh = new THREE.Mesh(hillGeo, hillMat);
      hillMesh.position.set(h.x, 0, h.z);
      hillMesh.receiveShadow = true;
      hillMesh.userData.isOuterScenery = true;
      group.add(hillMesh);
    });

    // 3. Dense Forest Population (Pine & Deciduous Trees)
    const pineHues = [0x1B4332, 0x2D6A4F, 0x1E3F20, 0x283618];
    const oakHues  = [0x40916C, 0x52B788, 0x386641, 0x606C38];

    // Populate North Forest (where clouds drift in)
    for (let i = 0; i < 75; i++) {
      const tx = farWest + 4 + Math.random() * (farEast - farWest - 8);
      const tz = farNorth + 3 + Math.random() * (minCoord - farNorth - 6);
      const isPine = Math.random() > 0.45;
      const tree = isPine 
        ? this.createPineTree(0.85 + Math.random() * 0.5, pineHues[Math.floor(Math.random() * pineHues.length)])
        : this.createDeciduousTree(0.85 + Math.random() * 0.45, oakHues[Math.floor(Math.random() * oakHues.length)]);
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.userData.isOuterScenery = true;
      group.add(tree);
    }

    // Populate West & East Flanks
    for (let i = 0; i < 35; i++) {
      const isWest = Math.random() > 0.5;
      const tx = isWest
        ? farWest + 3 + Math.random() * (minCoord - farWest - 6)
        : maxCoord + 3 + Math.random() * (farEast - maxCoord - 6);
      let tz = minCoord + 2 + Math.random() * (farSouth - minCoord - 4);
      if ((tz > g1_start - 1 && tz < g1_end + 1) || (tz > g2_start - 1 && tz < g2_end + 1)) {
        continue;
      }
      const isPine = Math.random() > 0.5;
      const tree = isPine 
        ? this.createPineTree(0.8 + Math.random() * 0.4, pineHues[Math.floor(Math.random() * pineHues.length)])
        : this.createDeciduousTree(0.8 + Math.random() * 0.4, oakHues[Math.floor(Math.random() * oakHues.length)]);
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.userData.isOuterScenery = true;
      group.add(tree);
    }

    // 4. Mossy Forest Boulders
    for (let i = 0; i < 28; i++) {
      const rx = farWest + 5 + Math.random() * (farEast - farWest - 10);
      const rz = farNorth + 4 + Math.random() * (minCoord - farNorth - 6);
      const rock = this.createForestRock(0.6 + Math.random() * 0.7);
      rock.position.set(rx, 0.2, rz);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.userData.isOuterScenery = true;
      group.add(rock);
    }

    // 5. Wildflower Glades in Forest Clearings
    for (let i = 0; i < 30; i++) {
      const fx = farWest + 6 + Math.random() * (farEast - farWest - 12);
      const fz = farNorth + 4 + Math.random() * (minCoord - farNorth - 6);
      const flowers = this.createFlowerCluster();
      flowers.position.set(fx, 0.05, fz);
      flowers.userData.isOuterScenery = true;
      group.add(flowers);
    }

    return group;
  },

  // 19. Soaring Hanseatic City & Forest Birds
  createBird(colorHex = 0xFFFFFF) {
    const group = new THREE.Group();
    const wingMat = new THREE.MeshLambertMaterial({ color: colorHex, side: THREE.DoubleSide });
    const bodyMat = new THREE.MeshLambertMaterial({ color: colorHex === 0xFFFFFF ? 0xDDDDDD : colorHex });
    
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.28, 5), bodyMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    
    const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.12), wingMat);
    leftWing.position.set(-0.14, 0.01, 0);
    leftWing.name = "leftWing";
    leftWing.castShadow = true;
    
    const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.12), wingMat);
    rightWing.position.set(0.14, 0.01, 0);
    rightWing.name = "rightWing";
    rightWing.castShadow = true;
    
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
      uFlowX:          { value: -0.32 }, // Flows from RIGHT (+X) to LEFT (-X)
      uFlowZ:          { value: -0.04 },
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
  waterMesh.position.set(31.2, -0.22, 31.2);
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
  ['G','G','A1','G','T','G','G','G','G','G','R_C','G','G','G','G','G','G','G','T','G','R_C','A2','G','G'],
  // Row 1: North Mainland (ZOB approach & East Garden)
  ['G','A2','R_C','R_C','R_C','G','G','G','G','T','R_C','T','G','G','G','G','G','G','G','T','R_C','T','G','G'],
  // Row 2: North Mainland (ZOB & East Garden)
  ['G','G','B_ZOB','G','R_C','G','G','G','G','G','R_C','G','G','G','G','G','G','G','G','G','R_C','T','G','G'],
  // Row 3: North Mainland Approach to North Bridge
  ['A1','G','R_C','G','R_C','G','G','G','G','G','R_B','G','G','G','G','G','G','G','G','G','R_C','A3','T','G'],
  // Row 4: NORTH CANAL (Water flows in at x:23 from right, flows out at x:0 to left!)
  ['W','W','BR','W','W','W','W','W','W','W','BR','W','W','W','W','W','W','W','W','W','BR','W','W','W'],
  // Row 5: Island North Apex
  ['G','T','R_C','G','G','W','G','G','R_C','R_C','R_C','R_C','R_C','R_C','G','G','G','W','G','G','R_C','T','G','G'],
  // Row 6: Island North (UNI)
  ['G','G','R_C','G','G','W','G','G','R_C','G','B_UNI','G','R_C','G','G','G','G','W','G','G','R_C','G','A4','G'],
  // Row 7: West-North Bridge (Bakery x:5) & East BurgTor Bridge (x:17)
  ['A2','G','B_BAKERY','R_C','R_B','BR','R_C','R_B','R_C','R_C','R_C','R_C','R_C','R_B','B_BURGTOR','R_B','R_C','BR','R_B','R_C','R_C','G','T','G'],
  // Row 8: West Mainland & Upper Island Core
  ['G','T','R_C','G','G','W','G','G','R_C','G','A1','G','R_C','G','G','G','G','W','G','G','R_C','G','G','G'],
  // Row 9: West Mainland & Island Market Center (Rathaus & Pizza)
  ['G','G','R_C','G','G','W','G','G','R_C','B_RATHAUS','R_C','B_PIZZA','R_C','G','G','G','G','W','G','G','R_C','T','G','G'],
  // Row 10: West Mainland (Student WG Room)
  ['A1','G','B_WG','R_C','R_C','W','G','G','R_C','R_C','R_C','R_C','R_C','G','G','G','G','W','G','G','R_C','G','A1','G'],
  // Row 11: West Mainland & Island Kino Avenue
  ['G','T','R_C','G','G','W','G','G','R_C','G','A2','G','R_C','G','G','G','G','W','G','G','R_C','G','T','G'],
  // Row 12: West Mainland (Garden) & Island Kino
  ['G','G','R_C','T','G','W','G','G','R_C','G','B_KINO','G','R_C','G','G','G','G','W','G','G','R_C','G','G','G'],
  // Row 13: West-South HolstenTor Bridge (Single Bridge at x:5) & East Church Bridge (x:17)
  ['G','T','R_C','G','R_B','BR','R_C','B_HOLSTEN','R_B','R_C','R_C','R_C','R_C','R_B','R_B','R_B','R_C','BR','R_B','R_C','R_C','B_MARIEN','G','G'],
  // Row 14: West Mainland (Garden) & Lower Island Core
  ['G','T','G','T','G','W','G','G','R_C','G','A3','G','R_C','G','G','G','G','W','G','G','R_C','G','A2','G'],
  // Row 15: West Mainland (Garden) & Lower Island
  ['G','G','T','G','G','W','G','G','R_C','R_C','R_C','R_C','R_C','G','G','G','G','W','G','G','R_C','T','G','G'],
  // Row 16: West Mainland Road to Darkstore
  ['G','A3','R_C','G','G','W','G','G','R_C','G','A4','G','R_C','G','G','G','G','W','G','G','R_C','G','G','G'],
  // Row 17: Island South Tip (Dom zu Lübeck)
  ['G','G','R_C','G','G','W','G','G','R_C','G','B_DOM','G','R_C','G','G','G','G','W','G','G','R_C','G','A3','G'],
  // Row 18: West Mainland (Kruma Darkstore #104)
  ['A4','G','B_DARKSTORE','R_C','R_C','W','G','G','G','R_C','R_C','G','G','G','G','G','G','W','G','G','R_C','T','G','G'],
  // Row 19: SOUTH CANAL (Water flows in at x:23 from right, flows out at x:0 to left!)
  ['W','W','W','BR','W','W','W','W','W','W','BR','W','W','W','W','W','W','W','W','W','BR','W','W','W'],
  // Row 20: South Mainland Approach to South Bridge & Crossings
  ['G','G','R_C','R_C','G','G','G','G','G','G','R_B','G','G','G','G','G','G','G','G','G','R_C','G','A4','G'],
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

// ============================================================================
// UNIFIED BUILDING BOX COLLIDER & SLIDING RESOLVER (Zero-cost collision)
// ============================================================================
window.FFH.buildingColliders = [];

window.FFH.initBuildingColliders = function() {
  const colliders = [];
  const S = window.FFH.TILE_SCALE || 2.6;
  const grid = window.FFH.LUBECK_CITY_GRID;
  if (!grid) return colliders;

  for (let z = 0; z < window.FFH.MAP_SIZE; z++) {
    for (let x = 0; x < window.FFH.MAP_SIZE; x++) {
      const type = grid[z][x];
      const posX = x * S;
      const posZ = z * S;

      if (type === 'B_HOLSTEN') {
        // Holstentor has twin conical towers flanking the north and south of the street
        // Leaving the center archway open for the player and NPCs to walk through!
        colliders.push({
          id: 'B_HOLSTEN_NORTH',
          minX: posX - 1.1, maxX: posX + 1.1,
          minZ: posZ - 2.1, maxZ: posZ - 0.55
        });
        colliders.push({
          id: 'B_HOLSTEN_SOUTH',
          minX: posX - 1.1, maxX: posX + 1.1,
          minZ: posZ + 0.55, maxZ: posZ + 2.1
        });
      } else if (type === 'B_MARIEN' || type === 'B_DOM') {
        // Massive Gothic Cathedrals
        colliders.push({
          id: type,
          minX: posX - 1.25, maxX: posX + 1.25,
          minZ: posZ - 1.35, maxZ: posZ + 1.35
        });
      } else if (type.startsWith('B_') || type.startsWith('A')) {
        // Standard Townhouses, Shops, City Hall, Cinema, Darkstore, WG
        colliders.push({
          id: type + '_' + x + '_' + z,
          minX: posX - 1.08, maxX: posX + 1.08,
          minZ: posZ - 1.08, maxZ: posZ + 1.08
        });
      } else if (type === 'T') {
        // Urban Trees
        colliders.push({
          id: 'TREE_' + x + '_' + z,
          minX: posX - 0.35, maxX: posX + 0.35,
          minZ: posZ - 0.35, maxZ: posZ + 0.35
        });
      }
    }
  }

  window.FFH.buildingColliders = colliders;
  return colliders;
};

window.FFH.checkBuildingCollision = function(posX, posZ, radius = 0.35) {
  const colliders = window.FFH.buildingColliders;
  if (!colliders || colliders.length === 0) return false;

  for (let i = 0; i < colliders.length; i++) {
    const b = colliders[i];
    if (posX + radius > b.minX && posX - radius < b.maxX &&
        posZ + radius > b.minZ && posZ - radius < b.maxZ) {
      return true;
    }
  }
  return false;
};

window.FFH.resolveSlidingMovement = function(curX, curZ, nextX, nextZ, radius = 0.35) {
  const S = window.FFH.TILE_SCALE || 2.6;
  const grid = window.FFH.LUBECK_CITY_GRID;
  const isWalkable = (x, z) => {
    const gx = Math.round(x / S);
    const gz = Math.round(z / S);
    if (!grid || !grid[gz] || !grid[gz][gx]) return false;
    const t = grid[gz][gx];
    return t !== 'W';
  };

  let resolvedX = curX;
  let resolvedZ = curZ;

  // Try X alone
  if (isWalkable(nextX, curZ) && !window.FFH.checkBuildingCollision(nextX, curZ, radius)) {
    resolvedX = nextX;
  }

  // Try Z alone
  if (isWalkable(resolvedX, nextZ) && !window.FFH.checkBuildingCollision(resolvedX, nextZ, radius)) {
    resolvedZ = nextZ;
  } else if (isWalkable(curX, nextZ) && !window.FFH.checkBuildingCollision(curX, nextZ, radius)) {
    resolvedZ = nextZ;
  }

  return { x: resolvedX, z: resolvedZ };
};

window.FFH.buildLubeckCityWorld = function() {
  const worldGroup = new THREE.Group();
  const interactiveMeshes = [];
  const clouds = [];
  const registry = window.FFH.CityAssetRegistry;
  const S = window.FFH.TILE_SCALE;

  // Initialize procedural textures and box colliders
  registry.initMaterials();
  window.FFH.initBuildingColliders();

  // Single continuous Water Base Plane (spanning across city and surrounding forest landscape)
  const { waterMesh, waterMat } = window.FFH.createSeamlessWaterPlane(140, 140);
  worldGroup.add(waterMesh);

  const platformDepth = 1.0; // 1.0 unit downward solid thickness so water interacts with ground
  const tileGeo = new THREE.BoxGeometry(S, platformDepth, S);
  const curbMat = new THREE.MeshLambertMaterial({ color: 0x7D8A9D });
  // Hanseatic weathered quayside masonry for the vertical platform sides dipping into water
  const quayMat = new THREE.MeshLambertMaterial({ color: 0x685D54 });

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
        // Multi-material: Top face (+Y, index 2) has street/grass; vertical sides have quayside stone
        const tileMats = [quayMat, quayMat, groundMat, quayMat, quayMat, quayMat];
        const base = new THREE.Mesh(tileGeo, tileMats);
        base.position.y = -platformDepth * 0.5; // Top surface at Y=0.0, base extends down to Y=-1.0
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

  // 4 Scenic Flight Loops connecting Outer Forest to City Spires & Landmarks
  const FLIGHT_LOOPS = [
    // Loop 1: Northern Forest to Altstadt Spire & Back
    [
      { x: -18, y: 10.5, z: -26 }, // Deep Forest North-West
      { x: 16,  y: 11.5, z: -20 }, // North Forest Ridge
      { x: 44,  y: 9.8,  z: 18 },  // Burgtor Citadel
      { x: 52,  y: 13.0, z: 34 },  // St. Mary's Spire
      { x: 26,  y: 8.8,  z: 28 },  // Island Center (Kino)
      { x: 8,   y: 9.2,  z: 8 }    // ZOB Parkland
    ],
    // Loop 2: Eastern Forest River to Island Moat & Dom
    [
      { x: 78,  y: 9.5,  z: 10.4 }, // East Forest River Entrance
      { x: 45,  y: 8.8,  z: 22 },   // East Island Moat
      { x: 26,  y: 12.0, z: 44 },   // Dom zu Lübeck
      { x: 13,  y: 9.5,  z: 34 },   // Holstentor Gateway
      { x: -22, y: 9.2,  z: 10.4 }, // West Forest Canal
      { x: 10,  y: 11.0, z: -24 }   // North Forest Pine Canopy
    ],
    // Loop 3: Market Square to North Forest Meadow
    [
      { x: 38,  y: 11.0, z: -22 }, // North Forest Meadow
      { x: 26,  y: 9.6,  z: 16 },  // University Campus
      { x: 23,  y: 8.6,  z: 23 },  // Rathaus Square
      { x: 13,  y: 9.2,  z: 34 },  // Holstentor Bridge
      { x: -18, y: 10.2, z: -12 }  // West Forest Grove
    ],
    // Loop 4: Southern Woodlands to Harbor & Dom Spire
    [
      { x: -18, y: 9.2,  z: 68 },  // South-West Forest
      { x: 8,   y: 8.6,  z: 47 },  // Darkstore Quay
      { x: 26,  y: 9.2,  z: 50 },  // South Bridge
      { x: 76,  y: 10.0, z: 48 },  // South-East Woodland
      { x: 26,  y: 12.0, z: 44 }   // Dom Cathedral Spire
    ]
  ];

  const birdColors = [0xFFFFFF, 0xF0F4F8, 0xC5CED6, 0x3D4043, 0xFFFFFF, 0xDFE5EB];
  const birds = [];

  for (let b = 0; b < 12; b++) {
    const loop = FLIGHT_LOOPS[b % FLIGHT_LOOPS.length];
    const color = birdColors[b % birdColors.length];
    const bird = registry.createBird(color);

    const startWpIdx = Math.floor(Math.random() * loop.length);
    const startPos = loop[startWpIdx];
    bird.position.set(
      startPos.x + (Math.random() - 0.5) * 3,
      startPos.y + (Math.random() - 0.5) * 1.5,
      startPos.z + (Math.random() - 0.5) * 3
    );

    const scale = 0.9 + Math.random() * 0.4;
    bird.scale.set(scale, scale, scale);

    bird.userData = {
      loop: loop,
      currentWp: (startWpIdx + 1) % loop.length,
      speed: 4.8 + Math.random() * 2.2,
      seed: Math.random() * 100
    };

    birds.push(bird);
    worldGroup.add(bird);
  }

  // Add outer forest and countryside landscape (where clouds originate and birds roam)
  worldGroup.add(registry.createOuterForestLandscape(window.FFH.MAP_SIZE, window.FFH.TILE_SCALE));

  // Add matching perimeter stone border wall around the whole playable map
  worldGroup.add(registry.createWorldPerimeterBorder(window.FFH.MAP_SIZE, window.FFH.TILE_SCALE));

  return { worldGroup, interactiveMeshes, waterMat, clouds, butterflies, birds };
};
