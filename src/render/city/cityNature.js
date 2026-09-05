// Procedural City Nature, Fauna, Clouds & Environmental Geometry
window.FFH = window.FFH || {};
window.FFH.CityAssetRegistry = window.FFH.CityAssetRegistry || {};

Object.assign(window.FFH.CityAssetRegistry, {

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
    
    // Add a raised stone planter border around the tree to visually indicate it's an obstacle
    const borderMat = new THREE.MeshLambertMaterial({ color: 0x7F8C8D });
    const bThickness = 0.2;
    const bSize = 2.4;
    const bHeight = 0.25;
    
    const bN = new THREE.Mesh(new THREE.BoxGeometry(bSize, bHeight, bThickness), borderMat);
    bN.position.set(0, bHeight/2, -bSize/2 + bThickness/2);
    bN.castShadow = true;
    group.add(bN);
    
    const bS = new THREE.Mesh(new THREE.BoxGeometry(bSize, bHeight, bThickness), borderMat);
    bS.position.set(0, bHeight/2, bSize/2 - bThickness/2);
    bS.castShadow = true;
    group.add(bS);
    
    const bE = new THREE.Mesh(new THREE.BoxGeometry(bThickness, bHeight, bSize - bThickness * 2), borderMat);
    bE.position.set(bSize/2 - bThickness/2, bHeight/2, 0);
    bE.castShadow = true;
    group.add(bE);
    
    const bW = new THREE.Mesh(new THREE.BoxGeometry(bThickness, bHeight, bSize - bThickness * 2), borderMat);
    bW.position.set(-bSize/2 + bThickness/2, bHeight/2, 0);
    bW.castShadow = true;
    group.add(bW);

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

    const farWest  = -120.0;
    const farEast  = 180.0;
    const farNorth = -120.0;
    const farSouth = 180.0;

    // 1. Full 360-Degree Ground Plains framing the city and preserving open river channels
    const chunks = [
      // North Forest & Countryside Plains
      { x: (farWest + farEast) * 0.5, z: (farNorth + minCoord) * 0.5, w: farEast - farWest, d: minCoord - farNorth },
      // South Countryside Plains (south of southern canal)
      { x: (farWest + farEast) * 0.5, z: (maxCoord + farSouth) * 0.5, w: farEast - farWest, d: farSouth - maxCoord },
      // West Flank (North of River Exit 1)
      { x: (farWest + minCoord) * 0.5, z: (minCoord + g1_start) * 0.5, w: minCoord - farWest, d: g1_start - minCoord },
      // West Flank (Between River Exit 1 & 2)
      { x: (farWest + minCoord) * 0.5, z: (g1_end + g2_start) * 0.5, w: minCoord - farWest, d: g2_start - g1_end },
      // West Flank (South of River Exit 2)
      { x: (farWest + minCoord) * 0.5, z: (g2_end + maxCoord) * 0.5, w: minCoord - farWest, d: maxCoord - g2_end },
      // East Flank (North of River Entrance 1)
      { x: (maxCoord + farEast) * 0.5, z: (minCoord + g1_start) * 0.5, w: farEast - maxCoord, d: g1_start - minCoord },
      // East Flank (Between River Entrance 1 & 2)
      { x: (maxCoord + farEast) * 0.5, z: (g1_end + g2_start) * 0.5, w: farEast - maxCoord, d: g2_start - g1_end },
      // East Flank (South of River Entrance 2)
      { x: (maxCoord + farEast) * 0.5, z: (g2_end + maxCoord) * 0.5, w: farEast - maxCoord, d: maxCoord - g2_end }
    ];

    chunks.forEach(c => {
      const geo = new THREE.BoxGeometry(c.w, platformDepth, c.d);
      const mesh = new THREE.Mesh(geo, chunkMats);
      mesh.position.set(c.x, -platformDepth * 0.5, c.z);
      mesh.receiveShadow = true;
      mesh.userData.isOuterScenery = true;
      group.add(mesh);
    });

    // 1b. Medieval City Rampart Walls & Corner Watchtowers surrounding the town perimeter
    const wallX_West = minCoord - 0.25;
    const wallX_East = maxCoord + 0.25;
    const wallZ_North = minCoord - 0.25;
    const wallZ_South = maxCoord + 0.25;

    // Corner Watchtowers at the 4 outer town corners
    [
      { x: wallX_West, z: wallZ_North },
      { x: wallX_East, z: wallZ_North },
      { x: wallX_West, z: wallZ_South },
      { x: wallX_East, z: wallZ_South }
    ].forEach(pos => {
      const tower = this.createMedievalWatchtower();
      tower.position.set(pos.x, 0, pos.z);
      group.add(tower);
    });

    // North Medieval Wall segments (leaving bridge gaps at x:2, 10, 20)
    for (let x = 0; x < mapSize; x++) {
      if (x === 2 || x === 10 || x === 20) continue; // Bridge entrances
      const wallSegment = this.createMedievalWallSegment(S, 1.8);
      wallSegment.position.set(x * S, 0, wallZ_North);
      group.add(wallSegment);
    }
    // South Medieval Wall segments (leaving bridge gaps at x:3, 10, 20)
    for (let x = 0; x < mapSize; x++) {
      if (x === 3 || x === 10 || x === 20) continue; // Bridge entrances
      const wallSegment = this.createMedievalWallSegment(S, 1.8);
      wallSegment.position.set(x * S, 0, wallZ_South);
      group.add(wallSegment);
    }
    // West Medieval Wall segments (leaving river exits at z:4, 19)
    for (let z = 0; z < mapSize; z++) {
      if (z === 4 || z === 19) continue;
      const wallSegment = this.createMedievalWallSegment(S, 1.8);
      wallSegment.rotation.y = Math.PI / 2;
      wallSegment.position.set(wallX_West, 0, z * S);
      group.add(wallSegment);
    }
    // East Medieval Wall segments (leaving river entrances at z:4, 19)
    for (let z = 0; z < mapSize; z++) {
      if (z === 4 || z === 19) continue;
      const wallSegment = this.createMedievalWallSegment(S, 1.8);
      wallSegment.rotation.y = Math.PI / 2;
      wallSegment.position.set(wallX_East, 0, z * S);
      group.add(wallSegment);
    }

    // 2. Rolling Green Hills & Knolls Surrounding All Horizons
    const hillMat1 = new THREE.MeshLambertMaterial({ color: 0x4F772D });
    const hillMat2 = new THREE.MeshLambertMaterial({ color: 0x386641 });
    const hillMat3 = new THREE.MeshLambertMaterial({ color: 0x2D6A4F });

    const hills = [
      // Northern Horizon Hills
      { x: -35, z: -40, r: 12.0, h: 3.5, mat: hillMat1 },
      { x: -10, z: -45, r: 14.0, h: 4.2, mat: hillMat2 },
      { x: 20,  z: -42, r: 13.0, h: 3.8, mat: hillMat1 },
      { x: 50,  z: -46, r: 15.0, h: 4.5, mat: hillMat3 },
      { x: 80,  z: -41, r: 12.5, h: 3.6, mat: hillMat2 },
      { x: 105, z: -38, r: 11.0, h: 3.2, mat: hillMat1 },
      
      // Eastern Horizon Hills
      { x: 95,  z: 0,   r: 13.0, h: 4.0, mat: hillMat2 },
      { x: 100, z: 30,  r: 14.5, h: 4.3, mat: hillMat1 },
      { x: 95,  z: 60,  r: 13.5, h: 3.9, mat: hillMat3 },
      { x: 102, z: 90,  r: 12.0, h: 3.5, mat: hillMat2 },

      // Southern Horizon Hills
      { x: -20, z: 95,  r: 13.0, h: 3.8, mat: hillMat1 },
      { x: 15,  z: 98,  r: 15.0, h: 4.6, mat: hillMat2 },
      { x: 50,  z: 96,  r: 14.0, h: 4.1, mat: hillMat3 },
      { x: 85,  z: 94,  r: 12.5, h: 3.7, mat: hillMat1 },

      // Western Horizon Hills
      { x: -45, z: -10, r: 12.5, h: 3.6, mat: hillMat3 },
      { x: -48, z: 25,  r: 14.0, h: 4.2, mat: hillMat1 },
      { x: -46, z: 65,  r: 13.0, h: 3.8, mat: hillMat2 }
    ];

    hills.forEach(h => {
      const hillGeo = new THREE.SphereGeometry(h.r, 11, 8);
      hillGeo.scale(1, h.h / h.r, 1);
      const hillMesh = new THREE.Mesh(hillGeo, h.mat);
      hillMesh.position.set(h.x, 0, h.z);
      hillMesh.receiveShadow = true;
      hillMesh.userData.isOuterScenery = true;
      group.add(hillMesh);
    });

    // 3. Countryside Agricultural Meadows & Crop Fields
    const fieldMat1 = new THREE.MeshLambertMaterial({ color: 0xE9C46A }); // Golden Wheat Field
    const fieldMat2 = new THREE.MeshLambertMaterial({ color: 0x2A9D8F }); // Clover Pasture

    const fields = [
      { x: -25, z: -20, w: 22, d: 16, mat: fieldMat1 },
      { x: 70,  z: -22, w: 26, d: 18, mat: fieldMat2 },
      { x: 72,  z: 75,  w: 24, d: 20, mat: fieldMat1 },
      { x: -28, z: 72,  w: 22, d: 18, mat: fieldMat2 }
    ];

    fields.forEach(f => {
      const fGeo = new THREE.BoxGeometry(f.w, 0.04, f.d);
      const fMesh = new THREE.Mesh(fGeo, f.mat);
      fMesh.position.set(f.x, 0.03, f.z);
      fMesh.receiveShadow = true;
      fMesh.userData.isOuterScenery = true;
      group.add(fMesh);
    });

    // 4. Dense Forest Groves Across All 4 Quadrants (Pine & Oak Trees)
    const pineHues = [0x1B4332, 0x2D6A4F, 0x1E3F20, 0x283618];
    const oakHues  = [0x40916C, 0x52B788, 0x386641, 0x606C38];

    // North & South Groves (120 trees)
    for (let i = 0; i < 120; i++) {
      const isNorth = Math.random() > 0.45;
      const tx = farWest + 6 + Math.random() * (farEast - farWest - 12);
      const tz = isNorth
        ? farNorth + 5 + Math.random() * (minCoord - farNorth - 10)
        : maxCoord + 5 + Math.random() * (farSouth - maxCoord - 10);

      const isPine = Math.random() > 0.45;
      const tree = isPine 
        ? this.createPineTree(0.9 + Math.random() * 0.55, pineHues[Math.floor(Math.random() * pineHues.length)])
        : this.createDeciduousTree(0.9 + Math.random() * 0.5, oakHues[Math.floor(Math.random() * oakHues.length)]);
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.userData.isOuterScenery = true;
      group.add(tree);
    }

    // East & West Flank Groves (70 trees)
    for (let i = 0; i < 70; i++) {
      const isWest = Math.random() > 0.5;
      const tx = isWest
        ? farWest + 5 + Math.random() * (minCoord - farWest - 10)
        : maxCoord + 5 + Math.random() * (farEast - maxCoord - 10);
      let tz = minCoord + 4 + Math.random() * (maxCoord - minCoord - 8);

      // Keep river exit channels open
      if ((tz > g1_start - 2 && tz < g1_end + 2) || (tz > g2_start - 2 && tz < g2_end + 2)) {
        continue;
      }
      const isPine = Math.random() > 0.5;
      const tree = isPine 
        ? this.createPineTree(0.85 + Math.random() * 0.45, pineHues[Math.floor(Math.random() * pineHues.length)])
        : this.createDeciduousTree(0.85 + Math.random() * 0.45, oakHues[Math.floor(Math.random() * oakHues.length)]);
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.userData.isOuterScenery = true;
      group.add(tree);
    }

    // 5. Mossy Boulders & Wildflower Glades
    for (let i = 0; i < 40; i++) {
      const rx = farWest + 8 + Math.random() * (farEast - farWest - 16);
      const rz = farNorth + 6 + Math.random() * (farSouth - farNorth - 12);
      // Skip city interior
      if (rx > minCoord && rx < maxCoord && rz > minCoord && rz < maxCoord) continue;

      const rock = this.createForestRock(0.6 + Math.random() * 0.75);
      rock.position.set(rx, 0.2, rz);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.userData.isOuterScenery = true;
      group.add(rock);
    }

    for (let i = 0; i < 45; i++) {
      const fx = farWest + 8 + Math.random() * (farEast - farWest - 16);
      const fz = farNorth + 6 + Math.random() * (farSouth - farNorth - 12);
      if (fx > minCoord && fx < maxCoord && fz > minCoord && fz < maxCoord) continue;

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
});
