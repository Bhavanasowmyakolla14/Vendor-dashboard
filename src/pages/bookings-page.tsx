import { motion } from 'framer-motion';
import { CalendarCheck, Clock, MapPin, Eye, MessageSquare, Filter, Search } from 'lucide-react';
import { upcomingEvents, type BookingStatus } from '@/lib/dashboard-data';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  confirmed: 'bg-sage-50 text-sage-700 border-sage-200',
  completed: 'bg-dark-100 text-dark-700 border-dark-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const allEvents = [
  ...upcomingEvents,
  { id: '5', customer: 'Divya Rao', type: 'Sangeet Night', date: 'Aug 25, 2026', time: '7:00 PM', location: 'ITC Grand, Bengaluru', budget: '₹70,000', status: 'completed' as BookingStatus },
  { id: '6', customer: 'Aditya Joshi', type: 'Pre-Wedding Shoot', date: 'Jul 30, 2026', time: '6:00 AM', location: 'Old Goa', budget: '₹55,000', status: 'completed' as BookingStatus },
  { id: '7', customer: 'Sneha Gupta', type: 'Makeup & Styling', date: 'Aug 28, 2026', time: '8:00 AM', location: 'Studio Mumbai', budget: '₹35,000', status: 'confirmed' as BookingStatus },
];

export function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" subtitle="Manage all your confirmed and pending bookings" icon={CalendarCheck} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search bookings..."
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Confirmed', 'Completed'].map((f, i) => (
            <button
              key={f}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                i === 0 ? 'bg-sage-600 text-white' : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {allEvents.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-dark-900">{event.customer}</h4>
                <p className="text-sm text-muted-foreground">{event.type}</p>
              </div>
              <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize', statusStyles[event.status])}>
                {event.status}
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {event.date} · {event.time}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</p>
              <p className="flex items-center gap-2 font-semibold text-gold-700"><span className="h-4 w-4 flex items-center justify-center">₹</span> {event.budget}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg bg-sage-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sage-700">
                <Eye className="h-3.5 w-3.5" /> View
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted">
                <MessageSquare className="h-3.5 w-3.5" /> Chat
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
