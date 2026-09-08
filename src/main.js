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
    if (window.FFH.InteriorPhase) {
      this.phases.INTERIOR = new window.FFH.InteriorPhase(this);
    }

    // Initialize Dynamic Story Interpreter (assets/narrative/story.json)
    if (window.FFH.StoryRunner) {
      this.storyRunner = new window.FFH.StoryRunner(this);
      this.storyRunner.init();
    }
    
    // Initialize Template Manager
    if (window.FFH.TemplateManager) {
      this.templateManager = new window.FFH.TemplateManager(this);
    }

    // Setup zoom controls
    this.initZoomControls();

    // Boot state
    this.transitionTo('BOOT');

    // Launch game loop
    this.animate = this.animate.bind(this);
    this.animate();

    // Attach unlock audio listeners (both immediate boot attempt and on-gesture unlock)
    this.unlockAudio();
    const handleGesture = () => {
      this.unlockAudio();
    };
    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('click', handleGesture, { passive: true });

    this.resize();
  }

  unlockAudio() {
    if (this.sfx) {
      if (typeof this.sfx.init === 'function') {
        this.sfx.init();
      }
      if (this.sfx.ctx && this.sfx.ctx.state === 'suspended') {
        this.sfx.ctx.resume().catch(() => {});
      }
      if (typeof this.sfx.startMusic === 'function') {
        this.sfx.startMusic();
      }
    }
    if (this.speech && this.speech.audioContext && this.speech.audioContext.state === 'suspended') {
      this.speech.audioContext.resume().catch(() => {});
    }
  }

  initZoomControls() {
    // Zooming is now handled strictly by the camera phases, 
    // no manual zooming allowed to keep the bird's-eye consistent.
  }

  setupTitleDiorama() {
    this.clearTitleDiorama();
    this.titleIdleStartedAt = this.clock ? this.clock.getElapsedTime() : 0;

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
      } else if (phaseKey === 'INTERIOR') {
        this.currentPhase = this.phases.INTERIOR;
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

      // The state machine is the single owner of HUD visibility.
      // Phases used to hide #hud themselves and never restore it, so the day
      // counter, wallet and objective vanished for the rest of the session on
      // the first conversation. Do not reintroduce per-phase display toggles.
      this.syncHudVisibility(phaseKey);
      this.syncBackdrop(phaseKey);

      // Update the HUD after transitioning, so it shows the correct state
      if (this.ui && this.ui.updatePersistentHUD) {
        this.ui.updatePersistentHUD(this.state);
      }
    }
  }

  // The state machine owns the scene backdrop for the same reason it owns HUD
  // visibility: only the city phase used to set scene.background, so every room
  // phase inherited the last sky the city painted. Leave the city alone, it
  // drives its own sky from the time of day.
  syncBackdrop(phaseKey) {
    if (!this.scene || !window.FFH.getBackdrop) return;
    if (phaseKey === 'CITY_EXPLORATION' || phaseKey === 'BOOT') return;

    if (phaseKey === 'PICK') {
      this.scene.background = window.FFH.getBackdrop('warehouse', '#1B2440', '#0D1424');
    } else if (phaseKey === 'DIALOGUE' || phaseKey === 'INTERIOR' || phaseKey === 'SHOP') {
      this.scene.background = window.FFH.getBackdrop('room', '#3E4A63', '#222C42');
    }
  }

  // Phases where the player is inside the run and needs the economy readout.
  // BOOT / WIN / LOSE own the whole screen and suppress it.
  syncHudVisibility(phaseKey) {
    const hidden = (phaseKey === 'BOOT' || phaseKey === 'WIN' || phaseKey === 'LOSE');
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = hidden ? 'none' : '';
    const persistent = document.getElementById('ffh-persistent-hud');
    if (persistent) persistent.style.display = hidden ? 'none' : 'flex';
  }

  // The prologue's Skip intro action and the judge-only fast-start share one
  // clean entry. The fast-start preserves the normal opening and only changes
  // the scene a reviewer lands in.
  startFirstShift(startSceneId = 'shift_1_teach') {
    if (this.storyRunner) {
      this.storyRunner.cancelProseQueue();
      this.storyRunner.pendingStoryTarget = null;
      this.storyRunner.history = [];
    }
    this.state = window.FFH.createRunState();
    window.FFH.state = this.state;
    this.state.currentShift = startSceneId === 'shift_3_test' ? 3 : 1;
    this.state.day = 1;
    if (window.FFH.resetShiftState) {
      window.FFH.resetShiftState(this.state);
    }
    if (this.ui) {
      this.ui.clear();
    }
    this.clearTitleDiorama();

    // Gameplay scenes route through StoryRunner so the rail ramp is preserved.
    // Falling back to a bare PICK loses the authored cue delay.
    if (this.storyRunner) {
      this.storyRunner.startScene(startSceneId);
    } else {
      this.transitionTo('PICK');
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
    if (this.currentPhase && this.currentPhase.update
        && !document.hidden && !document.getElementById('ffh-pause-modal')) {
      this.currentPhase.update(delta);
    }

    // Gentle room diorama idle animations (like breathing cat)
    if (this.titleRoom && this.titleRoom.userData && this.titleRoom.userData.updateIdle) {
      this.titleRoom.userData.updateIdle(this.clock.getElapsedTime());
    }

    // Let the title frame settle first, then begin a slow aerial glide. The
    // interactive city camera is deliberately separate from this non-blocking
    // title presentation.
    if (this.titleDiorama && this.currentPhaseName === 'BOOT' && !this.currentPhase) {
      const t = this.clock.getElapsedTime();
      const titleStart = this.titleIdleStartedAt !== undefined ? this.titleIdleStartedAt : t;
      const idleElapsed = Math.max(0, t - titleStart - 4);
      const radius = 12; // Adjusted for 0.52 zoom
      const cam = this.cameras.mainCamera;
      if (cam) {
        cam.zoom = 0.52;
        cam.updateProjectionMatrix();
        cam.position.x = 10.4 + Math.sin(idleElapsed * 0.08) * radius;
        cam.position.z = 5.2 + Math.cos(idleElapsed * 0.08) * radius;
        cam.position.y = 14 + Math.sin(idleElapsed * 0.05) * 1.5;
        cam.lookAt(10.4, 0.05, 5.2);
      }
      // Animate water on title screen too
      if (this.titleWaterMat && this.titleWaterMat.uniforms && this.titleWaterMat.uniforms.time) {
        const wSpd = (window.FFH.CONFIG && window.FFH.CONFIG.environment && window.FFH.CONFIG.environment.waterSpeed !== undefined) ? window.FFH.CONFIG.environment.waterSpeed : 1.0;
        this.titleWaterMat.uniforms.time.value = t * wSpd;
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
window.addEventListener('DOMContentLoaded', async () => {
  if (window.FFH.preloadAllNPCModels) {
    try {
      await window.FFH.preloadAllNPCModels();
    } catch (e) {
      console.error("NPC Preload failed:", e);
    }
  }
  const game = new window.FFH.Game();
  window.FFH_GAME = game;
  window.game = game;
  game.init();

  // ?quickstart=1 opens directly on the Shift 3 rail-pulse Aha. This gives a
  // reviewer a 90-second proof path without putting a bypass button on the
  // main menu or rushing the normal, cozy Day 1 opening.
  try {
    if (new URLSearchParams(window.location.search).get('quickstart') === '1') {
      setTimeout(() => {
        game.unlockAudio();
        game.startFirstShift('shift_3_test');
      }, 300);
    }
  } catch (e) { /* no URLSearchParams support: fall through to the title screen */ }
});
