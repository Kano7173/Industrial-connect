import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IndustrialConnect — Protected Industrial Orders',
  description: 'Industrial procurement, production evidence and protected marketplace payment workflow.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
