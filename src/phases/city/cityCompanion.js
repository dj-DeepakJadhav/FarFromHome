// CityCompanion: a named NPC who walks the player somewhere.
//
// Used by the `companion_walk` mechanic (see nico_tour in story.json). Nico
// leads the player past the Dom and St Mary's, which the main story path never
// visits, so it is the only scene that shows the city off.
//
// This deliberately does NOT reuse the citizen behaviour tree. Citizens wander;
// a companion has a route, waits for you, and speaks on arrival. Trying to
// express "wait for the player" as a wander node was more code than this.
window.FFH = window.FFH || {};

window.FFH.CityCompanion = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;
    this.active = false;
    this.mesh = null;
    this.stops = [];
    this.stopIndex = 0;
    this.path = null;
    this.pathIndex = 0;
    this.onArrive = null;
    this.onFinish = null;
    this.waiting = false;

    // Tunables. LEASH is the number that decides whether this feels like a
    // companion or a bug: too short and Nico dithers, too long and you lose him.
    this.SPEED = 3.2;
    this.LEASH = 7.0;          // stop and wait if the player is further than this
    this.ARRIVE_RADIUS = 1.6;  // close enough to count as reaching a stop
  }

  // stops: array of POI type keys, e.g. ['B_DOM', 'B_MARIEN']
  start(npcKey, stops, { onArrive, onFinish } = {}) {
    this.stop();
    const resolved = (stops || [])
      .map(key => {
        const m = (this.phase.interactiveMeshes || []).find(x => x.userData && x.userData.type === key);
        return m ? { key, pos: m.position.clone() } : null;
      })
      .filter(Boolean);

    if (!resolved.length) {
      console.warn('CityCompanion: none of the requested stops exist on the map', stops);
      return false;
    }

    this.mesh = window.FFH.createNPCMesh ? window.FFH.createNPCMesh(npcKey) : null;
    if (!this.mesh) {
      console.warn('CityCompanion: could not build a mesh for', npcKey);
      return false;
    }

    const p = this.phase.playerPos;
    this.mesh.position.set(p.x + 1.2, 0.12, p.z + 1.2);
    this.game.scene.add(this.mesh);

    this.stops = resolved;
    this.stopIndex = 0;
    this.onArrive = onArrive || null;
    this.onFinish = onFinish || null;
    this.active = true;
    this._routeToCurrentStop();
    return true;
  }

  stop() {
    if (this.mesh) {
      this.game.scene.remove(this.mesh);
      this.mesh = null;
    }
    this.active = false;
    this.path = null;
    this.stops = [];
  }

  _routeToCurrentStop() {
    const target = this.stops[this.stopIndex];
    if (!target) return;
    const from = this.mesh.position;
    this.path = window.FFH.findPath
      ? window.FFH.findPath(from.x, from.z, target.pos.x, target.pos.z)
      : null;
    this.pathIndex = 0;
    // No route (water, blocked): walk straight at it rather than freezing.
    if (!this.path || !this.path.length) this.path = [{ x: target.pos.x, z: target.pos.z }];
  }

  _playAction(name) {
    if (this.mesh && this.mesh.userData && this.mesh.userData.playAction) {
      this.mesh.userData.playAction(name);
    }
  }

  update(delta) {
    if (!this.active || !this.mesh) return;
    const player = this.phase.playerPos;
    if (!player) return;

    // Leash. Nico is leading, not racing: if the player drops behind he waits,
    // which is the whole difference between a guide and a runaway NPC.
    const gapToPlayer = Math.hypot(this.mesh.position.x - player.x, this.mesh.position.z - player.z);
    if (gapToPlayer > this.LEASH) {
      if (!this.waiting) { this.waiting = true; this._playAction('idle'); }
      return;
    }
    if (this.waiting) { this.waiting = false; }

    const node = this.path && this.path[this.pathIndex];
    if (!node) return;

    const dx = node.x - this.mesh.position.x;
    const dz = node.z - this.mesh.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.25) {
      this.pathIndex++;
      if (this.pathIndex >= this.path.length) this._reachedStop();
      return;
    }

    const step = Math.min(dist, this.SPEED * delta);
    this.mesh.position.x += (dx / dist) * step;
    this.mesh.position.z += (dz / dist) * step;
    this.mesh.rotation.y = Math.atan2(dx, dz);
    this._playAction('walk');
  }

  _reachedStop() {
    const reached = this.stops[this.stopIndex];
    this._playAction('idle');
    if (this.onArrive && reached) this.onArrive(reached.key, this.stopIndex, this.stops.length);

    this.stopIndex++;
    if (this.stopIndex >= this.stops.length) {
      this.active = false;
      if (this.onFinish) this.onFinish();
      return;
    }
    // Beat before moving on, so the arrival line has room to land.
    setTimeout(() => { if (this.mesh) this._routeToCurrentStop(); }, 2200);
  }
};
