class AudioAnnouncer {
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public playTone(freq: number, type: OscillatorType = 'sine', durationSec: number = 0.2, gainValue: number = 0.15) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch {
      // Audio not supported or blocked
    }
  }

  public playBoundaryCelebration(type: 'FOUR' | 'SIX') {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (type === 'SIX') {
      // High celebratory chord
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.4, 0.2), idx * 70);
      });
    } else {
      // Crisp 4 chime
      [440, 554.37, 659.25].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.18), idx * 60);
      });
    }
  }

  public playWicketSound() {
    if (this.isMuted) return;
    // Dramatic descending umpire horn
    [587.33, 440, 329.63, 220].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.35, 0.22), idx * 80);
    });
  }

  public playReviewSiren() {
    if (this.isMuted) return;
    [600, 800, 600, 800].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.15), idx * 120);
    });
  }

  public announce(text: string, force: boolean = false) {
    if (this.isMuted && !force) return;
    if (!this.voiceEnabled && !force) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // clear previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      // Try to select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('English')));
      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error fallback
    }
  }
}

export const audioAnnouncer = new AudioAnnouncer();
