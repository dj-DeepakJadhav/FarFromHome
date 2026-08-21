// Spoken-German engine using pre-baked high-fidelity Piper TTS audio sprites (Thorsten CC0)
// Falls back smoothly to browser SpeechSynthesis if needed.
window.FFH.SpeechEngine = class {
  constructor() {
    this.voice = null;
    this.hasGermanVoice = false;
    this.audioCache = new Map();
    
    // Pre-load audio elements from base64 data sprites
    if (window.FFH.voiceSprites) {
      for (const [key, dataUri] of Object.entries(window.FFH.voiceSprites)) {
        const audio = new Audio(dataUri);
        audio.preload = 'auto';
        this.audioCache.set(key, audio);
      }
    }

    this.loadVoice();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoice();
    }
  }

  loadVoice() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    const german = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('de'));
    if (german) {
      this.voice = german;
      this.hasGermanVoice = true;
    } else {
      this.voice = null;
      this.hasGermanVoice = false;
    }
  }

  speakKey(key) {
    if (this.audioCache.has(key)) {
      const audio = this.audioCache.get(key);
      try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }

  speak(text) {
    // Optional client-side TTS if voices available, otherwise silent
    if (!window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.lang = 'de-DE';
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
};
