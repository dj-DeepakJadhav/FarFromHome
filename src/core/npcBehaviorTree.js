// Behavior Tree nodes and logic for Far From Home NPCs
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
  Selector,
  Sequence,
  ActionNode
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
    
    if (!agent.targetPos) {
      // Pick a random road tile from window.FFH.LUBECK_CITY_GRID
      const roadTiles = [];
      const S = window.FFH.TILE_SCALE || 2.0;
      for (let z = 1; z < window.FFH.MAP_SIZE - 1; z++) {
        for (let x = 1; x < window.FFH.MAP_SIZE - 1; x++) {
          const type = window.FFH.LUBECK_CITY_GRID[z][x];
          if (type === 'R_C' || type === 'R_B' || type === 'BR') {
            roadTiles.push({ x: x * S, z: z * S });
          }
        }
      }
      if (roadTiles.length > 0) {
        const rand = roadTiles[Math.floor(Math.random() * roadTiles.length)];
        // Add tiny variance to prevent stacking
        agent.targetPos = new THREE.Vector3(rand.x + (Math.random() - 0.5) * 0.6, 0.05, rand.z + (Math.random() - 0.5) * 0.6);
      } else {
        return 'FAILURE';
      }
    }

    const dist = Math.hypot(agent.targetPos.x - agent.position.x, agent.targetPos.z - agent.position.z);
    if (dist < 0.3) {
      agent.targetPos = null;
      return 'SUCCESS';
    } else {
      // Walk towards target
      const dirX = (agent.targetPos.x - agent.position.x) / dist;
      const dirZ = (agent.targetPos.z - agent.position.z) / dist;
      agent.position.x += dirX * agent.speed * delta;
      agent.position.z += dirZ * agent.speed * delta;
      agent.mesh.position.copy(agent.position);
      agent.mesh.position.y = 0.05; // Reset base height
      const angle = Math.atan2(dirX, dirZ);
      agent.mesh.rotation.y = THREE.MathUtils.lerp(agent.mesh.rotation.y, angle, delta * 8);

      // Procedural waddle animation for monolithic meshes
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
