import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const jakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'Gourmet Kitchen | Order Fresh Culinary Dishes Online',
  description: 'Order from our premium menu selection. Features instant cloud order tracking and automated payment handling pipelines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${jakartaSans.variable} font-sans antialiased bg-slate-50 text-slate-600 min-h-full flex flex-col`}>
        <Providers>
          <div className="flex-grow">{children}</div>
        </Providers>
      </body>
    </html>
  );
}