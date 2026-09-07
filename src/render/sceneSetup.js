// Scene setting: renderer, layout camera, lights
window.FFH.setupScene = function(canvasContainerId) {
  const container = document.getElementById(canvasContainerId);
  const width = 390;
  const height = 844;
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5DB7AD);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(12, 22, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 60;
  dirLight.shadow.bias = -0.0006;
  dirLight.shadow.normalBias = 0.02;
  scene.add(dirLight);
  
  // 1. Unified Main Camera: High Bird's-Eye View (Orthographic Isometric)
  const aspect = width / height;
  const d = 12.0; // View volume size
  const mainCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
  
  // Set default top-down isometric angle
  mainCamera.position.set(15, 20, 15);
  mainCamera.lookAt(0, 0, 0);

  // Expose
  return {
    renderer,
    scene,
    mainCamera,
    currentCamera: mainCamera
  };
};

window.FFH.getSafeGLTFLoader = function() {
  if (!window.FFH._safeGLTFLoader) {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      // Intercept any texture reference (like colormap.png or relative texture paths) in bundled GLTF models
      if (!url.startsWith('data:') && !url.startsWith('blob:')) {
        return window.FFH.CHARACTER_TEXTURE_BASE64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
      return url;
    });
    window.FFH._safeGLTFLoader = new THREE.GLTFLoader(manager);
  }
  return window.FFH._safeGLTFLoader;
};

// A flat scene.background made every room phase look like a colour swatch, and
// because only the city phase ever set it, rooms inherited whatever sky the
// city left behind: at dusk the dialogue diorama sat on a flat pink field.
// A soft vertical gradient with a darker floor reads as depth for no cost.
window.FFH.makeBackdrop = function (topHex, bottomHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, topHex);
  grad.addColorStop(0.55, bottomHex);
  grad.addColorStop(1, bottomHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  return tex;
};

// Cached so a phase change does not rebuild a texture every time.
window.FFH.BACKDROPS = {};
window.FFH.getBackdrop = function (name, topHex, bottomHex) {
  if (!window.FFH.BACKDROPS[name]) {
    window.FFH.BACKDROPS[name] = window.FFH.makeBackdrop(topHex, bottomHex);
  }
  return window.FFH.BACKDROPS[name];
};
