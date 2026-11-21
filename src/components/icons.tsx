import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

const ICONS = {
  flame: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></>,
  bell: <><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></>,
  star: <><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></>,
  ton: <><path d="M6 9h12l2 11H4z"/><path d="M9 9a3 3 0 0 1 6 0"/></>,
  home: <><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></>,
  timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  sound: <><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  up: <><path d="M12 15V3M7 8l5-5 5 5M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></>,
  down: <><path d="M12 3v12M7 10l5 5 5-5M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  tabHome: <><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="14" cy="18" r="2"/></>,
  // solid glyphs (names end in F): drawn filled, used for coloured stat icons and medals
  clockF: <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5a1 1 0 1 0-2 0v5c0 .27.1.52.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.58V7Z" />,
  dumbbellF: <><rect x="1" y="8.5" width="3.5" height="7" rx="1.5" /><rect x="5.25" y="4.5" width="4.75" height="15" rx="2" /><rect x="10" y="10" width="4" height="4" /><rect x="14" y="4.5" width="4.75" height="15" rx="2" /><rect x="19.5" y="8.5" width="3.5" height="7" rx="1.5" /></>,
  flameF: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  stackF: <><rect x="3" y="4" width="18" height="4" rx="2" /><rect x="3" y="10" width="18" height="4" rx="2" /><rect x="3" y="16" width="18" height="4" rx="2" /></>,
  figureF: <><circle cx="12" cy="4.5" r="2.5" /><path d="M7 9.5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2V14a1 1 0 0 1-2 0v-3h-.5v10a1.25 1.25 0 0 1-2.5 0v-5 5a1.25 1.25 0 0 1-2.5 0V11H9v3a1 1 0 0 1-2 0V9.5Z" /></>,
  trophyF: <path fillRule="evenodd" d="M7 3h10v2h3v2a4 4 0 0 1-3.2 3.92A5 5 0 0 1 13 13.9V17h3v3H8v-3h3v-3.1a5 5 0 0 1-3.8-2.98A4 4 0 0 1 4 7V5h3V3Zm0 4H6a2 2 0 0 0 1 1.73V7Zm10 0v1.73A2 2 0 0 0 18 7h-1Z" />,
  calF: <path fillRule="evenodd" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3V3a1 1 0 0 1 1-1Zm-2 8v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8H5Z" />,
  scaleF: <path fillRule="evenodd" d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm6 3.5a5 5 0 0 0-4.6 3.05.75.75 0 0 0 .69 1.05h7.82a.75.75 0 0 0 .69-1.05A5 5 0 0 0 12 6.5Z" />,
  starF: <path d="m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6L2.5 9.5l6.6-1z" />,
  homeF: <path d="M11.3 2.6a1 1 0 0 1 1.4 0l8 7.2a1 1 0 0 1 .3.7V20a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 20v-9.5a1 1 0 0 1 .3-.7l8-7.2Z" />,
  back: <path d="m14.5 6-6 6 6 6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

/** Raw shapes of an icon, for drawing inside another <svg>. */
export const iconShapes = (name: IconName) => ICONS[name];

/** 24px icon. Line icons follow `currentColor` as a stroke; names ending in F are solid glyphs filled with it. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  const solid = name.endsWith('F');
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"
      className={cx('size-5 flex-none', solid ? 'fill-current' : 'stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]',
        !solid && !/\bfill-/.test(className ?? '') && 'fill-none', className)}>
      {ICONS[name]}
    </svg>
  );
}
