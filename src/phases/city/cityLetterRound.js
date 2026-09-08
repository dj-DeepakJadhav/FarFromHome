// CityLetterRound: the post job (Day 3, fail branch).
//
// Deliberately NOT the Kruma loop. Kruma's verb is "sort at speed" against a
// shelf; this one's verb is "navigate and knock" against a clock. It reuses the
// city, the doorways and the distance indicator, and adds no assets.
//
// Economy: paid per letter DELIVERED, not carried. Flat rate, no streak and no
// early-pick multiplier, because there is no sorting to be good at. It pays
// less than a Kruma shift on purpose, so climbing back to the trial stays the
// player's own idea. Tunables live in window.FFH.ECONOMY.
window.FFH = window.FFH || {};

window.FFH.CityLetterRound = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;
    this.active = false;
    this.addresses = [];
    this.index = 0;
    this.delivered = 0;
    this.timeRemaining = 0;
    this.onFinish = null;
    this.ARRIVE_RADIUS = 2.2;
  }

  start({ count, seconds, onFinish } = {}) {
    const E = window.FFH.ECONOMY || {};
    const want = count || E.LETTER_ROUND_SIZE || 5;
    // Exclude the outer border ring. Those tiles are decorative scenery that
    // frames the map, so a round could send the player to "Altbau 0-0", the
    // literal corner of the world.
    const M = window.FFH.MAP_SIZE || 24;
    const TILE0 = window.FFH.TILE_SCALE || 2.6;
    const onBorder = (m) => {
      const gx = Math.round(m.position.x / TILE0);
      const gz = Math.round(m.position.z / TILE0);
      return gx <= 1 || gz <= 1 || gx >= M - 2 || gz >= M - 2;
    };
    const pool = (this.phase.interactiveMeshes || []).filter(m =>
      m.userData && typeof m.userData.type === 'string' &&
      (m.userData.type.startsWith('A') || m.userData.type.startsWith('B_')) &&
      m.userData.type !== 'B_RATHAUS' &&
      !onBorder(m));

    if (pool.length < 2) {
      console.warn('CityLetterRound: not enough addresses on the map');
      return false;
    }

    // Shuffle, then take the round. Random each time, so no two rounds are the
    // same walk.
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    // Most residential meshes share a type key ('A1', 'A3'...), so naming by type
    // produced rounds like "A3, A3, A1" that read as debug output. Named POIs
    // keep their name; everything else gets a stable address from its position.
    const TILE = window.FFH.TILE_SCALE || 2.6;
    const seen = new Set();
    this.addresses = [];
    for (const m of shuffled) {
      if (this.addresses.length >= want) break;
      const meta = window.FFH.POI_METADATA && window.FFH.POI_METADATA[m.userData.type];
      const gx = Math.round(m.position.x / TILE);
      const gz = Math.round(m.position.z / TILE);
      // A named POI keeps its name. A residential block gets a house number
      // plus the nearest landmark, because "Altbau 10-14" is a grid coordinate
      // and tells the player nothing about where to walk.
      let name;
      if (meta && meta.name) {
        name = meta.name;
      } else {
        const houseNo = 2 * (gx * 3 + gz) % 90 + 2;      // stable, even, plausible
        const near = this._nearestLandmark(m.position);
        name = near ? `Altbau ${houseNo}, by ${near}` : `Altbau ${houseNo}`;
      }
      if (seen.has(name)) continue;      // never the same door twice in one round
      seen.add(name);
      // Keep the mesh, not only the position. The street beacon needs a target
      // mesh to resolve a door from, and residential types are shared across
      // many buildings ('A1', 'A3'), so the type key alone cannot locate one.
      // Score against the DOOR, not the building centre.
      //
      // The street beacon is drawn at getDoorPosition(), which is a fixed table
      // entry for named POIs and a 1.4 unit offset toward the road for
      // residentials. The round used to measure to the mesh centre instead, so
      // the ring the player walked to was not the point that counted, and for
      // a named POI the two could be metres apart. Same function, same point.
      const door = (this.phase.doorwayController
        && this.phase.doorwayController.getDoorPosition)
        ? this.phase.doorwayController.getDoorPosition(m.userData.type, m.position)
        : m.position.clone();
      this.addresses.push({ key: m.userData.type, name, pos: door, mesh: m });
    }
    if (this.addresses.length < 2) return false;

    this.index = 0;
    this.delivered = 0;
    this.timeRemaining = seconds || E.LETTER_ROUND_SECONDS || 120;
    this.onFinish = onFinish || null;
    this.active = true;
    this._announce();
    return true;
  }

  // Nearest named POI, used to describe a residential address in terms the
  // player can actually navigate by.
  _nearestLandmark(pos) {
    const meta = window.FFH.POI_METADATA || {};
    let best = null, bestD = Infinity;
    (this.phase.interactiveMeshes || []).forEach(m => {
      const t = m.userData && m.userData.type;
      if (!t || !meta[t] || !meta[t].name) return;
      const d = m.position.distanceTo(pos);
      if (d > 0.5 && d < bestD) { bestD = d; best = meta[t].name; }
    });
    // 32 units is a little over a third of the map, which is close enough for
    // a landmark to be a useful bearing. At 18 many residential blocks in the
    // quieter quarters fell through and were left as a bare "Altbau 44".
    if (!best || bestD > 32) return null;
    // Trim a parenthetical, so "St. Mary's (Church)" reads as "St. Mary's".
    return best.replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  stop() {
    this.active = false;
    this.addresses = [];
    if (this.game.ui && this.game.ui.updateCityExplorerHUD) {
      this.game.ui.updateCityExplorerHUD(0, 0, false);
    }
  }

  get current() { return this.addresses[this.index] || null; }

  _announce() {
    const a = this.current;
    if (!a) return;
    // Say where to go, not just how many are left. The HUD range readout
    // supplies live distance and bearing beside this line.
    this.game.state.activeObjective =
      `Deliver to ${a.name}  (${this.delivered + 1}/${this.addresses.length})`;
    if (this.game.ui && this.game.ui.updatePersistentHUD) {
      this.game.ui.updatePersistentHUD(this.game.state);
    }
  }

  update(delta) {
    if (!this.active) return;

    this.timeRemaining -= delta;
    if (this.timeRemaining <= 0) { this._finish('time'); return; }

    const a = this.current;
    const p = this.phase.playerPos;
    if (!a || !p) return;

    const dx = a.pos.x - p.x;
    const dz = a.pos.z - p.z;
    const dist = Math.hypot(dx, dz);

    // Reuse the objective range readout in the HUD; it is the same information.
    if (this.game.ui && this.game.ui.updateCityExplorerHUD) {
      this.game.ui.updateCityExplorerHUD(dist, Math.atan2(dx, dz), true);
    }

    if (dist <= this.ARRIVE_RADIUS) {
      this.delivered++;
      this.index++;
      if (this.game.sfx) this.game.sfx.playSfx('success');
      if (this.game.ui && this.game.ui.spawnFloatingText) {
        const rate = (window.FFH.ECONOMY || {}).LETTER_RATE || 2.4;
        this.game.ui.spawnFloatingText(`Delivered  +${rate.toFixed(2)}€`,
          window.innerWidth / 2, window.innerHeight / 2, '#2A9D8F');
      }
      if (this.index >= this.addresses.length) this._finish('complete');
      else this._announce();
    }
  }

  _finish(reason) {
    const E = window.FFH.ECONOMY || {};
    const rate = E.LETTER_RATE || 2.4;
    const pay = window.FFH.round2(this.delivered * rate);
    const undelivered = this.addresses.length - this.delivered;

    this.game.state.wallet = window.FFH.round2((this.game.state.wallet || 0) + pay);
    this.game.state.lastLetterRound = {
      delivered: this.delivered, undelivered, pay, reason
    };
    this.active = false;

    if (this.game.ui && this.game.ui.updateCityExplorerHUD) {
      this.game.ui.updateCityExplorerHUD(0, 0, false);
    }
    if (this.game.ui && this.game.ui.updatePersistentHUD) {
      this.game.state.activeObjective = reason === 'time'
        ? `Round over. ${undelivered} letter(s) undelivered.`
        : 'Round complete.';
      this.game.ui.updatePersistentHUD(this.game.state);
      // Then release the line, or "Round complete." sits in the HUD as the
      // player's objective through the scenes that follow.
      setTimeout(() => {
        if (this.active) return;                 // a new round started meanwhile
        if (this.game.state.activeObjective === 'Round complete.'
            || /^Round over\./.test(this.game.state.activeObjective || '')) {
          this.game.state.activeObjective = null;
          if (this.game.ui && this.game.ui.updatePersistentHUD) {
            this.game.ui.updatePersistentHUD(this.game.state);
          }
        }
      }, 3200);
    }
    if (this.onFinish) this.onFinish(this.game.state.lastLetterRound);
  }
};
