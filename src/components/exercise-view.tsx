'use client';
import { useRouter } from 'next/navigation';
import { setNote } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { EX } from '@/lib/data';
import { topKg } from '@/lib/domain';
import { fmtDate, nf, setText } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Icon } from './icons';
import { Page } from './shell';
import { Card, H2, btn, circle, h1, small } from './ui';
import { ExercisePics, MuscleMap, Spark } from './visuals';

export function ExerciseView({ id }: { id: string }) {
  const s = useStore(), router = useRouter(), x = EX[id];
  // every session that logged this exercise, newest first
  const log = (s?.history ?? []).flatMap(h => h.ex.filter(e => e.id === id && e.sets.length).map(e => ({ t: h.end, sets: e.sets, u: e.target.unit })));
  const kgs = log.map(l => topKg(l.sets)).filter(Boolean).reverse();

  return (
    <Page>
      <button type="button" onClick={() => router.back()} aria-label="Geri" className={cx(circle, 'self-start')}><Icon name="back" className="size-6 stroke-[2.2]" /></button>
      <h1 className={cx(h1, 'mt-4')}>{x.n}</h1>
      <p className={cx(small, 'mt-1')}>{x.m}</p>
      <ExercisePics id={id} />
      <Card className="mt-2.5 grid gap-2.5">
        <div><strong>Nasıl yapılır</strong><p className="text-muted">{x.how}</p></div>
        <div><strong>Dikkat</strong><p className="text-muted">{x.tip}</p></div>
      </Card>

      <H2>Çalışan kaslar</H2>
      <MuscleMap id={id} />
      <a className={btn({ className: 'mt-2.5 w-full' })} target="_blank" rel="noopener"
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${x.n} exercise proper form`)}`}>
        YouTube’da izle ↗
      </a>

      <H2><label htmlFor="note">Notum</label></H2>
      {s && (
        <textarea id="note" rows={2} placeholder="Koltuk ayarı, tutuş, hatırlatma…" defaultValue={s.notes[id] ?? ''} onBlur={e => setNote(id, e.target.value)}
          className="min-h-11 w-full resize-y rounded-2xl bg-surface px-4 py-3 text-base/[1.4] text-fg" />
      )}
      <p className={cx(small, 'mt-1.5')}>Antrenman sırasında hareketin altında görünür.</p>

      <H2>Gelişim</H2>
      {kgs.length > 1 && (
        <Card className="mb-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">En ağır set</span>
            <span className="num">{nf(kgs[0])} → {nf(kgs[kgs.length - 1])}&nbsp;kg</span>
          </div>
          <Spark values={kgs} />
        </Card>
      )}
      {log.length ? (
        <Card>
          <ul className="divide-y divide-line">
            {log.slice(0, 12).map(l => (
              <li key={l.t} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span>{fmtDate(l.t, { day: 'numeric', month: 'short' })}</span>
                <span className="num text-right text-sm">{l.sets.map(st => setText(st, l.u)).join(', ')}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : <p className={small}>Bu hareket için henüz kayıt yok.</p>}
    </Page>
  );
}
