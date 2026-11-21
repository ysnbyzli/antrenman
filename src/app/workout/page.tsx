'use client';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { Icon } from '@/components/icons';
import { Dock, NavLink, Page, useGo } from '@/components/shell';
import { Badge, Button, Chevron, Stepper, card, circle, h3, small } from '@/components/ui';
import { Thumb } from '@/components/visuals';
import {
  addSet, applyBump, completeSet, curIdx, delSet, discardWorkout, finishWorkout, goTo, restAdd, restEnd, setField, skipExercise, stepField, undoSet,
} from '@/lib/actions';
import { cx } from '@/lib/cx';
import { keepAwake } from '@/lib/device';
import { ask } from '@/lib/dialog';
import { bump, lastSets } from '@/lib/domain';
import { clock, hasKg, nf, parseNum, setText, targetText, unitLabel } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';

/** Big number the user can also type into. Empty clears it; anything that isn't a number is ignored. */
function Field({ value, unit, label, mode, onCommit }:
  { value: number | ''; unit: string; label: string; mode: 'decimal' | 'numeric'; onCommit: (v: number) => void }) {
  return (
    <label className="flex flex-1 flex-col items-center text-xs text-muted">
      <input
        key={String(value)} defaultValue={nf(value)} inputMode={mode} enterKeyHint="done" placeholder="–" aria-label={label}
        className="num w-full rounded-lg bg-transparent text-center text-[34px] leading-[1.1] font-semibold tracking-[-.02em] text-fg"
        onFocus={e => e.target.select()}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        onBlur={e => {
          const raw = e.target.value.trim(), v = parseNum(raw);
          if (raw === nf(value)) return;
          if (raw === '' || (Number.isFinite(v) && v >= 0)) onCommit(v);
          else e.target.value = nf(value);
        }}
      />
      <span>{unit}</span>
    </label>
  );
}

