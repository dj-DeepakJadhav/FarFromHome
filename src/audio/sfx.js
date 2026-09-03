// Procedural Web Audio API sound & music generator
window.FFH.AudioEngine = class {
  constructor() {
    this.ctx = null;
    this.motorOsc = null;
    this.motorGain = null;
    this.ambienceNodes = null;
    this.bgmTimer = null;
  }
  
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  playSfx(type) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const now = this.ctx.currentTime;
    
    if (type === 'success') {
      // Pleasant coin chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'early_success') {
      // High-pitched layered chime / register sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880.00, now + 0.06); // A5
      osc.frequency.setValueAtTime(1046.50, now + 0.12); // C6
      osc.frequency.setValueAtTime(1318.51, now + 0.18); // E6
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'error') {
      // Low buzzer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'bell') {
      // Bright metallic bicycle bell (ding-ding)
      [0, 0.12].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2093.00, now + offset); // C7
        osc.frequency.exponentialRampToValueAtTime(1760.00, now + offset + 0.25);
        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
      });
    } else if (type === 'buzzer') {
      // Doorstep intercom buzzer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'register') {
      // Cash register ka-ching
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.start(now);
      osc1.stop(now + 0.4);
    } else if (type === 'click') {
      // Tiny soft clicking blip
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'stamp') {
      // Official German Amtsschimmel Heavy Stamp (*CLACK-THUD!*)
      // 1. Initial sharp wooden/metal mechanical click (clack)
      const oscClick = this.ctx.createOscillator();
      const gainClick = this.ctx.createGain();
      oscClick.connect(gainClick);
      gainClick.connect(this.ctx.destination);
      oscClick.type = 'triangle';
      oscClick.frequency.setValueAtTime(1400, now);
      oscClick.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gainClick.gain.setValueAtTime(0.22, now);
      gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      oscClick.start(now);
      oscClick.stop(now + 0.04);

      // 2. Heavy bass desk impact resonance (thud)
      const oscThud = this.ctx.createOscillator();
      const gainThud = this.ctx.createGain();
      oscThud.connect(gainThud);
      gainThud.connect(this.ctx.destination);
      oscThud.type = 'sine';
      oscThud.frequency.setValueAtTime(160, now + 0.03);
      oscThud.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      gainThud.gain.setValueAtTime(0.40, now + 0.03);
      gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      oscThud.start(now + 0.03);
      oscThud.stop(now + 0.35);
    } else if (type === 'bus_doors_hiss') {
      // Pneumatic air brake / bus door release hiss
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(1.5, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } else if (type === 'door_lock_turn') {
      // Heavy key turning in brass lock tumbler (double click + metal scrape)
      [0, 0.08].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 800 : 520, now + offset);
        osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.05);
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
    } else if (type === 'radiator_tick') {
      // Warm cast iron radiator expansion tick
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'kettle_low') {
      // Soft boiling water rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'phone_buzz') {
      // Double vibration motor buzz
      [0, 0.14].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(130, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } else if (type === 'paper_rustle') {
      // Paper document slide / unfold
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
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
      this.motorGain.gain.setTargetAtTime(intensity * 0.12, now, 0.1);
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

  startAmbience(isNight = false) {
    this.init();
    if (!this.ctx || this.ambienceNodes) return;
    
    // Pink noise generator for gentle wind / town air
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.012;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = isNight ? 350 : 600;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.035;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start(0);

    this.ambienceNodes = { source: whiteNoise, filter, gain };
  }

  stopAmbience() {
    if (this.ambienceNodes) {
      try {
        this.ambienceNodes.source.stop();
        this.ambienceNodes.source.disconnect();
      } catch (e) {}
      this.ambienceNodes = null;
    }
  }

  playBgm(type) {
    this.init();
    if (!this.ctx) return;
    this.startAmbience(type === 'night');
  }
};
