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
        // Explicit empty texture base path: the .mtl atlas reference is an
        // inlined data: URI (see build/bundle_obj.js) which resolveURL()
        // passes through untouched, keeping the offline build request-free.
        const materials = _mtlLoader.parse(mtlText, '');
        // Avoid materials.preload() as it triggers image loader requests for non-existent PNG textures
        _objLoader.setMaterials(materials);
      } else {
        _objLoader.setMaterials(null);
      }
      const object = _objLoader.parse(objText);
      let meshCount = 0;
      object.traverse((child) => {
        if (child.isMesh) {
          meshCount++;
          child.castShadow = true;
          child.receiveShadow = true;
          // Ensure valid solid color material if MTL texture loading fails
          if (!child.material || (Array.isArray(child.material) && child.material.length === 0)) {
            child.material = window.FFH.createCelMaterial(0xFFAA44);
          }
        }
      });
      if (meshCount > 0) {
        resolve(object);
      } else {
        reject(new Error('OBJ parsed 0 meshes'));
      }
    } catch(e) {
      reject(e);
    }
  });
  _foodModelCache.set(key, promise);
  return promise;
}

window.FFH.createItemMesh = function(itemType, genderColorHex) {
  const group = new THREE.Group();
  
  // No gender base disc. The shelf rails now carry DER / DIE / DAS with their
  // symbol, so a coloured disc under every item was redundant reinforcement,
  // and the shallow camera stretched each circle into a wide ellipse that
  // crowded the groceries standing on it.
  
  const contentMat = window.FFH.createCelMaterial(0xFFAA44); // Fallback color
  let geometry;
  let placeholderMesh = null;
  
  // Build procedural placeholder (instant render while GLTF/OBJ parses)
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
    carton: { key: 'carton.obj', scale: 1.1, y: -0.1 },
    sphere: { key: 'apple.obj', scale: 1.15, y: -0.1 },
    box: { key: 'bread.obj', scale: 1.0, y: -0.05 },
    cylinder: { key: 'soda-bottle.obj', scale: 1.1, y: -0.1 },
    curve: { key: 'banana.obj', scale: 1.1, y: -0.1 },
    wedge: { key: 'cheese.obj', scale: 1.15, y: -0.1 },
    egg: { key: 'egg.obj', scale: 1.2, y: -0.1 },
    cone: { key: 'carrot.obj', scale: 1.1, y: -0.1 },
    cup: { key: 'cup-coffee.obj', scale: 1.1, y: -0.1 },
    disc: { key: 'pizza.obj', scale: 1.1, y: -0.1 },
    salad: { key: 'salad.obj', scale: 1.1, y: -0.1 },
    fish: { key: 'fish.obj', scale: 1.1, y: -0.1 },
    corn: { key: 'corn.obj', scale: 1.1, y: -0.1 },
    mushroom: { key: 'mushroom.obj', scale: 1.1, y: -0.1 },
    cake: { key: 'cake.obj', scale: 1.1, y: -0.1 },
    tomato: { key: 'tomato.obj', scale: 1.1, y: -0.1 },
    onion: { key: 'onion.obj', scale: 1.1, y: -0.1 },
    lemon: { key: 'lemon.obj', scale: 1.1, y: -0.1 },
    pear: { key: 'pear.obj', scale: 1.1, y: -0.1 },
    grapes: { key: 'grapes.obj', scale: 1.1, y: -0.1 },
    croissant: { key: 'croissant.obj', scale: 1.1, y: -0.1 },
    meat: { key: 'meat-cooked.obj', scale: 1.1, y: -0.1 },
    oil: { key: 'bottle-oil.obj', scale: 1.1, y: -0.1 },
  };

  const modelInfo = modelMap[itemType];
  if (modelInfo) {
    const promise = loadFoodModel(modelInfo.key);
    if (promise) {
      promise.then((scene) => {
        if (!scene || !scene.children || scene.children.length === 0) return;
        const kenneyMesh = scene.clone(true);
        kenneyMesh.scale.set(modelInfo.scale, modelInfo.scale, modelInfo.scale);
        kenneyMesh.position.y = modelInfo.y;
        
        if (placeholderMesh && placeholderMesh.parent === group) {
          group.remove(placeholderMesh);
        }
        group.add(kenneyMesh);

        // Offline safety net: an undecodable colormap atlas samples black.
        // If the map image failed, drop it and fall back to the solid
        // gender-tier colour so the item stays readable instead of black.
        setTimeout(() => {
          kenneyMesh.traverse((child) => {
            if (!child.isMesh) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              const img = m && m.map && m.map.image;
              if (img && img.complete && img.naturalWidth === 0) {
                m.map = null;
                if (m.color) m.color.set(genderColorHex);
                m.needsUpdate = true;
              }
            });
          });
        }, 3000);
      }).catch((err) => {
        // Keep procedural placeholderMesh intact if OBJ parsing fails
      });
    }
  }
  
  return group;
};
