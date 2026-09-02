// Behavior Tree & Dynamic Reactive NPC AI Engine for Far From Home
// Implements Shadow of Mordor-style memory tracking, etiquette sentiment, and adaptive response generation.
window.FFH = window.FFH || {};

class BTNode {
  tick(agent, delta, game) {
    return 'FAILURE';
  }
}

class Selector extends BTNode {
  constructor(children = []) {
    super();
    this.children = children;
  }
  tick(agent, delta, game) {
    for (const child of this.children) {
      const status = child.tick(agent, delta, game);
      if (status !== 'FAILURE') {
        return status; // SUCCESS or RUNNING
      }
    }
    return 'FAILURE';
  }
}

class Sequence extends BTNode {
  constructor(children = []) {
    super();
    this.children = children;
  }
  tick(agent, delta, game) {
    for (const child of this.children) {
      const status = child.tick(agent, delta, game);
      if (status !== 'SUCCESS') {
        return status; // FAILURE or RUNNING
      }
    }
    return 'SUCCESS';
  }
}

class ActionNode extends BTNode {
  constructor(actionFn) {
    super();
    this.actionFn = actionFn;
  }
  tick(agent, delta, game) {
    return this.actionFn(agent, delta, game);
  }
}

// Global BT Node exports
window.FFH.BT = {
  BTNode,
  Selector,
  Sequence,
  ActionNode
};

