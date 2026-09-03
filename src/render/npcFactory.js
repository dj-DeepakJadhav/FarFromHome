// NPC & Character mesh generator using bundled GLB models with skeletal animations & textures
window.FFH = window.FFH || {};

// Cache parsed GLTF data (scene clone template and animation clips)
const _glbTemplateCache = new Map();

function getGLTFLoader() {
  if (!window.FFH._glbLoader) {
    if (window.FFH.getSafeGLTFLoader) {
      window.FFH._glbLoader = window.FFH.getSafeGLTFLoader();
    } else {
      window.FFH._glbLoader = new THREE.GLTFLoader();
    }
  }
  return window.FFH._glbLoader;
}

// Convert base64 to ArrayBuffer synchronously
function base64ToArrayBuffer(b64) {
  const byteStr = atob(b64);
  const len = byteStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = byteStr.charCodeAt(i);
  }
  return bytes.buffer;
}

// Get from cache synchronously
function getGLBTemplate(glbKey) {
  return _glbTemplateCache.get(glbKey) || null;
}

// Pre-parse and cache all GLTF templates asynchronously
window.FFH.preloadAllNPCModels = async function() {
  const catalog = window.FFH.GLB_CHARACTERS_BASE64;
  if (!catalog) return Promise.resolve();

  const loader = getGLTFLoader();
  const keys = Object.keys(catalog);
  
  const parsePromises = keys.map(glbKey => {
    return new Promise((resolve) => {
      if (_glbTemplateCache.has(glbKey)) {
        return resolve();
      }
      
      const b64 = catalog[glbKey];
      const arrayBuffer = base64ToArrayBuffer(b64);
      
      loader.parse(arrayBuffer, '', (gltf) => {
        gltf.scene.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        _glbTemplateCache.set(glbKey, {
          scene: gltf.scene,
          animations: gltf.animations || []
        });
        resolve();
      }, (err) => {
        console.error('Failed to parse GLB character:', glbKey, err);
        resolve(); // Resolve anyway so it doesn't block loading
      });
    });
  });

  await Promise.all(parsePromises);
  console.log(`Preloaded ${keys.length} GLB NPC characters.`);
};

window.FFH.createNPCMesh = function(npcKey) {
  const mapping = window.FFH.NPC_GLB_MAPPING || {};
  const glbKey = mapping[npcKey] || npcKey;
  const template = getGLBTemplate(glbKey);

  if (!template) {
    console.warn(`NPC GLB model not found for ${npcKey} (key: ${glbKey}), using procedural fallback.`);
    return window.FFH.createCourierCharacter ? window.FFH.createCourierCharacter() : new THREE.Group();
  }

  // Clone template scene
  const charModel = template.scene.clone(true);
  const isGeneric = glbKey.startsWith('character-') && glbKey.length === 11; // 'character-a' to 'character-r'
  
  // Both generic and named character rigs fit nicely with scale 0.55
  const scaleFactor = 0.55;
  charModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

  const group = new THREE.Group();
  group.userData.isNPC = true;
  group.userData.npcKey = npcKey;
  group.userData.glbKey = glbKey;
  group.userData.npcType = isGeneric ? 'generic' : 'named';

  group.add(charModel);

  // Setup AnimationMixer & Actions
  if (template.animations && template.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(charModel);
    const actions = {};
    template.animations.forEach((clip) => {
      actions[clip.name.toLowerCase()] = mixer.clipAction(clip);
    });

    group.userData.mixer = mixer;
    group.userData.actions = actions;
    group.userData.currentAction = null;

    // Start in 'idle' by default
    const idleAction = actions['idle'] || actions['static'] || actions[template.animations[0].name.toLowerCase()];
    if (idleAction) {
      idleAction.play();
      group.userData.currentAction = idleAction;
    }
  }

  // Helper function to transition actions
  group.userData.playAction = function(name, duration) {
    if (!group.userData.actions) return;
    const nextAction = group.userData.actions[name.toLowerCase()];
    if (!nextAction) return;

    const fadeDuration = (typeof duration === 'number') ? duration : 0.25;
    const current = group.userData.currentAction;

    if (current && current !== nextAction) {
      current.fadeOut(fadeDuration);
    }
    nextAction.reset().fadeIn(fadeDuration).play();
    group.userData.currentAction = nextAction;
  };

  return group;
};

// Global animation update method called each frame for NPC groups
window.FFH.updateNPCAnimation = function(npcGroup, delta) {
  if (npcGroup && npcGroup.userData && npcGroup.userData.mixer) {
    npcGroup.userData.mixer.update(delta);
  }
};
