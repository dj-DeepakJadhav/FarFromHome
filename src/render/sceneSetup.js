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
