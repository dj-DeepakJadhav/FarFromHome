window.FFH = window.FFH || {};

window.FFH.StoryGraph = [
  {
    id: "WG_BUZZER",
    poi: "B_WG",
    prereq: ["ZOB_CHOICE"], // Unlocked only after choosing route at ZOB
    type: "isometric_room",
    roomLayout: "DOORWAY",
    npc: null,
    titleBadge: "ENTRANCE",
    title: "Apartment Buzzer",
    text: "There are three names on the bells. The landlord said my flatmate is named Nico.",
    note: "Ring the correct bell to enter.",
    choices: [
      {
        label: "Müller",
        borderLeft: "#718096",
        action: (game) => {
          if (game.sfx) game.sfx.playSfx('error');
          if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('No answer...', window.innerWidth/2, window.innerHeight*0.3, '#718096');
        }
      },
      {
        label: "Schmidt / Nico",
        borderLeft: "#2EC4B6",
        action: (game) => {
          if (game.sfx) game.sfx.playSfx('success');
          if (window.FFH.completeNode) window.FFH.completeNode(game, "WG_BUZZER");
          const next = game.templateManager.getInteractionForPOI('B_WG_ENTERED');
          if (next) {
            game.templateManager.executeTemplate(next);
          }
        }
      },
      {
        label: "Hausverwaltung",
        borderLeft: "#718096",
        action: (game) => {
          if (game.sfx) game.sfx.playSfx('error');
          if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('An angry voice yells: "Keine Werbung!"', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
        }
      }
    ]
  },
  {
    id: "WG_MULLTRENNUNG",
    poi: "B_WG_ENTERED",
    prereq: ["WG_BUZZER"],
    type: "isometric_room",
    roomLayout: "WG_ROOM",
    npc: "NPC_NICO",
    titleBadge: "APARTMENT",
    title: "Mülltrennung (Garbage Sorting)",
    speaker: "Nico (Flatmate)",
    text: "Hey! Before you unpack, you must learn the German way. Where does the empty milk carton go?",
    note: "Sort the trash correctly to pass.",
    choices: [
      {
        label: "Restmüll (Black Bin)",
        subtext: "General waste",
        borderLeft: "#111111",
        action: (game) => {
          if (game.sfx) game.sfx.playSfx('error');
          if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('Wrong! Nico sighs loudly.', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
        }
      },
      {
        label: "Gelber Sack (Yellow Bag)",
        subtext: "Plastics & Packaging",
        borderLeft: "#F4D03F",
        action: (game) => {
          if (game.sfx) game.sfx.playSfx('success');
          if (window.FFH.completeNode) window.FFH.completeNode(game, "WG_MULLTRENNUNG");
          const next = game.templateManager.getInteractionForPOI('B_WG_DESK');
          if (next) {
            game.templateManager.executeTemplate(next);
          }
        }
      },
      {
        label: "Papiertonne (Blue Bin)",
        subtext: "Paper & Cardboard",
        borderLeft: "#3498DB",
        action: (game) => {
          if (game.sfx) game.sfx.playSfx('error');
          if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('Wrong! Nico looks disappointed.', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
        }
      }
    ]
  },
  {
    id: "WG_URGENT_LETTER",
    poi: "B_WG_DESK",
    prereq: ["WG_MULLTRENNUNG"],
    type: "isometric_room",
    roomLayout: "WG_ROOM",
    npc: null,
    titleBadge: "DESK",
    title: "Urgent Letter",
    text: 'You spot a letter on your desk. It says: "Achtung: Exmatrikulation upon failure to pay €250 semester fee by Friday."',
    note: "I need to head to the University Campus immediately to sort this out.",
    choices: [
      {
        label: "Leave Apartment",
        subtext: "Sprint to University Campus.",
        borderLeft: "#2EC4B6",
        action: (game, interiorPhase) => {
          if (window.FFH.completeNode) window.FFH.completeNode(game, "WG_URGENT_LETTER");
          const s = game.state;
          s.act1Stage = window.FFH.ACT1_STAGES.TRANSIT_TO_UNI;
          s.questStep = 1;
          s.activeObjective = '🎓 Sprint to University Campus before 17:00!';
          if (game.storyRunner) {
            game.storyRunner.pendingStoryTarget = { sceneId: 'uni_closed', poi: 'B_UNI' };
          }
          if (game.ui && game.ui.updateQuestTracker) game.ui.updateQuestTracker();
          if (window.FFH.saveGame) window.FFH.saveGame(game);

          const doExit = () => {
            if (interiorPhase && interiorPhase.exitToCity) {
              interiorPhase.exitToCity();
            } else if (game.transitionTo) {
              game.transitionTo('CITY_EXPLORATION');
            }

            const city = game.phases && game.phases.CITY_EXPLORATION;
            if (city) {
              city.updateAtmosphericTime && city.updateAtmosphericTime(0.70);
              city.isEnteringBuilding = false;
              city.inputDisabled = false;
              city.startBuildingExit && city.startBuildingExit();
              if (game.ui && game.ui.spawnWandererThought) {
                setTimeout(() => {
                  game.ui.spawnWandererThought("Still broke. Nice light, though.");
                }, 1200);
              }
            }
          };

          if (game.ui && game.ui.fadeToBlack) {
            game.ui.fadeToBlack(300, () => {
              doExit();
              if (game.ui && game.ui.fadeFromBlack) game.ui.fadeFromBlack(300);
            });
          } else {
            doExit();
          }
        }
      }
    ]
  }
];

window.FFH.completeNode = function(game, nodeId) {
  game.state.completedNodes = game.state.completedNodes || {};
  game.state.completedNodes[nodeId] = true;
};

window.FFH.isNodeUnlocked = function(game, node) {
  if (!node.prereq || node.prereq.length === 0) return true;
  const completed = game.state.completedNodes || {};
  if (game.state && (game.state.actOneChoiceDone || (game.state.act1Stage && game.state.act1Stage !== 'ARRIVAL_ZOB'))) {
    completed["ZOB_CHOICE"] = true;
  }
  return node.prereq.every(p => completed[p] === true);
};

window.FFH.TemplateManager = class {
  constructor(game) {
    this.game = game;
    this.graph = window.FFH.StoryGraph || [];
  }

  getInteractionForPOI(poiType) {
    // Return the FIRST matching node that is UNLOCKED but NOT YET COMPLETED
    const completed = this.game.state.completedNodes || {};
    return this.graph.find(node => 
      node.poi === poiType && 
      !completed[node.id] && 
      window.FFH.isNodeUnlocked(this.game, node)
    );
  }

  executeTemplate(template) {
    if (!template) return;
    if (template.type === 'isometric_room') {
      const config = {
        roomType: template.roomType || template.roomLayout || 'DOORWAY',
        npcKey: template.npcKey || template.npc || null,
        titleBadge: template.titleBadge || 'LOCATION',
        title: template.title || '',
        speaker: template.speaker || '',
        text: template.text || '',
        note: template.note || '',
        choices: template.choices || []
      };

      if (this.game.ui && this.game.ui.fadeToBlack && this.game.currentPhaseName !== 'INTERIOR') {
        this.game.ui.fadeToBlack(250, () => {
          this.game.transitionTo('INTERIOR', config);
          if (this.game.ui && this.game.ui.fadeFromBlack) {
            this.game.ui.fadeFromBlack(250);
          }
        });
      } else {
        this.game.transitionTo('INTERIOR', config);
      }
    }
  }
};
