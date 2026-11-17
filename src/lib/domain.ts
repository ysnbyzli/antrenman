// Pure rules of the app: schedule, streak, progression, badges. No React, no storage.
import { BADGES, GROUP, type BadgeKind, type Tier } from './data';
import { hasKg } from './format';
import type { Active, ExEntry, PlanKey, Workout, WSet } from './types';
import type { IconName } from '@/components/icons';

export const DAY = 864e5;

/** Monday 00:00 of the week containing `d`. */
export function monday(d: Date | number = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
export const sameDay = (a: Date | number, b: Date | number) => new Date(a).toDateString() === new Date(b).toDateString();
/** Gym days are Monday, Wednesday, Friday. */
export const gymDay = (d: Date | number) => [1, 3, 5].includes(new Date(d).getDay());

/** A and B simply alternate (= Pzt A, Çar B, Cum A / Pzt B, Çar A, Cum B), so a missed day never skips a workout. */
export function nextGym(H: Workout[]): 'A' | 'B' {
  const l = H.find(h => !h.home);
  return l && l.plan === 'A' ? 'B' : 'A';
}
export const gymOn = (H: Workout[], d: Date | number) => H.find(h => !h.home && sameDay(h.end, d));
export const suggested = (H: Workout[], d: Date = new Date()): PlanKey => (gymDay(d) && !gymOn(H, d) ? nextGym(H) : 'H');

export const topKg = (sets: WSet[]) => Math.max(0, ...sets.map(s => Number(s.kg) || 0));
export const doneCount = (a: Active) => a.ex.filter(e => e.sets.some(s => s.done)).length;
export const volume = (h: Workout) =>
  h.ex.reduce((n, e) => n + e.sets.reduce((m, s) => m + (Number(s.kg) || 0) * (Number(s.reps) || 0), 0), 0);

/** Sets of the most recent finished session that has this exercise. */
export function lastSets(H: Workout[], id: string): WSet[] {
  for (const h of H) {
    const e = h.ex.find(e => e.id === id && e.sets.length);
    if (e) return e.sets;
  }
  return [];
}

/** Double progression: every set of the last session reached the target reps → suggest the next weight step. 0 = no suggestion. */
export function bump(H: Workout[], e: Pick<ExEntry, 'id' | 'target' | 'sets'>, step: number) {
  const p = lastSets(H, e.id), t = e.target;
  if (p.length < t.sets || e.sets.some(s => s.done) || !p.every(s => hasKg(s) && s.reps >= t.reps)) return 0;
  const kg = topKg(p);
  return e.sets.every(s => s.kg === kg) ? Math.round((kg + step) * 100) / 100 : 0;
}

export interface Streak { cur: number; best: number; goal: number; week: number }
/** Week streak: consecutive weeks (Mon–Sun) that reached the weekly goal. The running week only counts once it's reached. */
export function streak(H: Workout[], goal: number): Streak {
  const cnt: Record<number, number> = {};
  H.filter(h => !h.home).forEach(h => { const k = monday(h.end).getTime(); cnt[k] = (cnt[k] || 0) + 1; });
  const ok = (k: number) => (cnt[k] || 0) >= goal;
  const back = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x; };
  let w = monday(), cur = 0;
  if (!ok(w.getTime())) w = back(w);
  while (ok(w.getTime())) { cur++; w = back(w); }
  let best = 0, run = 0, last: number | null = null;
  Object.keys(cnt).map(Number).sort((a, b) => a - b).forEach(k => {
    if (!ok(k)) { run = 0; last = null; return; }
    run = last != null && Math.round((k - last) / (7 * DAY)) === 1 ? run + 1 : 1;
    last = k;
    best = Math.max(best, run);
  });
  return { cur, best, goal, week: cnt[monday().getTime()] || 0 };
}

export interface Badge {
  id: string; name: string; desc: string; k: BadgeKind; icon: IconName; need: number; tier: Tier; label: string; cur: number; got: boolean;
}
export function badges(H: Workout[], goal: number): Badge[] {
  const v: Record<BadgeKind, number> = {
    n: H.filter(h => !h.home).length,
    s: streak(H, goal).best,
    pr: H.reduce((n, h) => n + (h.prs?.length || 0), 0),
    vol: Math.round(H.reduce((n, h) => n + volume(h), 0)),
    home: H.filter(h => h.home).length,
  };
  return BADGES.map(([id, name, desc, k, need, tier, label]) => ({
    id, name, desc, k, icon: GROUP[k][1], need, tier, label, cur: Math.min(v[k], need), got: v[k] >= need,
  }));
}

/** How deep a route sits in the navigation: tabs 0, pushed screens 1, exercise detail 2. Drives slide direction. */
export function depth(path: string) {
  const p = path.replace(/\/+$/, '') || '/';
  if (p.startsWith('/ex/')) return 2;
  return ['/workout', '/summary', '/streak', '/exercises', '/history/detail'].includes(p) ? 1 : 0;
}
