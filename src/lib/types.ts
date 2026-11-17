export type Unit = '' | 'taraf' | 'sn';
export type PlanKey = 'A' | 'B' | 'H';
export type Theme = 'auto' | 'light' | 'dark';

/** One set. `kg` is '' for bodyweight moves; `done` is the completion timestamp (0 = pending). */
export interface WSet { kg: number | ''; reps: number; done: number }
export interface Target { sets: number; reps: number; unit: Unit; max?: number }
export interface ExEntry { id: string; name: string; target: Target; sets: WSet[]; skipped?: boolean }

/** The workout in progress. Timers are stored as end timestamps so they survive a locked screen. */
export interface Active {
  id: string; plan: PlanKey; name: string; home: boolean; start: number; cur: number;
  restEnd: number; restTotal?: number; hold?: { i: number; end: number } | null; ex: ExEntry[];
}
/** A finished workout. Carries its own copy of the plan, so later plan edits never change history. */
export interface Workout {
  id: string; plan: PlanKey; name: string; home: boolean; start: number; end: number;
  ex: ExEntry[]; prs?: string[]; badges?: string[];
}
export interface BodyEntry { t: number; kg: number | null; waist: number | null }
export interface Settings {
  rest: number; step: number; goal: number; sound: boolean; theme: Theme; lastBackup: number; hideInstall?: boolean;
}
export interface State {
  active: Active | null; history: Workout[]; notes: Record<string, string>; body: BodyEntry[]; settings: Settings;
}
