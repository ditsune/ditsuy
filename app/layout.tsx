import type { Metadata, Viewport } from 'next';
import { Caveat, Poppins } from 'next/font/google';
import './globals.css';

const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-caveat' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Ditsuy — Catatan Keuangan',
  description: 'Catatan pengeluaran dan pemasukan pribadi',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ditsuy',
  },
};

export const viewport: Viewport = {
  themeColor: '#D4537E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${caveat.variable} ${poppins.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.44.0/dist/tabler-icons.min.css"
        />
      </head>
      <body className="font-sans">
        <div className="max-w-[480px] mx-auto min-h-screen relative pb-24">
          {children}
        </div>
      </body>
    </html>
  );
}
