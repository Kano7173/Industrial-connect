import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'IndustrialConnect — Industrial procurement, re-engineered.', description: 'India-focused industrial sourcing, supplier matching and protected transaction workflow.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}