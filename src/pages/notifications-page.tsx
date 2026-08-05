import { motion } from 'framer-motion';
import { BellRing, CreditCard, CalendarCheck, Star, Package, Check } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';

type NotifType = 'payment' | 'booking' | 'review' | 'package';

interface FullNotif {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const allNotifications: FullNotif[] = [
  { id: '1', type: 'payment', title: 'Payment Received', message: '₹1,20,000 received from Ananya Sharma for Wedding Photography', time: '5 minutes ago', unread: true },
  { id: '2', type: 'booking', title: 'New Booking Request', message: 'Meera Nair requested Wedding Decor for Sep 5, 2026', time: '1 hour ago', unread: true },
  { id: '3', type: 'review', title: 'New 5-Star Review', message: 'Rohan Mehta rated your Corporate Event service 5 stars', time: '3 hours ago', unread: true },
  { id: '4', type: 'package', title: 'Package Viewed', message: 'Your Wedding Premium package was viewed 12 times this week', time: '1 day ago', unread: false },
  { id: '5', type: 'payment', title: 'Payout Processed', message: '₹2,76,000 has been transferred to your bank account ending 4321', time: '2 days ago', unread: false },
  { id: '6', type: 'booking', title: 'Booking Confirmed', message: 'Priya Iyer confirmed Birthday Celebration for Aug 18, 2026', time: '3 days ago', unread: false },
  { id: '7', type: 'review', title: 'New 5-Star Review', message: 'Divya Rao rated your Sangeet Night coverage 5 stars', time: '4 days ago', unread: false },
  { id: '8', type: 'package', title: 'New Package Created', message: 'You successfully created the Birthday package', time: '5 days ago', unread: false },
];

const typeConfig: Record<NotifType, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  payment: { icon: CreditCard, bg: 'bg-sage-50', color: 'text-sage-600' },
  booking: { icon: CalendarCheck, bg: 'bg-gold-50', color: 'text-gold-600' },
  review: { icon: Star, bg: 'bg-gold-50', color: 'text-gold-600' },
  package: { icon: Package, bg: 'bg-dark-100', color: 'text-dark-700' },
};

const filters = ['All', 'Unread', 'Payments', 'Bookings', 'Reviews'];

export function NotificationsPage() {
  const [filter, setFilter] = useState('All');

  const filtered = allNotifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return n.unread;
    if (filter === 'Payments') return n.type === 'payment';
    if (filter === 'Bookings') return n.type === 'booking';
    if (filter === 'Reviews') return n.type === 'review';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Stay updated on all your activities" icon={BellRing} />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
              filter === f ? 'bg-sage-600 text-white shadow-glow-sage' : 'border border-border bg-card text-dark-700 hover:bg-muted',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-premium sm:p-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-sm font-semibold text-dark-700">{filtered.length} notifications</p>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <Check className="h-3.5 w-3.5" /> Mark all as read
          </button>
        </div>
        <div className="space-y-1">
          {filtered.map((notif, i) => {
            const { icon: Icon, bg, color } = typeConfig[notif.type];
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'flex items-start gap-3 rounded-xl p-3.5 transition-colors hover:bg-cream-50',
                  notif.unread ? 'bg-cream-50/60' : '',
                )}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-dark-900">{notif.title}</p>
                    {notif.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{notif.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
