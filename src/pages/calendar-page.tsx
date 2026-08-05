import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const events: Record<number, { type: string; color: string }> = {
  5: { type: 'Wedding', color: 'bg-sage-500' },
  12: { type: 'Corporate', color: 'bg-gold-500' },
  14: { type: 'Birthday', color: 'bg-sage-400' },
  18: { type: 'Reception', color: 'bg-gold-400' },
  22: { type: 'Sangeet', color: 'bg-sage-500' },
  25: { type: 'Pre-Wed', color: 'bg-gold-500' },
};

export function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" subtitle="View and manage your event schedule" icon={CalendarDays} />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-dark-900">August 2026</h3>
          <div className="flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 transition-colors hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 transition-colors hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div key={day} className="pb-2 text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }).map((_, i) => {
            const date = i + 1;
            const event = events[date];
            return (
              <motion.div
                key={date}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-xl border p-1 text-sm transition-colors',
                  date === 5 ? 'border-sage-400 bg-sage-50 font-bold text-sage-800' : 'border-border bg-cream-50/50 text-dark-700 hover:bg-cream-100',
                )}
              >
                <span>{date}</span>
                {event && (
                  <span className={cn('mt-1 h-1.5 w-1.5 rounded-full', event.color)} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
        <h3 className="mb-4 text-base font-bold text-dark-900">Events This Month</h3>
        <div className="space-y-3">
          {Object.entries(events).map(([date, ev], i) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-cream-50/50 p-3.5"
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg text-white', ev.color)}>
                <span className="text-sm font-bold">{date}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-900">{ev.type} Event</p>
                <p className="text-sm text-muted-foreground">August {date}, 2026</p>
              </div>
              <button className="rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sage-700">View</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
