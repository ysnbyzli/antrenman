// Promise-based confirm sheet: `if (await ask('Silinsin mi?')) …`. Rendered once by <ConfirmSheet> in the layout.
import { useSyncExternalStore, type ReactNode } from 'react';

export interface AskOptions { danger?: boolean; cancel?: boolean; content?: ReactNode }
export interface AskRequest extends AskOptions { title: string; body: string; ok: string; resolve: (ok: boolean) => void }

let current: AskRequest | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function ask(title: string, body = '', ok = 'Tamam', opts: AskOptions = {}) {
  return new Promise<boolean>(resolve => {
    current?.resolve(false);
    current = { title, body, ok, cancel: true, ...opts, resolve };
    emit();
  });
}

export function settle(ok: boolean) {
  current?.resolve(ok);
  current = null;
  emit();
}

export const useAsk = () =>
  useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, () => current, () => null);
