'use client';
// App chrome: page container with transitions, sticky bottom dock, floating tab bar and direction-aware links.
// Mobile measurements: 20px side margins; bottom chrome sits just above the home indicator, not a full safe area higher.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ViewTransition, type ComponentProps, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { depth } from '@/lib/domain';
import { Icon, type IconName } from './icons';
import { circle } from './ui';

const SLIDE = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

/** Going deeper slides forward, coming back slides back, tab ↔ tab doesn't animate. */
const types = (from: string, to: string) => {
  const d = depth(to.split('?')[0]) - depth(from);
  return d > 0 ? ['nav-forward'] : d < 0 ? ['nav-back'] : [];
};

/** Every page renders inside this. `bare` pages (workout, summary) have no tab bar underneath; `glow` adds the warm light at the top. */
export function Page({ children, bare, glow }: { children: ReactNode; bare?: boolean; glow?: boolean }) {
  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <main
        className={cx(
          'relative isolate mx-auto flex min-h-dvh max-w-[520px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+16px)]',
          bare ? 'pb-0' : 'pb-[calc(max(env(safe-area-inset-bottom),22px)+84px)]',
        )}
      >
        {glow && (
          <div aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(75%_62%_at_50%_0%,color-mix(in_srgb,var(--flame)_30%,transparent),transparent_72%)]" />
        )}
        {children}
      </main>
    </ViewTransition>
  );
}

/** Sticky bottom area for the primary action; its buttons end right at the safe area, like a native toolbar. */
export function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-5 -mx-5 mt-auto bg-page/85 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur-md">
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

/** Round back button; `children` is where it goes, read out by screen readers. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <NavLink href={href} className={cx(circle, 'self-start')}>
      <Icon name="back" className="size-6 stroke-[2.2]" />
      <span className="sr-only">{children}</span>
    </NavLink>
  );
}

const TABS: [href: string, label: string, icon: IconName, match: string[]][] = [
  ['/', 'Ana Sayfa', 'tabHome', ['/']],
  ['/history', 'Geçmiş', 'history', ['/history', '/history/detail']],
  ['/body', 'Ölçüler', 'chart', ['/body']],
  ['/settings', 'Ayarlar', 'sliders', ['/settings', '/exercises']],
];

/** Floating tab bar, tucked just above the home indicator. The pill behind the active tab slides between tabs. */
export function TabBar() {
  const path = usePathname().replace(/\/+$/, '') || '/';
  const tab = TABS.findIndex(t => t[3].includes(path));
  if (path === '/workout' || path === '/summary') return null;
  return (
    <nav
      aria-label="Ana menü"
      style={{ viewTransitionName: 'tabbar' }}
      className="fixed inset-x-4 bottom-[max(12px,calc(env(safe-area-inset-bottom)-12px))] z-5 mx-auto grid max-w-[488px] grid-cols-4 rounded-full border border-line bg-surface/85 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,.28)] backdrop-blur-xl backdrop-saturate-150"
    >
      <i
        className={cx(
          'absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/4)] rounded-full bg-fill-2 transition-[transform,opacity] duration-[250ms] ease-in-out-strong motion-reduce:transition-none',
          tab < 0 && 'opacity-0',
        )}
        style={{ transform: `translateX(${Math.max(tab, 0) * 100}%)` }}
      />
      {TABS.map(([href, label, icon], i) => (
        <NavLink
          key={href} href={href} aria-current={i === tab ? 'page' : undefined}
          className={cx(
            'group relative flex min-h-13 flex-col items-center justify-center gap-[3px] rounded-full text-[11px] font-semibold no-underline transition-colors duration-200',
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
