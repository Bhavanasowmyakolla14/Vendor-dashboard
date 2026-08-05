import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function AvailabilityCard() {
  const [available, setAvailable] = useState(true);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
      <h3 className="text-base font-bold text-dark-900">Availability</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Toggle your booking status</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-3 w-3 rounded-full',
              available ? 'bg-sage-500 animate-pulse-ring' : 'bg-dark-300',
            )}
          />
          <div>
            <p className="text-sm font-semibold text-dark-900">
              {available ? 'Available' : 'Unavailable'}
            </p>
            <p className="text-xs text-muted-foreground">
              {available ? 'Accepting new bookings' : 'Not taking bookings'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setAvailable((v) => !v)}
          className={cn(
            'relative h-8 w-14 rounded-full transition-colors',
            available ? 'bg-sage-600' : 'bg-dark-200',
          )}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'absolute top-1 h-6 w-6 rounded-full bg-white shadow-md',
              available ? 'left-7' : 'left-1',
            )}
          />
        </button>
      </div>
    </div>
  );
}
