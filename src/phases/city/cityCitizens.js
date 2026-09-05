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
      const modelKey = NPC_CHAR_;
      const mesh = window.FFH.createNPCMesh ? window.FFH.createNPCMesh(modelKey) : null;
      if (mesh) {
        mesh.position.set(spawnTile.x, 0.12, spawnTile.z);
        this.game.scene.add(mesh);
      }
      
      this.roamingCitizens.push({
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
    this.roamingCitizens.forEach(citizen => {
      this.citizenBehaviorTree.tick(citizen, delta, this.game);
      if (citizen.mesh && window.FFH.updateNPCAnimation) {
        window.FFH.updateNPCAnimation(citizen.mesh, delta);
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
