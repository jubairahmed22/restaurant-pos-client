import { Suspense } from 'react';
import ShopShell from '@/components/shop/ShopShell';

export const metadata = {
  title: 'Shop | RIN Japanese Food',
  description: 'Browse and shop our curated Japanese food products.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ShopShell>{children}</ShopShell>
    </Suspense>
  );
}
