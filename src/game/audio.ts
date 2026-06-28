export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private drumInterval: ReturnType<typeof setInterval> | null = null;
  volume = 0.7;
  private started = false;

  init() {
    if (this.started) return;
    this.started = true;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.startAmbient();
    } catch {
      // AudioContext not available
    }
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  // Browsers create an AudioContext in a "suspended" state and only allow it to
  // start from within a user gesture. Call this from a tap/click/keypress.
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { /* ignore — will retry on next gesture */ });
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.masterGain) return;
    // Ocean low rumble
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    gain.gain.value = 0.04;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.ambientOsc = osc;

    // Drum beat pattern
    let beat = 0;
    this.drumInterval = setInterval(() => {
      const pattern = [1, 0, 0, 1, 0, 1, 0, 0];
      if (pattern[beat % pattern.length]) this.playDrum();
      beat++;
    }, 480);
  }

  private playDrum() {
    if (!this.ctx || !this.masterGain) return;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3) * 0.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  playCannon() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Low boom oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);

    // Noise burst
    const bufLen = this.ctx.sampleRate * 0.3;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2);
    }
    const noise = this.ctx.createBufferSource();
    const noiseFilter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();
    noise.buffer = buf;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 400;
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }

  playExplosion() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufLen = this.ctx.sampleRate * 0.5;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5);
    }
    const noise = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    noise.buffer = buf;
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  playSplash() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufLen = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.2) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    noise.buffer = buf;
    filter.type = 'highpass';
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  playHit() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  stop() {
    if (this.drumInterval) clearInterval(this.drumInterval);
    if (this.ambientOsc) try { this.ambientOsc.stop(); } catch { /* already stopped */ }
    if (this.ctx) this.ctx.close();
    this.started = false;
    this.ctx = null;
    this.masterGain = null;
  }
}
