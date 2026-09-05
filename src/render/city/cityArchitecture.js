// Procedural 3D Lübeck Historic Architecture & Gateways
window.FFH = window.FFH || {};
window.FFH.CityAssetRegistry = window.FFH.CityAssetRegistry || {};

Object.assign(window.FFH.CityAssetRegistry, {

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

    // Brick Arch Piers along canal banks (center channel remains completely open for water flow)
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

      group.add(deck, bal1, bal2, cap1, cap2, p1, p2, p3, p4, abutW, abutE);
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

      group.add(deck, bal1, bal2, cap1, cap2, p1, p2, p3, p4, abutN, abutS);
    }
    return group;
  },


  // Helper: Create a medieval stone watchtower with cone roof
  createMedievalWatchtower() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x5E5A56 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x9B2226 });

    // Tower Body
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 3.4, 8), stoneMat);
    tower.position.y = 1.7;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Overhang Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.75, 0.4, 8), stoneMat);
    rim.position.y = 3.4;
    rim.castShadow = true;
    group.add(rim);

    // Conical Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 8), roofMat);
    roof.position.y = 4.3;
    roof.castShadow = true;
    group.add(roof);

    return group;
  },


  // Helper: Create a medieval stone wall segment with battlements
  createMedievalWallSegment(length = 2.6, height = 2.0) {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x5E5A56 });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0x47423D });

    const wall = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.45), stoneMat);
    wall.position.y = height / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    const crenCount = Math.max(2, Math.floor(length / 0.5));
    for (let i = 0; i < crenCount; i++) {
      if (i % 2 === 0) {
        const cren = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.5), trimMat);
        const cx = -length / 2 + 0.18 + (i * 0.28);
        cren.position.set(cx, height + 0.17, 0);
        cren.castShadow = true;
        group.add(cren);
      }
    }
    return group;
  }
});
