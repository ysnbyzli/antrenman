// App state lives in localStorage (same key as the pre-Next.js app, so existing data carries over).
// A tiny external store: components subscribe with useStore(), actions change it with store.update().
import { useSyncExternalStore } from 'react';
import type { State, Theme } from './types';

const KEY = 'fitness-v1';

/** Fill in defaults so older saves and backups keep working. */
export const norm = (d: Partial<State>): State => ({
  active: d.active || null,
  history: d.history || [],
  notes: d.notes || {},
  body: d.body || [],
  // look 2 = the dark-first redesign: saves from before it switch to dark once, after that the choice is the user's
  settings: { rest: 90, step: 2.5, goal: 3, sound: true, lastBackup: 0, ...d.settings, theme: d.settings?.look === 2 ? d.settings.theme : 'dark', look: 2 },
});

function read(): State {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && Array.isArray(d.history)) return norm(d);
  } catch {}
  return norm({});
}

let state: State | null = null;
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach(l => l());
}

export const store = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  /** Current state; null while prerendering (no localStorage there). */
  get: (): State | null => (typeof window === 'undefined' ? null : (state ??= read())),
  /** Change state by mutating a private copy: components always get a fresh, immutable snapshot. */
  update(fn: (draft: State) => void) {
    const draft = structuredClone(store.get()!);
    fn(draft);
    commit(draft);
  },
  replace: (next: State) => commit(next),
};

/** Subscribe a component to the state. Returns null during prerender and hydration: render nothing until it's there. */
export const useStore = () => useSyncExternalStore(store.subscribe, store.get, () => null);

/** Theme is system by default and can be forced; mirrored on <html data-theme> for the CSS tokens. */
export function applyTheme(th: Theme) {
  const bg = { light: '#f2f2f7', dark: '#0b0b0b' };
  if (th === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = th;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(m => {
    m.content = th === 'auto' ? (m.media.includes('dark') ? bg.dark : bg.light) : bg[th];
  });
}
