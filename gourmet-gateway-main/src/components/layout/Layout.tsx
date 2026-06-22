import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AdminAccessButton } from '@/components/admin/AdminAccessButton';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { PromoBanner } from '@/components/PromoBanner';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBanner />
      <Navbar />
      <main className="flex-1 pt-0">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <AdminAccessButton />
    </div>
  );
}
