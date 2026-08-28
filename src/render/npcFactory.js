// NPC & Character mesh generator using OBJ geometries + per-character textures
window.FFH = window.FFH || {};

// Cache loaded THREE.Texture objects by NPC key so we don't reload them
const _textureCache = new Map();
const _loader = new THREE.TextureLoader();

function getTextureForKey(npcKey) {
  if (_textureCache.has(npcKey)) return _textureCache.get(npcKey);

  const base64Map = window.FFH.CHARACTER_TEXTURES_BASE64;
  const b64 = base64Map && base64Map[npcKey];
  if (!b64) {
    // Fallback: use shared colormap
    const fallbackB64 = window.FFH.CHARACTER_TEXTURE_BASE64;
    if (!fallbackB64) return null;
    const tex = _loader.load(fallbackB64);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    _textureCache.set(npcKey, tex);
    return tex;
  }

  // Convert base64 → Blob URL → TextureLoader (most reliable path in Three.js)
  const byteStr = atob(b64);
  const ab = new ArrayBuffer(byteStr.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
  const blob = new Blob([ab], { type: 'image/png' });
  const blobUrl = URL.createObjectURL(blob);

  const tex = _loader.load(blobUrl);
  tex.magFilter = THREE.NearestFilter;  // pixel-art crisp look
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // flipY=true is default and correct for these models

  _textureCache.set(npcKey, tex);
  return tex;
}

window.FFH.createNPCMesh = function(npcKey) {
  const modelData = window.FFH.CHARACTER_MODELS && window.FFH.CHARACTER_MODELS[npcKey];
  if (!modelData) {
    console.warn(`NPC Model data not found for ${npcKey}, using procedural fallback.`);
    return window.FFH.createCourierCharacter();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(modelData.p, 3));
  geometry.setAttribute('uv',       new THREE.Float32BufferAttribute(modelData.u, 2));
  geometry.setAttribute('normal',   new THREE.Float32BufferAttribute(modelData.n, 3));

  const tex = getTextureForKey(npcKey);
  const material = new THREE.MeshLambertMaterial({ map: tex });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const isGeneric = npcKey.startsWith('NPC_CHAR_');
  const scaleFactor = isGeneric ? 0.47 : 1.5;
  mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

  const group = new THREE.Group();
  group.userData.isNPC = true;
  group.userData.npcType = isGeneric ? 'generic' : 'named';
  
  // Actually, we need to apply scale to the group so the debug slider can find it and update it, 
  // or we can just tag the mesh. Let's tag the mesh as well just in case.
  mesh.userData.isNPC = true;
  mesh.userData.npcType = isGeneric ? 'generic' : 'named';
  
  group.add(mesh);
  return group;
};
