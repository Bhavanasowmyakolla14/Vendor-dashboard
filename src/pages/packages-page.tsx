import { motion } from 'framer-motion';
import { Package, Check, Pencil, Trash2, Eye, Plus, Sparkles } from 'lucide-react';
import { packages } from '@/lib/dashboard-data';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';

export function PackagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Packages" subtitle="Create and manage your service offerings" icon={Package} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Add new package */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-cream-50/50 text-muted-foreground transition-colors hover:border-sage-400 hover:bg-sage-50/30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-100">
            <Plus className="h-7 w-7 text-sage-600" />
          </div>
          <p className="font-semibold text-dark-700">Create New Package</p>
          <p className="text-sm text-muted-foreground">Add a new service offering</p>
        </motion.button>

        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className={cn(
              'relative flex flex-col rounded-2xl border p-5 shadow-premium transition-shadow hover:shadow-premium-lg',
              pkg.popular ? 'border-sage-300 bg-sage-50/40' : 'border-border bg-card',
            )}
          >
            {pkg.popular && (
              <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold text-white shadow-glow-sage">
                <Sparkles className="h-2.5 w-2.5" /> Popular
              </span>
            )}
            <h4 className="text-lg font-bold text-dark-900">{pkg.name}</h4>
            <p className="mt-1 text-2xl font-bold text-gold-700">{pkg.price}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {pkg.services.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-dark-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-100">
                    <Check className="h-2.5 w-2.5 text-sage-700" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sage-600 py-2 text-xs font-semibold text-white hover:bg-sage-700">
                <Eye className="h-3.5 w-3.5" /> View
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-dark-600 hover:bg-muted">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-dark-600 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
