import './globals.css';
import './ecosystem.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Connect — Industrial procurement operating system',
  description: 'Industrial Connect connects buyers, manufacturers and order workflows from RFQ to delivery, quality and commission tracking.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
