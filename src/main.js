// Core Engine Boot + Loop
class GameEngine {
  constructor() {
    this.state = window.FFH.state;
    this.sceneData = null;
    this.scene = null;
    this.renderer = null;
    this.cameras = null;
    this.currentCamera = null;
    this.particles = null;
    this.sfx = new window.FFH.AudioEngine();
    this.speech = new window.FFH.SpeechEngine();
    this.ui = null;

    this.phases = {
      PICK: null
    };
    this.currentPhase = null;
    this.clock = new THREE.Clock();
  }

  init() {
    // Renderer & scene components initialization
    this.sceneData = window.FFH.setupScene('canvas-container');
    this.scene = this.sceneData.scene;
    this.renderer = this.sceneData.renderer;
    this.cameras = {
      warehouseCamera: this.sceneData.warehouseCamera,
      streetCamera: this.sceneData.streetCamera,
      titleCamera: this.sceneData.titleCamera
    };
    this.currentCamera = this.sceneData.titleCamera;

    this.titleDiorama = null;
    this.titleWorld = null;

    // Title camera zoom state — a flat, static diorama (no auto-spin, no
    // drag-rotate); the only camera control is dolly in/out.
    this.titleCameraDir = new THREE.Vector3(0, 13, 17).normalize();
    this.titleCameraDist = Math.hypot(13, 17);
    this.titleCameraDistMin = 8;
    this.titleCameraDistMax = 60;

    // Core helpers
    this.particles = new window.FFH.ParticleSystem(this.scene);
    this.ui = new window.FFH.UI(this);

    // Ink-outline post-processing wraps every render (see inkOutline.js)
    this.inkRenderer = window.FFH.createInkRenderer(this.renderer, this.scene, this.currentCamera);

    // Wire stages
    this.phases.PICK = new window.FFH.PickPhase(this);
    this.phases.RIDE = new window.FFH.RidePhase(this);
    this.phases.INTERCOM = new window.FFH.IntercomPhase(this);
    this.phases.SHOP = new window.FFH.ShopPhase(this);

    // Setup zoom controls
    this.initZoomControls();

    // Boot state
    this.transitionTo('BOOT');

    // Launch game loop
    this.animate = this.animate.bind(this);
    this.animate();

    // Screen size change lock
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  initZoomControls() {
    const canvas = this.renderer.domElement;
    this.dioramaZoom = 3.6; // zoomed-out default
    this.dioramaZoomMin = 2.0;
    this.dioramaZoomMax = 5.5;

    const applyZoom = (delta) => {
      this.dioramaZoom = THREE.MathUtils.clamp(
        this.dioramaZoom + delta,
        this.dioramaZoomMin,
        this.dioramaZoomMax
      );
      
      const aspect = 390 / 844;
      const d = this.dioramaZoom;
      if (this.cameras && this.cameras.warehouseCamera) {
        this.cameras.warehouseCamera.left = -d * aspect;
        this.cameras.warehouseCamera.right = d * aspect;
        this.cameras.warehouseCamera.top = d;
        this.cameras.warehouseCamera.bottom = -d;
        this.cameras.warehouseCamera.updateProjectionMatrix();
      }
    };

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      applyZoom(e.deltaY * 0.0035);
    }, { passive: false });

