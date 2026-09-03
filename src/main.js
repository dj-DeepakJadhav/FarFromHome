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
    // Install three-mesh-bvh (support both MeshBVH and MeshBVHLib global names)
    const BVH = window.MeshBVH || window.MeshBVHLib;
    if (BVH) {
      window.MeshBVH = BVH;
      THREE.BufferGeometry.prototype.computeBoundsTree = BVH.computeBoundsTree;
      THREE.BufferGeometry.prototype.disposeBoundsTree = BVH.disposeBoundsTree;
      THREE.Mesh.prototype.raycast = BVH.acceleratedRaycast;
    } else {
      console.warn('MeshBVH not found, sliding collision will fallback or fail.');
    }

    // Renderer & scene components initialization
    this.sceneData = window.FFH.setupScene('canvas-container');
    this.scene = this.sceneData.scene;
    this.renderer = this.sceneData.renderer;
    this.cameras = {
      mainCamera: this.sceneData.mainCamera
    };
    this.currentCamera = this.sceneData.mainCamera;

    this.titleDiorama = null;
    this.titleWorld = null;

    // Core helpers
    this.particles = new window.FFH.ParticleSystem(this.scene);
    this.ui = new window.FFH.UI(this);

    // Ink-outline post-processing (optional, see inkOutline.js)
    // Defaults to Clean Diorama Mode (hardware MSAA antialiased rendering matching 3D isometric mockup)
    window.FFH.useInkOutline = (window.FFH.useInkOutline !== undefined) ? window.FFH.useInkOutline : false;
    this.inkRenderer = window.FFH.createInkRenderer(this.renderer, this.scene, this.currentCamera);

    // Wire stages
    this.phases.PICK = new window.FFH.PickPhase(this);
    this.phases.SHOP = new window.FFH.ShopPhase(this);
    this.phases.CITY_EXPLORATION = new window.FFH.CityExplorationPhase(this);
    this.phases.DIALOGUE = new window.FFH.DialoguePhase(this);

    // Initialize Dynamic Story Interpreter (assets/narrative/story.json)
    if (window.FFH.StoryRunner) {
      this.storyRunner = new window.FFH.StoryRunner(this);
      this.storyRunner.init();
    }

    // Setup zoom controls
    this.initZoomControls();

    // Boot state
    this.transitionTo('BOOT');

    // Launch game loop
    this.animate = this.animate.bind(this);
    this.animate();

    // Screen size change lock
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 100));
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.resize());
      window.visualViewport.addEventListener('scroll', () => this.resize());
    }
    this.resize();
  }

  initZoomControls() {
    // Zooming is now handled strictly by the camera phases, 
    // no manual zooming allowed to keep the bird's-eye consistent.
  }

  setupTitleDiorama() {
    this.clearTitleDiorama();

    // Build the full city world as a background for the main menu
    // This way the player sees the actual game world behind the frosted glass panel
    try {
      const { worldGroup, waterMat } = window.FFH.buildLubeckCityWorld();
      this.titleDiorama = worldGroup;
      this.titleWaterMat = waterMat;
      this.scene.add(this.titleDiorama);

      // Add atmospheric lighting for the title screen
      const titleAmbient = new THREE.AmbientLight(0xC8E6FF, 0.9);
      const titleSun = new THREE.DirectionalLight(0xFFD080, 1.4);
      titleSun.position.set(30, 50, 20);
      titleSun.castShadow = false; // no shadows needed on boot screen
      this.titleDiorama.add(titleAmbient, titleSun);

      // Position the title camera at a cinematic wide angle of the city
      const cam = this.cameras.titleCamera;
      if (cam) {
        cam.position.set(22, 18, 38);
        cam.lookAt(20, 0, 14);
      }
    } catch(e) {
      console.warn('Title diorama build failed:', e);
    }
  }

  clearTitleDiorama() {
    this.titleToken = null;
    if (this.titleDiorama) {
      this.scene.remove(this.titleDiorama);
      this.titleDiorama.traverse((obj) => {
        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m && typeof m.dispose === 'function') m.dispose();
            });
          } else if (typeof obj.material.dispose === 'function') {
            obj.material.dispose();
          }
        }
      });
      this.titleDiorama = null;
      this.titleWorld = null;
    }
  }

  transitionTo(phaseKey, params = {}) {
    const isSamePhase = (this.currentPhaseName === phaseKey && this.currentPhase);
    this.currentPhaseName = phaseKey;

    if (!isSamePhase && this.currentPhase && this.currentPhase.exit) {
      this.currentPhase.exit();
    }

    if (phaseKey === 'BOOT') {
      this.currentPhase = null;
      this.currentCamera = this.cameras.mainCamera;
      this.setupTitleDiorama();
      this.ui.showBootScreen();
    } else {
      this.clearTitleDiorama();
      if (phaseKey === 'ROOM_HUB') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.mainCamera;
        this.setupTitleDiorama();
        this.ui.showRoomHubUI();
      } else if (phaseKey === 'CITY_EXPLORATION') {
        this.currentPhase = this.phases.CITY_EXPLORATION;
        this.currentCamera = this.cameras.mainCamera;
        this.currentPhase.enter(params);
      } else if (phaseKey === 'DIALOGUE') {
        this.currentPhase = this.phases.DIALOGUE;
        this.currentCamera = this.cameras.mainCamera;
        this.currentPhase.enter(params);
      } else if (phaseKey === 'PICK') {
        this.currentPhase = this.phases.PICK;
        this.currentCamera = this.cameras.mainCamera;
        this.currentPhase.enter(params);
      } else if (phaseKey === 'DEBRIEF_RECEIPT') {
        this.currentCamera = this.cameras.mainCamera;
        this.ui.showShiftSummaryUI();
      } else if (phaseKey === 'SHOP') {
        this.ui.updatePersistentHUD(this.state);
        this.sfx.playBgm('shop');
        this.currentPhase = this.phases.SHOP;
        this.currentCamera = this.cameras.mainCamera;
        this.currentPhase.enter(params);
      } else if (phaseKey === 'WIN') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.mainCamera;
        this.ui.showWinScreen();
      } else if (phaseKey === 'LOSE') {
        this.currentPhase = null;
        this.currentCamera = this.cameras.mainCamera;
        this.ui.showLoseScreen();
      }
      if (phaseKey !== 'BOOT' && phaseKey !== 'WIN' && phaseKey !== 'LOSE') {
        if (window.FFH && window.FFH.saveGame) {
          window.FFH.saveGame(this);
        }
      }

      // Update the HUD after transitioning, so it shows the correct state
      if (this.ui && this.ui.updatePersistentHUD) {
        this.ui.updatePersistentHUD(this.state);
      }
    }
  }

  // Full run reset. State is rebuilt rather than patched so nothing (strikes,
  // upgrades, stats) can leak from the previous run into the new one.
  restartRun() {
    this.state = window.FFH.createRunState();
    window.FFH.state = this.state;
    this.transitionTo('SHOP');
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

    // Render loop - gently pan the title camera around the city on the boot screen
    if (this.titleDiorama && !this.currentPhase) {
      const t = this.clock.getElapsedTime();
      const radius = 28;
      const cam = this.cameras.mainCamera;
      if (cam) {
        cam.position.x = 20 + Math.sin(t * 0.04) * radius;
        cam.position.z = 26 + Math.cos(t * 0.04) * radius;
        cam.position.y = 16 + Math.sin(t * 0.025) * 3;
        cam.lookAt(20, 1, 14);
      }
      // Animate water on title screen too
      if (this.titleWaterMat && this.titleWaterMat.uniforms && this.titleWaterMat.uniforms.time) {
        this.titleWaterMat.uniforms.time.value = t;
      }
    }

    if (this.renderer && this.scene && this.currentCamera) {
      if (this.inkRenderer && window.FFH.useInkOutline) {
        this.inkRenderer.setCamera(this.currentCamera);
        this.inkRenderer.render();
      } else {
        this.renderer.render(this.scene, this.currentCamera);
      }
    }
  }

  resize() {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const scale = Math.min(vw / 390, vh / 844);
      gameContainer.style.transform = `scale(${scale})`;
      gameContainer.style.transformOrigin = 'center center';
    }
  }
}

window.FFH.Game = GameEngine;

// Window load trigger
window.addEventListener('DOMContentLoaded', () => {
  const game = new window.FFH.Game();
  window.FFH_GAME = game;
  window.game = game;
  game.init();
});
