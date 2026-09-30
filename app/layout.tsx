import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RFQWorks — India’s industrial sourcing & manufacturing network',
  description: 'RFQWorks connects industrial buyers with manufacturers for structured RFQs, quotations and protected transaction workflows.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