export default function WorkoutPage() {
  const s = useStore(), now = useNow(1000), go = useGo();
  const [sel, setSel] = useState<number | null>(null); // set picked for editing
  const [dir, setDir] = useState<1 | -1>(1); // which way the exercise content slides in
  const leaving = useRef(false), touch = useRef<[number, number, number] | null>(null), strip = useRef<HTMLDivElement>(null);
  const a = s?.active ?? null, cur = a?.cur;

  // No workout in progress (opened directly, or it was just discarded): back to home.
  useEffect(() => { if (s && !s.active && !leaving.current) go('/', true); });
  // Keep the screen on while this page is open.
  useEffect(() => {
    const sync = () => void keepAwake(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); void keepAwake(false); };
  }, []);
  // Keep the current exercise centred in the thumbnail strip.
  useEffect(() => {
    const row = strip.current, el = row?.querySelector<HTMLElement>('[aria-current]');
    if (row && el) row.scrollLeft = el.offsetLeft - row.clientWidth / 2 + 24;
  }, [cur]);

  if (!s || !a) return <Page bare>{null}</Page>;

  const H = s.history, e = a.ex[a.cur], t = e.target, isLast = a.cur === a.ex.length - 1, nx = a.ex[a.cur + 1];
  const ci = curIdx(e, sel), set = e.sets[ci], allDone = e.sets.every(x => x.done);
  const prev = lastSets(H, e.id), ps = prev[ci] || prev[prev.length - 1], note = s.notes[e.id];
  const up = a.home ? 0 : bump(H, e, s.settings.step);
  const total = a.restTotal || s.settings.rest * 1000, restLeft = Math.min(total, a.restEnd - now), resting = restLeft > 0;
  const u = unitLabel(t.unit);

  const move = (i: number) => { if (i < 0 || i >= a.ex.length) return; setDir(i > a.cur ? 1 : -1); setSel(null); goTo(i); window.scrollTo(0, 0); };
  const complete = () => { setDir(1); setSel(null); completeSet(ci); };
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
    : set && !set.done ? { label: t.unit === 'sn' ? `${set.reps} sn Başlat` : `${ci + 1}. Seti Tamamla`, run: complete }
    : set ? { label: 'Tamam', run: () => setSel(null) }
    : isLast ? { label: 'Antrenmanı Bitir', run: finish }
    : { label: 'Sonraki Hareket', run: () => move(a.cur + 1) };

  return (
    <Page bare>
      <div className="flex-1 pb-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="-mt-1 mb-2 flex items-center justify-between">
          <NavLink href="/" aria-label="Ana sayfaya dön, antrenman sürer" className={circle}><Icon name="back" className="size-6 stroke-[2.2]" /></NavLink>
          <div className="text-center">
            <div className={small}>{a.name} · {a.cur + 1}/{a.ex.length}</div>
            <div className="num text-[28px] leading-[1.1] font-semibold tracking-[-.02em]">{clock(now - a.start)}</div>
          </div>
          <button type="button" onClick={finish} className="min-h-11 cursor-pointer rounded-full bg-fg px-5 font-semibold text-page active:opacity-85">Bitir</button>
        </div>

        <div ref={strip} data-noswipe className="relative -mx-5 mb-2.5 flex gap-3 overflow-x-auto px-5 pt-1.5 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {a.ex.map((x, i) => {
            const d = x.sets.filter(y => y.done).length, all = d > 0 && d === x.sets.length, here = i === a.cur;
            return (
              <button key={x.id} type="button" onClick={() => move(i)} aria-current={here ? 'step' : undefined}
                aria-label={`${i + 1}. ${x.name}: ${x.skipped ? 'atlandı' : `${d}/${x.sets.length} set`}`} className="relative flex-none cursor-pointer rounded-[14px]">
                <Thumb id={x.id} size={48} className={cx('rounded-[14px]!', here ? 'shadow-[0_0_0_2px_var(--bg2),0_0_0_4px_var(--g1000)]' : x.skipped ? 'opacity-25' : 'opacity-50')} />
                {d > 0 && (
                  <span className={cx('num absolute -right-1.5 -bottom-1.5 grid h-5 min-w-5 place-items-center rounded-[10px] border-2 border-page px-[5px] text-[11px] font-semibold text-surface', all ? 'bg-ok' : 'bg-fg')}>
                    {all ? '✓' : `${d}/${x.sets.length}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* keyed by exercise so the content slides in from the side it came from */}
        <div key={a.cur} className={cx(dir > 0 ? 'animate-in-right' : 'animate-in-left', 'motion-reduce:animate-none')}>
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <h1 className={h3}>
                <NavLink href={`/ex/${e.id}`} className="no-underline">{e.name} <span className="text-muted" aria-hidden="true">›</span></NavLink>
              </h1>
              <p className={cx(small, 'mt-0.5')}>Hedef <span className="num">{targetText(t)}</span>{note && ` · ${note}`}</p>
            </div>
            {e.skipped ? <Badge>Atlandı</Badge> : allDone && <Badge ok>✓ Tamam</Badge>}
          </div>
          {up > 0 && (
            <button type="button" onClick={() => applyBump(up)} className="mt-3 min-h-10 cursor-pointer rounded-full bg-info-bg px-4 text-sm font-semibold text-info">
              Geçen sefer hedef tamam · {nf(up)}&nbsp;kg dene
            </button>
          )}

          <div className="mt-4 grid gap-2">
            {e.sets.map((x, i) => {
              const since = i > 0 && x.done && e.sets[i - 1].done ? x.done - e.sets[i - 1].done : 0;
              return (
                <div key={i} className="contents">
                  {since > 0 && <div className="num -my-1 text-center text-xs text-muted">{clock(since)} sonra</div>}
                  {i === ci ? (
                    <div className="animate-up rounded-3xl border border-line-2 bg-surface p-4 motion-reduce:animate-none">
                      <div className="flex items-center justify-between gap-2.5">
                        <strong>Set {i + 1}</strong>
                        {x.done ? <button type="button" className="min-h-8 cursor-pointer font-[550] text-muted" onClick={() => { undoSet(i); setSel(null); }}>Tamamlanmadı yap</button>
                          : ps && <span className={small}>Önceki <span className="num">{setText(ps, t.unit)}</span></span>}
                      </div>
                      {!a.home && (
                        <div className="mt-2.5">
                          <Stepper big label="Ağırlık" onStep={d => stepField(i, 'kg', d)}
                            value={<Field value={x.kg} unit="kg" label="Ağırlık" mode="decimal" onCommit={v => setField(i, 'kg', v)} />} />
                        </div>
                      )}
                      <div className="mt-2.5">
                        <Stepper big label={t.unit === 'sn' ? 'Süre' : 'Tekrar'} onStep={d => stepField(i, 'reps', d)}
                          value={<Field value={x.reps} unit={u} label={t.unit === 'sn' ? 'Süre' : 'Tekrar'} mode="numeric" onCommit={v => setField(i, 'reps', v)} />} />
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setSel(i)}
                      aria-label={`Set ${i + 1}: ${setText(x, t.unit)}, ${x.done ? 'tamamlandı' : 'bekliyor'}. Düzenle`}
                      className={cx('num grid min-h-15 cursor-pointer items-center gap-2 rounded-[20px] border px-4 py-1.5 text-[17px] font-medium',
                        a.home ? 'grid-cols-[24px_1fr_24px]' : 'grid-cols-[24px_1fr_1fr_24px]',
                        x.done ? 'border-ok-line bg-ok-bg text-fg' : 'border-transparent bg-surface text-muted')}>
                      <span className="text-left text-muted">{i + 1}</span>
                      {!a.home && <Pill done={!!x.done}>{hasKg(x) ? nf(x.kg) : '–'}<small className="font-sans text-xs font-normal text-muted">kg</small></Pill>}
                      <Pill done={!!x.done}>{x.reps}<small className="font-sans text-xs font-normal text-muted">{t.unit === 'sn' ? 'sn' : 'tekrar'}</small></Pill>
                      <span aria-hidden="true" className={cx('grid size-6 place-items-center rounded-full border-[1.5px] text-sm',
                        x.done ? 'border-ok bg-ok text-surface' : 'border-line-2', x.done > 0 && now - x.done < 1500 && 'animate-pop motion-reduce:animate-none')}>
                        {x.done ? '✓' : ''}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <button type="button" className="min-h-11 cursor-pointer pr-4 font-[550] text-muted" onClick={() => { addSet(); setSel(null); }}>+ Set ekle</button>
            {set && !set.done && e.sets.length > 1 && (
              <button type="button" className="min-h-11 cursor-pointer px-4 font-[550] text-muted" onClick={() => { delSet(ci); setSel(null); }}>Set {ci + 1}’i sil</button>
            )}
          </div>

          {nx && (
            <button type="button" onClick={() => move(a.cur + 1)} className={cx(card, 'mt-5 flex min-h-17 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left active:bg-fill')}>
              <Thumb id={nx.id} size={44} />
              <span className="flex-1"><span className={cx(small, 'block')}>Sıradaki</span><strong>{nx.name}</strong></span>
              <span className="num text-sm text-muted">{targetText(nx.target)}</span><Chevron />
            </button>
          )}
        </div>
      </div>

      <Dock>
        {resting && (
          <div className="mb-3 flex animate-up items-center justify-between gap-2.5 text-info motion-reduce:animate-none">
            <div className="flex items-center gap-2.5">
              <svg className="size-12 flex-none" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" className="fill-none stroke-info-bg stroke-[3.5]" />
                <circle cx="18" cy="18" r="15.5" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - (restLeft / total) * 100} transform="rotate(-90 18 18)"
                  className="fill-none stroke-info stroke-[3.5] transition-[stroke-dashoffset] duration-1000 ease-linear [stroke-linecap:round] motion-reduce:transition-none" />
              </svg>
              <div><div className="text-sm">Dinlenme</div><b className="num block text-[26px] leading-none font-semibold">{clock(restLeft)}</b></div>
            </div>
            <span className="flex gap-2.5">
              {[['+30 sn', restAdd], ['Geç', restEnd]].map(([label, run]) => (
                <button key={label as string} type="button" onClick={run as () => void} className="min-h-10 cursor-pointer rounded-full bg-info-bg px-4 text-sm font-semibold">{label as string}</button>
              ))}
            </span>
          </div>
        )}
        <Button variant="primary" big onClick={primary.run}>{primary.label}</Button>
        {!allDone && !isLast && (
          <button type="button" className="mt-1 min-h-11 w-full cursor-pointer text-[15px] font-[550] text-muted" onClick={() => { setDir(1); setSel(null); skipExercise(); window.scrollTo(0, 0); }}>
            Bu Hareketi Atla
          </button>
        )}
      </Dock>
    </Page>
  );
}

function Pill({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <span className={cx('flex h-10 items-baseline justify-center gap-1 rounded-[10px] leading-10 text-fg', !done && 'bg-fill')}>{children}</span>;
}
