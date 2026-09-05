// 3D Cinematic Interior Conversation & Mini-Game Phase
// Solution Architecture: Decoupled Interior System
// - Upper 50% visual viewport: 3D Isometric Diorama Room + Animated Character Mesh
// - Lower 50% visual viewport: Standardized Conversation Drawer + Action Slot
window.FFH = window.FFH || {};

window.FFH.InteriorPhase = class {
  constructor(game) {
    this.game = game;
    this.dioramaRoom = null;
    this.npcMesh = null;
    this.currentConfig = null;
    this.endCamPos = new THREE.Vector3();
    this.endCamTarget = new THREE.Vector3();
    this.endCamZoom = 2.1;
  }

  enter(config = {}) {
    this.currentConfig = config;
    const scene = this.game.scene;
    const cam = this.game.cameras.mainCamera;

    // 1. Clean up any lingering objects from previous phase
    this.cleanupScene();

    // 2. Hide City Overworld exploration visual elements
    if (this.game.phases.CITY_EXPLORATION) {
      const city = this.game.phases.CITY_EXPLORATION;
      if (city.worldGroup) city.worldGroup.visible = false;
      if (city.courier) city.courier.visible = false;
      if (city.questHintMarker) city.questHintMarker.visible = false;
      if (city.navPathGroup) city.navPathGroup.visible = false;
      if (city.targetMarker) city.targetMarker.visible = false;
    }

    // Hide City HUD
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';

    // 3. Instantiate the 3D Diorama Room in the center (0, 0, 0)
    this.dioramaRoom = this.buildRoom(config.roomType);
    if (this.dioramaRoom) {
      this.dioramaRoom.position.set(0, 0, 0);
      scene.add(this.dioramaRoom);
    }

    // 4. Spawn NPC Character Mesh with Idle Breathing / Animation
    if (config.npcKey && window.FFH.createNPCMesh) {
      this.npcMesh = window.FFH.createNPCMesh(config.npcKey);
      if (this.npcMesh) {
        // Room-specific NPC placement presets:
        const ROOM_NPC_PRESETS = window.FFH.ROOM_NPC_PRESETS || {};
        const preset = ROOM_NPC_PRESETS[config.roomType] || { x: -0.25, y: 0.05, z: -0.8, rotY: 0.85, scale: 2.6 };

        const charX = config.characterX !== undefined ? config.characterX : preset.x;
        // Force an additional +1.10 offset specifically for the isometric interior rooms to prevent the 
        // 2.6x scaled Kenney characters from sinking into the ground geometry.
        const charY = (config.characterY !== undefined ? config.characterY : preset.y) + 1.10;
        const charZ = config.characterZ !== undefined ? config.characterZ : preset.z;
        const charRotY = config.characterRotationY !== undefined ? config.characterRotationY : preset.rotY;
        const charScale = config.characterScale !== undefined ? config.characterScale : preset.scale;

        this.currentCharY = charY;
        this.npcMesh.position.set(charX, charY, charZ);
        this.npcMesh.rotation.y = charRotY;
        this.npcMesh.scale.multiplyScalar(charScale);
        scene.add(this.npcMesh);
      }
    }

    // 5. Setup Camera Framing to Reusable 50/50 Template
    const template = window.FFH.DIORAMA_VIEW_TEMPLATE || {
      target: new THREE.Vector3(0, -2.4, 0),
      zoomOffset: new THREE.Vector3(10.0, 13.5, 10.0),
      zoom: 2.1
    };

    this.endCamTarget.copy(template.target);
    this.endCamPos.copy(this.endCamTarget).add(template.zoomOffset);
    this.endCamZoom = template.zoom;

    cam.position.copy(this.endCamPos);
    cam.lookAt(this.endCamTarget);
    if (cam.isOrthographicCamera) {
      cam.zoom = this.endCamZoom;
      cam.updateProjectionMatrix();
    }

    // 6. Mount the Standardized Bottom Conversation Drawer
    this.renderDrawer(config);
  }

  buildRoom(roomType) {
    if (!roomType) {
      return window.FFH.createRoomShell ? window.FFH.createRoomShell() : new THREE.Group();
    }
    switch (roomType) {
      case 'DOORWAY':
        return window.FFH.createDoorwayRoom ? window.FFH.createDoorwayRoom() : window.FFH.createRoomShell();
      case 'WG_ROOM':
      case 'WG_KITCHEN':
        return window.FFH.createWGRoom ? window.FFH.createWGRoom(this.game.state) : window.FFH.createLevel0Room(this.game.state);
      case 'UNI':
      case 'UNI_LOBBY':
        return window.FFH.createUniRoom ? window.FFH.createUniRoom() : window.FFH.createRoomShell();
      case 'PIZZERIA':
        return window.FFH.createPizzeriaRoom ? window.FFH.createPizzeriaRoom() : window.FFH.createRoomShell();
      case 'BAKERY':
        return window.FFH.createBakeryRoom ? window.FFH.createBakeryRoom() : window.FFH.createRoomShell();
      case 'DARKSTORE':
        return window.FFH.createDarkStoreRoom ? window.FFH.createDarkStoreRoom() : window.FFH.createRoomShell();
      case 'RATHAUS':
        return window.FFH.createRathausRoom ? window.FFH.createRathausRoom() : window.FFH.createRoomShell();
      case 'BANK':
        return window.FFH.createBankRoom ? window.FFH.createBankRoom() : window.FFH.createRoomShell();
      default:
        return window.FFH.createRoomShell ? window.FFH.createRoomShell() : new THREE.Group();
    }
  }

  renderDrawer(config) {
    const parent = document.getElementById('ui-container') || document.body;
    const existing = document.getElementById('interior-conversation-drawer');
    if (existing) existing.remove();

    const drawer = document.createElement('div');
    drawer.id = 'interior-conversation-drawer';
    drawer.style.cssText = [
      'position: absolute;',
      'bottom: 0;',
      'left: 0;',
      'right: 0;',
      'height: 48vh;',
      'box-sizing: border-box;',
      'background: #FFFFFF;',
      'border-top: 4px solid #2EC4B6;',
      'border-top-left-radius: 20px;',
      'border-top-right-radius: 20px;',
      'padding: 12px 14px 14px 14px;',
      'box-shadow: 0 -8px 30px rgba(0,0,0,0.25);',
      'font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);',
      'pointer-events: auto;',
      'animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);',
      'display: flex;',
      'flex-direction: column;',
      'z-index: 9500;',
      'overflow: hidden;'
    ].join(' ');

    const badge = config.titleBadge || 'LOCATION';
    const title = config.title || 'Conversation';
    const speaker = config.speaker || '';
    const text = config.text || '';
    const note = config.note || '';

    let closeBtnHtml = '';
    if (config.canClose) {
      closeBtnHtml = '<button id="btn-close-interior" style="background: none; border: none; color: #1D3557; font-size: 20px; font-weight: 800; cursor: pointer; padding: 2px 8px;">✕</button>';
    }

    let speechBubbleHtml = '';
    if (speaker || text) {
      let speakerHtml = speaker ? '<div style="font-size: 11px; font-weight: 800; color: #2EC4B6; margin-bottom: 4px;">' + speaker + '</div>' : '';
      speechBubbleHtml = '<div style="background: #F4F7F6; border-radius: 12px; padding: 10px 12px; border: 1px solid #E2E8F0; flex-shrink: 0;">' + speakerHtml + '<div style="font-size: 12.5px; line-height: 1.45; color: #1D3557; font-weight: 700;">' + text + '</div></div>';
    }

    let noteHtml = '';
    if (note) {
      noteHtml = '<div style="background: #FFF3CD; border-left: 4px solid #FFD166; border-radius: 6px; padding: 8px 10px; font-size: 11.5px; color: #856404; line-height: 1.35; flex-shrink: 0;">' + note + '</div>';
    }

    drawer.innerHTML = [
      '<div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #F0F4F8; padding-bottom: 6px; margin-bottom: 6px; flex-shrink: 0;">',
      '  <div style="display: flex; flex-direction: column;">',
      '    <div style="font-size: 10px; color: #E76F51; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">' + badge + '</div>',
      '    <div style="font-size: 14px; font-weight: 900; color: #1D3557; line-height: 1.2;">' + title + '</div>',
      '  </div>',
      closeBtnHtml,
      '</div>',
      '<div id="interior-scroll-stream" style="flex: 1; overflow-y: auto; padding: 2px 2px 8px 2px; display: flex; flex-direction: column; gap: 8px; scroll-behavior: smooth;">',
      speechBubbleHtml,
      noteHtml,
      '  <div id="interior-action-slot" style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; margin-top: 2px;"></div>',
      '</div>'
    ].join('\n');

    parent.appendChild(drawer);

    const actionSlot = drawer.querySelector('#interior-action-slot');
    const closeBtn = drawer.querySelector('#btn-close-interior');

    if (closeBtn) {
      closeBtn.onclick = () => {
        this.exitToCity();
      };
    }

    // Mount Custom Widget (e.g. 3-Button Doorbell or Mülltrennung)
    if (config.customWidget) {
      config.customWidget(actionSlot, (result) => {
        if (config.onComplete) config.onComplete(result);
      }, this);
    } else if (config.choices && config.choices.length > 0) {
      // Mount Standard Options
      config.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'dialogue-opt-btn';
        const borderLeft = choice.borderLeft || (idx === 0 ? '#2EC4B6' : '#E76F51');
        btn.style.cssText = [
          'background: #FFFFFF;',
          'color: #1D3557;',
          'border: 2px solid #264653;',
          'border-left: 5px solid ' + borderLeft + ';',
          'border-radius: 12px;',
          'padding: 9px 12px;',
          'font-weight: 800;',
          'font-size: 12px;',
          'cursor: pointer;',
          'text-align: left;',
          'box-shadow: 0 3px 8px rgba(0,0,0,0.08);',
          'transition: transform 0.08s ease, background 0.15s ease;',
          'line-height: 1.35;',
          'display: flex;',
          'align-items: center;',
          'gap: 8px;',
          'width: 100%;',
          'box-sizing: border-box;'
        ].join(' ');

        const labelText = choice.label || choice.text || '';
        const subtextHtml = choice.subtext ? '<div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">' + choice.subtext + '</div>' : '';
        btn.innerHTML = '<div style="flex: 1;"><div style="font-size: 13px; font-weight: 900; color: #1D3557;">' + labelText + '</div>' + subtextHtml + '</div><span style="font-size: 13px; opacity: 0.7;">➔</span>';

        btn.onclick = () => {
          if (this.game.sfx) this.game.sfx.playSfx('click');
          if (choice.action) {
            choice.action(this.game, this);
          } else {
            this.exitToCity();
          }
        };
        actionSlot.appendChild(btn);
      });
    }
  }

  update(delta) {
    const cam = this.game.cameras.mainCamera;
    if (cam.isOrthographicCamera && cam.zoom !== this.endCamZoom) {
      cam.zoom = this.endCamZoom;
      cam.updateProjectionMatrix();
    }
    cam.position.copy(this.endCamPos);
    cam.lookAt(this.endCamTarget);

    // Update NPC idle animation
    if (this.npcMesh) {
      if (window.FFH.updateNPCAnimation) {
        window.FFH.updateNPCAnimation(this.npcMesh, delta);
      }
      if (!this.npcMesh.userData.mixer) {
        const baseY = this.currentCharY !== undefined ? this.currentCharY : (this.currentConfig?.characterY || 0.05);
        this.npcMesh.position.y = baseY + Math.sin(time * 3) * 0.025;
      }
    }
  }

  exitToCity() {
    this.cleanupScene();

    const city = this.game.phases.CITY_EXPLORATION;
    let spawnPos = null;
    if (city) {
      const poiType = city.enteringPoiType || null;
      if (poiType && city.getExitPosition) {
        spawnPos = city.getExitPosition(poiType, city.playerPos);
      } else if (city.playerPos) {
        spawnPos = city.playerPos.clone();
      }
    }
    const timeOfDay = (city && city.timeOfDay !== undefined) ? city.timeOfDay : undefined;

    // Transition back to CITY_EXPLORATION through GameEngine so scene, world, HUD, and listeners are properly restored
    this.game.transitionTo('CITY_EXPLORATION', {
      spawnPos: spawnPos,
      timeOfDay: timeOfDay,
      fromBuildingExit: true
    });
  }

  cleanupScene() {
    const scene = this.game.scene;
    if (this.dioramaRoom) {
      scene.remove(this.dioramaRoom);
      this.dioramaRoom = null;
    }
    if (this.npcMesh) {
      scene.remove(this.npcMesh);
      this.npcMesh = null;
    }
    const drawer = document.getElementById('interior-conversation-drawer');
    if (drawer) drawer.remove();
  }

  exit() {
    this.cleanupScene();
    const cam = this.game.cameras.mainCamera;
    if (cam && cam.isOrthographicCamera) {
      cam.zoom = 1.15;
      cam.updateProjectionMatrix();
    }
  }
};
