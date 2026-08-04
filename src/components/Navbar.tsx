import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, LogOut, User, Store, ChevronDown, Bell, LayoutDashboard, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === '/') {
      navigate('/');
    } else if (href.startsWith('/#')) {
      if (isHome) {
        document.querySelector(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userDisplayName = user?.email?.split('@')[0] || 'User';
  const isVendor = profile?.role === 'vendor';
  const isAdmin = profile?.role === 'admin';
  const dashboardUrl = isAdmin ? '/admin' : (isVendor ? '/vendor-dashboard' : '/dashboard');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent py-4'
          : 'bg-cream-50/95 backdrop-blur-xl shadow-soft py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className={`font-display text-2xl font-bold tracking-tight transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-sage-900'}`}>
              Festivo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-bold hover-underline transition-colors duration-200 ${
                  isTransparent ? 'text-white/95 hover:text-white' : 'text-sage-700 hover:text-sage-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate(dashboardUrl)}
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isTransparent ? 'text-white/95 hover:bg-white/10' : 'text-sage-700 hover:bg-sage-100'
                  }`}
                >
                  {isAdmin ? <Shield className="w-4 h-4" /> : (isVendor ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />)}
                  {userDisplayName}
                </button>
                <button
                  onClick={() => navigate(dashboardUrl)}
                  className={`p-2 rounded-xl transition-all hover:scale-110 relative ${
                    isTransparent ? 'text-white hover:bg-white/10' : 'text-sage-700 hover:bg-sage-100'
                  }`}
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOut}
                  className={`p-2 rounded-xl transition-all hover:scale-110 ${
                    isTransparent ? 'text-white hover:bg-white/10' : 'text-sage-700 hover:bg-sage-100'
                  }`}
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="relative group">
                <button
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isTransparent ? 'text-white/95 hover:bg-white/10' : 'text-sage-700 hover:bg-sage-100'
                  }`}
                >
                  Sign In
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-card-hover border border-sage-100 p-2 w-56">
                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-sage-50 transition-colors text-left group/customer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0 group-hover/customer:bg-sage-200 transition-colors">
                        <User className="w-4 h-4 text-sage-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sage-900 font-bold text-sm">Customer Portal</p>
                        <p className="text-dark-500 text-[11px] font-medium">Plan & book events</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-sage-50 transition-colors text-left group/vendor"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-gold-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sage-900 font-bold text-sm">Vendor Portal</p>
                        <p className="text-dark-500 text-[11px] font-medium">Enroll service by category</p>
                      </div>
                    </button>

                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => navigate('/vendors')}
              className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-brand text-white shadow-glow hover:shadow-card-hover hover:scale-105 transition-all duration-300 active:scale-95"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isTransparent ? 'text-white' : 'text-sage-800'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ${
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-cream-50 border-t border-sage-200 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left text-sage-800 font-bold py-2 hover:text-sage-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <button onClick={handleSignOut} className="w-full text-sm font-bold py-2.5 rounded-xl border border-sage-300 text-sage-700 hover:border-sage-500 transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { setMobileOpen(false); navigate('/auth'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-sage-300 text-sage-700 hover:border-sage-500 transition-colors"
                >
                  <User className="w-4 h-4 text-sage-600" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold">Customer Sign In</p>
                    <p className="text-xs text-sage-500 font-medium">Plan & book events</p>
                  </div>
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/auth'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-900 text-white transition-colors"
                >
                  <Store className="w-4 h-4 text-gold-400" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold">Vendor Sign In</p>
                    <p className="text-xs text-sage-300 font-medium">Offer event services</p>
                  </div>
                </button>
              </div>
            )}
            {user && (
              <button
                onClick={() => { setMobileOpen(false); navigate(dashboardUrl); }}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl border border-sage-200 text-sage-700 hover:bg-sage-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> My Dashboard
              </button>
            )}
            <button
              onClick={() => { setMobileOpen(false); navigate('/vendors'); }}
              className="w-full text-sm font-bold py-2.5 rounded-xl bg-gradient-brand text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
