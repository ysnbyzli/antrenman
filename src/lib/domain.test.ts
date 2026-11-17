import { describe, expect, it } from 'vitest';
import { bump, monday, nextGym, streak } from './domain';
import { clock } from './format';
import type { Workout, WSet } from './types';

const sets = (...reps: number[]): WSet[] => reps.map(r => ({ kg: 40, reps: r, done: 1 }));
const workout = (over: Partial<Workout>): Workout => ({ id: 'w', plan: 'A', name: 'Full Body A', home: false, start: 0, end: 0, ex: [], ...over });
/** Noon on the Monday `n` weeks ago. */
const week = (n: number) => { const d = monday(); d.setDate(d.getDate() - 7 * n); d.setHours(12); return d.getTime(); };

describe('schedule', () => {
  it('starts with A and alternates, ignoring the home routine', () => {
    expect(nextGym([])).toBe('A');
    expect(nextGym([workout({ plan: 'H', home: true }), workout({ plan: 'A' })])).toBe('B');
    expect(nextGym([workout({ plan: 'B' })])).toBe('A');
  });
});

describe('double progression', () => {
  const e = { id: 'x', target: { sets: 2, reps: 12, unit: '' as const }, sets: [{ kg: 40 as const, reps: 12, done: 0 }, { kg: 40 as const, reps: 12, done: 0 }] };
  const last = (...reps: number[]) => [workout({ ex: [{ id: 'x', name: 'x', target: e.target, sets: sets(...reps) }] })];

  it('suggests the next step when every set reached the target', () => expect(bump(last(12, 12), e, 2.5)).toBe(42.5));
  it('stays put when one set fell short', () => expect(bump(last(12, 11), e, 2.5)).toBe(0));
  it('stays put once a set of this session is done', () =>
    expect(bump(last(12, 12), { ...e, sets: [{ kg: 40, reps: 12, done: 1 }, e.sets[1]] }, 2.5)).toBe(0));
});

describe('week streak', () => {
  const H = [0, 0, 0, 1, 1, 1, 3, 3, 3].map(n => workout({ end: week(n) }));

  it('counts consecutive weeks that reached the goal and stops at a gap', () =>
    expect(streak(H, 3)).toMatchObject({ cur: 2, best: 2, week: 3 }));
  it('carries the streak while the running week is still below the goal', () =>
    expect(streak(H.slice(1), 3).cur).toBe(1));
  it('does not count home routines', () =>
    expect(streak([workout({ end: week(0), home: true })], 1).cur).toBe(0));
});

describe('clock', () => {
  it('formats m:ss and h:mm:ss', () => {
    expect(clock(90_000)).toBe('1:30');
    expect(clock(3_723_000)).toBe('1:02:03');
    expect(clock(-5)).toBe('0:00');
  });
});
