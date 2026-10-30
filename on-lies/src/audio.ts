declare const Tone: any;

let synth: any = null;
let thud: any = null;
let unlocked = false;

export async function unlockAudio(): Promise<void> {
  if (unlocked) return;
  try {
    if (typeof Tone !== 'undefined' && typeof Tone.start === 'function') {
      await Tone.start();
      unlocked = true;
    }
  } catch {
    // Audio fallback if browser prevents autoplay
  }
}

export function beep(note: string, duration = '8n'): void {
  try {
    if (typeof Tone === 'undefined') return;
    synth ??= new Tone.PolySynth(Tone.Synth).toDestination();
    synth.triggerAttackRelease(note, duration);
  } catch {
    // Audio fallback
  }
}

export function stamp(note: string, duration = '16n'): void {
  try {
    if (typeof Tone === 'undefined') return;
    thud ??= new Tone.PolySynth(Tone.MembraneSynth).toDestination();
    thud.triggerAttackRelease(note, duration);
  } catch {
    // Audio fallback
  }
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a fun cartoonish slide/whistle up sound effect + sparkling bell chime
 */
export function playMascotSlideInSound(): void {
  const ctx = getAudioContext();
  if (ctx) {
    try {
      const now = ctx.currentTime;
      // 1. Cartoon slide whistle / spring boing (whimsical pitch glide upwards)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.24);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.38);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);

      // 2. Sparkle chime bells (bright C6 - E6 - G6)
      const chimes = [
        { freq: 1046.5, time: 0.18, dur: 0.2 },
        { freq: 1318.5, time: 0.28, dur: 0.24 },
        { freq: 1567.98, time: 0.38, dur: 0.3 }
      ];
      chimes.forEach(({ freq, time, dur }) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + time);
        g.gain.setValueAtTime(0, now + time);
        g.gain.linearRampToValueAtTime(0.14, now + time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + time);
        o.stop(now + time + dur + 0.02);
      });
      return;
    } catch {
      // fallback to Tone
    }
  }

  // Fallback to Tone.js
  try {
    beep('C5', '16n');
    setTimeout(() => beep('E5', '16n'), 100);
    setTimeout(() => beep('G5', '16n'), 180);
    setTimeout(() => beep('C6', '8n'), 260);
  } catch {}
}

/**
 * Play a cute subtle cartoon slide-down sound when closing
 */
export function playMascotSlideOutSound(): void {
  const ctx = getAudioContext();
  if (ctx) {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.22);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      return;
    } catch {}
  }
  try {
    beep('G4', '16n');
  } catch {}
}

/**
 * Play a playful chirp / happy feedback sound for mascot interaction
 */
export function playMascotInteractionSound(): void {
  const ctx = getAudioContext();
  if (ctx) {
    try {
      const now = ctx.currentTime;
      [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(0, now + idx * 0.06);
        g.gain.linearRampToValueAtTime(0.15, now + idx * 0.06 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.06);
        o.stop(now + idx * 0.06 + 0.24);
      });
      return;
    } catch {}
  }
  try {
    beep('E5', '16n');
    setTimeout(() => beep('A5', '8n'), 80);
  } catch {}
}
