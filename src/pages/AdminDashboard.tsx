import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BarChart3, Wallet, Clock, Store, Star, LogOut,
  DollarSign, Send, AlertTriangle, FileText, Bell
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Booking } from '../lib/supabase';

type VendorWithProfile = any;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  
  const [vendors, setVendors] = useState<VendorWithProfile[]>([]);
  const [pendingApplications, setPendingApplications] = useState<VendorWithProfile[]>([]);
  const [selectedApp, setSelectedApp] = useState<VendorWithProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'vendors' | 'bookings' | 'revenue'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Verification Queue checklist state
  const [checklist, setChecklist] = useState({
    email: true,
    mobile: true,
    aadhaar: false,
    pan: false,
    gst: false,
    bank: false,
    portfolio: false,
    businessDetails: false
  });

  // Lightbox modal for KYC document preview
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  // Rejection & requested docs inputs
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false);
  const [requestedDocsList, setRequestedDocsList] = useState('');

  // Admin to Vendor messaging
  const [adminMessage, setAdminMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; date: string }>>([]);

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
    try {
      const { data: vendorData } = await supabase.from('vendors').select('*').order('rating', { ascending: false });
      const { data: bookingData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(50);
      
      setBookings(bookingData ?? []);

      // Load local pending vendors queue
      const localPending: VendorWithProfile[] = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
      // Load local approved vendors
      const localApproved: VendorWithProfile[] = JSON.parse(localStorage.getItem('festivo_approved_vendors') || '[]');

      const allVendors = [...(vendorData ?? []), ...localApproved];
      const uniqueVendors = Array.from(new Map(allVendors.map(v => [v.slug || v.id, v])).values());

      setVendors(uniqueVendors);
      
      // Default placeholder pending queue if empty to allow easy admin review testing
      if (localPending.length === 0) {
        const placeholderQueue = [
          {
            id: 'VND-291083',
            name: 'Royal Canopy Decors',
            category: 'Decorator',
            location: 'Bangalore, KA',
            price_amount: 35000,
            price_label: 'Basic setup',
            price_unit: 'day',
            rating: 4.8,
            reviews: 0,
            image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800',
            verified: false,
            badge: 'Pending Review',
            badge_color: 'bg-gold-500',
            slug: 'royal-canopy-decors',
            details: {
              email: 'royaldecors@gmail.com',
              phone: '+91 91234 56789',
              owner: 'Ananya Roy',
              address: '12th Main Road, Indiranagar, Bangalore, 560038',
              serviceAreas: ['Bangalore', 'Mysore'],
              languages: ['English', 'Kannada'],
              teamSize: '6-10 Members',
              experience: '3-5 Years',
              registrationDate: '2026-08-04',
              status: 'Pending Verification',
              kyc: {
                aadhaarFront: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
                aadhaarBack: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&q=80&w=200',
                pan: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=200',
                cancelledCheque: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=200'
              }
            }
          }
        ];
        localStorage.setItem('festivo_pending_vendors', JSON.stringify(placeholderQueue));
        setPendingApplications(placeholderQueue);
      } else {
        setPendingApplications(localPending);
      }

      // Sync and load admin notifications
      const storedNotifs = localStorage.getItem('festivo_admin_notifications');
      const currentPending = localPending.length === 0 ? JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]') : localPending;
      if (!storedNotifs && currentPending.length > 0) {
        const generated = currentPending.map((v: any) => ({
          id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'new_application',
          vendorId: v.id,
          vendorName: v.name,
          message: `New vendor application submitted by "${v.name}" (${v.category}) in ${v.location}.`,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          read: false
        }));
        localStorage.setItem('festivo_admin_notifications', JSON.stringify(generated));
        setAdminNotifications(generated);
      } else if (storedNotifs) {
        setAdminNotifications(JSON.parse(storedNotifs));
      }
    } catch (err) {
      console.warn('Error reading real Supabase tables inside Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'festivo_admin_notifications') {
        setAdminNotifications(JSON.parse(e.newValue || '[]'));
      }
      if (e.key === 'festivo_pending_vendors') {
        const newPending = JSON.parse(e.newValue || '[]');
        setPendingApplications(newPending);
        const currentNotifs = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
        setAdminNotifications(currentNotifs);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!showNotificationsDropdown) return;
    const handleOutsideClick = () => {
      setShowNotificationsDropdown(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showNotificationsDropdown]);

  const handleAppOpen = (app: VendorWithProfile) => {
    setSelectedApp(app);
    setChecklist({
      email: true,
      mobile: true,
      aadhaar: app.details?.kyc?.aadhaarFront ? true : false,
      pan: app.details?.kyc?.pan ? true : false,
      gst: false,
      bank: app.details?.kyc?.cancelledCheque ? true : false,
      portfolio: true,
      businessDetails: true
    });
    // Load local chat log for this vendor
    const localMsgs = JSON.parse(localStorage.getItem(`festivo_msgs_${app.id}`) || '[]');
    setChatLog(localMsgs);
  };

  const handleNotificationClick = (notif: any) => {
    // 1. Mark notification as read
    const updated = adminNotifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
    setAdminNotifications(updated);
    localStorage.setItem('festivo_admin_notifications', JSON.stringify(updated));

    // Reload from local storage to ensure we have the absolute latest pending list
    const latestPending = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    setPendingApplications(latestPending);

    // 2. Find the vendor in pending applications list
    const foundVendor = latestPending.find((v: any) => v.id === notif.vendorId);
    if (foundVendor) {
      setActiveTab('applications');
      handleAppOpen(foundVendor);
    } else {
      const foundActive = vendors.find(v => v.id === notif.vendorId);
      if (foundActive) {
        setActiveTab('vendors');
        setActionNotice(`Vendor "${foundActive.name}" is already active and approved.`);
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setActionNotice("Vendor details not found in database.");
        setTimeout(() => setActionNotice(null), 4000);
      }
    }
    setShowNotificationsDropdown(false);
  };

  const handleApproveApplication = async (vendor: VendorWithProfile) => {
    const approvedVendor = {
      ...vendor,
      verified: true,
      badge: 'Verified Partner',
      badge_color: 'bg-sage-600',
    };
    approvedVendor.details = {
      ...(approvedVendor.details || {}),
      status: 'Approved'
    };

    // Remove from pending
    const updatedPending = pendingApplications.filter(v => v.slug !== vendor.slug);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));

    // Add to approved
    const localApproved = JSON.parse(localStorage.getItem('festivo_approved_vendors') || '[]');
    localStorage.setItem('festivo_approved_vendors', JSON.stringify([...localApproved, approvedVendor]));

    // Update state
    setVendors(prev => [...prev.filter(v => v.slug !== vendor.slug), approvedVendor]);

    // Send mock notification email
    const notifications = JSON.parse(localStorage.getItem('festivo_notifications') || '[]');
    const newNotification = {
      id: crypto.randomUUID(),
      vendor_id: vendor.id,
      title: 'Listing Approved! 🎉',
      message: `Congratulations! Your vendor listing for "${vendor.name}" has been approved and published.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('festivo_notifications', JSON.stringify([...notifications, newNotification]));

    // Update DB
    try {
      await supabase.from('vendors').update({ verified: true, details: approvedVendor.details }).eq('id', vendor.id);
    } catch (e) {
      console.warn('Supabase approve update error (ignored in mocks):', e);
    }

    setActionNotice(`✓ "${vendor.name}" approved and listing published!`);
    setSelectedApp(null);
  };

  const handleAcceptProfileDetails = (vendor: VendorWithProfile) => {
    const updatedVendor = {
      ...vendor,
      badge: 'Awaiting KYC',
      badge_color: 'bg-blue-550'
    };
    updatedVendor.details = {
      ...(updatedVendor.details || {}),
      status: 'Pending KYC'
    };

    // Update pending
    const updatedPending = pendingApplications.map(v => v.id === vendor.id ? updatedVendor : v);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));

    // Send mock notification to vendor
    const notifications = JSON.parse(localStorage.getItem('festivo_notifications') || '[]');
    const newNotification = {
      id: crypto.randomUUID(),
      vendor_id: vendor.id,
      title: 'Profile Approved! 📄 Now Submit KYC',
      message: `Your basic business listing details have been approved. Please log in and upload your KYC documents to activate your portal.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('festivo_notifications', JSON.stringify([...notifications, newNotification]));

    setActionNotice(`✓ Listing details accepted for "${vendor.name}". Staged to Pending KYC.`);
    setSelectedApp(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRejectApplication = async (vendor: VendorWithProfile) => {
    if (!rejectionReason.trim()) return;

    const rejectedVendor = {
      ...vendor,
      verified: false,
      badge: 'Rejected',
      badge_color: 'bg-red-500',
    };
    rejectedVendor.details = {
      ...(rejectedVendor.details || {}),
      status: 'Rejected',
      rejectionReason: rejectionReason.trim()
    };

    // Store rejection reason
    localStorage.setItem(`festivo_reject_reason_${vendor.id}`, rejectionReason.trim());

    // Update pending
    const updatedPending = pendingApplications.map(v => v.id === vendor.id ? rejectedVendor : v);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));

    // Send mock notification
    const notifications = JSON.parse(localStorage.getItem('festivo_notifications') || '[]');
    const newNotification = {
      id: crypto.randomUUID(),
      vendor_id: vendor.id,
      title: 'Listing Rejected ❌',
      message: `Reason: ${rejectionReason.trim()}`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('festivo_notifications', JSON.stringify([...notifications, newNotification]));

    setActionNotice(`Application rejected: ${rejectionReason.trim()}`);
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedApp(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRequestDocs = (vendor: VendorWithProfile) => {
    if (!requestedDocsList.trim()) return;

    // Update status locally
    const updatedVendor = {
      ...vendor,
      badge: 'Docs Requested',
      badge_color: 'bg-blue-500'
    };
    updatedVendor.details = {
      ...(updatedVendor.details || {}),
      status: 'Documents Requested',
      requestedDocs: requestedDocsList.trim()
    };

    localStorage.setItem(`festivo_requested_docs_${vendor.id}`, requestedDocsList.trim());

    // Update pending list
    const updatedPending = pendingApplications.map(v => v.id === vendor.id ? updatedVendor : v);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));

    // Notification
    const notifications = JSON.parse(localStorage.getItem('festivo_notifications') || '[]');
    const newNotification = {
      id: crypto.randomUUID(),
      vendor_id: vendor.id,
      title: 'Action Required: Documents Requested ⏳',
      message: `Please upload: ${requestedDocsList.trim()}`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('festivo_notifications', JSON.stringify([...notifications, newNotification]));

    setActionNotice(`Documents requested from "${vendor.name}".`);
    setShowRequestDocsModal(false);
    setRequestedDocsList('');
    setSelectedApp(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleKeepPending = (vendor: VendorWithProfile) => {
    const updatedVendor = {
      ...vendor,
      badge: 'Pending Review',
      badge_color: 'bg-gold-500'
    };
    updatedVendor.details = {
      ...(updatedVendor.details || {}),
      status: 'Pending Verification'
    };

    const updatedPending = pendingApplications.map(v => v.id === vendor.id ? updatedVendor : v);
    setPendingApplications(updatedPending);
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updatedPending));

    setActionNotice(`Application status set to Pending Review.`);
    setSelectedApp(null);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSendAdminMessage = () => {
    if (!adminMessage.trim() || !selectedApp) return;

    const newMsg = {
      sender: 'admin',
      text: adminMessage.trim(),
      date: new Date().toISOString()
    };

    const updatedLog = [...chatLog, newMsg];
    setChatLog(updatedLog);
    localStorage.setItem(`festivo_msgs_${selectedApp.id}`, JSON.stringify(updatedLog));
    setAdminMessage('');

    // Trigger mock partner reply in 2 seconds
    setTimeout(() => {
      const partnerReply = {
        sender: 'vendor',
        text: `Thanks for the details. We will comply and upload the files as requested.`,
        date: new Date().toISOString()
      };
      const finalLog = [...updatedLog, partnerReply];
      setChatLog(finalLog);
      localStorage.setItem(`festivo_msgs_${selectedApp.id}`, JSON.stringify(finalLog));
    }, 2000);
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApproveKyc = (vendorEmail: string) => {
    if (!vendorEmail) return;
    localStorage.setItem(`festivo_kyc_status_${vendorEmail.toLowerCase()}`, 'Approved');
    setActionNotice(`✓ KYC documents approved for ${vendorEmail}!`);
    loadData();
    setTimeout(() => setActionNotice(null), 3000);
  };

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0);
  const commissionRevenue = Math.round(totalRevenue * 0.15);

  // Filters search results
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'verified') return matchesSearch && v.verified;
    if (filterStatus === 'unverified') return matchesSearch && !v.verified;
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">Approved</span>;
    if (status === 'Rejected') return <span className="bg-red-50 text-red-800 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-bold">Rejected</span>;
    if (status === 'Documents Requested') return <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">Docs Requested</span>;
    return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">Pending verification</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 text-dark-800 font-body antialiased">
      
      {/* Top Navbar */}
      <header className="h-20 bg-gradient-to-r from-sage-900 to-sage-800 text-white flex items-center justify-between px-6 md:px-12 shadow-soft sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-gold-300">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-white">Festivo Platform Admin</h1>
            <p className="text-sage-200 text-[10px] uppercase font-bold tracking-widest">Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1 overflow-x-auto">
            {(['overview', 'applications', 'vendors', 'bookings', 'revenue'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'applications') {
                    const latestPending = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
                    setPendingApplications(latestPending);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap ${
                  activeTab === tab ? 'bg-white text-sage-950 shadow-soft' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab === 'applications' ? 'Verification Queue' : tab}
              </button>
            ))}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotificationsDropdown(!showNotificationsDropdown);
              }}
              className="relative p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {adminNotifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse border-2 border-sage-800">
                  {adminNotifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div 
                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-dark-100 shadow-card z-50 overflow-hidden animate-scale-in text-dark-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 bg-gradient-to-r from-sage-900 to-sage-800 text-white flex items-center justify-between">
                  <span className="text-xs font-black tracking-wide uppercase">Admin Notifications</span>
                  {adminNotifications.filter(n => !n.read).length > 0 && (
                    <button
                      onClick={() => {
                        const updated = adminNotifications.map(n => ({ ...n, read: true }));
                        setAdminNotifications(updated);
                        localStorage.setItem('festivo_admin_notifications', JSON.stringify(updated));
                      }}
                      className="text-[10px] text-gold-300 hover:text-white font-bold underline transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto divide-y divide-dark-50">
                  {adminNotifications.length === 0 ? (
                    <div className="p-6 text-center text-dark-500 text-xs font-semibold">
                      No notifications yet
                    </div>
                  ) : (
                    adminNotifications.map(notif => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left p-4 hover:bg-cream-50/50 transition-colors flex gap-3 items-start ${!notif.read ? 'bg-cream-50/30' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-rose-500' : 'bg-transparent'}`} />
                        <div className="space-y-1">
                          <p className={`text-xs text-dark-800 leading-snug ${!notif.read ? 'font-bold' : 'font-semibold'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-dark-400 font-semibold">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-dark-50 bg-cream-50/50 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('applications');
                      const latestPending = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
                      setPendingApplications(latestPending);
                      setShowNotificationsDropdown(false);
                    }}
                    className="text-[10px] font-black text-sage-800 hover:text-sage-900 transition-colors uppercase tracking-wider"
                  >
                    View Verification Queue
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/15 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {actionNotice && (
          <div className="mb-6 p-4 bg-sage-900 text-white font-bold rounded-2xl border border-sage-700 shadow-md flex items-center justify-between animate-slide-up text-xs">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-xs text-sage-300 hover:text-white">&times;</button>
          </div>
        )}

        {/* Tab 1: Overview Dashboard stats */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Gross Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'bg-sage-50 text-sage-600' },
                { label: 'Commission Earned', value: `₹${(commissionRevenue / 1000).toFixed(0)}K`, icon: Wallet, color: 'bg-cream-100 text-cream-800' },
                { label: 'Total active vendors', value: String(vendors.length), icon: Store, color: 'bg-sage-100 text-sage-700' },
                { label: 'Total Bookings placed', value: String(bookings.length), icon: BarChart3, color: 'bg-cream-50 text-cream-900' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl shadow-soft p-5 border border-dark-100">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="font-display text-2xl font-black text-dark-900">{stat.value}</p>
                  <p className="text-dark-500 text-xs font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-dark-100">
                <h2 className="font-display text-base font-black text-dark-900 mb-5 flex items-center gap-2">
                  <BarChart3 className="w-4.5 h-4.5 text-sage-600" /> Recent Booking Actions
                </h2>
                <div className="space-y-3">
                  {bookings.slice(0, 6).map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-100 text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark-900 truncate">{b.customer_name}</p>
                        <p className="text-dark-500 mt-0.5">{b.event_type} · {b.event_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-dark-905">₹{b.total_amount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-bold text-sage-700 uppercase mt-0.5">{b.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Rated Vendors */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-dark-100">
                <h2 className="font-display text-base font-black text-dark-900 mb-5 flex items-center gap-2">
                  <Star className="w-4.5 h-4.5 text-gold-500" /> Top Rated Partners
                </h2>
                <div className="space-y-3">
                  {vendors.slice(0, 6).map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-100 text-xs hover:bg-cream-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark-900 truncate">{v.name}</p>
                        <p className="text-dark-500 mt-0.5">{v.category} · {v.location}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white border px-2 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                        <span className="font-bold text-dark-900">{v.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pending Applications queue */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-dark-100 space-y-6 animate-fade-up">
            <div>
              <h2 className="font-display text-lg font-black text-dark-900">Vendor Verification Queue</h2>
              <p className="text-dark-500 text-xs font-semibold mt-0.5">Approve business KYC, check Aadhaar/PAN cards, and manage registry status.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-100 text-dark-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 font-bold">ID</th>
                    <th className="pb-3 font-bold">Business</th>
                    <th className="pb-3 font-bold">Owner</th>
                    <th className="pb-3 font-bold">Category</th>
                    <th className="pb-3 font-bold">City</th>
                    <th className="pb-3 font-bold">Experience</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 text-xs font-semibold text-dark-600">
                  {pendingApplications.map(app => (
                    <tr key={app.slug} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-4 font-mono font-bold text-dark-800">{app.id || 'VND-391083'}</td>
                      <td className="py-4">
                        <div>
                          <p className="font-bold text-dark-900 text-sm">{app.name}</p>
                          <p className="text-[10px] text-dark-400 font-semibold">{app.details?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 font-medium text-dark-700">{app.details?.owner || app.details?.ownerName || 'Rajesh'}</td>
                      <td className="py-4 text-sage-700 font-bold">{app.category}</td>
                      <td className="py-4">{app.location.split(',')[0]}</td>
                      <td className="py-4">{app.details?.experience || '3-5 Years'}</td>
                      <td className="py-4">{getStatusBadge(app.details?.status || 'Pending Verification')}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleAppOpen(app)}
                          className="px-3.5 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold transition-all shadow-soft"
                        >
                          👁 Review Files
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Active Vendors management list */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-dark-100 space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-black text-dark-900">Active Vendor Listings</h2>
                <p className="text-dark-500 text-xs font-semibold mt-0.5">Inspect verified vendor profile cards published on searches.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search business name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-dark-100 bg-cream-50 rounded-xl text-xs outline-none focus:border-sage-300 w-48 font-semibold"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-dark-100 bg-cream-50 rounded-xl text-xs font-bold text-dark-700 outline-none"
                >
                  <option value="all">All Vendors</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-100 text-dark-400 text-xs font-bold uppercase">
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-center">KYC Documents</th>
                    <th className="pb-3 text-right">Listing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 text-xs font-semibold text-dark-600">
                  {filteredVendors.map(v => {
                    const email = v.details?.email || '';
                    const kycStatus = localStorage.getItem(`festivo_kyc_status_${email.toLowerCase()}`) || 'Not Uploaded';
                    return (
                      <tr key={v.id} className="hover:bg-cream-50/50">
                        <td className="py-4">
                          <div>
                            <p className="font-bold text-dark-900 text-sm">{v.name}</p>
                            <p className="text-[10px] text-dark-400 font-semibold">{email}</p>
                          </div>
                        </td>
                        <td className="py-4 text-sage-700 font-bold">{v.category}</td>
                        <td className="py-4">{v.location}</td>
                        <td className="py-4 font-black">₹{v.price_amount.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-center">
                          {kycStatus === 'Approved' && (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase">KYC Verified</span>
                          )}
                          {kycStatus === 'Pending Verification' && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black uppercase animate-pulse">Pending KYC</span>
                              <button
                                onClick={() => handleApproveKyc(email)}
                                className="px-2.5 py-1 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-[9px] font-black transition-all shadow-soft"
                              >
                                Approve KYC
                              </button>
                            </div>
                          )}
                          {kycStatus === 'Not Uploaded' && (
                            <span className="bg-dark-100 text-dark-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">No KYC Copy</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Active</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Bookings list */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-dark-100 space-y-6 animate-fade-up">
            <h2 className="font-display text-lg font-black text-dark-900">Gross Booking Ledger</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-100 text-dark-400 text-xs font-bold uppercase">
                    <th className="pb-3">Ref No.</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Payment</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 text-xs font-semibold text-dark-650">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-cream-50/50">
                      <td className="py-4 font-mono font-bold text-dark-800">{b.booking_ref}</td>
                      <td className="py-4">
                        <p className="font-bold text-dark-900">{b.customer_name}</p>
                        <p className="text-[10px] text-dark-400">{b.customer_email}</p>
                      </td>
                      <td className="py-4">{b.event_date}</td>
                      <td className="py-4 text-right font-black text-dark-900">₹{b.total_amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 text-center">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 px-2.5 py-0.5 rounded text-[10px] font-bold">Paid</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="bg-sage-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">Confirmed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Revenue details */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-dark-100 space-y-6 animate-fade-up">
            <h2 className="font-display text-lg font-black text-dark-900">Revenue Split by Category</h2>
            <div className="space-y-4">
              {['Venue', 'Catering', 'Photography', 'Decoration', 'DJ'].map(cat => {
                const catBookings = bookings.filter(b => b.event_type.toLowerCase().includes(cat.toLowerCase()));
                const rev = catBookings.reduce((s, b) => s + b.total_amount, 0);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-dark-800">
                      <span>{cat}</span>
                      <span>₹{rev.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2.5 bg-cream-50 rounded-full overflow-hidden">
                      <div className="h-full bg-sage-600" style={{ width: `${rev > 0 ? 60 : 10}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* DETAIL WORKFLOW REVIEW MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-dark-950/20 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-dark-100 shadow-card animate-scale-in flex flex-col lg:flex-row">
            
            {/* Modal Left: Details & Documents previews */}
            <div className="flex-1 p-6 md:p-8 space-y-6 border-r border-dark-100 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-sage-800 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-100">
                    {selectedApp.category}
                  </span>
                  <h3 className="font-display font-black text-dark-900 text-lg md:text-xl mt-1.5">{selectedApp.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)} 
                  className="w-9 h-9 rounded-xl bg-cream-50 text-dark-600 hover:bg-cream-100 flex items-center justify-center transition-colors text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <p className="text-dark-600 text-xs leading-relaxed font-semibold bg-cream-50 p-4 rounded-xl border border-cream-200">
                "{selectedApp.description}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-dark-500">
                <div className="p-3.5 bg-cream-50/50 rounded-xl border border-cream-100 space-y-1">
                  <p className="font-bold text-dark-400 uppercase text-[9px] tracking-wide">Owner details</p>
                  <p className="text-dark-900"><b>Owner:</b> {selectedApp.details?.owner || 'Rajesh Kumar'}</p>
                  <p className="text-dark-900"><b>Email:</b> {selectedApp.details?.email}</p>
                  <p className="text-dark-900"><b>Mobile:</b> {selectedApp.details?.phone}</p>
                </div>
                <div className="p-3.5 bg-cream-50/50 rounded-xl border border-cream-100 space-y-1">
                  <p className="font-bold text-dark-400 uppercase text-[9px] tracking-wide">Business settings</p>
                  <p className="text-dark-900"><b>Base Budget:</b> ₹{selectedApp.price_amount.toLocaleString('en-IN')}</p>
                  <p className="text-dark-900"><b>Pricing Type:</b> {selectedApp.price_unit}</p>
                  <p className="text-dark-900"><b>City HQ:</b> {selectedApp.location}</p>
                </div>
              </div>

              {/* Document Click Preview Section */}
              <div className="space-y-3">
                <h4 className="font-display font-black text-sage-900 text-sm">KYC Documents (Click to Preview)</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Aadhaar Card Front', url: selectedApp.details?.kyc?.aadhaarFront },
                    { label: 'Aadhaar Card Back', url: selectedApp.details?.kyc?.aadhaarBack },
                    { label: 'PAN Card', url: selectedApp.details?.kyc?.pan },
                    { label: 'Cancelled Cheque', url: selectedApp.details?.kyc?.cancelledCheque },
                    { label: 'GST Certificate (Opt)', url: selectedApp.details?.kyc?.gst },
                    { label: 'Biz Reg Certificate (Opt)', url: selectedApp.details?.kyc?.regCert }
                  ].map((doc, idx) => {
                    const exists = !!doc.url;
                    return (
                      <button
                        key={idx}
                        disabled={!exists}
                        onClick={() => exists && setPreviewDoc({ title: doc.label, url: doc.url })}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-colors flex flex-col justify-between h-20 ${
                          exists 
                            ? 'bg-cream-50 hover:bg-cream-100 border-cream-200 text-dark-800' 
                            : 'bg-dark-50 border-dark-100 text-dark-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className="leading-tight">{doc.label}</span>
                        <span className={`text-[9px] block mt-1 ${exists ? 'text-sage-600 hover:underline' : 'text-dark-400 font-semibold'}`}>
                          {exists ? '👁 Click to view' : 'Not Uploaded'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portfolio Previews */}
              <div className="space-y-2.5">
                <h4 className="font-display font-black text-sage-900 text-sm">Portfolio Preview</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=150',
                    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=150',
                    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=150'
                  ].map((pImg, pIdx) => (
                    <img 
                      key={pIdx} 
                      src={pImg} 
                      onClick={() => setPreviewDoc({ title: `Portfolio Image ${pIdx+1}`, url: pImg })}
                      alt="Portfolio Preview" 
                      className="w-full h-16 object-cover rounded-xl border cursor-pointer hover:opacity-90" 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Right: Verification checklist and actions panel */}
            <div className="w-full lg:w-80 bg-cream-50 p-6 md:p-8 space-y-6 flex flex-col justify-between max-h-[90vh]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-display font-black text-dark-900 text-base">Verification Steps</h4>
                  <p className="text-dark-500 text-[10px] font-bold uppercase tracking-wider">KYC Checklist</p>
                </div>

                {/* Checklist interactive checkboxes */}
                <div className="space-y-2">
                  {[
                    { key: 'email', label: 'Email Verified' },
                    { key: 'mobile', label: 'Mobile OTP Verified' },
                    { key: 'aadhaar', label: 'Aadhaar Verified' },
                    { key: 'pan', label: 'PAN Verified' },
                    { key: 'gst', label: 'GST Certificate Checked' },
                    { key: 'bank', label: 'Bank Cheque Verified' },
                    { key: 'portfolio', label: 'Portfolio Reviewed' },
                    { key: 'businessDetails', label: 'Business Profile Verified' }
                  ].map(item => (
                    <label 
                      key={item.key} 
                      className="flex items-center justify-between p-2.5 bg-white border border-dark-100 rounded-xl text-xs font-bold text-dark-800 cursor-pointer hover:bg-cream-100/50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={(checklist as any)[item.key]}
                        onChange={() => toggleChecklist(item.key as any)}
                        className="w-4 h-4 rounded text-sage-600 border-dark-100 focus:ring-sage-100"
                      />
                    </label>
                  ))}
                </div>

                {/* Verification Checklist Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                    <span>KYC Progress</span>
                    <span>{Math.round((Object.values(checklist).filter(Boolean).length / 8) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sage-600 transition-all duration-300"
                      style={{ width: `${(Object.values(checklist).filter(Boolean).length / 8) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Message Log history with Vendor */}
                <div className="border-t border-dark-100 pt-4 space-y-3">
                  <p className="font-bold text-dark-500 uppercase text-[9px] tracking-wide">Communication Thread</p>
                  
                  {chatLog.length > 0 && (
                    <div className="bg-white border rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 text-[10px] font-medium leading-relaxed">
                      {chatLog.map((c, i) => (
                        <div key={i} className={c.sender === 'admin' ? 'text-sage-800 text-right' : 'text-dark-700'}>
                          <p className="font-bold uppercase text-[8px]">{c.sender}:</p>
                          <p className="mt-0.5 bg-cream-50 p-1.5 rounded-lg border inline-block text-left">"{c.text}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Message vendor..."
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      className="bg-white border border-dark-100 rounded-xl px-3 py-1.5 text-xs outline-none w-full font-medium"
                    />
                    <button 
                      onClick={handleSendAdminMessage}
                      className="p-1.5 bg-sage-600 text-white rounded-xl flex items-center justify-center shadow-soft"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="space-y-2 border-t border-dark-100 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={selectedApp.details?.status === 'Pending KYC'}
                    onClick={() => handleKeepPending(selectedApp)}
                    className="h-10 border border-dark-100 hover:bg-cream-200 text-dark-800 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Keep Pending
                  </button>
                  <button
                    disabled={selectedApp.details?.status === 'Pending KYC'}
                    onClick={() => setShowRequestDocsModal(true)}
                    className="h-10 border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Req Docs
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={selectedApp.details?.status === 'Pending KYC'}
                    onClick={() => setShowRejectModal(true)}
                    className="h-11 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold transition-all border border-red-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Application
                  </button>
                  {selectedApp.details?.status === 'KYC Submitted' ? (
                    <button
                      onClick={() => handleApproveApplication(selectedApp)}
                      className="h-11 bg-gradient-brand text-white rounded-xl text-xs font-black shadow-md transition-all hover:opacity-95"
                    >
                      Approve KYC & Publish
                    </button>
                  ) : selectedApp.details?.status === 'Pending KYC' ? (
                    <div className="h-11 bg-cream-100 text-dark-500 rounded-xl text-[10px] font-bold flex items-center justify-center border text-center leading-tight">
                      Awaiting KYC upload
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptProfileDetails(selectedApp)}
                      className="h-11 bg-gradient-brand text-white rounded-xl text-xs font-black shadow-md transition-all hover:opacity-95"
                    >
                      Accept Profile Details
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* DOCUMENT LIGHTBOX PREVIEW OVERLAY */}
      {previewDoc && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 animate-scale-in border border-dark-200 shadow-card relative">
            <button 
              onClick={() => setPreviewDoc(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-cream-100 text-dark-600 hover:bg-cream-200 flex items-center justify-center font-bold"
            >
              &times;
            </button>
            <h3 className="font-display font-black text-dark-900 text-base">{previewDoc.title}</h3>
            
            <div className="border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/50 p-4 flex items-center justify-center min-h-[300px]">
              {previewDoc.url.startsWith('data:') || previewDoc.url.startsWith('http') ? (
                <img src={previewDoc.url} alt={previewDoc.title} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
              ) : (
                <div className="text-center space-y-2">
                  <FileText className="w-12 h-12 text-sage-600 mx-auto" />
                  <p className="text-xs text-dark-500 font-bold">{previewDoc.url}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT DIALOG */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-dark-100 shadow-card animate-scale-in space-y-4">
            <h3 className="font-display font-black text-dark-900 text-base flex items-center gap-1 text-red-650">
              <AlertTriangle className="w-5 h-5" /> Reject Vendor Enrollment
            </h3>
            <p className="text-xs text-dark-500 font-medium">Please provide the official rejection reason. This reason will be emailed to the vendor and displayed on their dashboard, letting them edit and resubmit their details.</p>
            
            <textarea
              placeholder="e.g. Aadhaar card front photo is blur and PAN card details do not match the business owner name."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full bg-cream-50 border border-dark-100 rounded-xl p-3 text-xs outline-none font-medium resize-none leading-relaxed"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-cream-250 text-dark-750 font-bold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRejectApplication(selectedApp)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST ADDITIONAL DOCUMENTS */}
      {showRequestDocsModal && selectedApp && (
        <div className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-dark-100 shadow-card animate-scale-in space-y-4">
            <h3 className="font-display font-black text-dark-900 text-base flex items-center gap-1.5 text-blue-700">
              <Clock className="w-5 h-5" /> Request Additional Documents
            </h3>
            <p className="text-xs text-dark-500 font-medium">State which documents need to be re-uploaded or corrected by the vendor.</p>
            
            <textarea
              placeholder="e.g. Please upload clear copies of: 1. Cancelled Cheque with clear IFSC, 2. GST Registration Certificate."
              value={requestedDocsList}
              onChange={(e) => setRequestedDocsList(e.target.value)}
              rows={4}
              className="w-full bg-cream-50 border border-dark-100 rounded-xl p-3 text-xs outline-none font-medium resize-none leading-relaxed"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowRequestDocsModal(false)}
                className="px-4 py-2 bg-cream-250 text-dark-750 font-bold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRequestDocs(selectedApp)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                Request Docs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
