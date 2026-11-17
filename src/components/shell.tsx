'use client';
// App chrome: page container with transitions, sticky bottom dock, floating tab bar and direction-aware links.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ViewTransition, type ComponentProps, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { depth } from '@/lib/domain';
import { Icon, type IconName } from './icons';

const SLIDE = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

/** Going deeper slides forward, coming back slides back, tab ↔ tab doesn't animate. */
const types = (from: string, to: string) => {
  const d = depth(to.split('?')[0]) - depth(from);
  return d > 0 ? ['nav-forward'] : d < 0 ? ['nav-back'] : [];
};

/** Every page renders inside this. `bare` pages (workout, summary) have no tab bar underneath. */
export function Page({ children, bare }: { children: ReactNode; bare?: boolean }) {
  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <main
        className={cx(
          'mx-auto flex min-h-dvh max-w-[520px] flex-col px-4 pt-[calc(env(safe-area-inset-top)+20px)]',
          bare ? 'pb-0' : 'pb-[calc(env(safe-area-inset-bottom)+100px)]',
        )}
      >
        {children}
      </main>
    </ViewTransition>
  );
}

/** Sticky bottom area for the primary action; sits at the end of a `bare` page's content. */
export function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-5 -mx-4 mt-auto border-t border-fill-2 bg-page/85 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-md">
      {children}
    </div>
  );
}

/** next/link that picks the slide direction from where it's used. */
export function NavLink({ href, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const path = usePathname();
  return <Link href={href} transitionTypes={types(path, href)} {...rest} />;
}

/** Programmatic navigation with the same direction logic as NavLink. */
export function useGo() {
  const router = useRouter(), path = usePathname();
  return (href: string, replace = false) => router[replace ? 'replace' : 'push'](href, { transitionTypes: types(path, href) });
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <NavLink href={href} className="-mt-2 inline-flex min-h-11 items-center self-start font-[550] text-muted no-underline">
      ‹ {children}
    </NavLink>
  );
}

const TABS: [href: string, label: string, icon: IconName, match: string[]][] = [
  ['/', 'Ana Sayfa', 'tabHome', ['/']],
  ['/history', 'Geçmiş', 'history', ['/history', '/history/detail']],
  ['/body', 'Ölçüler', 'chart', ['/body']],
  ['/settings', 'Ayarlar', 'sliders', ['/settings', '/exercises']],
];

/** Floating tab bar. The pill behind the active tab slides between tabs. */
export function TabBar() {
  const path = usePathname().replace(/\/+$/, '') || '/';
  const tab = TABS.findIndex(t => t[3].includes(path));
  if (path === '/workout' || path === '/summary') return null;
  return (
    <nav
      aria-label="Ana menü"
      style={{ viewTransitionName: 'tabbar' }}
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+8px)] z-5 mx-auto grid max-w-[496px] grid-cols-4 rounded-[26px] border border-line bg-surface/80 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_24px_rgba(0,0,0,.12)] backdrop-blur-lg backdrop-saturate-150"
    >
      <i
        className={cx(
          'absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/4)] rounded-[20px] bg-fill transition-[transform,opacity] duration-[250ms] ease-in-out-strong motion-reduce:transition-none',
          tab < 0 && 'opacity-0',
        )}
        style={{ transform: `translateX(${Math.max(tab, 0) * 100}%)` }}
      />
      {TABS.map(([href, label, icon], i) => (
        <NavLink
          key={href} href={href} aria-current={i === tab ? 'page' : undefined}
          className={cx(
            'group relative flex min-h-13 flex-col items-center justify-center gap-[3px] rounded-[20px] text-[11px] font-semibold no-underline transition-colors duration-200',
            i === tab ? 'text-fg' : 'text-muted',
          )}
        >
          <Icon name={icon} className={cx('size-[22px] transition-transform duration-150 ease-out-strong group-active:scale-90 motion-reduce:group-active:scale-100', i === tab && 'stroke-[2.2]')} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
