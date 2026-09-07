// CityCitizens: Manages spawning, roaming, and behavior tree ticks for ambient Lübeck citizens.
window.FFH = window.FFH || {};

window.FFH.CityCitizens = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;
    this.roamingCitizens = [];
    this.citizenBehaviorTree = null;
  }

  setup() {
    this.dispose();
    this.citizenBehaviorTree = window.FFH.createCitizenBehaviorTree ? window.FFH.createCitizenBehaviorTree() : null;
    const S = window.FFH.TILE_SCALE || 2.0;
    const roadTiles = [];

    if (window.FFH.LUBECK_CITY_GRID) {
      for (let z = 1; z < window.FFH.MAP_SIZE - 1; z++) {
        for (let x = 1; x < window.FFH.MAP_SIZE - 1; x++) {
          if (['R_C', 'R_B', 'BR', 'R_R'].includes(window.FFH.LUBECK_CITY_GRID[z][x])) {
            roadTiles.push({ x: x * S, z: z * S });
          }
        }
      }
    }

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
    for (let i = 0; i < 12; i++) {
      if (roadTiles.length === 0) break;
      const spawnTile = roadTiles[Math.floor(Math.random() * roadTiles.length)];
      const homeTile = roadTiles[Math.floor(Math.random() * roadTiles.length)];
      const modelKey = `NPC_CHAR_${letters[i % letters.length]}`;
      const mesh = window.FFH.createNPCMesh ? window.FFH.createNPCMesh(modelKey) : null;
      if (mesh) {
        mesh.position.set(spawnTile.x, 0.12, spawnTile.z);
        this.game.scene.add(mesh);
      }
      
      this.roamingCitizens.push({
        id: `citizen_${i}`,
        position: new THREE.Vector3(spawnTile.x, 0.12, spawnTile.z),
        homePosition: new THREE.Vector3(homeTile.x, 0.12, homeTile.z),
        targetPos: null,
        speed: 1.8 + Math.random() * 1.0,
        mesh: mesh,
        isAtHome: false,
        isGreeting: false,
        greetTimer: 0,
        greetCooldown: 0,
        greetTarget: null
      });
    }

    // Expose reference on phase for any legacy access
    this.phase.roamingCitizens = this.roamingCitizens;
    this.phase.citizenBehaviorTree = this.citizenBehaviorTree;
  }

  update(delta) {
    if (!this.roamingCitizens || !this.citizenBehaviorTree) return;
    const playerPos = this.phase.playerPos;

    this.roamingCitizens.forEach(citizen => {
      // 1. Tick behavior tree for pathfinding and goal logic
      this.citizenBehaviorTree.tick(citizen, delta, this.game);

      // 2. Collision Avoidance against Main Player Courier (Soft Repulsion Sphere)
      if (playerPos && citizen.position) {
        const dx = citizen.position.x - playerPos.x;
        const dz = citizen.position.z - playerPos.z;
        const distToPlayer = Math.hypot(dx, dz);
        const MIN_PLAYER_DIST = 1.1; // Minimum distance between player and citizen

        if (distToPlayer < MIN_PLAYER_DIST && distToPlayer > 0.001) {
          const pushFactor = (MIN_PLAYER_DIST - distToPlayer) / MIN_PLAYER_DIST;
          citizen.position.x += (dx / distToPlayer) * pushFactor * 0.08;
          citizen.position.z += (dz / distToPlayer) * pushFactor * 0.08;
          if (citizen.mesh) {
            citizen.mesh.position.x = citizen.position.x;
            citizen.mesh.position.z = citizen.position.z;
          }
        }
      }

      // 3. Collision Avoidance between NPCs
      this.roamingCitizens.forEach(other => {
        if (other !== citizen && other.position && citizen.position) {
          const dx = citizen.position.x - other.position.x;
          const dz = citizen.position.z - other.position.z;
          const dist = Math.hypot(dx, dz);
          const MIN_NPC_DIST = 0.85;

          if (dist < MIN_NPC_DIST && dist > 0.001) {
            const pushFactor = (MIN_NPC_DIST - dist) / MIN_NPC_DIST;
            citizen.position.x += (dx / dist) * pushFactor * 0.04;
            citizen.position.z += (dz / dist) * pushFactor * 0.04;
            if (citizen.mesh) {
              citizen.mesh.position.x = citizen.position.x;
              citizen.mesh.position.z = citizen.position.z;
            }
          }
        }
      });

      // 4. Update Animations & Procedural Walk Bobbing
      if (citizen.mesh) {
        if (window.FFH.updateNPCAnimation) {
          window.FFH.updateNPCAnimation(citizen.mesh, delta);
        }
      }
    });
  }

  dispose() {
    if (this.roamingCitizens) {
      this.roamingCitizens.forEach(c => {
        if (c.mesh && c.mesh.parent) {
          c.mesh.parent.remove(c.mesh);
        }
      });
    }
    this.roamingCitizens = [];
    this.phase.roamingCitizens = [];
  }
};
