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
