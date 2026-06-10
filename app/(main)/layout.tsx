import Navbar from '@/components/shared/Navbar';
import MobileBackButton from '@/components/shared/MobileBackButton';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <MobileBackButton />
      <main>{children}</main>
    </>
  );
}