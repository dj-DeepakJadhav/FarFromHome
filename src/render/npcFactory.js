// NPC & Character mesh generator using bundled GLB models with skeletal animations & textures
window.FFH = window.FFH || {};

// Cache parsed GLTF data (scene clone template and animation clips)
const _glbTemplateCache = new Map();
const _glbPromiseCache = new Map();

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

function loadSingleGLB(glbKey) {
  if (_glbTemplateCache.has(glbKey)) {
    return Promise.resolve(_glbTemplateCache.get(glbKey));
  }
  if (_glbPromiseCache.has(glbKey)) {
    return _glbPromiseCache.get(glbKey);
  }

  const catalog = window.FFH.GLB_CHARACTERS_BASE64;
  if (!catalog || !catalog[glbKey]) return Promise.resolve(null);

  const loader = getGLTFLoader();
  const b64 = catalog[glbKey];
  const arrayBuffer = base64ToArrayBuffer(b64);

  const promise = new Promise((resolve) => {
    loader.parse(arrayBuffer, '', (gltf) => {
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      const template = {
        scene: gltf.scene,
        animations: gltf.animations || []
      };
      _glbTemplateCache.set(glbKey, template);
      resolve(template);
    }, (err) => {
      console.error('Failed to parse GLB character:', glbKey, err);
      resolve(null);
    });
  });

  _glbPromiseCache.set(glbKey, promise);
  return promise;
}

// Pre-parse and cache all GLTF templates asynchronously
window.FFH.preloadAllNPCModels = async function() {
  const catalog = window.FFH.GLB_CHARACTERS_BASE64;
  if (!catalog) return Promise.resolve();
  const keys = Object.keys(catalog);
  await Promise.all(keys.map(k => loadSingleGLB(k)));
  console.log(`Preloaded ${keys.length} GLB NPC characters.`);
};

function buildNPCMeshFromTemplate(group, template, npcKey, glbKey, isGeneric) {
  if (!template || !template.scene) return;
  const charModel = template.scene.clone(true);

  // THREE.js GLTF clone() does not duplicate skeletons properly. Fix bone references:
  const sourceSkinnedMeshes = [];
  template.scene.traverse(node => { if (node.isSkinnedMesh) sourceSkinnedMeshes.push(node); });

  const cloneBones = {};
  const cloneSkinnedMeshes = [];
  charModel.traverse(node => {
    if (node.isBone) cloneBones[node.name] = node;
    if (node.isSkinnedMesh) cloneSkinnedMeshes.push(node);
  });

  cloneSkinnedMeshes.forEach((cloneMesh, i) => {
    const sourceMesh = sourceSkinnedMeshes[i];
    if (!sourceMesh) return;
    const sourceBones = sourceMesh.skeleton.bones;
    const newBones = sourceBones.map(bone => cloneBones[bone.name]);
    cloneMesh.skeleton = new THREE.Skeleton(newBones, sourceMesh.skeleton.boneInverses);
    cloneMesh.bindMatrix.copy(sourceMesh.bindMatrix);
  });

  const cfg = (window.FFH.CONFIG && window.FFH.CONFIG.characters) || {};
  const blocky = cfg.blockyScale || { x: 0.8, y: 0.8, z: 0.8 };
  const mini = cfg.miniScale || { x: 2.0, y: 3.5, z: 2.0 };

  if (isGeneric) {
    // Blocky open-world NPCs scale
    charModel.scale.set(blocky.x, blocky.y, blocky.z);
  } else {
    // Mini isometric room NPCs scale
    charModel.scale.set(mini.x, mini.y, mini.z);
  }

  // Kenney characters have their origin at the waist (Y=0), meaning feet are at Y=-0.45.
  // We apply the offset to a wrapper group so AnimationMixer root motion doesn't overwrite it.
  const offsetGroup = new THREE.Group();
  offsetGroup.position.y += 0.45;
  offsetGroup.add(charModel);

  group.add(offsetGroup);

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

    const current = group.userData.currentAction;
    if (current === nextAction && current.isRunning()) return;

    const fadeDuration = (typeof duration === 'number') ? duration : 0.25;

    if (current && current !== nextAction) {
      current.fadeOut(fadeDuration);
    }
    nextAction.reset().fadeIn(fadeDuration).play();
    group.userData.currentAction = nextAction;
  };
}

window.FFH.createNPCMesh = function(npcKey) {
  const mapping = window.FFH.NPC_GLB_MAPPING || {};
  const glbKey = mapping[npcKey] || npcKey;
  const isGeneric = glbKey.startsWith('character-') && glbKey.length === 11; // 'character-a' to 'character-r'

  const group = new THREE.Group();
  group.userData.isNPC = true;
  group.userData.npcKey = npcKey;
  group.userData.glbKey = glbKey;
  group.userData.npcType = isGeneric ? 'generic' : 'named';

  const template = getGLBTemplate(glbKey);
  if (template) {
    buildNPCMeshFromTemplate(group, template, npcKey, glbKey, isGeneric);
    return group;
  }

  // If not cached yet, load asynchronously and populate container group
  if (window.FFH.GLB_CHARACTERS_BASE64 && window.FFH.GLB_CHARACTERS_BASE64[glbKey]) {
    loadSingleGLB(glbKey).then(t => {
      if (t) {
        buildNPCMeshFromTemplate(group, t, npcKey, glbKey, isGeneric);
      }
    });
  }

  return group;
};

// Global animation update method called each frame for NPC groups
window.FFH.updateNPCAnimation = function(npcGroup, delta, floorY = null) {
  if (npcGroup && npcGroup.userData && npcGroup.userData.mixer) {
    npcGroup.userData.mixer.update(delta);
  }
};
