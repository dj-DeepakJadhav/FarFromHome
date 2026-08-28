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
    this.targetNpcKey = params.isDelivery ? 'NPC_DELIVERY_CUSTOMER' : (params.npcKey || 'NPC_RITA');
    const npcEntry = window.FFH.NPC_DATABASE ? window.FFH.NPC_DATABASE[this.targetNpcKey] : null;

    // 1. We NO LONGER clear the scene. We overlay the dialogue UI on top of whatever (e.g. City View).
    // The instructions say: "Create sliding bottom dialogue card directly inside the city view (no cutaway void boxes)."
    // So we just leave the camera and scene exactly as they are from the previous phase (likely cityExplorationPhase).

    // 2. We DO NOT spawn the roomGroup anymore to avoid cutting away to a void box.
    // If the game needs a character mesh, we could spawn it in front of the camera, but for the milestone, 
    // simply putting the dialogue card directly in the city view is what's required.

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
