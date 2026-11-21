'use client';
// Things that run once for the whole app: timers, theme, service worker, confirm sheet.
import { useEffect, useRef } from 'react';
import { finishHold, restEnd } from '@/lib/actions';
import { asset, cx } from '@/lib/cx';
import { beep, unlockAudio } from '@/lib/device';
import { settle, useAsk } from '@/lib/dialog';
import { applyTheme, store } from '@/lib/store';
import { btn, h3 } from './ui';

/** Mounted in the root layout. Renders the confirm sheet and the hidden haptic switch. */
export function Runtime() {
  useEffect(() => {
    applyTheme(store.get()!.settings.theme);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      void navigator.serviceWorker.register(asset('/sw.js'), { scope: asset('/') });
    }
    // Timers are stored as end timestamps, so they stay correct after the screen was locked.
    const tick = () => {
      const a = store.get()?.active;
      if (!a) return;
      if (a.hold && a.hold.end <= Date.now()) { beep(); finishHold(); }
      if (a.restEnd && a.restEnd <= Date.now()) { beep(); restEnd(); }
    };
    const timer = setInterval(tick, 1000);
    const wake = () => { if (!document.hidden) tick(); };
    const unlock = () => { if (store.get()?.active) unlockAudio(); };
    document.addEventListener('visibilitychange', wake);
    document.addEventListener('pointerdown', unlock);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', wake);
      document.removeEventListener('pointerdown', unlock);
    };
  }, []);

  return (
    <>
      <ConfirmSheet />
      <label aria-hidden="true" className="pointer-events-none fixed opacity-0">
        {/* @ts-expect-error `switch` is a Safari-only attribute used for the haptic tap */}
        <input id="haptic" type="checkbox" switch="" tabIndex={-1} />
      </label>
    </>
  );
}

/** Bottom sheet for ask(): closes with Esc, the backdrop's cancel, or either button. */
function ConfirmSheet() {
  const req = useAsk(), ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (req && d && !d.open) { d.returnValue = ''; d.showModal(); }
  }, [req]);
  return (
    <dialog
      ref={ref}
      onClose={e => settle(e.currentTarget.returnValue === 'ok')}
      className="sheet m-[auto_auto_0] w-full max-w-[520px] overscroll-contain rounded-t-[28px] bg-surface px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)] text-fg"
    >
      {req && (
        <form method="dialog" className={cx(req.content ? 'text-center' : undefined)}>
          {req.content && <div className="mt-1 mb-4 grid place-items-center">{req.content}</div>}
          <h3 className={h3}>{req.title}</h3>
          <p className="mt-1.5 mb-5 whitespace-pre-line text-muted">{req.body}</p>
          <div className="grid gap-2.5">
            <button value="ok" className={btn({ variant: 'primary', big: true, className: req.danger ? 'border-danger! bg-danger! text-white!' : undefined })}>
              {req.ok}
            </button>
            {req.cancel && <button value="" className={btn({ big: true })}>Vazgeç</button>}
          </div>
        </form>
      )}
    </dialog>
  );
}
