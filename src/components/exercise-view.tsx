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
import { Card, Group, H2, Stat, btn, circle, row, small } from './ui';
import { AreaChart, ExercisePics, MuscleMap } from './visuals';

export function ExerciseView({ id }: { id: string }) {
  const s = useStore(), router = useRouter(), x = EX[id];
  // every session that logged this exercise, newest first
  const log = (s?.history ?? []).flatMap(h => h.ex.filter(e => e.id === id && e.sets.length).map(e => ({ t: h.end, sets: e.sets, u: e.target.unit })));
  const kgs = log.map(l => topKg(l.sets)).filter(Boolean).reverse(); // oldest first
  const best = Math.max(0, ...kgs);

  return (
    <Page>
      <button type="button" onClick={() => router.back()} aria-label="Geri" className={cx(circle, 'self-start')}><Icon name="back" className="size-6 stroke-[2.2]" /></button>

      {/* start and end position alternate; name and muscles centred underneath */}
      <ExercisePics id={id} />
      <div className="mt-5 text-center">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-.02em]">{x.n}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {x.m.split(', ').map(m => <span key={m} className="rounded-full bg-surface px-3 py-1 text-sm font-semibold text-muted first-letter:uppercase">{m}</span>)}
        </div>
      </div>

      {log.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Stat icon="trophyF" tone="flame" label="En ağır" value={best ? nf(best) : '—'} unit={best ? 'kg' : undefined} />
          <Stat icon="calF" tone="info" label="Son yapılış" value={fmtDate(log[0].t, { day: 'numeric', month: 'short' })} foot={`${log.length} kez yapıldı`} />
        </div>
      )}

      <H2>Nasıl yapılır</H2>
      <Card><p>{x.how}</p></Card>
      <Card className="mt-2 flex gap-3.5">
        <Icon name="info" className="mt-0.5 size-6 text-flame" />
        <div><p className="font-semibold">Dikkat</p><p className="text-muted">{x.tip}</p></div>
      </Card>
      <a className={btn({ big: true, className: 'mt-2' })} target="_blank" rel="noopener"
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${x.n} exercise proper form`)}`}>
        YouTube’da İzle ↗
      </a>

      <H2>Çalışan kaslar</H2>
      <MuscleMap id={id} />

      <H2><label htmlFor="note">Notum</label></H2>
      {s && (
        <textarea id="note" rows={2} placeholder="Koltuk ayarı, tutuş, hatırlatma…" defaultValue={s.notes[id] ?? ''} onBlur={e => setNote(id, e.target.value)}
          className="min-h-14 w-full resize-y rounded-3xl bg-surface px-4 py-3.5 text-base/[1.4] text-fg placeholder:text-muted" />
      )}
      <p className={cx(small, 'mt-2 px-4')}>Antrenman sırasında hareketin altında görünür.</p>

      <H2>Gelişim</H2>
      {kgs.length > 1 && (
        <Card className="mb-2 overflow-hidden pb-0">
          <p className={small}>En ağır set</p>
          <p className="num text-2xl font-semibold">{nf(kgs[0])} → {nf(kgs[kgs.length - 1])}<span className="text-base font-normal text-muted"> kg</span></p>
          <div className="-mx-4 mt-2 text-flame"><AreaChart values={kgs} label={`Ağırlık gelişimi: ${nf(kgs[0])} kg → ${nf(kgs[kgs.length - 1])} kg`} /></div>
        </Card>
      )}
      {log.length ? (
        <Group>
          {log.slice(0, 12).map(l => (
            <div key={l.t} className={cx(row, 'items-baseline')}>
              <span className="flex-1 font-medium">{fmtDate(l.t, { day: 'numeric', month: 'long' })}</span>
              <span className="num text-right text-sm text-muted">{l.sets.map((st, i) => <span key={i} className="block">{setText(st, l.u)}</span>)}</span>
            </div>
          ))}
        </Group>
      ) : <Card><p className="text-muted">Bu hareket için henüz kayıt yok. İlk antrenmandan sonra gelişimin burada görünecek.</p></Card>}
    </Page>
  );
}
