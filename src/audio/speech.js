// Neural TTS Engine replaced with pre-baked Voice Sprites using Web Audio API
window.FFH.SpeechEngine = class {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.buffers = {};
    this.fallbackMode = false; // We don't use TTS fallback anymore for core dialogue
  }

  async initONNX() {
    // Deprecated, no longer using ONNX locally, we rely on pre-baked voice sprites
  }

  async _loadSprite(key) {
    if (this.buffers[key]) return this.buffers[key];
    const b64 = window.FFH.voiceSprites && window.FFH.voiceSprites[key];
    if (!b64) return null;
    
    try {
      const response = await fetch(b64);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers[key] = audioBuffer;
      return audioBuffer;
    } catch (e) {
      console.error("Failed to decode audio sprite for", key, e);
      return null;
    }
  }

  speakKey(key) {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this._loadSprite(key).then(buffer => {
      if (buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      } else {
        console.warn("No audio sprite found for key:", key);
      }
    });
  }

  async speak(text) {
    // If we have dynamic text that isn't mapped to a key, fallback to TTS if available
    // But for the game, we want to route through speakKey
    console.warn("Dynamic speak() called, but we are using pre-baked sprites now. Text:", text);
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  }
};
