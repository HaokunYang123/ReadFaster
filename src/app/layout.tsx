import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReadFaster - RSVP Speed Reader',
  description:
    'A Rapid Serial Visual Presentation (RSVP) speed reading application with Optimal Recognition Point (ORP) technology.',
  keywords: ['speed reading', 'RSVP', 'ORP', 'reading', 'productivity'],
  authors: [{ name: 'ReadFaster' }],
  openGraph: {
    title: 'ReadFaster - RSVP Speed Reader',
    description:
      'Read faster with RSVP technology. Improve your reading speed up to 1000 WPM.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
