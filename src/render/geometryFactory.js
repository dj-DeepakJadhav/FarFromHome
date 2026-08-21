// Procedural geometry builders for 8 grocery items
window.FFH.createItemMesh = function(itemType, genderColorHex) {
  const group = new THREE.Group();
  
  // Highlight ring/base representing grammatical gender color
  const ringGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16);
  const ringMat = new THREE.MeshBasicMaterial({ color: genderColorHex });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = -0.5;
  group.add(ring);
  
  const contentMat = window.FFH.createCelMaterial(0xFFAA44); // Fallback color
  let geometry;
  let mesh;
  
  switch(itemType) {
    case 'carton': // Milk (Mini-Market style carton with gable top & label)
      mesh = new THREE.Group();
      const bodyMat = window.FFH.createCelMaterial(0xF7EDE2);
      const blueMat = window.FFH.createCelMaterial(0x3A86FF);
      const redMat = window.FFH.createCelMaterial(0xE63946);
      
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.55), bodyMat);
      bMesh.position.y = 0;
      
      // Milk print band
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.28, 0.57), blueMat);
      band.position.y = -0.05;

      // Gable top wedge
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.38, 0.25, 4, 1, false, Math.PI / 4), bodyMat);
      roof.position.y = 0.45;
      roof.scale.set(1.0, 1.0, 1.0);

      // Plastic screw cap
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), redMat);
      cap.position.set(0.12, 0.52, 0.12);
      
      mesh.add(bMesh, band, roof, cap);
      break;
      
    case 'sphere': // Apple (Kenney style apple with indentation, wood stem & leaf)
      mesh = new THREE.Group();
      const appleMat = window.FFH.createCelMaterial(0xE63946);
      const stemMat = window.FFH.createCelMaterial(0x582F0E);
      const leafMat = window.FFH.createCelMaterial(0x38B000);

      const appleBody = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), appleMat);
      appleBody.scale.set(1.0, 0.9, 1.0);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.22, 6), stemMat);
      stem.position.set(0, 0.38, 0);
      stem.rotation.z = -0.15;

      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.09), leafMat);
      leaf.position.set(0.08, 0.42, 0);
      leaf.rotation.z = 0.4;

      mesh.add(appleBody, stem, leaf);
      break;
      
    case 'box': // Bread (Artisan bakery sourdough with score cuts)
      mesh = new THREE.Group();
      const crustMat = window.FFH.createCelMaterial(0xC68B59);
      const scoreMat = window.FFH.createCelMaterial(0xF7EDE2);

      const loaf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.48), crustMat);
      loaf.position.y = 0.05;

      // Score marks
      for (let x = -0.25; x <= 0.25; x += 0.25) {
        const cut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.5), scoreMat);
        cut.position.set(x, 0.06, 0);
        cut.rotation.y = 0.2;
        mesh.add(cut);
      }
      mesh.add(loaf);
      mesh.rotation.y = 0.25;
      break;
      
    case 'cylinder': // Mineral Water (Clear PET bottle with label and ribbed neck)
      mesh = new THREE.Group();
      const bottleMat = window.FFH.createCelMaterial(0xA2D2FF);
      const waterLabelMat = window.FFH.createCelMaterial(0x0077B6);
      const capMat = window.FFH.createCelMaterial(0x03045E);

      const wBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16), bottleMat);
      const wLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.25, 16), waterLabelMat);
      wLabel.position.y = 0.02;

      const wNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 0.25, 16), bottleMat);
      wNeck.position.y = 0.42;

      const wCapMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.09, 12), capMat);
      wCapMesh.position.y = 0.58;

      mesh.add(wBody, wLabel, wNeck, wCapMesh);
      break;
      
    case 'curve': // Banana (Organic curve with green tip and brown stalk)
      mesh = new THREE.Group();
      const peelMat = window.FFH.createCelMaterial(0xFFD60A);
      const stalkMat = window.FFH.createCelMaterial(0x582F0E);
      const tipMat = window.FFH.createCelMaterial(0x70E000);

      const banMid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.55, 7), peelMat);
      banMid.rotation.z = 0.45;
      banMid.scale.set(1.0, 1.0, 0.65);

      const bStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.18, 6), stalkMat);
      bStalk.position.set(-0.16, 0.32, 0);
      bStalk.rotation.z = 0.7;

      const bTip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.12, 6), tipMat);
      bTip.position.set(0.15, -0.28, 0);
      bTip.rotation.z = 0.3;

      mesh.add(banMid, bStalk, bTip);
      break;
      
    case 'wedge': // Cheese (Emmental wedge with hollow holes)
      mesh = new THREE.Group();
      const cheeseMat = window.FFH.createCelMaterial(0xFFC300);
      const holeMat = window.FFH.createCelMaterial(0xDDA15E);

      const cWedge = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 6, 1, false, 0, Math.PI / 2.2), cheeseMat);
      cWedge.position.set(0, 0, 0);

      // Cheese holes (dimples)
      const hole1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), holeMat);
      hole1.position.set(0.2, 0.08, 0.2);
      const hole2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), holeMat);
      hole2.position.set(0.32, -0.05, 0.1);

      mesh.add(cWedge, hole1, hole2);
      break;
      
    case 'egg': // Egg (Egg carton & smooth organic egg)
      mesh = new THREE.Group();
      const eggShellMat = window.FFH.createCelMaterial(0xF7E1D7);
      const eggBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), eggShellMat);
      eggBody.scale.set(1.0, 1.35, 1.0);
      mesh.add(eggBody);
      break;
      
    case 'cone': // Carrot (Fresh carrot with layered leafy greenery)
      mesh = new THREE.Group();
      const carrotMat = window.FFH.createCelMaterial(0xF77F00);
      const greenMat = window.FFH.createCelMaterial(0x38B000);

      const root = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.85, 10), carrotMat);
      root.rotation.x = Math.PI;
      root.position.y = -0.05;

      // Green sprigs
      const g1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 6), greenMat);
      g1.position.set(0.04, 0.5, 0);
      g1.rotation.z = -0.2;
      const g2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 6), greenMat);
      g2.position.set(-0.04, 0.48, 0.03);
      g2.rotation.z = 0.25;

      mesh.add(root, g1, g2);
      break;
      
    default:
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      mesh = new THREE.Mesh(geometry, contentMat);
  }
  
  if (mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  
  return group;
};
