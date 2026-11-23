'use client';
import { useState, type FormEvent } from 'react';
import { Page } from '@/components/shell';
import { Button, Card, Group, H2, Segmented, circle, h1, row, small } from '@/components/ui';
import { AreaChart } from '@/components/visuals';
import { deleteBody, saveBody } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { ask } from '@/lib/dialog';
import { sameDay } from '@/lib/domain';
import { fmtDate, nf, parseNum } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';

type Metric = 'kg' | 'waist';
const METRICS: [Metric, string][] = [['kg', 'Kilo'], ['waist', 'Bel çevresi']];
const UNIT: Record<Metric, string> = { kg: 'kg', waist: 'cm' };
/** One decimal at most, whatever was stored. */
const fmt = (v: number) => nf(Math.round(v * 10) / 10);
const field = 'num min-h-12 w-28 rounded-full bg-fill-2 text-center text-[17px] font-semibold text-fg';

/** "↘ 0,9 kg" in green when it went down, "↗" in orange when it went up. */
function Delta({ d, unit }: { d: number; unit: string }) {
  if (!d) return <span className="text-muted">değişmedi</span>;
  return <span className={cx('num font-semibold', d < 0 ? 'text-ok' : 'text-flame')}>{d < 0 ? '↘' : '↗'} {nf(Math.abs(Math.round(d * 10) / 10))}&nbsp;{unit}</span>;
}

export default function BodyPage() {
  const s = useStore(), now = useNow();
  const [metric, setMetric] = useState<Metric>('kg');
  const [adding, setAdding] = useState(false);
  if (!s) return <Page>{null}</Page>;

  const unit = UNIT[metric], today = s.body.find(x => sameDay(x.t, now));
  const entries = s.body.filter(x => x[metric] != null), values = entries.map(x => x[metric]!).reverse(); // oldest first
  const latest = entries[0], first = values[0], current = values[values.length - 1];
  const iso = new Date(now - new Date(now).getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

  const save = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const val = (name: string, lo: number, hi: number) => { const v = parseNum(String(f.get(name) ?? '')); return v >= lo && v <= hi ? Math.round(v * 10) / 10 : null; };
    const kg = val('kg', 20, 400), waist = val('waist', 30, 250), t = new Date(`${f.get('date')}T12:00`).getTime();
    if ((kg == null && waist == null) || !t) {
      void ask('Ölçü kaydedilemedi', 'Kilo (20–400 kg) veya bel ölçüsünden (30–250 cm) en az birini gir.', 'Tamam', { cancel: false });
      return;
    }
    saveBody(t, kg, waist);
    setAdding(false);
  };
  const remove = async (t: number) => {
    if (await ask('Ölçü silinsin mi?', `${fmtDate(t, { day: 'numeric', month: 'long', year: 'numeric' })} tarihli ölçü silinir.`, 'Sil', { danger: true })) deleteBody(t);
  };

  return (
    <Page>
      <div className="flex items-center justify-between gap-2.5">
        <h1 className={h1}>Ölçüler</h1>
        <button type="button" className={cx(circle, 'text-2xl', adding && 'bg-fg! text-page!')} aria-label={adding ? 'Ölçü eklemeyi kapat' : 'Ölçü ekle'} aria-expanded={adding} onClick={() => setAdding(!adding)}>
          {adding ? '×' : '+'}
        </button>
      </div>

      {adding && (
        <form onSubmit={save} className="mt-5 animate-up motion-reduce:animate-none">
          <Card className="grid gap-3">
            <label className="flex items-center justify-between gap-2.5 font-medium">Kilo (kg)
              <input name="kg" className={field} inputMode="decimal" placeholder="82,5" defaultValue={today?.kg != null ? nf(today.kg) : ''} /></label>
            <label className="flex items-center justify-between gap-2.5 font-medium">Bel çevresi (cm)
              <input name="waist" className={field} inputMode="decimal" placeholder="94" defaultValue={today?.waist != null ? nf(today.waist) : ''} /></label>
            <label className="flex items-center justify-between gap-2.5 font-medium">Tarih
              <input name="date" type="date" className={cx(field, 'w-auto px-4 text-base')} defaultValue={iso} max={iso} /></label>
            <Button type="submit" variant="primary" big>Kaydet</Button>
            <p className={small}>Aynı güne tekrar kaydedersen o günün ölçüsü güncellenir.</p>
          </Card>
        </form>
      )}

      <Segmented className="mt-5 self-start" label="Ölçü" options={METRICS} value={metric} onChange={setMetric} />

      {latest ? (
        <>
          <p className={cx(small, 'mt-6')}>Son ölçüm: {fmtDate(latest.t, { day: 'numeric', month: 'long' })}</p>
          <p className="num mt-1 text-[56px] leading-none font-bold tracking-[-.03em]">{fmt(current)}<span className="text-2xl font-semibold text-muted"> {unit}</span></p>
          <p className="mt-2.5">{values.length > 1 ? <><Delta d={current - first} unit={unit} /> <span className="text-muted">· ilk ölçümden beri</span></> : <span className="text-muted">Değişimi görmek için bir ölçü daha ekle.</span>}</p>
          {values.length > 1 && <div className="-mx-5 mt-4 text-ok"><AreaChart values={values} label={`${METRICS.find(m => m[0] === metric)![1]} gelişimi: ${fmt(first)} ${unit} → ${fmt(current)} ${unit}`} /></div>}
        </>
      ) : (
        <Card className="mt-6">
          <p className="font-semibold">Henüz {metric === 'kg' ? 'kilo' : 'bel'} ölçüsü yok</p>
          <p className={small}>Sağ üstteki + ile ilk ölçünü ekle. Kiloyu sabah aç karnına, beli göbek hizasından ölçmek karşılaştırmayı kolaylaştırır.</p>
        </Card>
      )}

      {entries.length > 0 && (
        <>
          <H2>Kayıtlar</H2>
          <Group>
            {entries.map((x, i) => {
              const prev = entries[i + 1];
              return (
                <div key={x.t} className={cx(row, 'pr-2')}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{fmtDate(x.t, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm">{prev ? <Delta d={x[metric]! - prev[metric]!} unit={unit} /> : <span className="text-muted">İlk ölçüm</span>}</p>
                  </div>
                  <span className="num text-[17px] font-semibold">{fmt(x[metric]!)}&nbsp;{unit}</span>
                  <button type="button" onClick={() => remove(x.t)} aria-label="Bu ölçüyü sil" className="grid size-11 cursor-pointer place-items-center text-xl text-muted">×</button>
                </div>
              );
            })}
          </Group>
        </>
      )}
    </Page>
  );
}
