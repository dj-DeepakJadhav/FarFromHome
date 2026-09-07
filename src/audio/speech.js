// Procedural audio engine. Every sound here is synthesised at runtime from
// oscillators - there are no recorded voice assets in this build by design.
// Character talk-blips are pitched per speaker (Animal Crossing / Celeste style).
window.FFH = window.FFH || {};

window.FFH.SpeechEngine = class SpeechEngine {
  constructor() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    
    // Character Talk-Blip & Acoustic Pitch Profiles (0KB memory cost, fully procedural)
    this.characterProfiles = {
      'PLAYER_FEMALE': { pitch: 1.15, filterFreq: 4000, blipBase: 360, type: 'triangle' },
      'PLAYER_MALE': { pitch: 0.95, filterFreq: 2600, blipBase: 240, type: 'triangle' },
      'NPC_RITA': { pitch: 1.05, filterFreq: 3500, blipBase: 310, type: 'sine' },
      'NPC_MARTHA': { pitch: 0.92, filterFreq: 1800, blipBase: 215, type: 'sine' },
      'NPC_MATHIAS': { pitch: 0.82, filterFreq: 1200, blipBase: 175, type: 'sawtooth' },
      'NPC_NINA': { pitch: 1.08, filterFreq: 3800, blipBase: 340, type: 'triangle' },
      'NPC_LOKKER': { pitch: 0.80, filterFreq: 1050, blipBase: 160, type: 'sawtooth' },
      'NPC_NICO': { pitch: 0.96, filterFreq: 2400, blipBase: 265, type: 'triangle' },
      'NPC_VOGEL': { pitch: 0.88, filterFreq: 1700, blipBase: 200, type: 'square' },
      'NPC_WEBER': { pitch: 1.02, filterFreq: 2900, blipBase: 290, type: 'sine' },
      'NPC_LINDEMANN': { pitch: 0.97, filterFreq: 2200, blipBase: 250, type: 'sine' },
      'NPC_KLAUS': { pitch: 1.12, filterFreq: 3900, blipBase: 355, type: 'triangle' },
      'NPC_ANKE': { pitch: 1.04, filterFreq: 3300, blipBase: 300, type: 'sine' },
      'NPC_DELIVERY_CUSTOMER': { pitch: 1.00, filterFreq: 2100, blipBase: 240, type: 'triangle' }
    };
    this.muted = false;
  }

  setMuted(isMuted) {
    this.muted = !!isMuted;
  }

  // Retro typewriter talk-blip customized per character (Animal Crossing / Celeste style)
  playTalkBlip(npcKey = null) {
    if (this.muted || (window.FFH.CONFIG && window.FFH.CONFIG.audio && window.FFH.CONFIG.audio.sfxMuted)) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    const profile = (npcKey && this.characterProfiles[npcKey]) ? this.characterProfiles[npcKey] : { blipBase: 260, type: 'triangle' };
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = profile.type || 'triangle';
    // Subtle pitch fluctuation for lively speech feel
    const baseFreq = profile.blipBase + (Math.random() - 0.5) * 40;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + 0.045);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Play pleasant acoustic preview chime for dialogue option selection
  playOptionChime(idx = 0) {
    if (this.muted || (window.FFH.CONFIG && window.FFH.CONFIG.audio && window.FFH.CONFIG.audio.sfxMuted)) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chords
    const freq = freqs[idx % freqs.length] || 523.25;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

};
