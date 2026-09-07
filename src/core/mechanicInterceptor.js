window.FFH = window.FFH || {};

window.FFH.MechanicInterceptor = class MechanicInterceptor {
  constructor(game) {
    this.game = game;
  }

  // Returns true if the mechanic was intercepted and handled via a custom UI.
  // Returns false if the storyRunner should just play the scene normally.
  intercept(scene) {
    if (!scene || !scene.unlocks || !scene.unlocks.mechanic) return false;

    const mechanic = scene.unlocks.mechanic;
    const s = this.game.state;

    if (mechanic === 'intercom_choice') {
      this.game.transitionTo('INTERIOR', {
        roomType: 'DOORWAY',
        npcKey: null,
        titleBadge: 'ENTRANCE',
        title: 'Apartment Buzzer',
        text: 'Three names on the buzzer. No apartment numbers.',
        note: 'None of them says Nico.',
        choices: [
          {
            label: 'MEIER',
            borderLeft: '#718096',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('error');
              if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('NEIN! RUHEZEIT!', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
              game.storyRunner.startScene('wg_door'); // Proceed anyway, per JSON
            }
          },
          {
            label: 'HAUSMEISTER SCHMIDT',
            borderLeft: '#718096',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('error');
              if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('No answer...', window.innerWidth/2, window.innerHeight*0.3, '#718096');
              game.storyRunner.startScene('wg_door'); // Proceed anyway, per JSON
            }
          },
          {
            label: 'WG 3B',
            borderLeft: '#2EC4B6',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('success');
              if (window.FFH && window.FFH.saveGame) window.FFH.saveGame(game);
              game.storyRunner.startScene('wg_door');
            }
          }
        ]
      });
      return true;
    }

    if (mechanic === 'muelltrennung_lore') {
      this.game.transitionTo('INTERIOR', {
        roomType: 'WG_ROOM',
        npcKey: 'NPC_NICO',
        titleBadge: 'APARTMENT',
        title: 'Mülltrennung (Garbage Sorting)',
        speaker: 'Nico (Flatmate)',
        text: 'Hey! Before you unpack, you must learn the German way. Where does the empty milk carton go?',
        note: 'Sort the trash correctly to pass.',
        choices: [
          {
            label: 'Restmüll (Black Bin)',
            subtext: 'General waste',
            borderLeft: '#111111',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('error');
              if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('Wrong! Nico sighs loudly.', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
            }
          },
          {
            label: 'Gelber Sack (Yellow Bag)',
            subtext: 'Plastics & Packaging',
            borderLeft: '#F4D03F',
            action: (game, interiorPhase) => {
              if (game.sfx) game.sfx.playSfx('success');
              // Proceed to next json scene
              game.storyRunner.startScene('nico_sends_kruma');
            }
          },
          {
            label: 'Papiertonne (Blue Bin)',
            subtext: 'Paper & Cardboard',
            borderLeft: '#3498DB',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('error');
              if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('Wrong! Nico looks disappointed.', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
            }
          }
        ]
      });
      return true;
    }

    if (mechanic === 'quest_tracking') {
      // Don't intercept the text, but trigger the side effect of showing the quest tracker
      const qt = document.getElementById('city-quest-tracker');
      if (qt) qt.style.opacity = '1';
      this.game.state.questStep = 1;
      this.game.state.activeObjective = '🎓 Sprint to University Campus before 17:00!';
      if (this.game.ui && this.game.ui.updateQuestTracker) {
        this.game.ui.updateQuestTracker();
      }
      return false; // let normal text render
    }

    if (mechanic === 'atmospheric_time_shift') {
      // Golden hour visual change without interrupting the overlay dialogue
      const cx = this.game.phases && this.game.phases.CITY_EXPLORATION;
      if (cx && cx.updateAtmosphericTime) {
        cx.updateAtmosphericTime(0.70); // Golden hour
      }
      return false; // let normal text render
    }

    if (mechanic === 'day1_recap') {
      if (this.game.ui && this.game.ui.showDayRecapModal) {
        this.game.ui.showDayRecapModal(() => {
          this.game.state.questStep = 4;
          this.game.state.activeObjective = 'Tag 2 (07:00): Head to Kruma Express Dark Store for Shift 1!';
          if (this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
          if (this.game.ui.refreshStats) this.game.ui.refreshStats(this.game.state);

          const cx = this.game.phases && this.game.phases.CITY_EXPLORATION;
          if (cx && cx.updateAtmosphericTime) {
            cx.updateAtmosphericTime(0.30); // Morning dawn
          }

          if (this.game.ui.spawnWandererThought) {
            this.game.ui.spawnWandererThought('Day 2. Sun is up, tea is drunk. Time to tackle Kruma Express.');
          }

          if (window.FFH && window.FFH.saveGame) {
            window.FFH.saveGame(this.game);
          }
          this.game.storyRunner.pendingStoryTarget = {
            sceneId: 'shift_1_teach',
            poi: 'B_DARKSTORE'
          };
          this.game.transitionTo('CITY_EXPLORATION', { fromBuildingExit: true });
        });
      }
      return true;
    }

    return false;
  }
};
