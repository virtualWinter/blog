'use client';

import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth/client';
import { Header } from './header';
import { Footer } from './footer';
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const { user } = useSession();

  if (isDashboard) {
    return (
      <>
        <AnalyticsTracker userId={user?.id} />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsTracker userId={user?.id} />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}