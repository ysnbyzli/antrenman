'use client';
import { useRef, type ChangeEvent } from 'react';
import { NavLink, Page, useGo } from '@/components/shell';
import { Chevron, Group, H2, RowBody, Segmented, Stepper, h1, row, rowTap, small } from '@/components/ui';
import { exportData, nudgeSetting, readBackup, restoreBackup, setSound, setTheme, wipeAll } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { EX } from '@/lib/data';
import { ask } from '@/lib/dialog';
import { badges, streak } from '@/lib/domain';
import { fmtDate, nf } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { Theme } from '@/lib/types';

const THEMES: [Theme, string][] = [['auto', 'Sistem'], ['light', 'Açık'], ['dark', 'Koyu']];
const value = 'num min-w-15 text-center text-[15px] font-medium';

export default function SettingsPage() {
  const s = useStore(), go = useGo(), file = useRef<HTMLInputElement>(null);
  if (!s) return <Page>{null}</Page>;
  const st = s.settings, goal = st.goal;

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

      <H2>Antrenman</H2>
      <Group>
        <div className={row}><RowBody icon="timer" label="Dinlenme süresi">
          <Stepper label="Dinlenme süresini" onStep={d => nudgeSetting('rest', d)} value={<span className={value}>{st.rest}&nbsp;sn</span>} /></RowBody></div>
        <div className={row}><RowBody icon="target" label="Haftalık hedef">
          <Stepper label="Haftalık hedefi" onStep={d => nudgeSetting('goal', d)} value={<span className={value}>{goal}&nbsp;gün</span>} /></RowBody></div>
        <div className={row}><RowBody icon="bell" label="Ağırlık adımı">
          <Stepper label="Ağırlık adımını" onStep={d => nudgeSetting('step', d)} value={<span className={value}>{nf(st.step)}&nbsp;kg</span>} /></RowBody></div>
        <label className={row}><RowBody icon="sound" label="Sesli uyarı" sub="Süre bitince bip sesi">
          <input type="checkbox" role="switch" checked={st.sound} onChange={e => setSound(e.target.checked)}
            className="relative h-[30px] w-[50px] flex-none cursor-pointer appearance-none rounded-full bg-line-2 transition-colors duration-200 after:absolute after:top-[3px] after:left-[3px] after:size-6 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,.25)] after:transition-transform after:duration-200 after:ease-out-strong checked:bg-ok checked:after:translate-x-5" />
        </RowBody></label>
      </Group>

      <H2>Görünüm</H2>
      <Group>
        <div className={row}><RowBody icon="sun" label="Tema"><Segmented label="Tema" options={THEMES} value={st.theme} onChange={setTheme} /></RowBody></div>
      </Group>

      <H2>Keşfet</H2>
      <Group>
        <NavLink href="/streak" className={cx(row, rowTap)}>
          <RowBody icon="flame" label="Seri ve rozetler" sub={`${streak(s.history, goal).cur} hafta seri · ${badges(s.history, goal).filter(b => b.got).length} rozet`}><Chevron /></RowBody>
        </NavLink>
        <NavLink href="/exercises" className={cx(row, rowTap)}>
          <RowBody icon="list" label="Hareket kütüphanesi" sub={`${Object.keys(EX).length} hareket, görsel ve talimatlar`}><Chevron /></RowBody>
        </NavLink>
      </Group>

      <H2>Veriler</H2>
      <Group>
        <button type="button" onClick={backup} className={cx(row, rowTap)}>
          <RowBody icon="up" label="Yedekle" sub={`Son yedek: ${st.lastBackup ? fmtDate(st.lastBackup, { day: 'numeric', month: 'long', year: 'numeric' }) : 'hiç alınmadı'}`}><Chevron /></RowBody>
        </button>
        <button type="button" onClick={() => file.current?.click()} className={cx(row, rowTap)}>
          <RowBody icon="down" label="Geri yükle" sub="Yedek dosyasından verileri geri getir"><Chevron /></RowBody>
        </button>
        <button type="button" onClick={wipe} className={cx(row, rowTap)}>
          <RowBody icon="trash" danger label="Tüm verileri sil" sub={`${s.history.length} antrenman, ${s.body.length} ölçü`}><Chevron /></RowBody>
        </button>
      </Group>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={restore} />
      <p className={cx(small, 'mt-2.5')}>Veriler sadece bu cihazda duruyor. Yedeği iCloud Drive’a kaydetmen önerilir.</p>

      <H2>Hakkında</H2>
      <Group>
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener" className={cx(row, rowTap)}>
          <RowBody icon="info" label="Hareket fotoğrafları" sub="free-exercise-db · kamu malı"><Chevron /></RowBody>
        </a>
        <a href="https://github.com/giavinh79/react-body-highlighter" target="_blank" rel="noopener" className={cx(row, rowTap)}>
          <RowBody icon="info" label="Kas haritası" sub="react-body-highlighter · MIT"><Chevron /></RowBody>
        </a>
      </Group>
    </Page>
  );
}
