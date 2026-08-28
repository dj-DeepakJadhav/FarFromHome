// 3D Interior Diorama Conversation & Narrative Phase
window.FFH = window.FFH || {};

window.FFH.DialoguePhase = class {
  constructor(game) {
    this.game = game;
    this.roomGroup = null;
    this.npcGroup = null;
    this.camera = null;
    this.targetNpcKey = null;
    this.dialogueData = null;
  }

  enter(params = {}) {
    // Clear previous scene objects (like city) so we only see the room diorama
    while (this.game.scene.children.length > 0) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }
    
    // Add ambient lighting for the room since we cleared the scene
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(5, 8, 3);
    dirLight.castShadow = true;
    this.game.scene.add(ambLight, dirLight);

    this.targetNpcKey = params.isDelivery ? 'NPC_DELIVERY_CUSTOMER' : (params.npcKey || 'NPC_RITA');
    const npcEntry = window.FFH.NPC_DATABASE ? window.FFH.NPC_DATABASE[this.targetNpcKey] : null;

    // Restore room diorama rendering for dialogue scenes
    if (npcEntry && npcEntry.roomLevel !== undefined) {
      this.roomGroup = window.FFH[`createLevel${npcEntry.roomLevel}Room`]();
    } else {
      // Default mappings
      if (this.targetNpcKey === 'NPC_RITA') this.roomGroup = window.FFH.createLevel1Room();
      else if (this.targetNpcKey === 'NPC_MATHIAS') this.roomGroup = window.FFH.createLevel2Room();
      else if (this.targetNpcKey === 'NPC_MARTHA') this.roomGroup = window.FFH.createLevel3Room();
      else if (this.targetNpcKey === 'NPC_NINA') this.roomGroup = window.FFH.createLevel4Room();
      else if (this.targetNpcKey === 'NPC_LOKKER') this.roomGroup = window.FFH.createLevel0Room();
      else if (this.targetNpcKey === 'NPC_DELIVERY_CUSTOMER') this.roomGroup = window.FFH.createLevel3Room();
      else this.roomGroup = window.FFH.createLevel4Room();
    }

    this.game.scene.add(this.roomGroup);

    // Also try to add the NPC mesh if possible
    if (window.FFH.createNPCMesh) {
       this.npcGroup = window.FFH.createNPCMesh(npcEntry ? npcEntry.modelKey || 'NPC_CHAR_A' : 'NPC_CHAR_A');
       this.npcGroup.position.set(0.5, 0.05, 0); // Position inside the diorama
       this.npcGroup.rotation.y = -Math.PI / 4;
       this.roomGroup.add(this.npcGroup);
    }

    // 3. Trigger Character Greeting Voice
    if (this.game.speech && npcEntry?.greetingAudio) {
      this.game.speech.speakKey(npcEntry.greetingAudio);
    }

    // 4. Render Visual Dialogue UI

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
  }

  update(delta) {
    // Gentle idle breathing / bobbing animation for NPC
    if (this.npcGroup) {
      const time = this.game.clock.getElapsedTime();
      this.npcGroup.position.y = Math.sin(time * 3) * 0.03;
    }
  }

  exit() {
    this.game.ui.clear();
  }
};
