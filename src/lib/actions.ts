// Everything that changes state. Components call these; none of them touch the DOM.
import { EX, PLANS } from './data';
import { haptic } from './device';
import { badges, lastSets, sameDay, topKg } from './domain';
import { applyTheme, norm, store } from './store';
import type { Active, ExEntry, PlanKey, State, Theme, Workout, WSet } from './types';

const active = (d: State) => d.active!;
const curEx = (d: State) => active(d).ex[active(d).cur];

/** The set being worked on: the one picked for editing, else the first pending one (-1 when all done). */
export const curIdx = (e: ExEntry, sel: number | null) => (sel != null && e.sets[sel] ? sel : e.sets.findIndex(s => !s.done));

function carryKg(e: ExEntry, i: number) {
  e.sets.slice(i + 1).forEach(s => { if (!s.done) s.kg = e.sets[i].kg; });
}

function markDone(d: State, e: ExEntry, s: WSet) {
  const a = active(d);
  s.done = Date.now();
  e.skipped = false;
  if (!a.home) { a.restTotal = d.settings.rest * 1000; a.restEnd = Date.now() + a.restTotal; }
  // all sets of this exercise done → move on while resting
  if (e.sets.every(x => x.done) && a.cur < a.ex.length - 1) a.cur++;
  haptic();
}

export function startWorkout(k: PlanKey) {
  store.update(d => {
    const p = PLANS[k];
    d.active = {
      id: Date.now().toString(36), plan: k, name: p.name, home: !!p.home, start: Date.now(), cur: 0, restEnd: 0,
      ex: p.items.map(([id, sets, reps, unit = '', max]) => {
        const prev = lastSets(d.history, id);
        return {
          id, name: EX[id].n, target: { sets, reps, unit, max },
          // last time's set count (e.g. 2 sets of an isolation move) carries over, within the plan's range
          sets: Array.from({ length: Math.min(Math.max(sets, prev.length), max || sets) }, (_, i): WSet => {
            const ps = prev[i] || prev[prev.length - 1];
            return { kg: p.home ? '' : (ps?.kg ?? ''), reps: unit === 'sn' ? reps : (ps?.reps ?? reps), done: 0 };
          }),
        };
      }),
    } satisfies Active;
  });
}

/** Complete set `i`. Timed moves (unit 'sn') start a countdown instead; tapping again stops it. */
export function completeSet(i: number) {
  store.update(d => {
    const a = active(d), e = curEx(d), s = e.sets[i];
    if (a.hold) { a.hold = null; return; }
    if (!s || s.done) return;
    if (e.target.unit === 'sn') {
      a.hold = { i, end: Date.now() + (Number(s.reps) || e.target.reps) * 1000 };
      a.restEnd = 0;
      return;
    }
    markDone(d, e, s);
  });
}

/** Called by the ticker when a hold countdown reaches zero. */
export function finishHold() {
  store.update(d => {
    const a = active(d), e = curEx(d), s = a.hold ? e.sets[a.hold.i] : undefined;
    a.hold = null;
    if (s && !s.done) markDone(d, e, s);
  });
}

export function stepField(i: number, f: 'kg' | 'reps', dir: 1 | -1) {
  store.update(d => {
    const e = curEx(d), s = e.sets[i];
    const inc = f === 'kg' ? d.settings.step : e.target.unit === 'sn' ? 5 : 1;
    s[f] = Math.max(0, Math.round(((Number(s[f]) || 0) + dir * inc) * 100) / 100);
    if (f === 'kg') carryKg(e, i);
  });
}

/** Typed value; anything that isn't a number clears the weight or restores the target reps. */
export function setField(i: number, f: 'kg' | 'reps', v: number) {
  store.update(d => {
    const e = curEx(d), s = e.sets[i], ok = Number.isFinite(v) && v >= 0;
    if (f === 'kg') { s.kg = ok ? v : ''; if (ok) carryKg(e, i); }
    else s.reps = ok ? v : e.target.reps;
  });
}

