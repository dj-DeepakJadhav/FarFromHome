// City Building Interactions & Story Transitions
window.FFH = window.FFH || {};

window.FFH.handleCityBuildingInteraction = function(phase, poiType) {
    if (this.game.templateManager) {
      const template = this.game.templateManager.getInteractionForPOI(poiType);
      if (template) {
        this.game.templateManager.executeTemplate(template, this);
        return;
      }
    }

    const sr = this.game.storyRunner;
    const s = this.game.state;
    console.log(`[TBI] poi=${poiType} | buzzed=${s.hasBuzzedWG} | mull=${s.hasDoneMuelltrennung} | uni=${s.hasVisitedLockedUni} | pending=${sr && sr.pendingStoryTarget ? sr.pendingStoryTarget.poi : 'none'}`);

    // Check if it's the pending story target
    if (sr && sr.pendingStoryTarget && poiType === sr.pendingStoryTarget.poi) {
      const nextSceneId = sr.resolveSceneId ? sr.resolveSceneId(sr.pendingStoryTarget.sceneId) : sr.pendingStoryTarget.sceneId;
      sr.pendingStoryTarget = null;
      if (this.game.ui && this.game.ui.hideCompassUI) {
        this.game.ui.hideCompassUI();
      }
      this.game.state.activeObjective = null;
      const qt = document.getElementById('city-quest-tracker');
      if (qt) qt.style.opacity = '0';
      console.log(`CityExploration: Player tapped ${poiType}. Launching scene "${nextSceneId}".`);
      sr.startScene(nextSceneId);
      return;
    }

    let targetNpc = null;
    let storyScene = null;

    // Clean display name mapping for any technical poi names
    const friendlyPoiNames = {
      'B_ZOB': 'Train Station (ZOB)',
      'B_WG': 'Student WG (Apartment)',
      'B_UNI': 'University Campus',
      'B_PIZZA': 'Pizzeria Bella',
      'B_BAKERY': 'Bakery Hansa',
      'B_DARKSTORE': 'Kruma Express Hub',
      'B_RATHAUS': 'Rathaus (City Hall)',
      'B_AUSLAENDER': 'Ausländerbehörde',
      'B_SUPERMARKET': 'Supermarket',
      'LM_MARKTPLATZ': 'Marktplatz'
    };
    const cleanPoiName = friendlyPoiNames[poiType] || poiType.replace(/^B_/, '').replace(/_/g, ' ');

    // ---------------------------------------------------------------------
    // CANONICAL ACT ONE STATE MACHINE (Docs/ACT_ONE_BRITISH_COMEDY.md)
    // ---------------------------------------------------------------------
    const Stages = window.FFH.ACT1_STAGES || {};
    const curStage = s.act1Stage || Stages.ARRIVAL_ZOB;
    console.log(`[Act1FSM] Interacted with ${poiType} during stage ${curStage}`);

    // Helper: Safely exit to city after non-modal or rejected interaction
    const cancelAndExit = () => {
      this.isEnteringBuilding = false;
      this.inputDisabled = false;
      this.startBuildingExit();
    };

    // 1. WG INTERCOM & ROOM 4
    if (poiType === 'B_WG') {
      if (curStage === Stages.ARRIVAL_ZOB) {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("I just arrived at the station. Let me choose my path first.");
        }
        cancelAndExit();
        return;
      }

      if (curStage === Stages.TRANSIT_TO_WG || curStage === Stages.WG_DOOR) {
        s.act1Stage = Stages.WG_DOOR;
        this.game.transitionTo('INTERIOR', {
          roomType: 'DOORWAY',
          npcKey: null,
          titleBadge: 'ENTRANCE',
          title: 'Apartment Buzzer',
          text: 'There are three names on the bells. The landlord said my flatmate is named Nico.',
          note: 'Ring the correct bell to enter.',
          choices: [
            {
              label: 'Müller',
              borderLeft: '#718096',
              action: (game) => {
                if (game.sfx) game.sfx.playSfx('error');
                if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('No answer...', window.innerWidth/2, window.innerHeight*0.3, '#718096');
              }
            },
            {
              label: 'Schmidt / Nico',
              borderLeft: '#2EC4B6',
              action: (game) => {
                if (game.sfx) game.sfx.playSfx('success');
                s.act1Stage = Stages.WG_ROOM4;
                if (window.FFH && window.FFH.saveGame) window.FFH.saveGame(game);
                this.triggerBuildingInteraction('B_WG_ENTERED');
              }
            },
            {
              label: 'Hausverwaltung',
              borderLeft: '#718096',
              action: (game) => {
                if (game.sfx) game.sfx.playSfx('error');
                if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('An angry voice yells: "Keine Werbung!"', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
              }
            }
          ]
        });
        return;
      }

      if (curStage === Stages.WG_ROOM4) {
        this.triggerBuildingInteraction('B_WG_ENTERED');
        return;
      }

      if (curStage === Stages.RETURN_TO_WG || curStage === Stages.JOB_HUNT_BAKERY) {
        if (this.game.ui && this.game.ui.showDayRecapModal) {
          this.game.ui.showDayRecapModal(() => {
            s.act1Stage = Stages.DAY1_SLEEP;
            s.day = 2;
            s.questStep = 4;
            s.activeObjective = 'Tag 2 (07:00): Head to Kruma Express Dark Store for Shift 1!';
            if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
            if (this.game.ui && this.game.ui.refreshStats) this.game.ui.refreshStats(this.game.state);

            // Transition lighting to Day 2 morning dawn (0.30)!
            this.updateAtmosphericTime(0.30);

            if (this.game.ui && this.game.ui.spawnWandererThought) {
              this.game.ui.spawnWandererThought(
                "Day 2. Sun is up, tea is drunk, and my landlord is still threatening eviction. Time to tackle Kruma Express."
              );
            }

            this.isEnteringBuilding = false;
            this.inputDisabled = false;
            if (window.FFH && window.FFH.saveGame) {
              window.FFH.saveGame(this.game);
            }
            this.startBuildingExit();
          });
          return;
        }
      }

      // Default WG interaction if visited out of sequence
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("My room key is in my pocket, but I need to finish my errands first.");
      }
      cancelAndExit();
      return;
    }

    // 2. INSIDE WG ROOM 4 (Nico & Mülltrennung)
    if (poiType === 'B_WG_ENTERED') {
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
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('success');
              s.act1Stage = Stages.TRANSIT_TO_UNI;
              
              // Transition to Urgent Tuition Letter on desk
              game.transitionTo('INTERIOR', {
                roomType: 'WG_ROOM',
                npcKey: null,
                titleBadge: 'DESK',
                title: 'Urgent Letter',
                text: 'You spot a letter on your desk. It says: "Achtung: Exmatrikulation upon failure to pay €250 semester fee by Friday."',
                note: 'I need to head to the University Campus immediately to sort this out.',
                choices: [
                  {
                    label: 'Leave Apartment',
                    subtext: 'Sprint to University Campus.',
                    borderLeft: '#2EC4B6',
                    action: (game2, interiorPhase2) => {
                      game2.state.questStep = 1;
                      game2.state.activeObjective = '🎓 Sprint to University Campus before 17:00!';
                      if (game2.storyRunner) {
                        game2.storyRunner.pendingStoryTarget = { sceneId: 'uni_closed', poi: 'B_UNI' };
                      }
                      if (game2.ui && game2.ui.updateQuestTracker) {
                        game2.ui.updateQuestTracker();
                      }
                      // Smooth transition to golden hour (16:45)
                      this.updateAtmosphericTime(0.70);

                      if (game2.ui && game2.ui.spawnWandererThought) {
                        setTimeout(() => {
                          game2.ui.spawnWandererThought(
                            "The sun is going down. The city looks dead pretty in this golden light. Still completely broke, of course, but the scenery is lovely."
                          );
                        }, 1200);
                      }

                      this.isEnteringBuilding = false;
                      this.inputDisabled = false;
                      this.isShowingInteriorModal = false;
                      if (window.FFH && window.FFH.saveGame) {
                        window.FFH.saveGame(game2);
                      }
                      interiorPhase2.exitToCity();
                    }
                  }
                ]
              });
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
      return;
    }

    // 3. UNIVERSITÄT ZU LÜBECK (Closed Door Notice)
    if (poiType === 'B_UNI' || poiType.includes('Universität') || poiType.includes('University')) {
      if (curStage === Stages.TRANSIT_TO_UNI || curStage === Stages.UNI_LOCKED) {
        this.game.transitionTo('INTERIOR', {
          roomType: 'UNI',
          npcKey: null,
          titleBadge: 'UNIVERSITÄT',
          title: 'Campus Admissions',
          text: 'The financial office is closed. A heavy wooden door blocks the way. A notice on the wall reads: "Payment deadline: Friday. Failure to pay will result in Exmatrikulation."',
          note: 'I need to find a job immediately. Pizzeria Bella might be hiring.',
          choices: [
            {
              label: 'Leave Campus',
              subtext: 'Search for work in town.',
              borderLeft: '#E76F51',
              action: (game, interiorPhase) => {
                s.act1Stage = Stages.JOB_HUNT_PIZZA;
                game.state.questStep = 2;
                game.state.activeObjective = '🍕 Try Pizzeria Bella for work — ask about a job';
                if (game.storyRunner) {
                  game.storyRunner.pendingStoryTarget = { sceneId: 'pizzeria_job', poi: 'B_PIZZA' };
                }
                if (game.ui && game.ui.updateQuestTracker) {
                  game.ui.updateQuestTracker();
                }

                // Transition atmosphere to Baltic night (19:00, progress 0.88)
                this.updateAtmosphericTime(0.88);

                if (game.ui && game.ui.spawnWandererThought) {
                  setTimeout(() => {
                    game.ui.spawnWandererThought(
                      "Great. It's pitch black, freezing cold, and I still don't have a job. Check the pizzeria for flyers."
                    );
                  }, 1200);
                }

                this.isEnteringBuilding = false;
                this.inputDisabled = false;
                this.isShowingInteriorModal = false;
                if (window.FFH && window.FFH.saveGame) {
                  window.FFH.saveGame(game);
                }
                interiorPhase.exitToCity();
              }
            }
          ]
        });
        return;
      }

      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("I should drop my luggage at the student WG first before wandering onto campus.");
      }
      cancelAndExit();
      return;
    }

    // 4. PIZZERIA BELLA (Mathias Job Rejection)
    if (poiType === 'B_PIZZA' || poiType.includes('Pizza')) {
      if (curStage === Stages.JOB_HUNT_PIZZA) {
        if (this.game.ui && this.game.ui.showPizzeriaJobModal) {
          this.showInteriorModal(window.FFH.createPizzeriaRoom, 'NPC_MATHIAS', (cleanup) => {
            this.game.ui.showPizzeriaJobModal(() => {
              cleanup();
              s.act1Stage = Stages.JOB_HUNT_BAKERY;
              s.questStep = 3;
              s.activeObjective = '🥐 Rejected at Pizzeria! Try Bakery Hansa for work.';
              if (this.game.storyRunner) {
                this.game.storyRunner.pendingStoryTarget = { sceneId: 'bakery_job', poi: 'B_BAKERY' };
              }
              if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
              this.isEnteringBuilding = false;
              this.inputDisabled = false;
              if (window.FFH && window.FFH.saveGame) {
                window.FFH.saveGame(this.game);
              }
              this.startBuildingExit();
            });
          });
          return;
        }
      }

      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("Smells of fresh garlic and oregano, but I have places to be right now.");
      }
      cancelAndExit();
      return;
    }

    // 5. BÄCKEREI HANSA (Oma Martha Rejection & Kruma Reveal)
    if (poiType === 'B_BAKERY' || poiType.includes('Bakery') || poiType.includes('Bäcker')) {
      if (curStage === Stages.JOB_HUNT_BAKERY) {
        if (this.game.ui && this.game.ui.showBakeryJobModal) {
          this.showInteriorModal(window.FFH.createBakeryRoom, 'NPC_MARTHA', (cleanup) => {
            this.game.ui.showBakeryJobModal(() => {
              cleanup();
              s.act1Stage = Stages.RETURN_TO_WG;
              s.questStep = 4;
              s.activeObjective = '🏠 Rejected at Bakery! Head back to WG to sleep.';
              if (this.game.storyRunner) {
                this.game.storyRunner.pendingStoryTarget = { sceneId: 'day1_sleep', poi: 'B_WG' };
              }
              if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
              this.isEnteringBuilding = false;
              this.inputDisabled = false;
              if (window.FFH && window.FFH.saveGame) {
                window.FFH.saveGame(this.game);
              }
              this.startBuildingExit();
            });
          });
          return;
        }
      }

      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("Warm crusty rye bread in the window. No time to browse pastries just yet.");
      }
      cancelAndExit();
      return;
    }

    // 6. KRUMA EXPRESS DARK STORE
    if (poiType === 'B_DARKSTORE' || poiType.includes('Kruma') || poiType.includes('Dark Store')) {
      if (s.day >= 2 || curStage === Stages.DAY1_SLEEP) {
        targetNpc = 'NPC_NINA';
        storyScene = 'knot_money';
      } else {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("Kruma Express warehouse. Shutter doors are down for the night. Opens tomorrow at 07:00.");
        }
        cancelAndExit();
        return;
      }
    }

    // 7. ZOB & TRANSIT HUB
    if (poiType === 'B_ZOB' || poiType.includes('ZOB') || poiType.includes('Station')) {
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought(
          "Bus Timetable: 'No buses inside town center. Walk.' Brilliant. Welcome to Germany, mate. Drag your 25kg suitcase across the cobblestones."
        );
      }
      cancelAndExit();
      return;
    }

    // 8. OTHER STORY & CIVIC BUILDINGS
    if (poiType.includes('Hostel') || poiType.includes('Dorm')) {
      targetNpc = 'NPC_WEBER';
      storyScene = 'the_circle_2';
    } else if (poiType.includes('Ausländer') || poiType.includes('Office') || poiType.includes('Dom') || poiType === 'B_AUSLAENDER') {
      targetNpc = 'NPC_LINDEMANN';
      storyScene = 'act_five';
    }

    if (sr && storyScene && (sr.scenesById ? sr.scenesById[storyScene] : sr.scenes[storyScene])) {
      sr.startScene(storyScene);
    } else if (targetNpc) {
      this.game.transitionTo('DIALOGUE', { npcKey: targetNpc });
    } else {
      this.game.ui.spawnFloatingText(`Visited: ${cleanPoiName}`, window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
      if (this.game.sfx && this.game.sfx.playSfx) {
        this.game.sfx.playSfx('success');
      }
      cancelAndExit();
    }
  };
