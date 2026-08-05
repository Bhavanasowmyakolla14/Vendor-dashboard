import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowDownToLine, TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { earningsData } from '@/lib/dashboard-data';
import { PageHeader } from '@/components/dashboard/page-header';

const monthlyData = [
  { day: 'Jan', value: 420000 }, { day: 'Feb', value: 510000 }, { day: 'Mar', value: 480000 },
  { day: 'Apr', value: 620000 }, { day: 'May', value: 580000 }, { day: 'Jun', value: 720000 },
  { day: 'Jul', value: 840000 }, { day: 'Aug', value: 984500 },
];

const transactions = [
  { id: '1', client: 'Ananya Sharma', event: 'Wedding Photography', amount: '₹1,20,000', date: 'Aug 5', status: 'completed' },
  { id: '2', client: 'Rohan Mehta', event: 'Corporate Event', amount: '₹85,000', date: 'Aug 4', status: 'completed' },
  { id: '3', client: 'Priya Iyer', event: 'Birthday Celebration', amount: '₹45,000', date: 'Aug 3', status: 'pending' },
  { id: '4', client: 'Karthik Reddy', event: 'Reception Coverage', amount: '₹95,000', date: 'Aug 2', status: 'pending' },
  { id: '5', client: 'Divya Rao', event: 'Sangeet Night', amount: '₹70,000', date: 'Aug 1', status: 'completed' },
];

export function EarningsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" subtitle="Track your revenue and manage payouts" icon={Wallet} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Today's Earnings", value: '₹48,250', change: '+12%', trend: 'up', bg: 'bg-gradient-brand', text: 'text-white' },
          { label: 'This Week', value: '₹2,76,000', change: '+18%', trend: 'up', bg: 'bg-card', text: 'text-dark-900' },
          { label: 'This Month', value: '₹9,84,500', change: '+24%', trend: 'up', bg: 'bg-card', text: 'text-dark-900' },
          { label: 'Pending Payout', value: '₹1,20,000', change: '2 pending', trend: 'down', bg: 'bg-card', text: 'text-dark-900' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border p-5 shadow-premium ${stat.bg} ${stat.text === 'text-white' ? 'border-transparent glossy' : 'border-border'}`}
          >
            <p className={`text-sm ${stat.text === 'text-white' ? 'text-white/80' : 'text-muted-foreground'}`}>{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-sage-600' : 'text-gold-600'} ${stat.text === 'text-white' ? '!text-white/80' : ''}`}>
              {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-dark-900">Earnings Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue overview</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sage transition-shadow hover:shadow-premium-lg">
            <ArrowDownToLine className="h-4 w-4" /> Withdraw
          </button>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a855a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5a855a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k` } />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40 15% 88%)', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Earnings']}
              />
              <Area type="monotone" dataKey="value" stroke="#5a855a" strokeWidth={2.5} fill="url(#earnGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-dark-900">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between rounded-xl border border-border bg-cream-50/50 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                  {t.client.split(' ').map((w) => w[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark-900">{t.client}</p>
                  <p className="text-xs text-muted-foreground">{t.event}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-dark-900">{t.amount}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.status === 'completed' ? 'bg-sage-50 text-sage-700' : 'bg-gold-50 text-gold-700'}`}>
                {t.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
