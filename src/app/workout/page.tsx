'use client';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { Icon } from '@/components/icons';
import { Dock, NavLink, Page, useGo } from '@/components/shell';
import { Badge, Button, Chevron, btn, card, circle, small } from '@/components/ui';
import { Cover, Thumb } from '@/components/visuals';
import {
  addSet, applyBump, completeSet, curIdx, delSet, discardWorkout, finishWorkout, goTo, restAdd, restEnd, setField, skipExercise, stepField, undoSet,
} from '@/lib/actions';
import { cx } from '@/lib/cx';
import { keepAwake } from '@/lib/device';
import { ask } from '@/lib/dialog';
import { bump, lastSets } from '@/lib/domain';
import { clock, hasKg, nf, parseNum, setText, targetText } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';

/** One value of the current set: label, a big number that can also be typed, and − / + underneath. */
function Tile({ label, unit, value, mode, onStep, onCommit }:
  { label: string; unit: string; value: number | ''; mode: 'decimal' | 'numeric'; onStep: (dir: 1 | -1) => void; onCommit: (v: number) => void }) {
  const round = 'grid size-12 cursor-pointer place-items-center rounded-full bg-fill-2 text-2xl transition-transform duration-100 ease-out active:scale-[.92] motion-reduce:active:scale-100';
  return (
    <div className={cx(card, 'flex flex-col items-center')}>
      <p className={small}>{label}</p>
      <label className="mt-1 flex w-full items-baseline justify-center gap-1.5">
        {/* keyed by value so stepping refills it; empty clears, anything that isn't a number is ignored */}
        <input
          key={String(value)} defaultValue={nf(value)} inputMode={mode} enterKeyHint="done" placeholder="–" aria-label={label}
          style={{ width: `${Math.max(2, nf(value).length) * 0.62}em` }}
          className={cx('num rounded-lg bg-transparent text-center leading-[1.1] font-bold tracking-[-.02em] text-fg', nf(value).length > 5 ? 'text-[32px]' : 'text-[40px]')}
          onFocus={e => e.target.select()}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          onBlur={e => {
            const raw = e.target.value.trim(), v = parseNum(raw);
            if (raw === nf(value)) return;
            if (raw === '' || (Number.isFinite(v) && v >= 0)) onCommit(v);
            else e.target.value = nf(value);
          }}
        />
        {unit && <span className="text-muted">{unit}</span>}
      </label>
      <div className="mt-3 flex gap-3">
        <button type="button" className={round} aria-label={`${label} azalt`} onClick={() => onStep(-1)}>−</button>
        <button type="button" className={round} aria-label={`${label} artır`} onClick={() => onStep(1)}>+</button>
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  const s = useStore(), now = useNow(1000), go = useGo();
  const [sel, setSel] = useState<number | null>(null); // set picked for editing
  const [dir, setDir] = useState<1 | -1>(1); // which way the exercise content slides in
  const leaving = useRef(false), touch = useRef<[number, number, number] | null>(null);
  const a = s?.active ?? null;

  // No workout in progress (opened directly, or it was just discarded): back to home.
  useEffect(() => { if (s && !s.active && !leaving.current) go('/', true); });
  // Keep the screen on while this page is open.
  useEffect(() => {
    const sync = () => void keepAwake(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); void keepAwake(false); };
  }, []);

  if (!s || !a) return <Page bare>{null}</Page>;

  const H = s.history, e = a.ex[a.cur], t = e.target, isLast = a.cur === a.ex.length - 1, nx = a.ex[a.cur + 1];
  const ci = curIdx(e, sel), set = e.sets[ci], allDone = e.sets.every(x => x.done);
  const prev = lastSets(H, e.id), ps = prev[ci] || prev[prev.length - 1], note = s.notes[e.id];
  const up = a.home ? 0 : bump(H, e, s.settings.step);
  const total = a.restTotal || s.settings.rest * 1000, restLeft = Math.min(total, a.restEnd - now), resting = restLeft > 0;
  const timed = t.unit === 'sn';

  const move = (i: number) => { if (i < 0 || i >= a.ex.length) return; setDir(i > a.cur ? 1 : -1); setSel(null); goTo(i); window.scrollTo(0, 0); };
  const complete = () => { setDir(1); setSel(null); completeSet(ci); };
  const skip = () => { setDir(1); setSel(null); skipExercise(); window.scrollTo(0, 0); };
  const finish = async () => {
    if (!a.ex.some(x => x.sets.some(y => y.done))) {
      if (await ask('Hiç set tamamlanmadı', 'Antrenman kaydedilmeden silinsin mi?', 'Sil', { danger: true })) { leaving.current = true; discardWorkout(); go('/', true); }
      return;
    }
    const left = a.ex.filter(x => !x.skipped && x.sets.some(y => !y.done)).length;
    if (left && !(await ask('Antrenman bitirilsin mi?', `${left} harekette tamamlanmamış set var. Yapılmayan setler kaydedilmez.`, 'Bitir'))) return;
    leaving.current = true;
    go(`/summary?id=${finishWorkout()}&new=1`, true);
  };

  // Swipe left/right to change exercise.
  const onTouchStart = (ev: TouchEvent) => {
    const p = ev.touches[0];
    touch.current = (ev.target as HTMLElement).closest('input, [data-noswipe]') ? null : [p.clientX, p.clientY, Date.now()];
  };
  const onTouchEnd = (ev: TouchEvent) => {
    const from = touch.current, p = ev.changedTouches[0];
    touch.current = null;
    if (!from) return;
    const dx = p.clientX - from[0], dy = p.clientY - from[1];
    if (Math.abs(dx) > 70 && Math.abs(dy) < 40 && Date.now() - from[2] < 600) move(a.cur + (dx < 0 ? 1 : -1));
  };

  const primary = a.hold ? { label: <>Durdur · <span className="num">{clock(a.hold.end - now)}</span></>, run: complete }
    : set && !set.done ? { label: timed ? `${set.reps} sn Başlat` : `${ci + 1}. Seti Tamamla`, run: complete }
    : set ? { label: 'Tamam', run: () => setSel(null) }
    : isLast ? { label: 'Antrenmanı Bitir', run: finish }
    : { label: 'Sonraki Hareket', run: () => move(a.cur + 1) };
  // the smaller button next to it: skip while there's work left, otherwise step back
  const secondary = !allDone && !isLast ? { label: 'Atla', run: skip } : a.cur > 0 ? { label: 'Önceki', run: () => move(a.cur - 1) } : null;

  return (
    <Page bare>
      <div className="flex-1 pb-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="flex items-center justify-between">
          <NavLink href="/" aria-label="Ana sayfaya dön, antrenman sürer" className={circle}><Icon name="back" className="size-6 stroke-[2.2]" /></NavLink>
          <div className="text-center">
            <p className={small}>{a.name}</p>
            <p className="num text-[17px] font-semibold">{clock(now - a.start)}</p>
          </div>
          <button type="button" onClick={finish} className={btn({ className: 'min-h-11 px-5' })}>Bitir</button>
        </div>

        {/* one segment per exercise: done, in progress, current, to do */}
        <div className="mt-4 flex gap-1.5">
          {a.ex.map((x, i) => {
            const d = x.sets.filter(y => y.done).length, all = d > 0 && d === x.sets.length;
            return (
              <button key={x.id} type="button" onClick={() => move(i)} aria-current={i === a.cur ? 'step' : undefined}
                aria-label={`${i + 1}. ${x.name}: ${x.skipped ? 'atlandı' : `${d}/${x.sets.length} set`}`} className="flex h-7 flex-1 cursor-pointer items-center">
                <i className={cx('w-full rounded-full transition-[height] duration-150', i === a.cur ? 'h-2' : 'h-1.5',
                  all ? 'bg-flame' : d > 0 ? 'bg-flame/50' : i === a.cur ? 'bg-fg' : x.skipped ? 'bg-fill-2 opacity-50' : 'bg-fill-2')} />
              </button>
            );
          })}
        </div>

        {/* keyed by exercise so the content slides in from the side it came from */}
        <div key={a.cur} className={cx(dir > 0 ? 'animate-in-right' : 'animate-in-left', 'motion-reduce:animate-none')}>
          <NavLink href={`/ex/${e.id}`} className="mt-3 block" aria-label={`${e.name} detayları`}><Cover id={e.id} /></NavLink>
          <div className="mt-5 text-center">
            <p className={small}>Hareket {a.cur + 1}/{a.ex.length}{e.skipped && ' · Atlandı'}</p>
            <h1 className="mt-1 text-[26px] leading-[1.15] font-bold tracking-[-.02em]">{e.name}</h1>
            <p className="mt-1.5 text-muted">Hedef <span className="num">{targetText(t)}</span>{note && ` · ${note}`}</p>
            {up > 0 && (
              <button type="button" onClick={() => applyBump(up)} className="mt-3 min-h-10 cursor-pointer rounded-full bg-info-bg px-4 text-sm font-semibold text-info">
                Geçen sefer hedef tamam · {nf(up)}&nbsp;kg dene
              </button>
            )}
          </div>

          {set ? (
            <div key={ci} className="animate-up motion-reduce:animate-none">
              <div className="mt-6 flex min-h-8 items-center justify-between gap-2.5">
                <p className="text-[17px] font-semibold">Set {ci + 1}<span className="font-normal text-muted">/{e.sets.length}</span></p>
                {set.done ? <button type="button" className="min-h-8 cursor-pointer font-semibold text-muted" onClick={() => { undoSet(ci); setSel(null); }}>Tamamlanmadı yap</button>
                  : ps && <p className={small}>Önceki <span className="num">{setText(ps, t.unit)}</span></p>}
              </div>
              <div className={cx('mt-2 grid gap-2', !a.home && 'grid-cols-2')}>
                {!a.home && <Tile label="Ağırlık" unit="kg" mode="decimal" value={set.kg} onStep={d => stepField(ci, 'kg', d)} onCommit={v => setField(ci, 'kg', v)} />}
                <Tile label={timed ? 'Süre' : t.unit === 'taraf' ? 'Tekrar / taraf' : 'Tekrar'} unit={timed ? 'sn' : ''} mode="numeric" value={set.reps}
                  onStep={d => stepField(ci, 'reps', d)} onCommit={v => setField(ci, 'reps', v)} />
              </div>
            </div>
          ) : (
            <div className="mt-6 flex justify-center"><Badge ok className="px-3 py-1 text-sm">✓ Bütün setler tamam</Badge></div>
          )}

          {/* every set as a row: tap one to edit it */}
          <div className="mt-3 grid gap-2">
            {e.sets.map((x, i) => (
              <button key={i} type="button" onClick={() => setSel(i === sel ? null : i)}
                aria-label={`Set ${i + 1}: ${setText(x, t.unit)}, ${x.done ? 'tamamlandı' : 'bekliyor'}. Düzenle`}
                className={cx('num grid min-h-14 cursor-pointer grid-cols-[28px_1fr_auto_28px] items-center gap-3 rounded-[20px] px-4 text-left font-semibold',
                  x.done ? 'bg-ok-bg' : 'bg-surface', i === ci && 'ring-2 ring-fg')}>
                <span className={x.done ? 'text-ok' : 'text-muted'}>{i + 1}</span>
                <span className={x.done || i === ci ? 'text-fg' : 'text-muted'}>
                  {hasKg(x) ? <>{nf(x.kg)}<span className="font-normal text-muted"> kg × </span>{x.reps}</> : <>{x.reps}<span className="font-normal text-muted"> {timed ? 'sn' : 'tekrar'}</span></>}
                </span>
                <span className="text-sm font-normal text-muted">{x.done ? 'Tamam' : i === ci ? 'Şimdi' : 'Bekliyor'}</span>
                <span aria-hidden="true" className={cx('grid size-7 place-items-center rounded-full text-sm', x.done ? 'bg-ok text-page' : 'border-[1.5px] border-line-2',
                  x.done > 0 && now - x.done < 1500 && 'animate-pop motion-reduce:animate-none')}>{x.done ? '✓' : ''}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" className="min-h-11 cursor-pointer rounded-full bg-surface px-4 text-sm font-semibold text-muted" onClick={() => { addSet(); setSel(null); }}>+ Set ekle</button>
            {set && !set.done && e.sets.length > 1 && (
              <button type="button" className="min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold text-muted" onClick={() => { delSet(ci); setSel(null); }}>Set {ci + 1}’i sil</button>
            )}
            <NavLink href={`/ex/${e.id}`} className="ml-auto flex min-h-11 items-center rounded-full bg-surface px-4 text-sm font-semibold text-muted no-underline">Not ve geçmiş</NavLink>
          </div>

          {nx && (
            <button type="button" onClick={() => move(a.cur + 1)} className={cx(card, 'mt-6 flex w-full cursor-pointer items-center gap-3.5 p-3 text-left active:bg-fill')}>
              <Thumb id={nx.id} size={52} className="rounded-2xl!" />
              <span className="min-w-0 flex-1"><span className={cx(small, 'block')}>Sıradaki</span><strong className="block truncate font-semibold">{nx.name}</strong></span>
              <span className="num text-sm text-muted">{targetText(nx.target)}</span><Chevron />
            </button>
          )}
        </div>
      </div>

      <Dock>
        {resting && (
          <div className="mb-3 flex animate-up items-center justify-between gap-2.5 rounded-3xl bg-info-bg p-3 pl-4 text-info motion-reduce:animate-none">
            <div className="flex items-center gap-3">
              <svg className="size-11 flex-none" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" className="fill-none stroke-info/25 stroke-[3.5]" />
                <circle cx="18" cy="18" r="15.5" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - (restLeft / total) * 100} transform="rotate(-90 18 18)"
                  className="fill-none stroke-info stroke-[3.5] transition-[stroke-dashoffset] duration-1000 ease-linear [stroke-linecap:round] motion-reduce:transition-none" />
              </svg>
              <div><p className="text-sm">Dinlenme</p><p className="num text-2xl leading-none font-bold">{clock(restLeft)}</p></div>
            </div>
            <span className="flex gap-2">
              <button type="button" onClick={restAdd} className="min-h-11 cursor-pointer rounded-full bg-info/15 px-4 text-sm font-semibold">+30 sn</button>
              <button type="button" onClick={restEnd} className="min-h-11 cursor-pointer rounded-full bg-info/15 px-4 text-sm font-semibold">Geç</button>
            </span>
          </div>
        )}
        <div className={cx('grid gap-3', secondary && 'grid-cols-[1fr_2fr]')}>
          {secondary && <Button big onClick={secondary.run}>{secondary.label}</Button>}
          <Button variant="primary" big onClick={primary.run}>{primary.label}</Button>
        </div>
      </Dock>
    </Page>
  );
}
