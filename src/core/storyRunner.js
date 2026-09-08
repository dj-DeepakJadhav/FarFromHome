// Dynamic Story Interpreter & Runtime Engine
// Single Source of Truth: assets/narrative/story.json
window.FFH = window.FFH || {};

window.FFH.StoryRunner = class {
  constructor(game) {
    this.game = game;
    this.data = window.FFH.storyData || null;
    this.currentSceneId = null;
    this.currentScene = null;
    this.history = [];
    // When set, city exploration will guide the player to this POI
    // before launching the target scene (exploration handshake).
    this.pendingStoryTarget = null;
  }

  // Modular Story Channel & Identifier Resolver
  // Routes to 'b_' (British Comedy) storyboard when activeStoryChannel is 'british',
  // with fallback to legacy scenes if configured or when no 'b_' override exists.
  // Phase identity. `game.currentPhase` holds the phase OBJECT, so comparing it
  // to a string literal was always true and every guard below silently passed.
  // Compare against `currentPhaseName`, which holds the key.
  phaseIs(...names) {
    return names.indexOf(this.game.currentPhaseName) !== -1;
  }

  // Interior / exterior routing is declared by the scene, not guessed from the
  // location name. `stage.space` is authored in story.json for all 85 scenes:
  //   exterior  -> open world, free movement
  //   threshold -> at a door, not yet admitted (city still visible behind)
  //   interior  -> inside a room diorama
  spaceOf(scene) {
    const st = scene && scene.stage;
    const space = st && st.space;
    if (space === 'interior' || space === 'exterior' || space === 'threshold') {
      return space;
    }
    // Legacy fallback for any scene authored without the field.
    const loc = (st && st.loc) || '';
    return loc.startsWith('LM_') || loc.endsWith('_YARD') ? 'exterior' : 'interior';
  }

  phaseForSpace(space) {
    return space === 'exterior' ? 'CITY_EXPLORATION' : 'DIALOGUE';
  }

  // The scene's first cast member is the speaker the diorama should build.
  // Falling back to NPC_NICO for every scene is what put Nico behind the
  // bakery counter and the Rathaus desk.
  // Prose plays as a cancellable queue, not a fan of fire-and-forget timers,
  // so a tap can advance to the next line. The old version scheduled every
  // line upfront at a fixed offset, which is why narration could not be
  // skipped at all. `onDone` runs once the last line has had its time.
  playProseQueue(lines, onDone) {
    this.cancelProseQueue();
    let i = 0;
    const step = () => {
      if (document.hidden || document.getElementById('ffh-pause-modal')) {
        this._proseTimer = setTimeout(step, 100);
        return;
      }
      if (i >= lines.length) {
        this._proseTimer = null;
        window.FFH.advanceProse = null;
        if (onDone) onDone();
        return;
      }
      const line = lines[i++];
      // ~52ms/char with a 1.8s floor. 72ms/char was unreadably slow and
      // unskippable; 38ms/char overshot and outran the reader. Bubbles are
      // tap-to-advance, so this is a ceiling for anyone who wants to linger.
      const lineTime = (line.length * 22) + Math.max(1800, line.length * 30);
      if (this.game.ui && this.game.ui.showThoughtBubble) {
        this.game.ui.showThoughtBubble(line, lineTime);
      }
      this._proseTimer = setTimeout(step, lineTime + 350);
    };
    // Tapping a bubble skips its remaining dwell and shows the next line.
    window.FFH.advanceProse = () => {
      if (this._proseTimer) {
        clearTimeout(this._proseTimer);
        this._proseTimer = null;
      }
      step();
    };
    step();
  }

  cancelProseQueue() {
    if (this._proseTimer) {
      clearTimeout(this._proseTimer);
      this._proseTimer = null;
    }
    window.FFH.advanceProse = null;
  }

  npcKeyFor(scene) {
    return (scene && scene.cast && scene.cast.length) ? scene.cast[0] : null;
  }

  // A scene with no cast has nobody in it. Ten scenes are authored that way on
  // purpose (reading a flyer alone, the canal at night, the final beat), and
  // every one of them was building an NPC diorama and defaulting it to
  // NPC_NICO, so Nico stood in for the narrator at the ending.
  // stage.loc -> the interior room to build. Used when a scene is declared
  // interior but has no cast: it still happens indoors, so the room has to be
  // built explicitly. Before this, such a scene simply played in whatever phase
  // the player happened to be in, so an office beat could run in the street.
  roomTypeFor(loc) {
    return ({
      B_WG: 'WG_ROOM',
      B_UNI: 'UNI',
      B_PIZZA: 'PIZZERIA',
      B_BAKERY: 'BAKERY',
      B_DARKSTORE: 'DARKSTORE',
      B_RATHAUS: 'RATHAUS',
      B_BANK: 'BANK',
      B_AUSLAENDER: 'AUSLAENDER',
      B_BIKESHOP: 'BIKESHOP'
    })[loc] || null;
  }

  hasSpeaker(scene) {
    return !!this.npcKeyFor(scene);
  }

  resolveSceneId(sceneId) {
    if (!sceneId) return sceneId;
    const prefix = 'b_';
    const channel = (this.game && this.game.state && this.game.state.activeStoryChannel) || 'british';

    if (channel === 'british') {
      // If already prefixed with b_, check direct
      if (sceneId.startsWith(prefix)) {
        return sceneId;
      }
      // Check if a dedicated b_ override scene exists in our registry or scenes
      const britishCandidate = `${prefix}${sceneId}`;
      if (this.scenesById && this.scenesById[britishCandidate]) {
        return britishCandidate;
      }
    }
    return sceneId;
  }

  // Lookup table of which POI each scene id belongs to.
  // When the target scene is at a DIFFERENT location from the current scene,
  // we break the dialogue chain and drop the player into city exploration.
  _getSceneLoc(sceneId) {
    const resolvedId = this.resolveSceneId(sceneId);
    const scene = this.scenesById && (this.scenesById[resolvedId] || this.scenesById[sceneId]);
    if (scene && scene.stage && scene.stage.loc) {
      return scene.stage.loc;
    }
    // Fallback POI mappings for British comedy beats
    if (window.FFH.BRITISH_POI_FALLBACK && window.FFH.BRITISH_POI_FALLBACK[resolvedId]) {
      return window.FFH.BRITISH_POI_FALLBACK[resolvedId];
    }
    return null;
  }

  init() {
    if (!this.data && window.FFH.storyData) {
      this.data = window.FFH.storyData;
    }
    if (this.data) {
      this.initSceneMap();
      return;
    }

    // If running in dev mode via HTTP server without pre-inlined storyData
    if (typeof fetch === 'function') {
      fetch('assets/narrative/story.json')
        .then(res => res.json())
        .then(data => {
          this.data = data;
          window.FFH.storyData = data;
          this.initSceneMap();
          console.log('FFH.StoryRunner: Loaded story.json dynamically in dev mode.');
        })
        .catch(err => {
          console.warn('FFH.StoryRunner: Could not fetch story.json:', err);
        });
    }
  }

  initSceneMap() {
    this.scenesById = {};
    if (this.data && this.data.scenes) {
      for (const scene of this.data.scenes) {
        this.scenesById[scene.id] = scene;
      }
    }
  }

  evaluateExpr(expr, state) {
    return window.FFH.evaluateStoryExpr(expr, state);
  }

  checkGate(gate, state) {
    return window.FFH.checkStoryGate(gate, state);
  }

  applyEffects(effects) {
    if (!effects || !effects.length) return;
    const state = this.game.state;

    for (const eff of effects) {
      if (!eff.var) continue;
      const res = this.evaluateExpr(eff.expr, state);
      if (res !== null && res !== undefined) {
        state[eff.var] = res;
        if (eff.var === 'wallet' && typeof state[eff.var] === 'number') {
          state[eff.var] = Math.round(state[eff.var] * 100) / 100;
        }
      }
    }

    this.checkHealthState();
    if (this.game.ui && this.game.ui.updatePersistentHUD) {
      this.game.ui.updatePersistentHUD(state);
    }
    
    if (this.phaseIs('CITY_EXPLORATION') && this.game.ui && this.game.ui.refreshStats) {
      // Refresh the stats visibly in the HUD without a full DOM teardown
      this.game.ui.refreshStats(state);
    }
  }

  checkHealthState() {
    window.FFH.checkStoryHealth(this.game.state, this.game.ui);
  }

  interpolate(text) {
    return window.FFH.interpolateStoryText(text, this.game.state);
  }

  // An objective that has been reached should leave the HUD immediately, not
  // linger until something happens to overwrite it. Called when a pending
  // travel target resolves and whenever a scene begins.
  clearObjective() {
    const st = this.game.state;
    if (!st || !st.activeObjective) return;
    st.activeObjective = null;
    st.isTypingObjective = false;
    if (this.game.ui && this.game.ui.updatePersistentHUD) {
      this.game.ui.updatePersistentHUD(st);
    }
    if (this.game.ui && this.game.ui.updateCityExplorerHUD) {
      this.game.ui.updateCityExplorerHUD(0, 0, false);   // drop the range readout too
    }
  }

  startScene(sceneId) {
    this.cancelProseQueue();
    if (!this.scenesById) {
      this.initSceneMap();
    }

    const resolvedId = this.resolveSceneId(sceneId);
    const channel = (this.game && this.game.state && this.game.state.activeStoryChannel) || 'british';

    // handleBritishSpecialBeats logic removed, storyRunner now plays all scenes natively

    const scene = this.scenesById ? (this.scenesById[resolvedId] || this.scenesById[sceneId]) : null;
    if (!scene) {
      console.error(`StoryRunner: Scene "${sceneId}" (resolved as "${resolvedId}") not found in story.json.`);
      return;
    }

    this.currentSceneId = resolvedId;
    this.currentScene = scene;
    this.history.push(resolvedId);

    if (scene.effects && scene.effects.length) {
      this.applyEffects(scene.effects);
    }

    if (scene.unlocks) {
      this.handleUnlocks(scene.unlocks);
    }

    if (!this.mechanicInterceptor) {
      if (window.FFH.MechanicInterceptor) {
        this.mechanicInterceptor = new window.FFH.MechanicInterceptor(this.game);
      }
    }
    const intercepted = this.mechanicInterceptor ? this.mechanicInterceptor.intercept(scene) : false;
    
    if (!intercepted) {
      this.renderScene(scene);
    }
    if (this.game.ui && this.game.ui.updatePersistentHUD) {
      this.game.ui.updatePersistentHUD(this.game.state);
    }
  }

  handleUnlocks(unlocks) {
    const s = this.game.state;
    if (unlocks.mechanic) {
      s[unlocks.mechanic] = true;
    }
    if (unlocks.ui && Array.isArray(unlocks.ui)) {
      for (const uiId of unlocks.ui) {
        const el = document.getElementById(uiId);
        if (el) el.style.display = '';
      }
    }
  }

  applyStage(stage, audioList = []) {
    if (!stage) return;
    const g = this.game;

    // 1. Play environmental audio triggers from scene
    if (audioList && audioList.length && g.sfx && g.sfx.playSfx) {
      audioList.forEach(aKey => {
        g.sfx.playSfx(aKey);
      });
    }

    // 2. Adjust City Atmosphere / Lighting based on stage.time and stage.light
    const cityPhase = g.phases && g.phases.CITY_EXPLORATION;
    if (cityPhase) {
      let timeProgress = 0.4; // default day
      if (stage.time) {
        const [h, m] = stage.time.split(':').map(Number);
        if (!isNaN(h)) {
          timeProgress = (h * 60 + (m || 0)) / (24 * 60);
        }
      }
      if (stage.light === 'dusk_cold') timeProgress = 0.75;
      else if (stage.light === 'night_lantern' || stage.light === 'night_lantern_water') timeProgress = 0.88;
      else if (stage.light === 'dawn_grey' || stage.light === 'dawn_clear') timeProgress = 0.22;
      else if (stage.light === 'interior_fluorescent_cold') timeProgress = 0.90;

      if (cityPhase.updateAtmosphericTime) {
        cityPhase.updateAtmosphericTime(timeProgress);
      }
    }

    // 3. Move Player and Position Camera to stage.loc when in city
    if (stage.loc && cityPhase && cityPhase.worldGroup && cityPhase.courier) {
      const targetPos = window.FFH.STORY_LOC_POSITIONS ? window.FFH.STORY_LOC_POSITIONS[stage.loc] : null;
      if (targetPos) {
        cityPhase.playerPos.x = targetPos.x;
        cityPhase.playerPos.z = targetPos.z;
        cityPhase.courier.position.copy(cityPhase.playerPos);

        // Adjust Camera Framing based on stage.camera
        const cam = g.cameras && g.cameras.mainCamera;
        if (cam) {
          if (stage.camera === 'wide_establishing_low') {
            cityPhase.setZoom(0.65);
          } else if (stage.camera === 'single_close' || stage.camera === 'first_person_pick') {
            cityPhase.setZoom(1.30);
          } else if (stage.camera === 'wide_reflection_hold' || stage.camera === 'fork_two_doors_wide') {
            cityPhase.setZoom(0.70);
          } else {
            cityPhase.setZoom(1.05);
          }
          cityPhase.updateCamera(true);
        }
      }
    }
  }

  renderScene(scene) {
    const hasCast = scene.cast && scene.cast.length > 0;
    const mode = scene.mode || (hasCast ? 'blocking' : 'overlay');
    const s = this.game.state;

    s.deposit_due = window.FFH.ECONOMY.KAUTION_DEPOSIT;
    s.next_day_cost = window.FFH.dailyCostsFor(s, (s.day || 1) + 1)
      .reduce((sum, cost) => sum + cost.amount, 0);

    // Direct stage, camera, and environmental audio
    this.applyStage(scene.stage, scene.audio);

    const validChoices = (scene.choices || []).filter(c => {
      if (c.gate) {
        return this.checkGate(c.gate, s);
      }
      return true;
    });

    // A terminal scene ends the run. The narrative track used to divert to a scene
    // id of "END" that does not exist, so its final beat dead-ended in DIALOGUE
    // instead of resolving. Terminal scenes now declare their own outcome.
    if (scene.terminal) {
      // scene.effects were already applied by startScene; do not re-apply them.
      const outcome = scene.outcome === 'LOSE' ? 'LOSE' : 'WIN';
      const prose = (scene.prose || []).map(line => this.interpolate(line));
      if (this.game.ui && this.game.ui.showStoryOverlay) {
        this.game.ui.showStoryOverlay(prose, []);
      }
      setTimeout(() => this.game.transitionTo(outcome), (scene.duration_s || 8) * 1000);
      return;
    }

    // Mechanics are dispatched before the presentation mode is considered.
    // These used to live inside handleBlockingScene, which meant an overlay
    // scene declaring a mechanic (night_one_end is mode:overlay) silently
    // skipped it.
    const mech = (scene.unlocks || {}).mechanic;
    if (mech === 'shift_receipt' && this.game.lastPayout) {
      this.game.ui.showShiftSummaryUI({ settled: true });
      this._resumeAfterReceipt = () => {
        this._resumeAfterReceipt = null;
        this.game.lastPayout = null;
        this.handleBlockingScene(scene, validChoices);
      };
      return;
    }
    if (mech === 'companion_walk' && this.startCompanionWalk(scene, validChoices)) return;
    if (mech === 'letter_round' && this.startLetterRound(scene, validChoices)) return;
    if (mech === 'day_end' && this.runDayEnd(scene, validChoices)) return;

    if (mode === 'gameplay') {
      this.handleGameplayScene(scene, validChoices);
    } else if (mode === 'blocking') {
      this.handleBlockingScene(scene, validChoices);
    } else {
      this.handleOverlayScene(scene, validChoices);
    }
  }

  // Put the player where the scene says it happens. `stage.space` is the
  // authority; this is the only function that acts on it.
  //
  //   exterior  -> the city. A speaker is spawned in the world, not in a room.
  //   interior  -> a room diorama, built from stage.loc when there is no cast.
  //   threshold -> a doorway two-shot: at the door, not admitted.
  //
  // Previously 22 of 92 scenes rendered in the wrong space: exterior scenes
  // with a cast opened a room diorama (Frau Klein on the university steps
  // appeared indoors), and interior scenes without a cast simply stayed in
  // whatever phase the player was in (an office beat could play in the street).
  placeScene(scene, space) {
    const loc = (scene.stage && scene.stage.loc) || '';
    const npcKey = this.npcKeyFor(scene);

    if (space === 'exterior') {
      if (!this.phaseIs('CITY_EXPLORATION')) {
        this.game.transitionTo('CITY_EXPLORATION', { fromBuildingExit: this.phaseIs('DIALOGUE') });
      }
      // A speaker outdoors stands in the street beside you.
      if (npcKey) this.spawnWorldSpeaker(npcKey, loc);
      return;
    }

    if (space === 'threshold') {
      if (!this.phaseIs('DIALOGUE', 'SHOP')) {
        this.game.transitionTo('DIALOGUE', {
          npcKey: npcKey || 'NPC_NICO', isStory: true, atThreshold: true, loc
        });
      }
      return;
    }

    // interior
    if (npcKey) {
      if (!this.phaseIs('DIALOGUE', 'SHOP')) {
        this.game.transitionTo('DIALOGUE', { npcKey, isStory: true, atThreshold: false, loc });
      }
      return;
    }
    const roomType = this.roomTypeFor(loc);
    if (roomType && !this.phaseIs('INTERIOR', 'SHOP', 'PICK')) {
      this.game.transitionTo('INTERIOR', { roomType, npcKey: null, loc });
    }
  }

  // An outdoor speaker is placed in the world rather than in a diorama, using
  // the same mesh factory the companion walk uses.
  spawnWorldSpeaker(npcKey, loc) {
    const city = this.game.phases && this.game.phases.CITY_EXPLORATION;
    if (!city || !window.FFH.createNPCMesh) return;
    if (city.worldSpeaker) {
      this.game.scene.remove(city.worldSpeaker);
      city.worldSpeaker = null;
    }
    const mesh = window.FFH.createNPCMesh(npcKey);
    if (!mesh) return;
    const anchorMesh = (city.interactiveMeshes || []).find(m => m.userData && m.userData.type === loc);
    const base = anchorMesh ? anchorMesh.position : city.playerPos;
    mesh.position.set(base.x + 1.4, 0.12, base.z + 1.4);
    if (city.playerPos) {
      mesh.rotation.y = Math.atan2(city.playerPos.x - mesh.position.x, city.playerPos.z - mesh.position.z);
    }
    this.game.scene.add(mesh);
    city.worldSpeaker = mesh;
  }

  handleOverlayScene(scene, choices) {
    const space = this.spaceOf(scene);
    const wantPhase = this.phaseForSpace(space);

    // An overlay scene draws its own choice buttons, so any dialogue drawer
    // left over from the previous scene has to go. Otherwise the old speaker's
    // options sit on top of the new ones.
    if (this.game.ui && this.game.ui.hideDialogueBox) {
      this.game.ui.hideDialogueBox();
    }

    this.placeScene(scene, space);

    const rawProse = scene.prose || [];
    const processedProse = rawProse.map(p => this.interpolate(p));


    // Dynamic Progressive Choice Filtering for Hub / Multi-Option Scenes:
    // If a scene provides more than 3 choices (e.g. hub or multi-branch node), filter choices using target scene gates,
    // or limit to the top 3 available progressive choices so the screen is never cluttered with 6+ options at once.
    let displayChoices = choices || [];
    if (displayChoices.length > 3) {
      displayChoices = displayChoices.filter(ch => {
        const targetId = ch.to || ch.next;
        const targetScene = targetId ? (this.scenesById ? this.scenesById[targetId] : null) : null;
        if (targetScene && targetScene.gate) {
          return this.checkGate(targetScene.gate, s);
        }
        return true;
      }).slice(0, 3);
    }

    // Choices appear once the prose queue drains, so skipping ahead brings
    // them forward instead of leaving the player waiting on a dead timer.
    const showChoices = () => {
      if (displayChoices && displayChoices.length && this.game.ui && this.game.ui.showStoryOverlay) {
        const overlayData = {
          sceneId: scene.id,
          beat: scene.beat,
          stage: scene.stage,
          prose: [], // No dark modal box; prose rendered above player head
          choices: displayChoices.map((ch, idx) => ({
            idx: idx,
            label: this.interpolate(ch.label),
            original: ch
          }))
        };
        this.game.ui.showStoryOverlay(overlayData, (choiceIndex) => {
          const choice = displayChoices[choiceIndex];
          if (scene.id === 'act_one') {
            this.game.state.actOneChoiceDone = true;
            const Stages = window.FFH.ACT1_STAGES || {};
            this.game.state.act1Stage = Stages.TRANSIT_TO_WG;
            if (window.FFH.completeNode) {
              window.FFH.completeNode(this.game, "ZOB_CHOICE");
            }
            // Witty British meta-joke on the illusion of choice vs navigation line
            setTimeout(() => {
              if (this.game.ui && this.game.ui.spawnWandererThought) {
                this.game.ui.spawnWandererThought(
                  "The arrow was going to send me that way regardless."
                );
              }
            }, 800);
          }
          this.selectChoice(choice);
        });
      } else {
        // Scene has no choices; it concludes automatically.
        if (scene.id === 'act_one') {
          this.game.state.actOneChoiceDone = true;
          const Stages = window.FFH.ACT1_STAGES || {};
          this.game.state.act1Stage = Stages.TRANSIT_TO_WG;
          if (window.FFH.completeNode) {
            window.FFH.completeNode(this.game, "ZOB_CHOICE");
          }
        }
        this.selectChoice({ next: scene.next || scene.divert });
      }
    };
    this.playProseQueue(processedProse, showChoices);
  }

  handleBlockingScene(scene, choices) {
    // No speaker means no conversation: render it over the live scene rather
    // than opening a two-shot with a stand-in.
    if (!this.hasSpeaker(scene)) {
      this.handleOverlayScene(scene, choices);
      return;
    }

    const rawProse = scene.prose || [];
    const processedProse = rawProse.map(p => this.interpolate(p));

    let speaker = 'Conversation';
    let npcKey = 'NPC_NICO';
    if (scene.cast && scene.cast.length) {
      npcKey = scene.cast[0];
      speaker = (window.FFH.NPC_SPEAKER_MAP && window.FFH.NPC_SPEAKER_MAP[npcKey]) || 'Conversation';
    }

    // Separate action/narrative prose from spoken dialogue lines
    const actionLines = [];
    const spokenLines = [];

    for (const p of processedProse) {
      if (p.includes(':')) {
        const colonIdx = p.indexOf(':');
        const spk = p.slice(0, colonIdx).trim();
        const speech = p.slice(colonIdx + 1).trim();
        spokenLines.push(speech);
        if (!speaker || speaker === 'Conversation') {
          speaker = spk;
        }
      } else {
        actionLines.push(p);
      }
    }

    // Filter & cap dialogue choices to max 3 progressive options per turn
    const displayBlockingChoices = choices.length > 3 ? choices.slice(0, 3) : choices;

    const dialogueData = {
      speaker: speaker,
      actionIntro: actionLines.join(' '),
      text: spokenLines.length ? spokenLines.join(' ') : actionLines.join(' '),
      isStory: true,
      options: displayBlockingChoices.map((ch, idx) => ({
        idx: idx,
        label: this.interpolate(ch.label),
        original: ch
      }))
    };

    if (this.game.phases.DIALOGUE) {
      this.placeScene(scene, this.spaceOf(scene));

      // Apply camera adjustments inside the diorama room
      const cam = this.game.cameras && this.game.cameras.mainCamera;
      if (cam && scene.stage && scene.stage.camera) {
        const cType = scene.stage.camera;
        if (cType === 'doorway_two_shot' || cType === 'kitchen_two_shot' || cType === 'workbench_two_shot') {
          this.game.phases.DIALOGUE.endCamZoom = 2.45;
        } else if (cType === 'insert_three_bins' || cType === 'single_close') {
          this.game.phases.DIALOGUE.endCamZoom = 2.85;
        } else {
          this.game.phases.DIALOGUE.endCamZoom = 2.15;
        }
      }

      if (this.game.ui && this.game.ui.showDialogueBox) {
        const npcEntry = (window.FFH.NPC_DATABASE && window.FFH.NPC_DATABASE[npcKey]) || {
          name: speaker,
          title: 'Lübeck Resident',
          avatarColor: '#2EC4B6'
        };
        this.game.ui.showDialogueBox(npcEntry, dialogueData, (chosenOption) => {
          if (chosenOption && chosenOption.original) {
            this.selectChoice(chosenOption.original);
          }
        });
      }
    }
  }

  // `companion_walk`: an NPC leads the player between POIs, speaking on arrival.
  // Returns false if the city phase or the companion module is unavailable, so
  // the caller can fall back to playing the scene as an ordinary conversation.
  startCompanionWalk(scene, choices) {
    const city = this.game.phases && this.game.phases.CITY_EXPLORATION;
    if (!city || !city.companion) return false;

    if (!this.phaseIs('CITY_EXPLORATION')) {
      this.game.transitionTo('CITY_EXPLORATION', { fromBuildingExit: this.phaseIs('DIALOGUE') });
    }
    if (this.game.ui && this.game.ui.hideDialogueBox) this.game.ui.hideDialogueBox();

    const stops = (scene.unlocks && scene.unlocks.tour_stops) || [];
    const npcKey = this.npcKeyFor(scene) || 'NPC_NICO';
    const lines = (scene.prose || []).map(p => this.interpolate(p));

    const started = city.companion.start(npcKey, stops, {
      // One line per stop, so the walk paces itself off the player's own speed
      // rather than a timer they cannot influence.
      onArrive: (poiKey, i) => {
        const line = lines[Math.min(i + 1, lines.length - 1)];
        if (line && this.game.ui && this.game.ui.showThoughtBubble) {
          this.game.ui.showThoughtBubble(line, 4200);
        }
        this.game.state.activeObjective = (i + 1 < stops.length)
          ? 'Keep up with Nico'
          : 'Follow Nico back';
        if (this.game.ui && this.game.ui.updatePersistentHUD) {
          this.game.ui.updatePersistentHUD(this.game.state);
        }
      },
      onFinish: () => {
        city.companion.stop();
        if (choices && choices.length) {
          this.game.ui.showStoryOverlay(
            {
              sceneId: scene.id,
              beat: scene.beat,
              stage: scene.stage,
              prose: [],
              choices: choices.map((ch, idx) => ({
                idx, label: this.interpolate(ch.label), original: ch
              }))
            },
            (i) => this.selectChoice(choices[i])
          );
        }
      }
    });

    if (!started) return false;

    if (lines.length && this.game.ui && this.game.ui.showThoughtBubble) {
      this.game.ui.showThoughtBubble(lines[0], 4200);
    }
    this.game.state.activeObjective = 'Keep up with Nico';
    if (this.game.ui && this.game.ui.updatePersistentHUD) {
      this.game.ui.updatePersistentHUD(this.game.state);
    }
    return true;
  }

  // `letter_round`: the post job. Plays in the city against a clock, paying per
  // letter delivered. Returns false if the city phase is unavailable so the
  // caller can fall back to an ordinary scene.
  startLetterRound(scene, choices) {
    const city = this.game.phases && this.game.phases.CITY_EXPLORATION;
    if (!city || !city.letterRound) return false;

    // The briefing is a conversation; the round itself is not. Play the scene's
    // prose first, then hand the player the bag.
    const lines = (scene.prose || []).map(p => this.interpolate(p));
    const begin = () => {
      if (!this.phaseIs('CITY_EXPLORATION')) {
        this.game.transitionTo('CITY_EXPLORATION', { fromBuildingExit: true });
      }
      if (this.game.ui && this.game.ui.hideDialogueBox) this.game.ui.hideDialogueBox();

      city.letterRound.start({
        onFinish: (result) => {
          const line = result.undelivered > 0
            ? `${result.delivered} delivered, ${result.undelivered} not. ${result.pay.toFixed(2)}€.`
            : `All ${result.delivered} delivered. ${result.pay.toFixed(2)}€.`;
          if (this.game.ui && this.game.ui.showThoughtBubble) {
            this.game.ui.showThoughtBubble(line, 5000);
          }
          if (choices && choices.length) {
            setTimeout(() => this.selectChoice(choices[0]), 2600);
          }
        }
      });
    };

    if (lines.length) this.playProseQueue(lines, begin);
    else begin();
    return true;
  }

  // `day_end`: the day is counted where the player sleeps, not where they
  // worked. Shows the payslip first (the only place on the story path it is
  // ever seen: DEBRIEF_RECEIPT has a single caller buried in a side dialogue),
  // then plays the room scene, then Sleep crosses the night tunnel.
  //
  // Returns false when there is nothing to count, so the scene plays normally.
  runDayEnd(scene, choices) {
    const state = this.game.state;
    if (!this.game.ui || !this.game.ui.showShiftSummaryUI) return false;
    if (this._dayEndShownFor === scene.id) return false;   // do not re-show on re-entry
    this._dayEndShownFor = scene.id;

    this.placeScene(scene, this.spaceOf(scene));
    const dayNum = state.day || 1;
    this.game.ui.showShiftSummaryUI({ isDayEnd: true, day: dayNum, settled: false });

    // The payslip owns the screen; the room scene resumes when it is dismissed.
    this._resumeAfterReceipt = () => {
      this._resumeAfterReceipt = null;
      // Consumed: do not count the same day's work twice.
      state.shiftEarnings = 0;
      state.lastLetterRound = null;
      this.game.lastPayout = null;
      const plain = Object.assign({}, scene, {
        unlocks: Object.assign({}, scene.unlocks, { mechanic: null })
      });
      if (scene.mode === 'blocking') this.handleBlockingScene(plain, choices);
      else this.handleOverlayScene(plain, choices);
    };
    return true;
  }

  handleGameplayScene(scene, choices) {
    // Ramp data lives at unlocks.ramp.icon_delay_s. This used to read a top-level
    // `scene.teaches` that no scene has ever had, so it always resolved to 0 and
    // flattened the ramp on the story path. Leaving it undefined is deliberate:
    // pickPhase then falls back to the canonical window.FFH.iconRevealDelay().
    const ramp = (scene.unlocks && scene.unlocks.ramp) || {};
    const iconDelay = ramp.icon_delay_s;


    this.game.transitionTo('PICK', {
      storyScene: scene,
      iconDelay: iconDelay,
      onComplete: () => {
        if (this.game.lastPayout) this.game.state.pay = this.game.lastPayout.netPayout;
        if (choices && choices.length) {
          this.selectChoice(choices[0]);
        } else if (scene.divert) {
          this.startScene(scene.divert);
        }
      }
    });

    // Gameplay scenes carry prose too (Klaus explaining the shelf, for one) and
    // it was being dropped entirely: this handler transitioned straight to PICK
    // and nothing else ever read scene.prose. Play it over the live shelf, which
    // is also the only place the lines make sense, and hold the shift clock so
    // the briefing does not eat the player's time.
    const briefing = (scene.prose || []).map(p => this.interpolate(p));
    if (briefing.length) {
      const pick = this.game.phases && this.game.phases.PICK;
      if (pick) pick.briefingHold = true;
      this.playProseQueue(briefing, () => {
        if (pick) pick.briefingHold = false;
      });
    }
  }

  selectChoice(choice) {
    if (!choice) return;

    if (choice.effects && choice.effects.length) {
      this.applyEffects(choice.effects);
    }

    let target = choice.to || choice.next;

    // Tunnels. A choice may target { tunnel: 'scene_id', then: 'scene_id' },
    // meaning "run that scene's effects, then continue". This used to take
    // `.then` and drop the tunnel on the floor, so `night_tick` never ran once
    // in the whole game: the day counter never advanced past 1, the nightly
    // rent was never charged, and body never reset. Both night boundaries in
    // Acts I and II go through a tunnel, so neither day boundary existed.
    if (typeof target === 'object' && target !== null) {
      const tunnelId = target.tunnel;
      if (tunnelId) {
        const tunnelScene = this.scenesById ? this.scenesById[tunnelId] : null;
        if (tunnelScene && tunnelScene.effects && tunnelScene.effects.length) {
          if (tunnelId === 'night_tick') {
            const state = this.game.state;
            state.lastDailyCosts = window.FFH.dailyCostsFor(state, (state.day || 1) + 1);
            state.daily_cost = state.lastDailyCosts.reduce((sum, cost) => sum + cost.amount, 0);
            // The day being closed has already shown its receipt, so the Pfand
            // ledger and the bottle spawns both reset for the new day.
            state.pfandCollected = 0;
            state.collectedPfandIds = [];
          }
          this.applyEffects(tunnelScene.effects);
        } else if (!tunnelScene) {
          console.warn(`StoryRunner: tunnel '${tunnelId}' has no scene; effects skipped.`);
        }
      }
      target = target.then || target.to || target.next;
    }

    if (this.currentScene && this.currentScene.conditional_edges) {
      const state = this.game.state;
      for (const ce of this.currentScene.conditional_edges) {
        if (this.checkGate(ce.if, state)) {
          target = ce.to;
          break;
        }
      }
    }

    if (!target && this.currentScene && this.currentScene.divert) {
      target = this.currentScene.divert;
    }

    if (this.currentSceneId === 'act_one') {
      this.game.state.actOneStarted = true;
    }

    const choiceProse = (choice.prose || []).map(p => this.interpolate(p));

    if (target) {
      // --- Exploration Handshake ---
      // If the target scene is at a DIFFERENT map location from the current one,
      // break the dialogue chain. Set pendingStoryTarget so city exploration
      // can beacon-guide the player there, firing the scene on approach.
      const currentLoc = this.currentScene && this.currentScene.stage && this.currentScene.stage.loc;
      const targetLoc = this._getSceneLoc(target);
      const TRAVEL_REQUIRED = !!(targetLoc && currentLoc && targetLoc !== currentLoc);

      if (TRAVEL_REQUIRED) {
        const prettyLoc = (window.FFH.STORY_LOC_NAMES && window.FFH.STORY_LOC_NAMES[targetLoc]) || 'Town';
        const targetScene = this.scenesById ? this.scenesById[target] : null;
        const isDayEnd = !!(targetScene && (targetScene.unlocks || {}).mechanic === 'day_end');
        const objective = isDayEnd
          ? "Go home. It's late."
          : ((window.FFH.STORY_OBJECTIVE_MAP && window.FFH.STORY_OBJECTIVE_MAP[target]) || `Head towards ${prettyLoc}`);
        console.log(`[StoryRunner] TRAVEL_REQUIRED to scene '${target}' at '${targetLoc}'. Setting objective: ${objective}`);

        this.pendingStoryTarget = { sceneId: target, poi: targetLoc, objective };
        this.game.state.activeObjective = objective;
        this.game.state.isTypingObjective = true;

        if (this.game.ui && this.game.ui.hideDialogueBox) {
          this.game.ui.hideDialogueBox();
        }
        console.log(`StoryRunner: Travel required to ${targetLoc} for scene "${target}". Entering city exploration.`);
        this.game.transitionTo('CITY_EXPLORATION', { fromBuildingExit: this.phaseIs('DIALOGUE') });

        // Show choice.prose as thought bubbles AFTER entering city map, with a short delay
        let thoughtDelay = 600;
        for (const line of choiceProse) {
          const lineTime = Math.max(1400, line.length * 22);
          setTimeout(() => {
            if (this.game.ui && this.game.ui.spawnWandererThought) {
              this.game.ui.spawnWandererThought(line, lineTime);
            }
          }, thoughtDelay);
          thoughtDelay += lineTime + 300;
        }

        if (this.game.ui && this.game.ui.playObjectiveRevealSequence) {
          // Only automatically play the sequence if the tutorial reveal has already happened.
          // If it hasn't, cityExplorationPhase will trigger it on the very first screen tap.
          setTimeout(() => {
            if (this.game.state.firstObjectiveRevealed) {
              this.game.ui.playObjectiveRevealSequence(false);
            }
          }, 400);
        }
      } else {
        // Same-location: play the choice's reaction prose, then chain onward.
        // This runs through playProseQueue so the lines are tap-advanceable like
        // every other narration. It used to schedule fixed timers via
        // spawnWandererThought, which meant up to five seconds of dead air
        // between picking an option and the next choices appearing, with
        // nothing on screen responding to taps.
        if (this.game.ui && this.game.ui.hideDialogueBox) {
          this.game.ui.hideDialogueBox();
        }
        if (choiceProse.length > 0) {
          this.playProseQueue(choiceProse, () => this.startScene(target));
        } else {
          this.startScene(target);
        }
      }
    } else {
      console.log('StoryRunner: Flow reached leaf or hub. Transitioning to city exploration.');
      this.game.transitionTo('CITY_EXPLORATION', { fromBuildingExit: this.phaseIs('DIALOGUE') });
    }
  }
};
