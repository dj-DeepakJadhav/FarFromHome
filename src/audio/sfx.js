// Procedural Web Audio API sound generator
window.FFH.AudioEngine = class {
  constructor() {
    this.ctx = null;
  }
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  playSfx(type) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    const now = this.ctx.currentTime;
    
    if (type === 'success') {
      // Pleasant coin sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'early_success') {
      // High-pitched layered chime / register sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880.00, now + 0.06); // A5
      osc.frequency.setValueAtTime(1046.50, now + 0.12); // C6
      osc.frequency.setValueAtTime(1318.51, now + 0.18); // E6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'error') {
      // Low buzzer
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'slide') {
      // Short whistle
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'click') {
      // Tiny soft clicking blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  startMotor() {
    this.init();
    if (!this.ctx || this.motorOsc) return;
    this.motorOsc = this.ctx.createOscillator();
    this.motorGain = this.ctx.createGain();
    this.motorOsc.type = 'sine';
    this.motorOsc.frequency.value = 80;
    this.motorGain.gain.value = 0;
    this.motorOsc.connect(this.motorGain);
    this.motorGain.connect(this.ctx.destination);
    this.motorOsc.start();
  }

  setMotorIntensity(intensity) {
    if (!this.motorOsc) this.startMotor();
    if (this.motorOsc && this.motorGain) {
      const now = this.ctx.currentTime;
      this.motorOsc.frequency.setTargetAtTime(80 + intensity * 60, now, 0.1);
      this.motorGain.gain.setTargetAtTime(intensity * 0.15, now, 0.1);
    }
  }

  stopMotor() {
    if (this.motorOsc && this.motorGain) {
      const now = this.ctx.currentTime;
      this.motorGain.gain.setTargetAtTime(0, now, 0.1);
      setTimeout(() => {
        if (this.motorOsc) {
          this.motorOsc.stop();
          this.motorOsc.disconnect();
          this.motorOsc = null;
        }
      }, 200);
    }
  }
};
