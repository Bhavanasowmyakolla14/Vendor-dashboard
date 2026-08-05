import { motion } from 'framer-motion';
import { LifeBuoy, MessageSquare, Mail, Phone, BookOpen, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

const faqs = [
  { id: '1', q: 'How do I receive payments?', a: 'Payments are automatically transferred to your linked bank account within 2-3 business days after event completion.' },
  { id: '2', q: 'How do I respond to booking requests?', a: 'Go to the Bookings page and use the Accept or Reject buttons on each request card.' },
  { id: '3', q: 'Can I customize my packages?', a: 'Yes! Visit the Packages page to create, edit, or remove service offerings at any time.' },
  { id: '4', q: 'How do I improve my ranking?', a: 'Complete your profile, maintain fast response times, and collect positive reviews to boost your visibility.' },
];

const channels = [
  { id: '1', label: 'Live Chat', desc: 'Chat with our support team', icon: MessageSquare, action: 'Start Chat' },
  { id: '2', label: 'Email Support', desc: 'support@festivo.com', icon: Mail, action: 'Send Email' },
  { id: '3', label: 'Phone Support', desc: '+91 1800 123 4567', icon: Phone, action: 'Call Now' },
];

export function SupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Support" subtitle="We are here to help you" icon={LifeBuoy} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50">
                <Icon className="h-6 w-6 text-sage-600" />
              </div>
              <p className="mt-3 font-semibold text-dark-900">{c.label}</p>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <button className="mt-3 w-full rounded-lg bg-sage-600 py-2 text-sm font-semibold text-white hover:bg-sage-700">{c.action}</button>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-dark-900">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group flex items-center justify-between rounded-xl border border-border bg-cream-50/50 p-4 transition-colors hover:bg-cream-50"
            >
              <div className="flex-1">
                <p className="font-semibold text-dark-900">{faq.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
