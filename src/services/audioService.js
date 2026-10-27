class SynthesizerAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicInterval = null;
    this.notesSequence = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 659.25];
    this.noteIdx = 0;
  }

  init() {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      this.ctx = new AudioContextClass();
    } catch (error) {
      console.warn('Web Audio is unavailable in this browser.', error);
    }
    return this.ctx;
  }

  playTone(freq, type = 'sine', duration = 0.5, startGain = 0.12) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(startGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playCollectSFX() {
    if (!this.init()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    this.playTone(523.25, 'sine', 0.2, 0.2);
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.2), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.2), 200);
  }

  playJumpSFX() {
    if (!this.init()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    this.playTone(330, 'triangle', 0.15, 0.08);
  }

  playGateSFX() {
    if (!this.init()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    this.playTone(220, 'sine', 0.8, 0.2);
    setTimeout(() => this.playTone(440, 'sine', 1.0, 0.2), 300);
  }

  startMusic() {
    if (!this.init()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (this.musicInterval) return;
    this.musicInterval = setInterval(() => {
      if (!this.isMuted && this.ctx) {
        const freq = this.notesSequence[this.noteIdx % this.notesSequence.length];
        this.playTone(freq, 'sine', 1.2, 0.06);
        if (this.noteIdx % 2 === 0) {
          this.playTone(freq * 0.5, 'triangle', 1.8, 0.03);
        }
        this.noteIdx++;
      }
    }, 850);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopMusic();
    else this.startMusic();
    return this.isMuted;
  }
}

export const audio = new SynthesizerAudio();
