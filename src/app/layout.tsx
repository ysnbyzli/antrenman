import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MedalDefs } from '@/components/medal';
import { Runtime } from '@/components/runtime';
import { TabBar } from '@/components/shell';
import { asset } from '@/lib/cx';
import './globals.css';

// latin-ext carries the Turkish letters (ğ, ş, ı, İ)
const sans = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-sans' });
const mono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Antrenman',
  description: 'Kişisel antrenman takibi',
  appleWebApp: { capable: true, title: 'Antrenman', statusBarStyle: 'default' },
  icons: { icon: asset('/icon-192.png'), apple: asset('/icon-180.png') },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0b' },
  ],
};

// Runs before first paint so a forced theme doesn't flash the system one.
const THEME_SCRIPT = `try{var s=JSON.parse(localStorage.getItem('fitness-v1')).settings,t=s.look===2?s.theme:'dark'}catch(e){t='dark'}if(t==='light'||t==='dark')document.documentElement.dataset.theme=t`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="tr" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
        <TabBar />
        <Runtime />
        <MedalDefs />
      </body>
    </html>
  );
}
