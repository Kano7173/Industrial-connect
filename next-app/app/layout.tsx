import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IndustrialConnect — Industrial Procurement, Re-engineered',
  description: 'India-focused industrial procurement network connecting buyer requirements with verified manufacturing capacity and protected marketplace transactions.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
