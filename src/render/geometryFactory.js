// Procedural and Kenney GLB geometry builders for grocery items
window.FFH = window.FFH || {};

const _foodModelCache = new Map();
let _mtlLoader = null;
let _objLoader = null;

function loadFoodModel(key) {
  if (_foodModelCache.has(key)) return _foodModelCache.get(key);
  if (typeof THREE.MTLLoader === 'undefined' || typeof THREE.OBJLoader === 'undefined') {
    return null; // Fall back cleanly to procedural meshes
  }
  if (!_mtlLoader) _mtlLoader = new THREE.MTLLoader();
  if (!_objLoader) _objLoader = new THREE.OBJLoader();
  
  const objKey = key.replace('.obj', '_obj');
  const mtlKey = key.replace('.obj', '_mtl');
  
  const objText = window.FFH.objAssets ? window.FFH.objAssets[objKey] : null;
  const mtlText = window.FFH.objAssets ? window.FFH.objAssets[mtlKey] : null;
  
  if (!objText) return null;
  
  const promise = new Promise((resolve, reject) => {
    try {
      if (mtlText) {
        const materials = _mtlLoader.parse(mtlText);
        materials.preload();
        _objLoader.setMaterials(materials);
      } else {
        _objLoader.setMaterials(null);
      }
      const object = _objLoader.parse(objText);
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            if (Array.isArray(child.material)) {
               child.material.forEach(m => {
                 m.type = 'MeshLambertMaterial';
               });
            } else {
               child.material.type = 'MeshLambertMaterial';
            }
          }
        }
      });
      resolve(object);
    } catch(e) {
      reject(e);
    }
  });
  _foodModelCache.set(key, promise);
  return promise;
}

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
  let placeholderMesh = null;
  
  // Build procedural placeholder (instant render while GLTF parses)
  switch(itemType) {
    case 'carton': // Milk
      placeholderMesh = new THREE.Group();
      const bodyMat = window.FFH.createCelMaterial(0xF7EDE2);
      const blueMat = window.FFH.createCelMaterial(0x3A86FF);
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.55), bodyMat);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.28, 0.57), blueMat);
      band.position.y = -0.05;
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.38, 0.25, 4, 1, false, Math.PI / 4), bodyMat);
      roof.position.y = 0.45;
      placeholderMesh.add(bMesh, band, roof);
      break;
      
    case 'sphere': // Apple
      placeholderMesh = new THREE.Group();
      const appleMat = window.FFH.createCelMaterial(0xE63946);
      const appleBody = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), appleMat);
      placeholderMesh.add(appleBody);
      break;
      
    case 'box': // Bread
      placeholderMesh = new THREE.Group();
      const crustMat = window.FFH.createCelMaterial(0xC68B59);
      const loaf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.48), crustMat);
      placeholderMesh.add(loaf);
      break;
      
    case 'cylinder': // Mineral Water
      placeholderMesh = new THREE.Group();
      const bottleMat = window.FFH.createCelMaterial(0xA2D2FF);
      const wBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 16), bottleMat);
      placeholderMesh.add(wBody);
      break;
      
    case 'curve': // Banana
      placeholderMesh = new THREE.Group();
      const peelMat = window.FFH.createCelMaterial(0xFFD60A);
      const banMid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.55, 7), peelMat);
      banMid.rotation.z = 0.45;
      placeholderMesh.add(banMid);
      break;
      
    case 'wedge': // Cheese
      placeholderMesh = new THREE.Group();
      const cheeseMat = window.FFH.createCelMaterial(0xFFC300);
      const cWedge = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 6, 1, false, 0, Math.PI / 2.2), cheeseMat);
      placeholderMesh.add(cWedge);
      break;
      
    case 'egg': // Egg
      placeholderMesh = new THREE.Group();
      const eggShellMat = window.FFH.createCelMaterial(0xF7E1D7);
      const eggBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), eggShellMat);
      eggBody.scale.set(1.0, 1.35, 1.0);
      placeholderMesh.add(eggBody);
      break;
      
    case 'cone': // Carrot
      placeholderMesh = new THREE.Group();
      const carrotMat = window.FFH.createCelMaterial(0xF77F00);
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.85, 10), carrotMat);
      root.rotation.x = Math.PI;
      placeholderMesh.add(root);
      break;
      
    default:
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      placeholderMesh = new THREE.Mesh(geometry, contentMat);
  }
  
  if (placeholderMesh) {
    placeholderMesh.castShadow = true;
    placeholderMesh.receiveShadow = true;
    group.add(placeholderMesh);
  }

  // Load and attach authentic Kenney 3D Food Kit model if available
  const modelMap = {
    carton: { key: 'carton.obj', scale: 2.2, y: -0.2 },
    sphere: { key: 'apple.obj', scale: 2.3, y: -0.2 },
    box: { key: 'bread.obj', scale: 2.2, y: -0.1 },
    cylinder: { key: 'soda-bottle.obj', scale: 2.2, y: -0.2 },
    curve: { key: 'banana.obj', scale: 2.3, y: -0.2 },
    wedge: { key: 'cheese.obj', scale: 2.3, y: -0.2 },
    egg: { key: 'egg.obj', scale: 2.4, y: -0.2 },
    cone: { key: 'carrot.obj', scale: 2.3, y: -0.2 }
  };

  const modelInfo = modelMap[itemType];
  if (modelInfo) {
    const promise = loadFoodModel(modelInfo.key);
    if (promise) {
      promise.then((scene) => {
        const kenneyMesh = scene.clone(true);
        kenneyMesh.scale.set(modelInfo.scale, modelInfo.scale, modelInfo.scale);
        kenneyMesh.position.y = modelInfo.y;
        
        if (placeholderMesh && placeholderMesh.parent === group) {
          group.remove(placeholderMesh);
        }
        group.add(kenneyMesh);
      }).catch((err) => {
        console.warn('Failed to load Kenney model for ' + itemType, err);
      });
    }
  }
  
  return group;
};
