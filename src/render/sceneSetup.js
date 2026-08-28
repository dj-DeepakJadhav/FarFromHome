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
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);
  
  // 1. Isometric Room Diorama Camera (Zoomed-out framing with dedicated space for top goal & bottom instruction cards)
  const aspect = width / height;
  const d = 3.6; // Clean zoomed-out framing
  const warehouseCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
  warehouseCamera.position.set(8, 7.2, 8);
  warehouseCamera.lookAt(0, 0.85, 0);
  
  // 2. Street-level third-person camera. near/far kept tight (0.3 .. 1600)
  // rather than 0.1 .. 5000 — the ink outline pass Sobel-tests the depth
  // buffer, and a 50000:1 depth range leaves too little precision at street
  // scale for depth edges to register at all.
  const streetCamera = new THREE.PerspectiveCamera(55, aspect, 0.5, 400);
  streetCamera.position.set(0, 2.5, 4);
  streetCamera.lookAt(0, 1.3, -2);

  // 3. Title Screen Camera (Isometric view matching diorama rooms)
  const titleCamera = warehouseCamera;

  // 4. City Exploration Camera (Isometric Orthographic View)
  const cityD = 12.0; // View volume size
  const cityCamera = new THREE.OrthographicCamera(-cityD * aspect, cityD * aspect, cityD, -cityD, 1, 1000);
  
  // Expose
  return {
    renderer,
    scene,
    warehouseCamera,
    streetCamera,
    titleCamera,
    cityCamera,
    currentCamera: titleCamera
  };
};

window.FFH.getSafeGLTFLoader = function() {
  if (!window.FFH._safeGLTFLoader) {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (url.includes('colormap.png') || url.includes('colormap.PNG')) {
        // Return the actual colormap embedded by the build script
        return window.FFH.CHARACTER_TEXTURE_BASE64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
      return url;
    });
    window.FFH._safeGLTFLoader = new THREE.GLTFLoader(manager);
  }
  return window.FFH._safeGLTFLoader;
};
