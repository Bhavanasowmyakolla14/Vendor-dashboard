import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BarChart3, Users, Wallet, TrendingUp, CheckCircle2,
  XCircle, Clock, Store, Star, Sparkles, ArrowRight, LogOut,
  AlertCircle, Download, Eye, Search, Filter, DollarSign
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Vendor, Booking } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { useInView } from '../hooks/useInView';

type VendorWithProfile = Vendor & {
  approval_status?: string;
  commission_rate?: number;
  subscription_tier?: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [vendors, setVendors] = useState<VendorWithProfile[]>([]);
  const [pendingApplications, setPendingApplications] = useState<VendorWithProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'vendors' | 'bookings' | 'revenue'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const statsView = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?admin=true');
      } else if (profile && profile.role !== 'admin') {
        navigate(profile.role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const loadData = async () => {
    const { data: vendorData } = await supabase.from('vendors').select('*').order('rating', { ascending: false });
    const { data: bookingData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(50);
    
    // Load local pending vendors
    const localPending: VendorWithProfile[] = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    // Load local approved vendors
    const localApproved: VendorWithProfile[] = JSON.parse(localStorage.getItem('festivo_approved_vendors') || '[]');

    const allVendors = [...(vendorData ?? []), ...localApproved] as VendorWithProfile[];
    // Unique by slug
    const uniqueVendors = Array.from(new Map(allVendors.map(v => [v.slug, v])).values());

    setVendors(uniqueVendors);
    setPendingApplications(localPending);
    setBookings(bookingData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveVendorApplication = async (vendor: VendorWithProfile) => {
    const approvedVendor: VendorWithProfile = {
      ...vendor,
      verified: true,
      badge: 'Verified Partner',
      badge_color: 'bg-sage-600',
    };

    // Remove from pending
    const updatedPending = pendingApplications.filter(v => v.slug !== vendor.slug);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));

    // Add to approved
    const localApproved: VendorWithProfile[] = JSON.parse(localStorage.getItem('festivo_approved_vendors') || '[]');
    const newApprovedList = [...localApproved, approvedVendor];
    localStorage.setItem('festivo_approved_vendors', JSON.stringify(newApprovedList));

    // Update vendors state
    setVendors(prev => [...prev.filter(v => v.slug !== vendor.slug), approvedVendor]);

    // Update Supabase if available
    try {
      await supabase.from('vendors').upsert(approvedVendor);
    } catch (e) {
      console.warn('Supabase update notice:', e);
    }

    setActionNotice(`✓ "${vendor.name}" has been approved and officially published under ${vendor.category}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const rejectVendorApplication = (slug: string) => {
    const updatedPending = pendingApplications.filter(v => v.slug !== slug);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));
    setActionNotice('Application rejected.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0);
  const commissionRevenue = Math.round(totalRevenue * 0.15);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const avgRating = vendors.length ? (vendors.reduce((s, v) => s + Number(v.rating), 0) / vendors.length).toFixed(1) : '—';

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'verified' && v.verified) || (filterStatus === 'unverified' && !v.verified);
    return matchesSearch && matchesStatus;
  });

  const toggleVerify = async (vendor: Vendor) => {
    const newStatus = !vendor.verified;
    await supabase.from('vendors').update({ verified: newStatus }).eq('id', vendor.id);
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, verified: newStatus } : v));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-900 to-sage-800 py-8 relative overflow-hidden">
          <div className="orb w-72 h-72 bg-sage-600/20 -top-20 -left-20 opacity-30" />
          <div className="orb w-72 h-72 bg-gold-500/10 -bottom-20 -right-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gold-500 text-sage-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Administrator
                    </span>
                    <span className="text-sage-200 text-sm">{user?.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

            <div className="flex gap-1 mt-6 overflow-x-auto">
              {(['overview', 'applications', 'vendors', 'bookings', 'revenue'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab ? 'bg-white text-sage-600 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab === 'applications' ? 'Pending Applications' : tab}
                  {tab === 'applications' && pendingApplications.length > 0 && (
                    <span className="bg-gold-500 text-sage-950 text-xs px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                      {pendingApplications.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {actionNotice && (
            <div className="mb-6 p-4 bg-sage-900 text-white font-bold rounded-2xl border border-sage-700 shadow-lg flex items-center justify-between animate-slide-down">
              <span>{actionNotice}</span>
              <button onClick={() => setActionNotice(null)} className="text-xs text-sage-300 hover:text-white">Dismiss</button>
            </div>
          )}

          {/* Pending Applications Tab */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl shadow-card p-6 border border-sage-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-sage-100">
                <div>
                  <h2 className="font-display text-2xl font-bold text-sage-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-gold-500" /> Pending Vendor Enrollment Requests ({pendingApplications.length})
                  </h2>
                  <p className="text-dark-500 text-sm font-medium mt-1">Review vendor submissions. Upon acceptance, they will officially become live in their category!</p>
                </div>
                <button
                  onClick={() => navigate('/vendor-registration')}
                  className="px-4 py-2 bg-gradient-brand text-white font-bold text-xs rounded-xl hover:shadow-glow transition-all"
                >
                  + Add Vendor Registration
                </button>
              </div>

              {pendingApplications.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-12 h-12 text-sage-400 mx-auto mb-3" />
                  <h3 className="font-display text-xl font-bold text-sage-900 mb-1">No Pending Applications</h3>
                  <p className="text-dark-500 text-sm">All vendor registration requests have been reviewed and accepted.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingApplications.map(app => (
                    <div key={app.slug} className="border border-sage-200 rounded-2xl p-5 bg-cream-50/50 space-y-4 hover:border-sage-400 transition-all">
                      <div className="flex items-start gap-4">
                        <img src={app.image} alt="" className="w-20 h-20 rounded-xl object-cover border border-sage-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="bg-gold-100 text-gold-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gold-300">
                              {app.category}
                            </span>
                            <span className="text-dark-400 text-xs font-medium">{app.location}</span>
                          </div>
                          <h3 className="font-display font-bold text-sage-900 text-lg mt-1 truncate">{app.name}</h3>
                          <p className="text-sage-700 font-bold text-sm">₹{Number(app.price_amount).toLocaleString('en-IN')} <span className="text-xs text-dark-500 font-normal">({app.price_label})</span></p>
                        </div>
                      </div>

                      <p className="text-dark-600 text-xs leading-relaxed line-clamp-3 font-medium bg-white p-3 rounded-xl border border-cream-200">
                        {app.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-sage-200">
                        <div className="flex flex-wrap gap-1">
                          {app.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] bg-white px-2 py-0.5 rounded text-dark-600 border">{tag}</span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => rejectVendorApplication(app.slug)}
                            className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-dark-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveVendorApplication(app)}
                            className="px-4 py-1.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Overview */}
          {activeTab === 'overview' && (
            <>
              <div ref={statsView.ref} className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-on-scroll ${statsView.inView ? 'in-view' : ''}`}>
                {[
                  { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'bg-sage-50 text-sage-600' },
                  { label: 'Commission Earned', value: `₹${(commissionRevenue / 1000).toFixed(0)}K`, icon: Wallet, color: 'bg-cream-100 text-cream-800' },
                  { label: 'Total Vendors', value: String(vendors.length), icon: Store, color: 'bg-sage-100 text-sage-700' },
                  { label: 'Total Bookings', value: String(bookings.length), icon: BarChart3, color: 'bg-cream-50 text-cream-900' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5 card-hover">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="font-display text-2xl font-bold text-sage-900">{stat.value}</p>
                    <p className="text-dark-500 text-sm mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sage-500" /> Recent Bookings
                  </h2>
                  {bookings.length === 0 ? (
                    <p className="text-dark-500 text-sm text-center py-8">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 6).map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 bg-sage-50/60 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sage-900 text-sm truncate">{b.customer_name}</p>
                            <p className="text-dark-400 text-xs">{b.event_type} · {new Date(b.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sage-900 text-sm">₹{b.total_amount.toLocaleString('en-IN')}</p>
                            <p className={`text-xs font-bold ${b.status === 'confirmed' ? 'text-sage-600' : b.status === 'pending' ? 'text-gold-600' : 'text-cream-700'}`}>{b.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Vendors */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold-500" /> Top Rated Vendors
                  </h2>
                  <div className="space-y-3">
                    {vendors.slice(0, 6).map(v => (
                      <div key={v.id} className="flex items-center gap-3 p-3 bg-sage-50/60 rounded-xl hover:bg-sage-100/60 transition-colors cursor-pointer" onClick={() => navigate(`/vendors/${v.slug}`)}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={v.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sage-900 text-sm truncate">{v.name}</p>
                          <p className="text-dark-400 text-xs">{v.category} · {v.location}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                          <span className="font-bold text-sage-900 text-sm">{v.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vendors Management */}
          {activeTab === 'vendors' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-xl font-bold text-sage-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-sage-500" /> Vendor Management ({vendors.length})
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search vendors..."
                      className="pl-10 pr-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 w-48"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-sage-200 rounded-xl text-sm font-medium text-dark-700 outline-none focus:ring-2 focus:ring-sage-300"
                  >
                    <option value="all">All</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sage-100">
                      {['Vendor', 'Category', 'Location', 'Rating', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} className="pb-3 text-left text-dark-500 text-xs font-bold uppercase tracking-wider pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-50">
                    {filteredVendors.map(v => (
                      <tr key={v.id} className="hover:bg-sage-50/50 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={v.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-sage-900 text-sm">{v.name}</p>
                              <p className="text-dark-400 text-xs">{v.reviews} reviews</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-sm text-dark-700">{v.category}</td>
                        <td className="py-4 pr-4 text-sm text-dark-700">{v.location}</td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                            <span className="font-bold text-sage-900 text-sm">{v.rating}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-bold text-sage-900 text-sm">₹{Number(v.price_amount).toLocaleString('en-IN')}</td>
                        <td className="py-4">
                          {v.verified ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-sage-700 bg-sage-100 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-gold-700 bg-gold-100 px-2.5 py-1 rounded-full">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-1">
                            <button onClick={() => navigate(`/vendors/${v.slug}`)} className="p-2 hover:bg-sage-100 rounded-lg transition-colors" title="View">
                              <Eye className="w-4 h-4 text-sage-600" />
                            </button>
                            <button onClick={() => toggleVerify(v)} className={`p-2 rounded-lg transition-colors ${v.verified ? 'hover:bg-cream-100' : 'hover:bg-sage-100'}`} title={v.verified ? 'Unverify' : 'Verify'}>
                              {v.verified ? <XCircle className="w-4 h-4 text-cream-600" /> : <CheckCircle2 className="w-4 h-4 text-sage-600" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredVendors.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="w-10 h-10 text-sage-300 mx-auto mb-3" />
                  <p className="text-dark-500 text-sm">No vendors match your filters</p>
                </div>
              )}
            </div>
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sage-500" /> All Bookings ({bookings.length})
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <BarChart3 className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="font-bold text-sage-900 mb-1">No bookings yet</p>
                  <p className="text-dark-500 text-sm">Bookings will appear here once customers start booking.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sage-100">
                        {['Ref', 'Customer', 'Event', 'Date', 'Amount', 'Payment', 'Status'].map(h => (
                          <th key={h} className="pb-3 text-left text-dark-500 text-xs font-bold uppercase tracking-wider pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-50">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-sage-50/50 transition-colors">
                          <td className="py-4 pr-4 font-mono text-xs text-dark-500">{b.booking_ref}</td>
                          <td className="py-4 pr-4">
                            <p className="font-bold text-sage-900 text-sm">{b.customer_name}</p>
                            <p className="text-dark-400 text-xs">{b.customer_email}</p>
                          </td>
                          <td className="py-4 pr-4 text-sm text-dark-700">{b.event_type}</td>
                          <td className="py-4 pr-4 text-sm text-dark-700">{new Date(b.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-4 pr-4 font-bold text-sage-900 text-sm">₹{b.total_amount.toLocaleString('en-IN')}</td>
                          <td className="py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.payment_status === 'paid' ? 'text-sage-700 bg-sage-100' : 'text-gold-700 bg-gold-100'}`}>
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'text-sage-700 bg-sage-100' : b.status === 'pending' ? 'text-gold-700 bg-gold-100' : 'text-cream-700 bg-cream-200'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Revenue */}
          {activeTab === 'revenue' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Gross Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'bg-sage-50 text-sage-600' },
                  { label: 'Commission (15%)', value: `₹${(commissionRevenue / 1000).toFixed(0)}K`, icon: Wallet, color: 'bg-cream-100 text-cream-800' },
                  { label: 'Pending Payouts', value: `₹${((totalRevenue - commissionRevenue) / 1000).toFixed(0)}K`, icon: Clock, color: 'bg-sage-100 text-sage-700' },
                  { label: 'Avg Order Value', value: `₹${bookings.length ? Math.round(totalRevenue / bookings.length / 1000) : 0}K`, icon: TrendingUp, color: 'bg-cream-50 text-cream-900' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5 card-hover">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="font-display text-2xl font-bold text-sage-900">{stat.value}</p>
                    <p className="text-dark-500 text-sm mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sage-500" /> Revenue by Category
                </h2>
                <div className="space-y-4">
                  {['Venue', 'Catering', 'Photography', 'Decoration', 'Entertainment', 'Coordinator'].map(cat => {
                    const catBookings = bookings.filter(b => {
                      const vendor = vendors.find(v => v.id === b.vendor_id);
                      return vendor?.category === cat;
                    });
                    const catRevenue = catBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0);
                    const maxRevenue = Math.max(...['Venue', 'Catering', 'Photography', 'Decoration', 'Entertainment', 'Coordinator'].map(c => {
                      const cb = bookings.filter(b => {
                        const v = vendors.find(vd => vd.id === b.vendor_id);
                        return v?.category === c;
                      });
                      return cb.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0);
                    }), 1);
                    const pct = (catRevenue / maxRevenue) * 100;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sage-900 text-sm">{cat}</span>
                          <span className="font-bold text-sage-600 text-sm">₹{catRevenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-3 bg-sage-50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-brand rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
