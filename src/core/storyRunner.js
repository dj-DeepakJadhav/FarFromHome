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

  // Lookup table of which POI each scene id belongs to.
  // When the target scene is at a DIFFERENT location from the current scene,
  // we break the dialogue chain and drop the player into city exploration.
  _getSceneLoc(sceneId) {
    const scene = this.scenesById && this.scenesById[sceneId];
    return scene && scene.stage && scene.stage.loc ? scene.stage.loc : null;
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
    if (typeof expr === 'boolean') return expr;
    if (typeof expr === 'number') return expr;
    if (expr === 'true') return true;
    if (expr === 'false') return false;

    try {
      const keys = Object.keys(state);
      const values = Object.values(state);
      const fn = new Function(...keys, `return (${expr});`);
      return fn(...values);
    } catch (e) {
      console.warn(`StoryRunner: Failed to evaluate expr "${expr}":`, e);
      return null;
    }
  }

  checkGate(gate, state) {
    if (!gate) return true;
    try {
      let jsGate = gate
        .replace(/\bnot\s+/g, '!')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||');
      
      const keys = Object.keys(state);
      const values = Object.values(state);
      const fn = new Function(...keys, `return Boolean(${jsGate});`);
      return fn(...values);
    } catch (e) {
      console.warn(`StoryRunner: Failed to evaluate gate "${gate}":`, e);
      return true;
    }
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
  }

  checkHealthState() {
    const s = this.game.state;
    if (s.body !== undefined && s.body <= 0) {
      s.body = 15;
      s.wallet = Math.max(0, s.wallet - 8);
      if (this.game.ui && this.game.ui.spawnFloatingText) {
        this.game.ui.spawnFloatingText('⚠️ Physical Collapse! Rested 1 day (-8€)', window.innerWidth / 2, window.innerHeight / 2, '#E63946');
      }
    }
    if (s.heart !== undefined && s.heart <= 0) {
      s.heart = 20;
      if (this.game.ui && this.game.ui.spawnFloatingText) {
        this.game.ui.spawnFloatingText('💔 Severe Despair! Nico checked in on you.', window.innerWidth / 2, window.innerHeight / 2, '#E63946');
      }
    }
  }

  interpolate(text) {
    if (!text) return '';
    const state = this.game.state;
    return text.replace(/\{([^}]+)\}/g, (match, expr) => {
      if (expr.includes(':')) {
        const parts = expr.split(':');
        const cond = parts[0].trim();
        const branch = parts[1].split('|');
        const ifTrue = branch[0] || '';
        const ifFalse = branch[1] || '';
        const res = this.checkGate(cond, state);
        return res ? ifTrue : ifFalse;
      }
      const val = this.evaluateExpr(expr, state);
      if (val !== null && val !== undefined) {
        if (typeof val === 'number') {
          return val.toFixed(2).replace(/\.00$/, '');
        }
        return String(val);
      }
      return match;
    });
  }

  startScene(sceneId) {
    if (!this.scenesById) {
      this.initSceneMap();
    }
    const scene = this.scenesById ? this.scenesById[sceneId] : null;
    if (!scene) {
      console.error(`StoryRunner: Scene "${sceneId}" not found in story.json.`);
      return;
    }

    this.currentSceneId = sceneId;
    this.currentScene = scene;
    this.history.push(sceneId);

    if (scene.effects && scene.effects.length) {
      this.applyEffects(scene.effects);
    }

    if (scene.unlocks) {
      this.handleUnlocks(scene.unlocks);
    }

    this.renderScene(scene);
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
      const locPositions = {
        // Each position is the R_C (road) tile immediately outside the building entrance.
        // Building centres are at col*2.6, row*2.6 — those are inside walls.
        // TILE_SCALE = 2.6; grid reference: LUBECK_CITY_GRID
        'B_ZOB':        { x: 10.4, z:  5.2 },  // row2,col4 R_C (east of ZOB)
        'B_BANK':       { x: 41.6, z:  5.2 },  // row2,col16 building — col15 R_C would be 39.0
        'B_UNI':        { x: 20.8, z: 15.6 },  // row6,col8  R_C (west of UNI)
        'B_BAKERY':     { x:  7.8, z: 18.2 },  // row7,col3  R_C (east of Bakery)
        'B_BURGTOR':    { x: 36.4, z: 18.2 },  // row7,col14 building — keep as-is (road bridge)
        'B_RATHAUS':    { x: 23.4, z: 23.4 },  // row9,col9 B_RATHAUS itself is road-adjacent
        'B_PIZZA':      { x: 28.6, z: 23.4 },  // row9,col11 building — col12 R_C = 31.2
        'B_WG':         { x:  7.8, z: 26.0 },  // row10,col3 R_C (east of WG)
        'B_AUSLAENDER': { x: 36.4, z: 26.0 },  // row10,col14 building entrance
        'B_BIKESHOP':   { x:  7.8, z: 31.2 },  // row12,col3 R_C (east of Bikeshop)
        'B_KINO':       { x: 26.0, z: 31.2 },  // row12,col10 building (road left/right)
        'B_HOLSTEN':    { x: 18.2, z: 33.8 },  // row13,col7 bridge area
        'B_MARIEN':     { x: 57.2, z: 33.8 },  // row13,col22 — keep
        'B_DOM':        { x: 26.0, z: 44.2 },  // row17,col10
        'B_DARKSTORE':  { x:  7.8, z: 46.8 },  // row18,col3 R_C (east of Darkstore)
        'LM_CANAL':     { x: 20.8, z: 31.2 },
        'LM_MARKTPLATZ':{ x: 26.0, z: 23.4 }
      };

      const targetPos = locPositions[stage.loc];
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
    const mode = scene.mode || 'overlay';
    const s = this.game.state;

    // Direct stage, camera, and environmental audio
    this.applyStage(scene.stage, scene.audio);

    const validChoices = (scene.choices || []).filter(c => {
      if (c.gate) {
        return this.checkGate(c.gate, s);
      }
      return true;
    });

    if (mode === 'gameplay') {
      this.handleGameplayScene(scene, validChoices);
    } else if (mode === 'blocking') {
      this.handleBlockingScene(scene, validChoices);
    } else {
      this.handleOverlayScene(scene, validChoices);
    }
  }

  handleOverlayScene(scene, choices) {
    // If in DIALOGUE phase, transition to CITY_EXPLORATION first so the live 3D world is visible
    if (this.game.currentPhase !== 'CITY_EXPLORATION') {
      this.game.transitionTo('CITY_EXPLORATION');
    }

    const rawProse = scene.prose || [];
    const processedProse = rawProse.map(p => this.interpolate(p));

    const overlayData = {
      sceneId: scene.id,
      beat: scene.beat,
      stage: scene.stage,
      prose: processedProse,
      choices: choices.map((ch, idx) => ({
        idx: idx,
        label: this.interpolate(ch.label),
        original: ch
      }))
    };

    if (this.game.ui && this.game.ui.showStoryOverlay) {
      this.game.ui.showStoryOverlay(overlayData, (choiceIndex) => {
        const choice = choices[choiceIndex];
        this.selectChoice(choice);
      });
    }
  }

  handleBlockingScene(scene, choices) {
    const rawProse = scene.prose || [];
    const processedProse = rawProse.map(p => this.interpolate(p));

    let speaker = 'Conversation';
    let npcKey = 'NPC_NICO';
    if (scene.cast && scene.cast.length) {
      npcKey = scene.cast[0];
      if (npcKey === 'NPC_NICO') speaker = 'Nico';
      else if (npcKey === 'NPC_RITA') speaker = 'Rita Schneider';
      else if (npcKey === 'NPC_NINA') speaker = 'Nina Lindemann';
      else if (npcKey === 'NPC_LOKKER') speaker = 'Herr Hans Lokker';
      else if (npcKey === 'NPC_VOGEL') speaker = 'Herr Vogel';
      else if (npcKey === 'NPC_MARTHA') speaker = 'Martha Webber';
      else if (npcKey === 'NPC_MATHIAS') speaker = 'Mathias Becker';
      else if (npcKey === 'NPC_LINDEMANN') speaker = 'Dr. Lindemann';
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

    const dialogueData = {
      speaker: speaker,
      actionIntro: actionLines.join(' '),
      text: spokenLines.length ? spokenLines.join(' ') : actionLines.join(' '),
      isStory: true,
      options: choices.map((ch, idx) => ({
        idx: idx,
        label: this.interpolate(ch.label),
        original: ch
      }))
    };

    if (this.game.phases.DIALOGUE) {
      this.game.transitionTo('DIALOGUE', { npcKey: npcKey, isStory: true });

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

  handleGameplayScene(scene, choices) {
    const teaches = scene.teaches || {};
    const iconDelay = teaches.icon_delay_s !== undefined ? teaches.icon_delay_s : 0.0;

    this.game.transitionTo('PICK', {
      storyScene: scene,
      iconDelay: iconDelay,
      onComplete: () => {
        if (choices && choices.length) {
          this.selectChoice(choices[0]);
        } else if (scene.divert) {
          this.startScene(scene.divert);
        }
      }
    });
  }

  selectChoice(choice) {
    if (!choice) return;

    if (choice.effects && choice.effects.length) {
      this.applyEffects(choice.effects);
    }

    let target = choice.to;
    if (typeof target === 'object' && target !== null) {
      target = target.then || target.to;
    }

    if (!target && this.currentScene && this.currentScene.divert) {
      target = this.currentScene.divert;
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

    if (target) {
      // --- Exploration Handshake ---
      // If the target scene is at a DIFFERENT map location from the current one,
      // break the dialogue chain. Set pendingStoryTarget so city exploration
      // can beacon-guide the player there, firing the scene on approach.
      const currentLoc = this.currentScene && this.currentScene.stage && this.currentScene.stage.loc;
      const targetLoc = this._getSceneLoc(target);
      const TRAVEL_REQUIRED = !!(targetLoc && currentLoc && targetLoc !== currentLoc);

      if (TRAVEL_REQUIRED) {
        const objectiveMap = {
          'wg_door':          '🏠 Find Room 4 — Student WG (south)',
          'nico_sends_kruma': '🎓 Check out Lübeck University (east across the bridge)',
          'uni_closed':       '🎓 Check out Lübeck University (east across the bridge)',
          'shift_1_teach':    '📦 Report for your first shift — Kruma Express (south)',
        };
        const objective = objectiveMap[target] || `Go to ${targetLoc}`;

        this.pendingStoryTarget = { sceneId: target, poi: targetLoc, objective };
        this.game.state.activeObjective = objective;

        if (this.game.ui && this.game.ui.hideDialogueBox) {
          this.game.ui.hideDialogueBox();
        }
        console.log(`StoryRunner: Travel required to ${targetLoc} for scene "${target}". Entering city exploration.`);
        this.game.transitionTo('CITY_EXPLORATION');
      } else {
        this.startScene(target);
      }
    } else {
      console.log('StoryRunner: Flow reached leaf or hub. Transitioning to city exploration.');
      this.game.transitionTo('CITY_EXPLORATION');
    }
  }
};