// Character Memory & Relationship Reactive AI Model (Shadow of Mordor style)
window.FFH.NPCMemoryManager = {
  recordEncounter: (npcKey, eventTag, deltaRelation = 0, state = window.FFH.state) => {
    if (!state.npcMemory) state.npcMemory = {};
    if (!state.npcMemory[npcKey]) state.npcMemory[npcKey] = [];
    if (!state.npcMemory[npcKey].includes(eventTag)) {
      state.npcMemory[npcKey].push(eventTag);
    }
    if (!state.npcRelationships) state.npcRelationships = {};
    if (state.npcRelationships[npcKey] === undefined) state.npcRelationships[npcKey] = 50;
    state.npcRelationships[npcKey] = Math.max(0, Math.min(100, state.npcRelationships[npcKey] + deltaRelation));
  },

  hasMemory: (npcKey, eventTag, state = window.FFH.state) => {
    return (state.npcMemory && state.npcMemory[npcKey] && state.npcMemory[npcKey].includes(eventTag));
  },

  getSentiment: (npcKey, state = window.FFH.state) => {
    const rel = (state.npcRelationships && state.npcRelationships[npcKey]) || 50;
    if (rel >= 75) return 'FRIENDLY';
    if (rel <= 35) return 'COLD';
    return 'NEUTRAL';
  },

  // Generates reactive greeting based on prior shifts, delivery performance, and etiquette
  generateReactiveGreeting: (npcKey, state = window.FFH.state) => {
    const sentiment = window.FFH.NPCMemoryManager.getSentiment(npcKey, state);
    const memories = (state.npcMemory && state.npcMemory[npcKey]) || [];
    const shiftCount = state.currentShift || 1;

    switch (npcKey) {
      case 'NPC_RITA':
        if (memories.includes('matriculated')) return 'Frau Studentin! Willkommen an der Universität. Wie läuft das Semester?';
        if (state.wallet >= (window.FFH.ECONOMY?.TUITION_GOAL || 250)) return 'Guten Tag! Ich sehe das Leuchten in Ihren Augen – Sie haben die Studiengebühren zusammen!';
        if (sentiment === 'FRIENDLY') return 'Schön Sie wiederzusehen! Bringen Sie schon Ihre Immatrikulationsunterlagen?';
        return 'Guten Tag. Bitte halten Sie Ihren Zulassungsbescheid und die Semestergebühr bereit.';

      case 'NPC_MATHIAS':
        if (memories.includes('dropped_pizza')) return 'Du schon wieder! Fahr bloß vorsichtig mit meinen Pizzen! Keine scharfen Kurven mehr!';
        if (memories.includes('fast_delivery')) return 'Ah, mein schnellster Kurier! Der Ofen brennt schon, genau wie dein Tempo!';
        if (sentiment === 'FRIENDLY') return 'Mamma mia, mein Lieblingsfahrer! Komm rein, nimm dir ein Stück warmes Focaccia!';
        return 'Hör mal zu, Junge: Pünktlichkeit ist Ehrensache in dieser Pizzeria!';

      case 'NPC_MARTHA':
        if (memories.includes('helped_flour')) return 'Guten Morgen, mein Lieber! Danke nochmals für das Tragen der schweren Mehlsäcke!';
        if (sentiment === 'FRIENDLY') return 'Moin moin! Du siehst hungrig aus vom Radfahren – nimm dir ein frisches Franzbrötchen!';
        return 'Guten Tag junger Mann! Bei Oma Martha schmeckt das Sauerteigbrot wie vor 50 Jahren.';

      case 'NPC_NINA':
        if (state.upgrades?.ebike) return 'Whoa, look at that E-Bike! Your pick-to-drop cycle times must be insane now!';
        if (memories.includes('picked_perfect')) return 'Clean picks on that last batch! The warehouse manager was actually impressed.';
        if (shiftCount > 2) return 'Back for another shift? Lübeck never stops ordering groceries, so let’s rack up that tuition!';
        return 'Kruma Dispatch here. Scan the article tag in your head before touching the shelves, okay?';

      case 'NPC_LOKKER':
        if (memories.includes('violated_ruhezeit')) return 'SIE! Ich habe gestern um 22:05 Uhr Schritte im Treppenhaus gehört! Ruhezeit ist heilig!';
        if (sentiment === 'FRIENDLY') return 'Guten Tag. Sie sind ein vorbildlicher Mieter. Der Flur ist besenrein.';
        return 'Guten Tag. Mülltrennung beachten: Papier blau, Plastik gelb, Bio braun. Und ab 22 Uhr absolute Zimmerlautstärke!';

      case 'NPC_VOGEL':
        if (memories.includes('anmeldung_complete')) return 'Guten Tag. Ihre Meldebescheinigung ist ordnungsgemäß archiviert. Aktenzeichen B-104.';
        if (state.hasApartment) return 'Ah, Sie haben die Wohnungsgeberbestätigung! Treten Sie vor an Schalter 2.';
        return 'Bürgeramt Lübeck. Ziehen Sie eine Wartemarke. Ohne Termin und Wohnungsgeberbestätigung keine Bearbeitung!';

      case 'NPC_WEBER':
        if (state.isSperrkontoUnlocked) return 'Guten Tag! Ihr Girokonto ist liquide und der monatliche Dauerauftrag läuft planmäßig.';
        if (state.hasAnmeldung && state.isMatriculated) return 'Guten Tag! Sie bringen alle Nachweise mit! Wir können Ihr Sperrkonto umgehend freischalten.';
        return 'Willkommen bei der Sparkasse. Für die Kontoeröffnung benötigen wir die Meldebescheinigung und Ihre Immatrikulation.';

      case 'NPC_LINDEMANN':
        const docs = [state.isMatriculated, state.hasApartment, state.hasAnmeldung, state.isSperrkontoUnlocked].filter(Boolean).length;
        return `Ausländerbehörde Lübeck. Dokumentenstatus: ${docs}/4 vollständig. ${docs === 4 ? 'Treten Sie ein zur Visumsausstellung!' : 'Es fehlen noch Unterlagen vor Fristablauf!'}`;

      default:
        return 'Guten Tag! Wie kann ich Ihnen helfen?';
    }
  }
};

