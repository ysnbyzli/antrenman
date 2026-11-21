import type { MetadataRoute } from 'next';
import { asset } from '@/lib/cx';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Antrenman',
    short_name: 'Antrenman',
    start_url: asset('/'),
    scope: asset('/'),
    display: 'standalone',
    background_color: '#0b0b0b',
    theme_color: '#0b0b0b',
    icons: [
      { src: asset('/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: asset('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: asset('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