export const applyBump = (kg: number) => store.update(d => { curEx(d).sets.forEach(s => { s.kg = kg; }); });
export const undoSet = (i: number) => store.update(d => { curEx(d).sets[i].done = 0; });
export const addSet = () => store.update(d => {
  const e = curEx(d), l = e.sets[e.sets.length - 1] || { kg: '' as const, reps: e.target.reps };
  e.sets.push({ kg: l.kg, reps: l.reps, done: 0 });
});
export const delSet = (i: number) => store.update(d => {
  const e = curEx(d);
  if (e.sets.length > 1 && i >= 0) { e.sets.splice(i, 1); active(d).hold = null; }
});
export const goTo = (i: number) => store.update(d => {
  const a = active(d);
  if (i >= 0 && i < a.ex.length) { a.cur = i; a.hold = null; }
});
export const skipExercise = () => store.update(d => {
  const a = active(d);
  curEx(d).skipped = true;
  if (a.cur < a.ex.length - 1) { a.cur++; a.hold = null; }
});
export const cancelHold = () => store.update(d => { active(d).hold = null; });
export const restAdd = () => store.update(d => { const a = active(d); a.restEnd += 30000; a.restTotal = (a.restTotal || 0) + 30000; });
export const restEnd = () => store.update(d => { if (d.active) d.active.restEnd = 0; });
export const discardWorkout = () => store.update(d => { d.active = null; });

/** Save the active workout to history (only the sets actually done). Returns the new record's id. */
export function finishWorkout() {
  let id = '';
  store.update(d => {
    const a = active(d), goal = d.settings.goal;
    const ex = a.ex.map(e => ({ id: e.id, name: e.name, target: e.target, sets: e.sets.filter(s => s.done) }));
    // personal records: heavier than anything logged before (the first time doesn't count)
    const prs = ex.filter(e => {
      const old = Math.max(0, ...d.history.flatMap(h => h.ex.filter(x => x.id === e.id).map(x => topKg(x.sets))));
      return old && topKg(e.sets) > old;
    }).map(e => e.id);
    const h: Workout = { id: a.id, plan: a.plan, name: a.name, home: a.home, start: a.start, end: Date.now(), ex, prs };
    const had = new Set(badges(d.history, goal).filter(b => b.got).map(b => b.id));
    d.history.unshift(h);
    d.active = null;
    h.badges = badges(d.history, goal).filter(b => b.got && !had.has(b.id)).map(b => b.id); // earned by this workout
    id = h.id;
  });
  haptic();
  return id;
}

export const deleteWorkout = (id: string) => store.update(d => { d.history = d.history.filter(h => h.id !== id); });

// ---- settings, notes, measurements ----
const STEPS = [1, 1.25, 2.5, 5, 10];
export function nudgeSetting(k: 'rest' | 'goal' | 'step', dir: 1 | -1) {
  store.update(d => {
    const st = d.settings, i = STEPS.indexOf(st.step);
    if (k === 'rest') st.rest = Math.min(600, Math.max(15, st.rest + dir * 15));
    if (k === 'goal') st.goal = Math.min(7, Math.max(1, st.goal + dir));
    if (k === 'step') st.step = STEPS[Math.min(STEPS.length - 1, Math.max(0, (i < 0 ? 2 : i) + dir))];
  });
}
export const setSound = (on: boolean) => store.update(d => { d.settings.sound = on; });
export function setTheme(th: Theme) {
  store.update(d => { d.settings.theme = th; });
  applyTheme(th);
}
export const hideInstall = () => store.update(d => { d.settings.hideInstall = true; });
export const setNote = (id: string, text: string) => store.update(d => {
  if (text.trim()) d.notes[id] = text.trim();
  else delete d.notes[id];
});

/** One entry per day: saving again on the same day updates it. Pass null to leave a value untouched. */
export function saveBody(t: number, kg: number | null, waist: number | null) {
  store.update(d => {
    const old = d.body.find(b => sameDay(b.t, t));
    if (old) { old.kg = kg ?? old.kg; old.waist = waist ?? old.waist; }
    else d.body.push({ t, kg, waist });
    d.body.sort((a, b) => b.t - a.t);
  });
}
export const deleteBody = (t: number) => store.update(d => { d.body = d.body.filter(b => b.t !== t); });

// ---- backup ----
/** Share (iOS) or download the whole state as a JSON file. Resolves false if the user cancelled. */
export async function exportData() {
  const name = `antrenman-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(store.get())], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });
  try {
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: name });
    else {
      const l = document.createElement('a');
      l.href = URL.createObjectURL(blob);
      l.download = name;
      l.click();
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return false;
    throw err;
  }
  store.update(d => { d.settings.lastBackup = Date.now(); });
  return true;
}

/** Parse a backup file. Throws with a user-facing message when it isn't one. */
export async function readBackup(file: File): Promise<State> {
  const d = JSON.parse(await file.text());
  if (!d || !Array.isArray(d.history) || !d.settings) throw new Error('Bu dosya bir antrenman yedeği değil.');
  return norm(d);
}
export function restoreBackup(next: State) {
  store.replace(next);
  applyTheme(next.settings.theme);
}
export function wipeAll() {
  const fresh = norm({});
  store.replace(fresh);
  applyTheme(fresh.settings.theme);
}
