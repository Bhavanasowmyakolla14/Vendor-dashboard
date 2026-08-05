import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Star, CalendarCheck, Clock, Repeat } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { earningsData } from '@/lib/dashboard-data';
import { PageHeader } from '@/components/dashboard/page-header';

const bookingTrend = [
  { month: 'Jan', bookings: 12 }, { month: 'Feb', bookings: 18 }, { month: 'Mar', bookings: 15 },
  { month: 'Apr', bookings: 22 }, { month: 'May', bookings: 25 }, { month: 'Jun', bookings: 28 },
  { month: 'Jul', bookings: 32 }, { month: 'Aug', bookings: 38 },
];

const serviceBreakdown = [
  { name: 'Weddings', value: 45 },
  { name: 'Corporate', value: 25 },
  { name: 'Birthdays', value: 18 },
  { name: 'Receptions', value: 12 },
];

const stats = [
  { label: 'Average Rating', value: '4.9', icon: Star, accent: 'text-gold-600', bg: 'bg-gold-50' },
  { label: 'Completed Events', value: '186', icon: CalendarCheck, accent: 'text-sage-600', bg: 'bg-sage-50' },
  { label: 'Response Time', value: '1.2h', icon: Clock, accent: 'text-dark-700', bg: 'bg-dark-100' },
  { label: 'Repeat Customers', value: '42%', icon: Repeat, accent: 'text-sage-600', bg: 'bg-sage-50' },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Insights into your business performance" icon={BarChart3} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <p className="mt-4 text-2xl font-bold text-dark-900">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Booking Trends</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40 15% 88%)', fontSize: '12px' }} />
                <Bar dataKey="bookings" fill="#5a855a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Revenue Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a855a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#5a855a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k` } />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40 15% 88%)', fontSize: '12px' }} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue'] } />
                <Area type="monotone" dataKey="value" stroke="#5a855a" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-dark-900">Service Breakdown</h3>
        <div className="space-y-3">
          {serviceBreakdown.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4"
            >
              <p className="w-28 text-sm font-medium text-dark-700">{s.name}</p>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-brand"
                />
              </div>
              <p className="w-10 text-right text-sm font-semibold text-dark-900">{s.value}%</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
