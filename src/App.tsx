import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AnimatedRoutes } from '@/components/dashboard/animated-routes';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNav } from '@/components/dashboard/top-nav';
import { BottomNav } from '@/components/dashboard/bottom-nav';
import { DashboardPage } from '@/pages/dashboard-page';
import { BookingsPage } from '@/pages/bookings-page';
import { CalendarPage } from '@/pages/calendar-page';
import { MessagesPage } from '@/pages/messages-page';
import { PortfolioPage } from '@/pages/portfolio-page';
import { PackagesPage } from '@/pages/packages-page';
import { ReviewsPage } from '@/pages/reviews-page';
import { EarningsPage } from '@/pages/earnings-page';
import { AnalyticsPage } from '@/pages/analytics-page';
import { DealsPage } from '@/pages/deals-page';
import { SettingsPage } from '@/pages/settings-page';
import { SupportPage } from '@/pages/support-page';
import { NotificationsPage } from '@/pages/notifications-page';

function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-background">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="lg:pl-[280px]">
          <TopNav onMenuClick={() => setMobileSidebarOpen(true)} notifCount={3} />

          <main className="mx-auto max-w-[1600px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
            <AnimatedRoutes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/earnings" element={<EarningsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </AnimatedRoutes>
          </main>
        </div>

        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default App;
