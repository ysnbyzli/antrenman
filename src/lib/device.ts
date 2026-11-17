// Browser-only helpers: sound, haptics, wake lock. All fail silently where unsupported.
import { store } from './store';

let ac: AudioContext | undefined;

/** Sound needs a user gesture first; call this from a tap. It only plays while the app is on screen. */
export function unlockAudio() {
  if (!store.get()?.settings.sound) return;
  try {
    ac ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    void ac.resume();
  } catch {}
}

export function beep() {
  navigator.vibrate?.([200, 100, 200]);
  const ctx = ac;
  if (!ctx || !store.get()?.settings.sound) return;
  [0, 0.25].forEach(d => {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + d;
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.2);
  });
}

/** iOS has no vibrate(); toggling a native switch gives a light tap on recent iOS versions. Harmless elsewhere. */
export function haptic() {
  try { document.getElementById('haptic')?.click(); } catch {}
}

let lock: WakeLockSentinel | null = null;
/** Keep the screen on (where the browser supports it). */
export async function keepAwake(on: boolean) {
  try {
    if (on && !lock && !document.hidden) {
      lock = (await navigator.wakeLock?.request('screen')) ?? null;
      lock?.addEventListener('release', () => { lock = null; });
    } else if (!on && lock) {
      void lock.release();
      lock = null;
    }
  } catch {}
}
