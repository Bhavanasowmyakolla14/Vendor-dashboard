import { motion } from 'framer-motion';
import { Images, Upload, Star, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

const portfolioImages = [
  'https://images.pexels.com/photos/32315685/pexels-photo-32315685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37058552/pexels-photo-37058552.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/35042459/pexels-photo-35042459.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/25956380/pexels-photo-25956380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/19021379/pexels-photo-19021379.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/33539320/pexels-photo-33539320.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/35069916/pexels-photo-35069916.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/17023112/pexels-photo-17023112.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio" subtitle="Showcase your best work to attract clients" icon={Images} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {['All', 'Weddings', 'Corporate', 'Birthdays'].map((f, i) => (
            <button
              key={f}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                i === 0 ? 'bg-sage-600 text-white' : 'border border-border bg-card text-dark-700 hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sage transition-shadow hover:shadow-premium-lg">
          <Upload className="h-4 w-4" />
          Upload Photos
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Upload tile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-cream-50/50 text-muted-foreground transition-colors hover:border-sage-400 hover:bg-sage-50/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
            <Plus className="h-6 w-6 text-sage-600" />
          </div>
          <p className="text-sm font-semibold">Add Photo</p>
        </motion.div>

        {portfolioImages.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-premium"
          >
            <img
              src={url}
              alt="Portfolio"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex w-full items-center justify-between p-3">
                <button className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-dark-900 backdrop-blur-sm">
                  <Star className="h-3 w-3 text-gold-500" /> Feature
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-600 backdrop-blur-sm">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
