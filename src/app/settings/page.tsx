'use client';
import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Hex } from '@/components/medal';
import { NavLink, Page, useGo } from '@/components/shell';
import { Chevron, Group, Segmented, Stepper, card, h1, row, rowTap, small } from '@/components/ui';
import { exportData, nudgeSetting, readBackup, restoreBackup, setSound, setTheme, wipeAll } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { EX } from '@/lib/data';
import { ask } from '@/lib/dialog';
import { badges, streak } from '@/lib/domain';
import { fmtDate, nf } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { Theme } from '@/lib/types';

const THEMES: [Theme, string][] = [['auto', 'Sistem'], ['light', 'Açık'], ['dark', 'Koyu']];
const value = 'num min-w-16 text-center font-semibold';
const label = 'min-w-0 flex-1 font-medium';

/** Small grey heading above a group, and an optional explanation under it. */
const Heading = ({ children }: { children: ReactNode }) => <h2 className="mt-7 mb-2 px-4 text-[13px] font-semibold tracking-[.04em] text-muted uppercase">{children}</h2>;
const Note = ({ children }: { children: ReactNode }) => <p className={cx(small, 'mt-2 px-4')}>{children}</p>;

export default function SettingsPage() {
  const s = useStore(), go = useGo(), file = useRef<HTMLInputElement>(null);
  if (!s) return <Page>{null}</Page>;
  const st = s.settings, goal = st.goal, sk = streak(s.history, goal), got = badges(s.history, goal).filter(b => b.got).length;

  const backup = () => exportData().catch(err => ask('Yedek oluşturulamadı', (err as Error).message, 'Tamam', { cancel: false }));
  const restore = async (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    try {
      const next = await readBackup(f);
      if (await ask('Yedek geri yüklensin mi?', `Yedekte ${next.history.length} antrenman var. Şu anki verilerin yerine geçer.`, 'Geri Yükle')) restoreBackup(next);
    } catch (err) {
      void ask('Geri yükleme başarısız', (err as Error).message, 'Tamam', { cancel: false });
    }
  };
  const wipe = async () => {
    if (!(await ask('Tüm veriler silinsin mi?', 'Antrenman geçmişi, ölçüler, notlar ve ayarlar silinir.', 'Devam', { danger: true }))) return;
    if (!(await ask('Emin misin?', 'Yedek almadıysan veriler geri getirilemez.', 'Hepsini Sil', { danger: true }))) return;
    wipeAll();
    go('/');
  };

  return (
    <Page>
      <h1 className={h1}>Ayarlar</h1>

      {/* where you stand, as the way into streak and badges */}
      <NavLink href="/streak" className={cx(card, 'mt-5 flex items-center gap-4 no-underline active:bg-fill')}>
        <Hex tier="b" icon="flameF" size={64} locked={!sk.cur} />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold">{sk.cur} hafta seri</p>
          <p className={small}>{s.history.filter(h => !h.home).length} antrenman · {got} rozet</p>
        </div>
        <Chevron />
      </NavLink>

      <Heading>Antrenman</Heading>
      <Group>
        <div className={row}><span className={label}>Dinlenme süresi</span>
          <Stepper label="Dinlenme süresini" onStep={d => nudgeSetting('rest', d)} value={<span className={value}>{st.rest}&nbsp;sn</span>} /></div>
        <div className={row}><span className={label}>Haftalık hedef</span>
          <Stepper label="Haftalık hedefi" onStep={d => nudgeSetting('goal', d)} value={<span className={value}>{goal}&nbsp;gün</span>} /></div>
        <div className={row}><span className={label}>Ağırlık adımı</span>
          <Stepper label="Ağırlık adımını" onStep={d => nudgeSetting('step', d)} value={<span className={value}>{nf(st.step)}&nbsp;kg</span>} /></div>
        <label className={row}><span className={label}>Sesli uyarı</span>
          <input type="checkbox" role="switch" checked={st.sound} onChange={e => setSound(e.target.checked)}
            className="relative h-[31px] w-[51px] flex-none cursor-pointer appearance-none rounded-full bg-line-2 transition-colors duration-200 after:absolute after:top-0.5 after:left-0.5 after:size-[27px] after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,.3)] after:transition-transform after:duration-200 after:ease-out-strong checked:bg-ok checked:after:translate-x-5" />
        </label>
      </Group>
      <Note>Dinlenme sayacı set tamamlayınca başlar, süre bitince bip sesi çalar. Haftalık hedef, seri için haftada kaç salon antrenmanı gerektiğini belirler. Ağırlık adımı + ve − düğmelerinin artışıdır.</Note>

      <Heading>Görünüm</Heading>
      <Group>
        <div className={row}><span className={label}>Tema</span><Segmented label="Tema" options={THEMES} value={st.theme} onChange={setTheme} /></div>
      </Group>

      <Heading>İçerik</Heading>
      <Group>
        <NavLink href="/exercises" className={cx(row, rowTap)}>
          <span className={label}>Hareket kütüphanesi</span><span className="text-muted">{Object.keys(EX).length} hareket</span><Chevron />
        </NavLink>
      </Group>

      <Heading>Veriler</Heading>
      <Group>
        <button type="button" onClick={backup} className={cx(row, rowTap)}>
          <span className={label}>Yedekle</span>
          <span className="text-muted">{st.lastBackup ? fmtDate(st.lastBackup, { day: 'numeric', month: 'short' }) : 'Hiç alınmadı'}</span><Chevron />
        </button>
        <button type="button" onClick={() => file.current?.click()} className={cx(row, rowTap)}>
          <span className={label}>Yedekten geri yükle</span><Chevron />
        </button>
      </Group>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={restore} />
      <Note>Veriler sadece bu cihazda duruyor: {s.history.length} antrenman, {s.body.length} ölçü. Yedeği iCloud Drive’a kaydetmen önerilir.</Note>
      <Group className="mt-4">
        <button type="button" onClick={wipe} className={cx(row, rowTap, 'justify-center font-semibold text-danger')}>Tüm Verileri Sil…</button>
      </Group>

      <Heading>Hakkında</Heading>
      <Group>
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener" className={cx(row, rowTap)}>
          <span className={label}>Hareket fotoğrafları</span><span className="text-muted">free-exercise-db</span><Chevron />
        </a>
        <a href="https://github.com/giavinh79/react-body-highlighter" target="_blank" rel="noopener" className={cx(row, rowTap)}>
          <span className={label}>Kas haritası</span><span className="text-muted">react-body-highlighter</span><Chevron />
        </a>
      </Group>
    </Page>
  );
}