    // Pinch-to-zoom on touch devices
    let lastPinchDist = null;
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist !== null) applyZoom((lastPinchDist - dist) * 0.01);
        lastPinchDist = dist;
      }
    }, { passive: true });
    canvas.addEventListener('touchend', () => { lastPinchDist = null; });
  }

  setupTitleDiorama() {
    this.clearTitleDiorama();
    this.titleDiorama = new THREE.Group();

    // Add Level 0 Student Sublet Room as the hero 3D diorama
    const level0Room = window.FFH.createLevel0Room();
    this.titleRoom = level0Room;
    this.titleDiorama.add(level0Room);

    this.scene.add(this.titleDiorama);
  }

  clearTitleDiorama() {
    this.titleToken = null;
    if (this.titleDiorama) {
      this.scene.remove(this.titleDiorama);
      this.titleDiorama.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      this.titleDiorama = null;
      this.titleWorld = null;
    }
  }

  transitionTo(phaseKey) {
    if (this.currentPhase && this.currentPhase.exit) {
      this.currentPhase.exit();
    }

    if (phaseKey === 'BOOT') {
      this.currentPhase = null;
      this.currentCamera = this.cameras.titleCamera;
      this.setupTitleDiorama();
      this.ui.showBootScreen();
    } else {
      this.clearTitleDiorama();
      if (phaseKey === 'ROOM_HUB') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.titleCamera;
        this.setupTitleDiorama();
        this.ui.showRoomHubUI();
      } else if (phaseKey === 'PICK') {
        this.currentPhase = this.phases.PICK;
        this.currentCamera = this.cameras.warehouseCamera;
        this.currentPhase.enter();
      } else if (phaseKey === 'RIDE') {
        this.currentPhase = this.phases.RIDE;
        this.currentCamera = this.cameras.streetCamera;
        this.currentPhase.enter();
      } else if (phaseKey === 'INTERCOM') {
        this.currentPhase = this.phases.INTERCOM;
        this.currentCamera = this.cameras.warehouseCamera;
        this.currentPhase.enter();
      } else if (phaseKey === 'DEBRIEF_RECEIPT') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.warehouseCamera;
        this.ui.showShiftSummaryUI();
      } else if (phaseKey === 'SHOP') {
        this.currentPhase = this.phases.SHOP;
        this.currentCamera = this.cameras.warehouseCamera;
        this.currentPhase.enter();
      } else if (phaseKey === 'WIN') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.warehouseCamera;
        this.ui.showWinScreen();
      } else if (phaseKey === 'LOSE') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.warehouseCamera;
        this.ui.showLoseScreen();
      }
    }
  }

  // Full run reset. State is rebuilt rather than patched so nothing (strikes,
  // upgrades, stats) can leak from the previous run into the new one.
  restartRun() {
    this.state = window.FFH.createRunState();
    window.FFH.state = this.state;
    this.transitionTo('ROOM_HUB');
  }

  triggerScreenShake() {
    const camera = this.currentCamera;
    const originalPos = camera.position.clone();
    let elapsed = 0;
    const duration = 0.35;

    const runShake = () => {
      elapsed += 0.016;
      if (elapsed < duration) {
        camera.position.x = originalPos.x + (Math.random() - 0.5) * 0.4;
        camera.position.y = originalPos.y + (Math.random() - 0.5) * 0.4;
        requestAnimationFrame(runShake);
      } else {
        camera.position.copy(originalPos);
      }
    };
    runShake();
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1); // cap delta to prevent frame jumps

    // Update active particle nodes
    if (this.particles) {
      this.particles.update(delta);
    }

    // Update phase
    if (this.currentPhase && this.currentPhase.update) {
      this.currentPhase.update(delta);
    }

    // Gentle room diorama idle animations (like breathing cat)
    if (this.titleRoom && this.titleRoom.userData && this.titleRoom.userData.updateIdle) {
      this.titleRoom.userData.updateIdle(this.clock.getElapsedTime());
    }

    // Render loop — the title diorama is a static flat map now (no auto-spin,
    // zoom only; see initZoomControls) so there's nothing to animate here.
    if (this.renderer && this.scene && this.currentCamera) {
      if (this.inkRenderer) {
        this.inkRenderer.setCamera(this.currentCamera);
        this.inkRenderer.render();
      } else {
        this.renderer.render(this.scene, this.currentCamera);
      }
    }
  }

  resize() {
    const width = 390;
    const height = 844;
    const canvas = this.renderer.domElement;

    // Lock aspect ratio calculations
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const gameRatio = width / height;

    let newWidth, newHeight;

    if (windowRatio > gameRatio) {
      newHeight = windowHeight;
      newWidth = windowHeight * gameRatio;
    } else {
      newWidth = windowWidth;
      newHeight = windowWidth / gameRatio;
    }

    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';

    // Update orthographic camera frustum to match viewport
    const aspect = width / height;
    const d = this.dioramaZoom || 3.6; // Respect zoomed-out default
    if (this.cameras && this.cameras.warehouseCamera) {
      this.cameras.warehouseCamera.left = -d * aspect;
      this.cameras.warehouseCamera.right = d * aspect;
      this.cameras.warehouseCamera.top = d;
      this.cameras.warehouseCamera.bottom = -d;
      this.cameras.warehouseCamera.updateProjectionMatrix();
    }
  }
}

// Window load trigger
window.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  window.__game = game; // dev convenience hook for manual testing/debugging
  game.init();
});
