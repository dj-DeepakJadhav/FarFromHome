// 3D Cinematic In-World Conversation Phase
window.FFH = window.FFH || {};

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
    // 1. Hide City Explorer UI elements
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';

    this.targetNpcKey = params.isDelivery ? 'NPC_DELIVERY_CUSTOMER' : (params.npcKey || 'NPC_RITA');
    const npcEntry = window.FFH.NPC_DATABASE ? window.FFH.NPC_DATABASE[this.targetNpcKey] : null;

    // 2. Spawn NPC in the world relative to player position
    const cityPhase = this.game.phases.CITY_EXPLORATION;
    const playerPos = cityPhase.playerPos;
    const playerHeading = cityPhase.playerHeading;

    if (window.FFH.createNPCMesh) {
      this.npcGroup = window.FFH.createNPCMesh(npcEntry ? npcEntry.modelKey || 'NPC_CHAR_A' : 'NPC_CHAR_A');
      
      // Place NPC roughly 3.5 units in front of player
      const npcDist = 3.5;
      this.npcGroup.position.set(
        playerPos.x + Math.sin(playerHeading) * npcDist,
        playerPos.y,
        playerPos.z + Math.cos(playerHeading) * npcDist
      );
      // NPC faces player
      this.npcGroup.rotation.y = playerHeading + Math.PI;
      this.game.scene.add(this.npcGroup);
    }

    // 3. Setup Cinematic Over-the-Shoulder (OTS) Camera Lerp
    this.startCamPos.copy(this.game.cameras.cityCamera.position);
    
    // Default walk camera target is player pos (with slight pitch)
    // We want the end camera to be over the player's right shoulder, looking at NPC
    const offsetRight = new THREE.Vector3(-Math.cos(playerHeading), 0, Math.sin(playerHeading)).multiplyScalar(1.8);
    const offsetBack = new THREE.Vector3(-Math.sin(playerHeading), 0, -Math.cos(playerHeading)).multiplyScalar(2.2);
    
    this.endCamPos.copy(playerPos).add(offsetRight).add(offsetBack);
    this.endCamPos.y += 2.0; // Camera height slightly above shoulder

    // The target we want to look at is the NPC's face
    this.endCamTarget.copy(this.npcGroup ? this.npcGroup.position : playerPos);
    this.endCamTarget.y += 1.8;

    // We need a smooth transition
    this.isTransitioning = true;
    this.transitionTime = 0;

    // 4. Trigger Character Greeting Voice
    if (this.game.speech && npcEntry?.greetingAudio) {
      this.game.speech.speakKey(npcEntry.greetingAudio);
    }

    // 5. Render Visual Dialogue UI (slightly delayed for cinematic effect)
    setTimeout(() => {
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
    }, 600);
  }

  update(delta) {
    // Smooth camera transition
    if (this.isTransitioning) {
      this.transitionTime += delta * 2.0; // speed
      if (this.transitionTime >= 1.0) {
        this.transitionTime = 1.0;
        this.isTransitioning = false;
      }
      
      const t = this.easeInOutQuad(this.transitionTime);
      this.game.cameras.cityCamera.position.lerpVectors(this.startCamPos, this.endCamPos, t);
      
      // Interpolate look target
      const startTarget = this.game.phases.CITY_EXPLORATION.playerPos.clone().setY(1.0);
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget, this.endCamTarget, t);
      this.game.cameras.cityCamera.lookAt(currentTarget);
    }

    // Gentle idle breathing for NPC
    if (this.npcGroup) {
      const time = this.game.clock.getElapsedTime();
      const baseY = this.game.phases.CITY_EXPLORATION.playerPos.y;
      this.npcGroup.position.y = baseY + Math.sin(time * 3) * 0.03;
    }
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  exit() {
    this.game.ui.clear();
    if (this.npcGroup) {
      this.game.scene.remove(this.npcGroup);
      this.npcGroup = null;
    }
  }
};
