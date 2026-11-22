// Procedural Web Audio API sound effects + Interactive Malay Speech Synthesis

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private speaking = false;
  private lastStepTime = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(m: boolean) {
    this.muted = m;
    if (m && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.speaking = false;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.speaking = false;
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.muted) {
      onEnd?.();
      return;
    }
    this.playChimeSoft();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const malayVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('ms')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('id'));
      if (malayVoice) {
        utter.voice = malayVoice;
        utter.lang = malayVoice.lang;
      } else {
        utter.lang = 'ms-MY';
      }
      utter.rate = 0.96;
      utter.pitch = 1.08;
      this.speaking = true;
      utter.onend = () => {
        this.speaking = false;
        onEnd?.();
      };
      utter.onerror = () => {
        this.speaking = false;
        onEnd?.();
      };
      window.speechSynthesis.speak(utter);
    } catch {
      this.speaking = false;
      onEnd?.();
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.14,
    delay = 0,
    freqEnd?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.tone(540, 0.07, 'triangle', 0.12, 0, 720);
  }

  public playChimeSoft() {
    this.tone(660, 0.14, 'sine', 0.08, 0);
    this.tone(880, 0.18, 'sine', 0.07, 0.07);
  }

  public playJump() {
    this.tone(240, 0.18, 'triangle', 0.14, 0, 520);
  }

  public playStep() {
    const now = performance.now();
    if (now - this.lastStepTime < 260) return;
    this.lastStepTime = now;
    this.tone(135 + Math.random() * 25, 0.055, 'sine', 0.06, 0, 90);
  }

  public playStarCollect() {
    this.tone(784, 0.12, 'triangle', 0.15, 0);
    this.tone(1046.5, 0.16, 'triangle', 0.16, 0.06);
    this.tone(1318.5, 0.24, 'sine', 0.14, 0.12);
  }

  public playBubblePop() {
    this.tone(380 + Math.random() * 220, 0.09, 'sine', 0.14, 0, 880);
  }

  public playWaterSplash() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.22;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 1.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.18;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playCorrect() {
    this.tone(523.25, 0.12, 'triangle', 0.15, 0);
    this.tone(659.25, 0.12, 'triangle', 0.15, 0.08);
    this.tone(783.99, 0.2, 'triangle', 0.16, 0.16);
  }

  public playWrong() {
    this.tone(240, 0.16, 'sawtooth', 0.09, 0, 190);
    this.tone(190, 0.22, 'sawtooth', 0.09, 0.12, 150);
  }

  public playGateOpen() {
    this.tone(440, 0.14, 'triangle', 0.14, 0);
    this.tone(554.37, 0.14, 'triangle', 0.14, 0.08);
    this.tone(659.25, 0.16, 'triangle', 0.15, 0.16);
    this.tone(880, 0.28, 'sine', 0.16, 0.24);
  }

  public playMissionComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.22, 'triangle', 0.15, idx * 0.09);
    });
  }

  public playVictoryFanfare() {
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 523.25, d: 0.14, t: 0.15 },
      { f: 659.25, d: 0.16, t: 0.3 },
      { f: 783.99, d: 0.2, t: 0.48 },
      { f: 659.25, d: 0.14, t: 0.7 },
      { f: 1046.5, d: 0.45, t: 0.86 },
    ];
    melody.forEach((m) => this.tone(m.f, m.d, 'triangle', 0.17, m.t));
  }
}

export const soundEngine = new SoundEngine();
