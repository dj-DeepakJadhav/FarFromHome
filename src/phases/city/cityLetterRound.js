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
    const pool = (this.phase.interactiveMeshes || []).filter(m =>
      m.userData && typeof m.userData.type === 'string' &&
      (m.userData.type.startsWith('A') || m.userData.type.startsWith('B_')) &&
      m.userData.type !== 'B_RATHAUS');

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
      const name = (meta && meta.name) ? meta.name : `Altbau ${gx}\u2011${gz}`;
      if (seen.has(name)) continue;      // never the same door twice in one round
      seen.add(name);
      this.addresses.push({ key: m.userData.type, name, pos: m.position.clone() });
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
    this.game.state.activeObjective =
      `Letter ${this.delivered + 1} of ${this.addresses.length}: ${a.name}`;
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
    }
    if (this.onFinish) this.onFinish(this.game.state.lastLetterRound);
  }
};