// Simple Behavior Tree for Roaming Citizens
window.FFH.createCitizenBehaviorTree = function () {
  const isNight = new ActionNode((agent, delta, game) => {
    const phase = game.currentPhase;
    if (!phase) return 'FAILURE';
    // If it's night (time < 0.25 or > 0.8), civilians head to shelter
    if (phase.timeOfDay < 0.25 || phase.timeOfDay > 0.8) {
      return 'SUCCESS';
    }
    return 'FAILURE';
  });

  const goHome = new ActionNode((agent, delta, game) => {
    if (agent.isAtHome) {
      agent.mesh.visible = false;
      return 'SUCCESS';
    }
    
    // Path to home coordinate (every citizen has an assigned home gate coordinate)
    const homePos = agent.homePosition;
    const dist = Math.hypot(homePos.x - agent.position.x, homePos.z - agent.position.z);
    
    if (dist < 0.5) {
      agent.isAtHome = true;
      agent.mesh.visible = false;
      return 'SUCCESS';
    } else {
      agent.mesh.visible = true;
      // Move towards home position
      const dirX = (homePos.x - agent.position.x) / dist;
      const dirZ = (homePos.z - agent.position.z) / dist;
      agent.position.x += dirX * agent.speed * delta;
      agent.position.z += dirZ * agent.speed * delta;
      agent.mesh.position.copy(agent.position);
      const angle = Math.atan2(dirX, dirZ);
      agent.mesh.rotation.y = THREE.MathUtils.lerp(agent.mesh.rotation.y, angle, delta * 8);
      
      if (window.FFH.updateCourierWalk) {
        window.FFH.updateCourierWalk(agent.mesh, delta, 0.6);
      }
      return 'RUNNING';
    }
  });

  const checkGreeting = new ActionNode((agent, delta, game) => {
    // Check if player or another NPC is nearby
    const phase = game.currentPhase;
    if (!phase || !phase.playerPos) return 'FAILURE';

    if (agent.greetCooldown > 0) {
      agent.greetCooldown -= delta;
      return 'FAILURE';
    }

    if (agent.isGreeting) {
      agent.greetTimer -= delta;
      if (agent.greetTimer <= 0) {
        agent.isGreeting = false;
        agent.greetCooldown = 8.0; // 8 seconds cooldown before next greeting
        return 'FAILURE';
      }
      
      // Face the player or other citizen
      const targetPos = agent.greetTarget;
      if (targetPos) {
        const dx = targetPos.x - agent.position.x;
        const dz = targetPos.z - agent.position.z;
        const angle = Math.atan2(dx, dz);
        agent.mesh.rotation.y = THREE.MathUtils.lerp(agent.mesh.rotation.y, angle, delta * 10);
      }

      // Play cute bouncing animation
      agent.mesh.position.y = 0.05 + Math.abs(Math.sin(agent.greetTimer * 12)) * 0.15;
      agent.mesh.rotation.z = 0; // stand straight up while greeting
      return 'RUNNING';
    }

    // Check distance to player
    const distToPlayer = Math.hypot(phase.playerPos.x - agent.position.x, phase.playerPos.z - agent.position.z);
    if (distToPlayer < 1.8) {
      agent.isGreeting = true;
      agent.greetTimer = 2.0; // greet for 2 seconds
      agent.greetTarget = phase.playerPos;
      // Show mini chat indicator / text above head
      if (game.ui && game.ui.spawnFloatingText && Math.random() > 0.6) {
        const lines = ["Moin!", "Hallo!", "Guten Tag!", "Schönen Tag!", "Grüß Gott!"];
        const helloLine = lines[Math.floor(Math.random() * lines.length)];
        game.ui.spawnFloatingText(helloLine, window.innerWidth / 2, window.innerHeight * 0.7, '#ECC238');
        if (game.sfx) game.sfx.playSfx('click');
      }
      return 'RUNNING';
    }
    
    return 'FAILURE';
  });

  const wander = new ActionNode((agent, delta, game) => {
    agent.mesh.visible = true;
    agent.isAtHome = false;

    const S = window.FFH.TILE_SCALE || 2.6;
    const grid = window.FFH.LUBECK_CITY_GRID;
    const M = window.FFH.MAP_SIZE;

    // Helper: is a grid tile walkable ground (strictly NO water and NO buildings)
    const isGroundTile = (gx, gz) => {
      if (gx < 1 || gx >= M - 1 || gz < 1 || gz >= M - 1) return false;
      const type = grid[gz][gx];
      const isWalkableType = (type === 'R_C' || type === 'R_B' || type === 'BR' || type === 'G');
      if (!isWalkableType) return false;
      if (window.FFH.checkBuildingCollision && window.FFH.checkBuildingCollision(gx * S, gz * S, 0.4)) return false;
      return true;
    };

    if (!agent.targetPos) {
      // Pick a nearby connected ground tile (within 1 to 3 tiles of agent's current position)
      const currentGX = Math.max(1, Math.min(M - 2, Math.round(agent.position.x / S)));
      const currentGZ = Math.max(1, Math.min(M - 2, Math.round(agent.position.z / S)));

      const nearbyGround = [];
      for (let dz = -3; dz <= 3; dz++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx === 0 && dz === 0) continue;
          const gz = currentGZ + dz;
          const gx = currentGX + dx;
          if (isGroundTile(gx, gz)) {
            nearbyGround.push({ x: gx * S, z: gz * S });
          }
        }
      }

      if (nearbyGround.length > 0) {
        const rand = nearbyGround[Math.floor(Math.random() * nearbyGround.length)];
        // Add slight variance to prevent NPCs walking in rigid single file
        agent.targetPos = new THREE.Vector3(
          rand.x + (Math.random() - 0.5) * (S * 0.35),
          0.05,
          rand.z + (Math.random() - 0.5) * (S * 0.35)
        );
      } else {
        return 'FAILURE';
      }
    }

    const dist = Math.hypot(agent.targetPos.x - agent.position.x, agent.targetPos.z - agent.position.z);
    if (dist < 0.3) {
      agent.targetPos = null;
      return 'SUCCESS';
    } else {
      // Walk towards target with building box collision and water barrier resolution
      const dirX = (agent.targetPos.x - agent.position.x) / dist;
      const dirZ = (agent.targetPos.z - agent.position.z) / dist;
      const step = agent.speed * delta;

      const nextX = agent.position.x + dirX * step;
      const nextZ = agent.position.z + dirZ * step;

      const resolved = window.FFH.resolveSlidingMovement
        ? window.FFH.resolveSlidingMovement(agent.position.x, agent.position.z, nextX, nextZ, 0.32)
        : { x: nextX, z: nextZ };

      const distMoved = Math.hypot(resolved.x - agent.position.x, resolved.z - agent.position.z);
      if (distMoved < 0.001) {
        // Blocked by building wall or water quay! Reset target and wander in a new direction
        agent.targetPos = null;
        return 'FAILURE';
      }

      agent.position.x = resolved.x;
      agent.position.z = resolved.z;
      agent.mesh.position.copy(agent.position);
      agent.mesh.position.y = 0.05; // Ground level

      const angle = Math.atan2(dirX, dirZ);
      agent.mesh.rotation.y = THREE.MathUtils.lerp(agent.mesh.rotation.y, angle, delta * 8);

      // Procedural waddle animation for citizens
      agent.walkTime = (agent.walkTime || 0) + delta * 15;
      agent.mesh.position.y = 0.05 + Math.abs(Math.sin(agent.walkTime)) * 0.12;
      agent.mesh.rotation.z = Math.cos(agent.walkTime * 0.5) * 0.15;
      return 'RUNNING';
    }
  });

  // Update needs model
  const updateNeeds = new ActionNode((agent, delta, game) => {
    if (!game.state.npcNeeds) game.state.npcNeeds = {};
    if (!game.state.npcNeeds[agent.id]) {
      game.state.npcNeeds[agent.id] = {
        food: { 'milch': 5, 'apfel': 5, 'brot': 5 } // Basic starting pantry
      };
      agent.consumeTimer = 0;
    }
    
    agent.consumeTimer += delta;
    if (agent.consumeTimer > 10) { // Every 10 in-game seconds for testing
      agent.consumeTimer = 0;
      const needs = game.state.npcNeeds[agent.id];
      const items = Object.keys(needs.food);
      const consumeItem = items[Math.floor(Math.random() * items.length)];
      if (needs.food[consumeItem] > 0) {
        needs.food[consumeItem]--;
      }
    }
    return 'SUCCESS'; // Non-blocking
  });

  // Construct complete BT
  return new Sequence([
    updateNeeds,
    new Selector([
      new Sequence([isNight, goHome]),
      checkGreeting,
      wander
    ])
  ]);
};
