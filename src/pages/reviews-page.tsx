import { motion } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

const allReviews = [
  { id: '1', customer: 'Ananya Sharma', avatar: 'AS', rating: 5, text: 'Absolutely stunning work! Every moment was captured beautifully. Highly recommend for any wedding.', date: '2 days ago', event: 'Wedding Photography' },
  { id: '2', customer: 'Rohan Mehta', avatar: 'RM', rating: 5, text: 'Professional, punctual, and incredibly talented. The corporate event photos exceeded our expectations.', date: '5 days ago', event: 'Corporate Event' },
  { id: '3', customer: 'Priya Iyer', avatar: 'PI', rating: 5, text: 'The birthday celebration photos are magical. Thank you for capturing our special moments so perfectly!', date: '1 week ago', event: 'Birthday Celebration' },
  { id: '4', customer: 'Karthik Reddy', avatar: 'KR', rating: 4, text: 'Great work overall. Would have liked a few more candid shots but the final album was beautiful.', date: '2 weeks ago', event: 'Reception Coverage' },
  { id: '5', customer: 'Divya Rao', avatar: 'DR', rating: 5, text: 'The sangeet night coverage was phenomenal. Every emotion was captured perfectly. Thank you!', date: '3 weeks ago', event: 'Sangeet Night' },
  { id: '6', customer: 'Aditya Joshi', avatar: 'AJ', rating: 5, text: 'Pre-wedding shoot was a dream! The locations, the poses, everything was just perfect.', date: '1 month ago', event: 'Pre-Wedding Shoot' },
];

export function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" subtitle="What your clients are saying about you" icon={Star} />

      {/* Rating summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Average Rating', value: '4.9', accent: 'text-gold-700' },
          { label: 'Total Reviews', value: '312', accent: 'text-dark-900' },
          { label: '5-Star Reviews', value: '298', accent: 'text-sage-700' },
          { label: 'Response Rate', value: '100%', accent: 'text-sage-700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-premium"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {allReviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                {review.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-900">{review.customer}</p>
                <p className="text-xs text-muted-foreground">{review.event}</p>
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
            <div className="mt-3 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={idx < review.rating ? 'h-4 w-4 fill-gold-400 text-gold-400' : 'h-4 w-4 text-dark-200'}
                />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-dark-700">"{review.text}"</p>
            <div className="mt-4 flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted">
                <MessageCircle className="h-3.5 w-3.5" /> Reply
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted">
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
