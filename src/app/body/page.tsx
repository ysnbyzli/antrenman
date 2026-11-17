'use client';
import type { FormEvent } from 'react';
import { Page } from '@/components/shell';
import { Button, Card, H2, h1, small } from '@/components/ui';
import { Spark } from '@/components/visuals';
import { deleteBody, saveBody } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { ask } from '@/lib/dialog';
import { sameDay } from '@/lib/domain';
import { fmtDate, nf, parseNum } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import type { BodyEntry } from '@/lib/types';

const field = 'num min-h-11 w-24 rounded-[10px] border border-line bg-fill text-center text-[17px] font-medium text-fg';

/** Latest value, change since the first entry, and a sparkline. */
function Trend({ entries, k, label, unit }: { entries: BodyEntry[]; k: 'kg' | 'waist'; label: string; unit: string }) {
  const v = entries.flatMap(x => (x[k] != null ? [x[k]] : [])).reverse();
  const d = v.length > 1 ? Math.round((v[v.length - 1] - v[0]) * 10) / 10 : null;
  return (
    <Card>
      <p className={small}>{label}</p>
      <div className="num text-[22px] font-semibold">{v.length ? nf(v[v.length - 1]) : '—'}<span className="text-sm font-normal text-muted"> {unit}</span></div>
      <p className={small}>{d == null ? 'İlk ölçüden sonra değişim görünür' : <><span className="num">{d > 0 && '+'}{nf(d)}&nbsp;{unit}</span> değişim</>}</p>
      {v.length > 1 && <Spark values={v} unit={unit} label={label} />}
    </Card>
  );
}

export default function BodyPage() {
  const s = useStore(), now = useNow();
  if (!s) return <Page>{null}</Page>;

  const today = s.body.find(x => sameDay(x.t, now));
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
  };
  const remove = async (t: number) => {
    if (await ask('Ölçü silinsin mi?', `${fmtDate(t, { day: 'numeric', month: 'long', year: 'numeric' })} tarihli ölçü silinir.`, 'Sil', { danger: true })) deleteBody(t);
  };

  return (
    <Page>
      <h1 className={h1}>Ölçüler</h1>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Trend entries={s.body} k="kg" label="Kilo" unit="kg" />
        <Trend entries={s.body} k="waist" label="Bel çevresi" unit="cm" />
      </div>

      <H2>Ölçü ekle</H2>
      {/* keyed by today's values so the inputs refill after a save */}
      <form onSubmit={save} key={`${today?.kg}-${today?.waist}`}>
        <Card className="grid gap-2.5">
          <label className="flex items-center justify-between gap-2.5">Kilo (kg)
            <input name="kg" className={field} inputMode="decimal" placeholder="82,5" defaultValue={today?.kg != null ? nf(today.kg) : ''} /></label>
          <label className="flex items-center justify-between gap-2.5">Bel çevresi (cm)
            <input name="waist" className={field} inputMode="decimal" placeholder="94" defaultValue={today?.waist != null ? nf(today.waist) : ''} /></label>
          <label className="flex items-center justify-between gap-2.5">Tarih
            <input name="date" type="date" className={cx(field, 'w-auto px-2.5 text-base')} defaultValue={iso} max={iso} /></label>
          <Button type="submit" variant="primary" className="w-full">Kaydet</Button>
          <p className={small}>Aynı güne tekrar kaydedersen o günün ölçüsü güncellenir. Kiloyu sabah aç karnına, beli göbek hizasından ölçmek karşılaştırmayı kolaylaştırır.</p>
        </Card>
      </form>

      <H2>Kayıtlar</H2>
      {s.body.length ? (
        <Card>
          <ul className="divide-y divide-fill-2">
            {s.body.map(x => (
              <li key={x.t} className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
                <span>{fmtDate(x.t, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="num flex items-center gap-2.5 text-sm">
                  {[x.kg != null && `${nf(x.kg)} kg`, x.waist != null && `${nf(x.waist)} cm`].filter(Boolean).join(' · ')}
                  <button type="button" onClick={() => remove(x.t)} aria-label="Bu ölçüyü sil" className="grid size-9 cursor-pointer place-items-center text-xl text-muted">×</button>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : <p className={small}>Henüz ölçü yok. İlk ölçünü yukarıdan ekle.</p>}
    </Page>
  );
}
