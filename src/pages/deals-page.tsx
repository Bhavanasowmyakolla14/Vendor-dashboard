import { motion } from 'framer-motion';
import { Tag, TrendingUp, Clock, Percent } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

const deals = [
  { id: '1', title: 'Early Bird Wedding Special', description: '20% off on bookings made 3 months in advance', discount: '20%', status: 'active', bookings: 14, ends: 'Aug 31, 2026' },
  { id: '2', title: 'Corporate Bundle Deal', description: 'Book 2 events, get 15% off on both', discount: '15%', status: 'active', bookings: 8, ends: 'Sep 15, 2026' },
  { id: '3', title: 'Off-Season Birthday Package', description: 'Special pricing for weekday birthday events', discount: '25%', status: 'expired', bookings: 22, ends: 'Jul 31, 2026' },
  { id: '4', title: 'Referral Bonus', description: 'Get ₹5,000 cashback on referred bookings', discount: '₹5k', status: 'active', bookings: 6, ends: 'Oct 1, 2026' },
];

export function DealsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Deals & Offers" subtitle="Create promotional offers to attract more clients" icon={Tag} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Active Deals', value: '3', icon: Tag, color: 'text-sage-600', bg: 'bg-sage-50' },
          { label: 'Total Bookings', value: '50', icon: TrendingUp, color: 'text-gold-600', bg: 'bg-gold-50' },
          { label: 'Avg. Discount', value: '20%', icon: Percent, color: 'text-dark-700', bg: 'bg-dark-100' },
          { label: 'Expiring Soon', value: '1', icon: Clock, color: 'text-gold-600', bg: 'bg-gold-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-premium"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mt-3 text-xl font-bold text-dark-900">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {deals.map((deal, i) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-dark-900">{deal.title}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${deal.status === 'active' ? 'bg-sage-50 text-sage-700' : 'bg-dark-100 text-dark-500'}`}>
                    {deal.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{deal.description}</p>
              </div>
              <div className="ml-4 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-brand glossy text-white shadow-glow-sage">
                <span className="text-lg font-bold">{deal.discount}</span>
                <span className="text-[10px] text-white/80">OFF</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>{deal.bookings} bookings used</span>
              <span>Ends {deal.ends}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
