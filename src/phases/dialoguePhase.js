// 3D Cinematic In-World Conversation Phase
window.FFH = window.FFH || {};

// Reusable 50/50 Split View Template for Diorama & Modal UI phases
window.FFH.DIORAMA_VIEW_TEMPLATE = {
  // Center of the upper 50% visual viewport in world coordinates
  // Moving the camera lookAt down along the projection plane positions the 3D room cleanly in the top 50% (51.5% to 94.1% viewport height)
  target: new THREE.Vector3(0, -2.4, 0),
  // Camera offset preserving true 45-degree isometric projection angle
  zoomOffset: new THREE.Vector3(10.0, 13.5, 10.0),
  // Balanced zoom factor keeping the entire room, floor edges, and character neatly framed in upper half with zero UI overlap
  zoom: 2.1,
  // Standard CSS bottom modal height (exactly 48vh)
  uiHeight: '48vh'
};

window.FFH.DialoguePhase = class {
  constructor(game) {
    this.game = game;
    this.npcGroup = null;
    this.targetNpcKey = null;
    this.dialogueData = null;
    this.transitionTime = 0;
    this.isTransitioning = false;
    this.startCamPos = new THREE.Vector3();
    this.startCamTarget = new THREE.Vector3();
    this.endCamPos = new THREE.Vector3();
    this.endCamTarget = new THREE.Vector3();
  }

  enter(params = {}) {
    // If already in DIALOGUE and just updating dialogue node/options, don't recreate room or restart camera
    if (this.dioramaRoom && this.targetNpcKey === (params.isDelivery ? 'NPC_DELIVERY_CUSTOMER' : (params.npcKey || 'NPC_RITA'))) {
      if (params.isStory) {
        return; // Handled directly by StoryRunner
      }
      const npcEntry = window.FFH.NPC_DATABASE ? window.FFH.NPC_DATABASE[this.targetNpcKey] : null;
      if (npcEntry && npcEntry.dialogue) {
        if (params.custom && npcEntry.currentResponse) {
          this.dialogueData = npcEntry.currentResponse;
        } else {
          this.dialogueData = npcEntry.dialogue(this.game.state);
        }
        this.game.ui.showDialogueBox(npcEntry, this.dialogueData, (option) => {
          if (option && option.action) {
            option.action(this.game);
          }
        });
      }
      return;
    }

    // Clean up any existing room if switching NPC
    if (this.dioramaRoom) {
      this.game.scene.remove(this.dioramaRoom);
      this.dioramaRoom = null;
    }
    if (this.npcGroup) {
      this.game.scene.remove(this.npcGroup);
      this.npcGroup = null;
    }

    // 1. Hide City Explorer UI and scene elements
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';

    if (this.game.phases.CITY_EXPLORATION.worldGroup) {
      this.game.phases.CITY_EXPLORATION.worldGroup.visible = false;
    }
    if (this.game.phases.CITY_EXPLORATION.courier) {
      this.game.phases.CITY_EXPLORATION.courier.visible = false;
    }

    this.targetNpcKey = params.isDelivery ? 'NPC_DELIVERY_CUSTOMER' : (params.npcKey || 'NPC_RITA');
    const npcEntry = window.FFH.NPC_DATABASE ? window.FFH.NPC_DATABASE[this.targetNpcKey] : null;

    // Build the respective diorama room depending on the building
    const bType = npcEntry ? npcEntry.building : 'B_HOSTEL';
    if (bType === 'B_UNI' && window.FFH.createUniRoom) {
      this.dioramaRoom = window.FFH.createUniRoom();
    } else if (bType === 'B_DARKSTORE' && window.FFH.createDarkStoreRoom) {
      this.dioramaRoom = window.FFH.createDarkStoreRoom();
    } else if (bType === 'B_PIZZA' && window.FFH.createPizzeriaRoom) {
      this.dioramaRoom = window.FFH.createPizzeriaRoom();
    } else if (bType === 'B_BAKERY' && window.FFH.createBakeryRoom) {
      this.dioramaRoom = window.FFH.createBakeryRoom();
    } else if (bType === 'B_WG' && window.FFH.createWGRoom) {
      this.dioramaRoom = window.FFH.createWGRoom();
    } else if (bType === 'B_RATHAUS' && window.FFH.createRathausRoom) {
      this.dioramaRoom = window.FFH.createRathausRoom();
    } else if (bType === 'B_BANK' && window.FFH.createBankRoom) {
      this.dioramaRoom = window.FFH.createBankRoom();
    } else if (bType === 'B_AUSLAENDER' && window.FFH.createAuslaenderRoom) {
      this.dioramaRoom = window.FFH.createAuslaenderRoom();
    } else if (params.isDelivery && window.FFH.createDoorwayRoom) {
      this.dioramaRoom = window.FFH.createDoorwayRoom();
    } else {
      this.dioramaRoom = window.FFH.createLevel0Room ? window.FFH.createLevel0Room(this.game.state) : window.FFH.createRoomShell(0xF29688, 0x76C8B8);
    }
    this.dioramaRoom.position.set(0, 0, 0);
    this.game.scene.add(this.dioramaRoom);

    // 2. Spawn NPC behind counter or desk according to room type
    if (window.FFH.createNPCMesh) {
      this.npcGroup = window.FFH.createNPCMesh(npcEntry ? npcEntry.modelKey || 'NPC_CHAR_A' : 'NPC_CHAR_A');
      const ROOM_NPC_PRESETS = window.FFH.ROOM_NPC_PRESETS || {};
      const preset = ROOM_NPC_PRESETS[bType] || { x: -0.25, y: 0.05, z: -0.8, rotY: 0.85, scale: 2.6 };
      this.npcGroup.position.set(preset.x, preset.y + 1.10, preset.z);
      this.npcGroup.rotation.y = preset.rotY;
      this.npcGroup.scale.multiplyScalar(preset.scale);
      this.game.scene.add(this.npcGroup);
    }

    // 3. Setup Cinematic Isometric View using Reusable 50/50 Template
    const template = window.FFH.DIORAMA_VIEW_TEMPLATE;
    const cam = this.game.cameras.mainCamera;
    
    // Target moves camera down in world space so 3D room renders high up in upper 50%
    this.endCamTarget = template.target.clone();
    this.endCamPos = new THREE.Vector3().copy(this.endCamTarget).add(template.zoomOffset);
    this.endCamZoom = template.zoom;

    // Direct snap: clean focus without pan jitter
    cam.position.copy(this.endCamPos);
    cam.lookAt(this.endCamTarget);
    if (cam.isOrthographicCamera) {
      cam.zoom = this.endCamZoom;
      cam.updateProjectionMatrix();
    }
    this.isTransitioning = false;

    // 4. Render Visual Dialogue UI & speak full German sentence
    if (!params.isStory && npcEntry && npcEntry.dialogue) {
      if (params.custom && npcEntry.currentResponse) {
        this.dialogueData = npcEntry.currentResponse;
      } else {
        this.dialogueData = npcEntry.dialogue(this.game.state);
      }
      this.game.ui.showDialogueBox(npcEntry, this.dialogueData, (option) => {
        if (option && option.action) {
          option.action(this.game);
        }
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

    // Update NPC animations (idle breathing / gestures)
    if (this.npcGroup) {
      if (window.FFH.updateNPCAnimation) {
        window.FFH.updateNPCAnimation(this.npcGroup, delta);
      }
      if (!this.npcGroup.userData.mixer) {
        const time = this.game.clock.getElapsedTime();
        const baseY = this.game.phases.CITY_EXPLORATION.playerPos.y;
        this.npcGroup.position.y = baseY + Math.sin(time * 3) * 0.03;
      }
    }
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  exit() {
    this.game.ui.clear();
    const cam = this.game.cameras.mainCamera;
    if (cam && cam.isOrthographicCamera) {
      cam.zoom = 1.0;
      cam.updateProjectionMatrix();
    }
    if (this.npcGroup) {
      this.game.scene.remove(this.npcGroup);
      this.npcGroup = null;
    }
    if (this.dioramaRoom) {
      this.game.scene.remove(this.dioramaRoom);
      this.dioramaRoom = null;
    }

    // Restore the city exploration world meshes visibility
    if (this.game.phases.CITY_EXPLORATION.worldGroup) {
      this.game.phases.CITY_EXPLORATION.worldGroup.visible = true;
    }
    if (this.game.phases.CITY_EXPLORATION.courier) {
      this.game.phases.CITY_EXPLORATION.courier.visible = true;
    }
  }
};
