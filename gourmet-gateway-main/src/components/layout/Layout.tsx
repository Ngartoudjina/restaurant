import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AdminAccessButton } from '@/components/admin/AdminAccessButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-0">
        {children}
      </main>
      <Footer />
      <AdminAccessButton />
    </div>
  );
}
