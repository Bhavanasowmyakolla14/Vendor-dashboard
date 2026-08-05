import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Images,
  Package,
  Star,
  Wallet,
  BarChart3,
  Tag,
  Settings,
  LifeBuoy,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { navItems } from '@/lib/dashboard-data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Images,
  Package,
  Star,
  Wallet,
  BarChart3,
  Tag,
  Settings,
  LifeBuoy,
};

const routeMap: Record<string, string> = {
  Dashboard: '/',
  Bookings: '/bookings',
  Calendar: '/calendar',
  Messages: '/messages',
  Portfolio: '/portfolio',
  Packages: '/packages',
  Reviews: '/reviews',
  Earnings: '/earnings',
  Analytics: '/analytics',
  Deals: '/deals',
  Settings: '/settings',
  Support: '/support',
};

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-dark-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed z-40 flex h-full w-[280px] flex-col border-r border-border bg-card shadow-premium transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-sage">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-900">Festivo</h1>
              <p className="text-[11px] font-medium text-muted-foreground">Vendor Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-4 py-2">
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] ?? LayoutDashboard;
              const path = routeMap[item.label] ?? '/';
              return (
                <li key={item.label}>
                  <NavLink
                    to={path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-dark-900',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl bg-gradient-brand"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <Icon
                          className={cn(
                            'relative z-10 h-[18px] w-[18px] shrink-0',
                            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-dark-900',
                          )}
                        />
                        <span className="relative z-10">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark-600 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
