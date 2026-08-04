import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
  CheckCircle2, Building2, Users, Star, Shield, Zap,
  Camera, Utensils, Flower2, Music, Store, Search, CalendarCheck,
  TrendingUp, Heart, Briefcase, Phone
} from 'lucide-react';
import { useAuth, type UserRole } from '../lib/auth';

/* ── Data ───────────────────────────────────────────────────────── */

const VENDOR_FEATURES = [
  { icon: Building2, text: 'Create your vendor profile & showcase portfolio' },
  { icon: TrendingUp, text: 'Get discovered by thousands of event planners' },
  { icon: Zap, text: 'Receive & manage bookings instantly' },
  { icon: Shield, text: 'Verified badge & priority listing' },
];

const CUSTOMER_FEATURES = [
  { icon: Search, text: 'Access 2,500+ verified vendors across India' },
  { icon: Heart, text: 'Save favourites and compare vendors easily' },
  { icon: CalendarCheck, text: 'Instant booking with secure payments' },
  { icon: Shield, text: 'Free cancellation & full buyer protection' },
];

const vendorSlides = [
  { image: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'For Vendors', title: 'Grow Your\nBusiness' },
  { image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Showcase', title: 'Your Work,\nAmplified' },
  { image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Connect', title: 'Reach More\nCustomers' },
];

const customerSlides = [
  { image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'For Customers', title: 'Plan Perfect\nEvents' },
  { image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Discover', title: 'Find The Best\nVendors' },
  { image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Celebrate', title: 'Every Moment\nMatters' },
];

/* ── Main Component ─────────────────────────────────────────────── */

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, setDemoAdmin } = useAuth();

  const [role, setRole] = useState<UserRole | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpNotice, setOtpNotice] = useState('');

  useEffect(() => {
    let t: any;
    if (otpTimer > 0) {
      t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [otpTimer]);

  const sendOtpCode = () => {
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(60);
    setOtpNotice('✓ Verification code sent! Use mock OTP: 123456');
  };

  const slides = role === 'vendor' ? vendorSlides : customerSlides;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    if (user) {
      if (profile?.role === 'admin' || role === 'admin') navigate('/admin');
      else if (profile?.role === 'vendor' || role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/vendors');
    }
  }, [user, profile, navigate, role]);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      setDemoAdmin();
      navigate('/admin');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your full name');
      if (!mobileNumber.trim()) return setError('Please enter your mobile number');
      if (!otp.trim()) return setError('Please enter the OTP');
      if (otp !== '123456') return setError('Invalid OTP. Please use the verification code 123456');
      if (password.length < 6) return setError('Password must be at least 6 characters');
      if (password !== confirmPassword) return setError('Passwords do not match');
      if (!agreeTerms) return setError('You must agree to the Terms & Conditions');
    }

    setLoading(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) { setError(error); return; }
      if (role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/vendors');
    } else {
      if (!role) { setLoading(false); return; }
      const { error } = await signUp(email, password, name, role);
      setLoading(false);
      if (error) { setError(error); return; }
      navigate(role === 'vendor' ? '/vendor-dashboard' : '/vendors');
    }
  };

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setError('');
    setConfirmPassword('');
    setMobileNumber('');
    setOtp('');
    setAgreeTerms(false);
    setOtpSent(false);
    setOtpTimer(0);
    setOtpNotice('');
  };

  const resetRole = () => {
    setRole(null);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMobileNumber('');
    setOtp('');
    setAgreeTerms(false);
    setOtpSent(false);
    setOtpTimer(0);
    setOtpNotice('');
  };

  const slide = slides[slideIndex] ?? slides[0];
  const isVendor = role === 'vendor';

  /* ── Render ───────────────────────────────────────────────────── */

  // No role selected yet → show role selection screen
  if (!role) {
    return <RoleSelectionScreen mounted={mounted} onSelect={setRole} onBack={() => navigate('/')} />;
  }

  // Role selected → show auth form
  return (
    <>
      <div className="min-h-screen flex">
        {/* Left visual panel */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
          {slides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-1000"
              style={{ opacity: i === slideIndex ? 1 : 0, transform: i === slideIndex ? 'scale(1)' : 'scale(1.05)' }}
            >
              <img src={s.image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}

          {/* Overlays — color depends on role */}
          <div className={`absolute inset-0 ${isVendor ? 'bg-gradient-to-br from-sage-950/90 via-sage-900/60 to-sage-950/80' : 'bg-gradient-to-br from-sage-900/80 via-sage-800/45 to-sage-900/75'}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-950/70 via-transparent to-transparent" />

          <div className="orb w-96 h-96 bg-sage-600/20 -top-20 -left-20" />
          <div className="orb w-72 h-72 bg-gold-400/15 bottom-10 right-10" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group w-fit">
                <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-display text-3xl font-bold">Festivo</span>
              </button>

              {/* Role badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isVendor ? 'bg-sage-800/60 border border-gold-400/30' : 'bg-sage-700/40 border border-white/20'} backdrop-blur-sm`}>
                {isVendor ? <Store className="w-4 h-4 text-gold-400" /> : <Users className="w-4 h-4 text-cream-400" />}
                <span className="text-sm font-bold">{isVendor ? 'Vendor Portal' : 'Customer Portal'}</span>
              </div>
            </div>

            {/* Slide content */}
            <div key={`${role}-${slideIndex}`} className="animate-fade-up">
              <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${isVendor ? 'text-gold-400' : 'text-cream-400'}`}>
                {slide.tag}
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6 whitespace-pre-line drop-shadow-lg">
                {slide.title}
              </h2>

              {/* Feature list */}
              <div className="space-y-3 max-w-sm">
                {(isVendor ? VENDOR_FEATURES : CUSTOMER_FEATURES).slice(0, 3).map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isVendor ? 'bg-gold-400/15 border border-gold-400/25' : 'bg-sage-500/20 border border-sage-400/25'}`}>
                      <Icon className={`w-4 h-4 ${isVendor ? 'text-gold-400' : 'text-cream-300'}`} />
                    </div>
                    <span className="text-sage-100 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['1239291', '1516680', '1181686', '1024993'].map(n => (
                    <div key={n} className="w-8 h-8 rounded-full border-2 border-sage-900 overflow-hidden">
                      <img
                        src={`https://images.pexels.com/photos/${n}/pexels-photo-${n}.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sage-200 text-sm font-medium">
                  {isVendor ? 'Join 2,500+ vendors' : 'Join 50,000+ happy customers'}
                </p>
              </div>

              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className={`transition-all duration-300 rounded-full ${i === slideIndex ? 'w-6 h-2 bg-gold-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-cream-50 relative min-h-screen">
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 flex items-center gap-2 text-dark-500 hover:text-sage-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Home</span>
          </button>

          <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white rounded-3xl shadow-card p-8 md:p-10 border border-sage-100">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-2xl font-bold text-sage-900">Festivo</span>
              </div>

              {/* Role indicator */}
              <div className={`flex items-center justify-between p-3 rounded-xl mb-6 ${isVendor ? 'bg-sage-900' : 'bg-sage-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVendor ? 'bg-sage-700' : 'bg-sage-100'}`}>
                    {isVendor ? <Store className="w-5 h-5 text-gold-400" /> : <Users className="w-5 h-5 text-sage-600" />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isVendor ? 'text-white' : 'text-sage-900'}`}>
                      {isVendor ? 'Vendor Account' : 'Customer Account'}
                    </p>
                    <p className={`text-xs ${isVendor ? 'text-sage-300' : 'text-sage-600'}`}>
                      {isVendor ? 'You offer event services' : 'You plan & book events'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetRole}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isVendor ? 'bg-sage-700 text-sage-200 hover:bg-sage-600' : 'bg-white text-sage-600 border border-sage-200 hover:border-sage-400'}`}
                >
                  Switch
                </button>
              </div>

              {/* Heading */}
              <h1 className="font-display text-3xl font-bold text-sage-900 mb-1">
                {mode === 'signin'
                  ? isVendor ? 'Vendor Sign In' : 'Welcome Back!'
                  : isVendor ? 'Create Vendor Account' : 'Create Your Account'}
              </h1>
              <p className="text-dark-500 text-sm mb-6">
                {mode === 'signin'
                  ? isVendor
                    ? 'Sign in to manage your bookings and listings.'
                    : 'Sign in to access your bookings and events.'
                  : isVendor
                    ? 'Join Festivo as a vendor and grow your business.'
                    : 'Join Festivo and start planning your perfect event.'}
              </p>

              {/* Sign In / Sign Up toggle */}
              <div className="flex gap-1.5 p-1 bg-sage-50 rounded-xl mb-7">
                {(['signin', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                      mode === m ? 'bg-white text-sage-600 shadow-sm' : 'text-dark-500 hover:text-sage-700'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="animate-fade-up">
                    <label className="block text-dark-700 font-bold text-sm mb-1.5">
                      {isVendor ? 'Business / Full Name' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isVendor ? 'Your business name' : 'Your full name'}
                        className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-sage-300 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-dark-700 font-bold text-sm mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-sage-300 font-medium"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="animate-fade-up">
                    <label className="block text-dark-700 font-bold text-sm mb-1.5">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-sage-300 font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={sendOtpCode}
                        disabled={otpTimer > 0}
                        className="px-4 py-3 bg-sage-800 hover:bg-sage-700 disabled:bg-sage-200 text-white disabled:text-dark-400 font-bold text-xs rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Send OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && otpSent && (
                  <div className="animate-fade-up space-y-2">
                    {otpNotice && (
                      <div className="p-2.5 bg-sage-50 border border-sage-200 rounded-xl text-xs text-sage-800 font-bold">
                        {otpNotice}
                      </div>
                    )}
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Verification OTP</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6-digit verification code"
                          className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-sage-300 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-dark-700 font-bold text-sm mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                      required
                      className="w-full pl-10 pr-10 py-3 border border-sage-200 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-sage-300 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-sage-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="animate-fade-up">
                    <label className="block text-dark-700 font-bold text-sm mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        className="w-full pl-10 pr-10 py-3 border border-sage-200 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-sage-300 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-sage-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex justify-end">
                    <button type="button" className="text-sage-600 text-sm font-bold hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-dark-500 font-medium my-4 select-none animate-fade-up">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-sage-600 focus:ring-sage-400 border-sage-200"
                    />
                    <span>
                      I agree to Festivo's{' '}
                      <a href="/terms" target="_blank" rel="noreferrer" className="text-sage-700 font-bold hover:underline">Terms &amp; Conditions</a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" rel="noreferrer" className="text-sage-700 font-bold hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                )}

                {error && (
                  <div className="p-3 bg-cream-100 border border-cream-300 rounded-xl animate-fade-in">
                    <p className="text-cream-900 text-sm font-bold">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-[1.01] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {mode === 'signin'
                        ? isVendor ? 'Sign In to Dashboard' : 'Sign In'
                        : isVendor ? 'Create Vendor Account' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick role switch hint */}
              <div className="mt-6 p-4 bg-sage-50 rounded-xl border border-sage-100 text-center">
                <p className="text-dark-500 text-xs font-medium">
                  {isVendor ? (
                    <>Are you here to plan an event?{' '}
                      <button onClick={() => setRole('customer')} className="text-sage-700 font-bold hover:underline">
                        Switch to Customer
                      </button>
                    </>
                  ) : (
                    <>Are you an event service provider?{' '}
                      <button onClick={() => setRole('vendor')} className="text-sage-700 font-bold hover:underline">
                        Switch to Vendor
                      </button>
                    </>
                  )}
                </p>
              </div>

              <p className="text-center text-dark-500 text-xs mt-5 font-medium">
                By continuing, you agree to Festivo's{' '}
                <button className="text-sage-600 font-bold hover:underline">Terms</button> &{' '}
                <button className="text-sage-600 font-bold hover:underline">Privacy Policy</button>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Role Selection Screen ──────────────────────────────────────── */

function RoleSelectionScreen({
  mounted, onSelect, onBack,
}: {
  mounted: boolean;
  onSelect: (role: UserRole) => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showAdmin = searchParams.get('admin') === 'true';

  return (
    <div className="min-h-screen bg-cream-50 relative overflow-hidden flex items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="orb w-96 h-96 bg-sage-400/20 -top-20 right-1/4" />
      <div className="orb w-72 h-72 bg-cream-400/20 bottom-0 left-1/4" style={{ animationDelay: '2s' }} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-dark-500 hover:text-sage-700 transition-colors group z-10"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Home</span>
      </button>

      {/* Logo top center */}
      <button onClick={onBack} className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 group z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl font-bold text-sage-900">Festivo</span>
      </button>

      <div className={`relative z-10 w-full max-w-6xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Heading */}
        <div className="text-center mb-10 mt-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sage-900 mb-3">
            {showAdmin ? (
              <>Platform <span className="text-gradient">Admin Portal</span></>
            ) : (
              <>Select Your <span className="text-gradient">Portal</span></>
            )}
          </h1>
          <p className="text-dark-500 text-lg font-medium max-w-lg mx-auto">
            {showAdmin
              ? "Access the Festivo administration dashboard to manage platform bookings and approve vendor registrations."
              : "Choose your account type below. Portals for Customers and Vendors."}
          </p>
        </div>

        {/* Portal Cards */}
        <div className={`grid gap-6 ${showAdmin ? 'max-w-md mx-auto' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>
          {!showAdmin && (
            <>
              {/* Customer Card */}
              <RoleCard
                role="customer"
                icon={Users}
                accentIcon={Search}
                title="Customer Portal"
                subtitle="Plan & Book Events"
                description="Discover 2,500+ verified vendors, compare prices, and book services for your event."
                features={CUSTOMER_FEATURES.slice(0, 3)}
                accent="sage"
                ctaLabel="Enter Customer Portal"
                mounted={mounted}
                onClick={() => onSelect('customer')}
              />

              {/* Vendor Card */}
              <div className="relative">
                <RoleCard
                  role="vendor"
                  icon={Store}
                  accentIcon={Briefcase}
                  title="Vendor Portal"
                  subtitle="Enrolled Business Partner"
                  description="List your business by category, upload portfolio, and manage customer bookings."
                  features={VENDOR_FEATURES.slice(0, 3)}
                  accent="gold"
                  ctaLabel="Vendor Sign In / Sign Up"
                  mounted={mounted}
                  onClick={() => onSelect('vendor')}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/vendor-registration'); }}
                  className="w-full mt-3 py-2.5 bg-gradient-brand text-white font-bold text-xs rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" /> Submit Complete Vendor Enrollment Form →
                </button>
              </div>
            </>
          )}

          {/* Admin Card */}
          {showAdmin && (
            <div className="bg-sage-900 rounded-3xl p-8 text-white border-2 border-sage-700 shadow-card flex flex-col justify-between hover:border-gold-400/60 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-gold-400" />
                  </div>
                  <span className="bg-gold-500/20 text-gold-300 text-xs font-bold px-3 py-1 rounded-full border border-gold-400/30">
                    Admin Panel
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-1">Platform Admin</h2>
                <p className="text-gold-400 text-sm font-bold mb-3">Verification & Oversight</p>
                <p className="text-sage-200 text-sm leading-relaxed mb-6 font-medium">
                  Approve pending vendor registration applications, manage category listings, and oversee platform bookings & revenues.
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    'Approve / Reject submitted vendor applications',
                    'Verify & link vendors to official categories',
                    'Platform revenue & booking management',
                  ].map(text => (
                    <div key={text} className="flex items-center gap-2 text-xs text-sage-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelect('admin')}
                className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-sage-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Enter Admin Portal <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom info */}
        {!showAdmin && (
          <div className="text-center mt-8">
            <p className="text-dark-500 text-sm font-medium">
              Not sure? You can switch your role anytime after signing up.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Role Card ──────────────────────────────────────────────────── */

function RoleCard({
  role, icon: Icon, accentIcon: AccentIcon, title, subtitle, description, features, accent, ctaLabel, mounted, onClick,
}: {
  role: UserRole;
  icon: typeof Users;
  accentIcon: typeof Search;
  title: string;
  subtitle: string;
  description: string;
  features: { icon: typeof Users; text: string }[];
  accent: 'sage' | 'gold';
  ctaLabel: string;
  mounted: boolean;
  onClick: () => void;
}) {
  const isGold = accent === 'gold';
  const delay = role === 'customer' ? 'delay-100' : 'delay-300';

  return (
    <div className={`animate-on-scroll ${mounted ? 'in-view' : ''} ${delay}`}>
      <button
        onClick={onClick}
        className={`group relative w-full text-left rounded-3xl p-8 border-2 transition-all duration-400 card-hover overflow-hidden ${
          isGold
            ? 'bg-sage-900 border-sage-800 hover:border-gold-500/50 hover:shadow-card-hover'
            : 'bg-white border-sage-200 hover:border-sage-400 hover:shadow-card-hover'
        }`}
      >
        {/* Decorative gradient blob */}
        <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-40 ${
          isGold ? 'bg-gold-500/15' : 'bg-sage-400/15'
        }`} />

        {/* Icon row */}
        <div className="relative flex items-center justify-between mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            isGold ? 'bg-sage-700' : 'bg-sage-100'
          }`}>
            <Icon className={`w-8 h-8 ${isGold ? 'text-gold-400' : 'text-sage-600'}`} />
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isGold ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-sage-50 border border-sage-200'
          }`}>
            <AccentIcon className={`w-5 h-5 ${isGold ? 'text-gold-400' : 'text-sage-500'}`} />
          </div>
        </div>

        {/* Title */}
        <h2 className={`font-display text-2xl font-bold mb-1 ${isGold ? 'text-white' : 'text-sage-900'}`}>
          {title}
        </h2>
        <p className={`text-sm font-bold mb-3 ${isGold ? 'text-gold-400' : 'text-sage-600'}`}>
          {subtitle}
        </p>
        <p className={`text-sm leading-relaxed mb-6 font-medium ${isGold ? 'text-sage-300' : 'text-dark-500'}`}>
          {description}
        </p>

        {/* Feature list */}
        <div className="space-y-2.5 mb-8">
          {features.map(({ icon: FeatureIcon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isGold ? 'bg-sage-700' : 'bg-sage-100'
              }`}>
                <FeatureIcon className={`w-3 h-3 ${isGold ? 'text-gold-400' : 'text-sage-600'}`} />
              </div>
              <span className={`text-sm font-medium ${isGold ? 'text-sage-200' : 'text-dark-600'}`}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`flex items-center justify-between pt-5 border-t transition-colors ${
          isGold ? 'border-sage-700 group-hover:border-gold-400/30' : 'border-sage-100 group-hover:border-sage-300'
        }`}>
          <span className={`font-bold text-sm ${isGold ? 'text-white' : 'text-sage-900'}`}>
            {ctaLabel}
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 ${
            isGold ? 'bg-gold-500/15 group-hover:bg-gold-500/25' : 'bg-sage-100 group-hover:bg-sage-200'
          }`}>
            <ArrowRight className={`w-5 h-5 ${isGold ? 'text-gold-400' : 'text-sage-600'}`} />
          </div>
        </div>
      </button>
    </div>
  );
}
