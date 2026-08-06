import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Calendar, Star, TrendingUp, Plus, Settings,
  Clock, LogOut, Bell, Wallet, X, Check,
  Package, MessageSquare, Send, Trash2, Instagram, Facebook, Globe,
  MapPin, DollarSign, Percent, HelpCircle, ChevronRight, Image as ImageIcon, ToggleLeft, ToggleRight,
  Menu, AlertCircle, Upload, XCircle, Camera, ArrowRight, ArrowLeft, Store
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, sanitizeVendors } from '../lib/supabase';
import type { Booking, Vendor } from '../lib/supabase';

type BookingWithVendor = Booking & { vendor_name?: string };

type VendorService = {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
  created_at?: string;
};

type ChatMessage = {
  id: string;
  vendor_id: string;
  customer_email: string;
  customer_name?: string;
  sender_type: 'customer' | 'vendor';
  message: string;
  created_at: string;
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const primaryVendor = vendors[0] || {
    id: 'mock-vendor-id',
    name: 'Festivo Premier Studios',
    category: 'Photographer',
    location: 'Bangalore, KA',
    price_amount: 50000,
    price_label: 'Starting Package',
    price_unit: 'event',
    rating: 4.9,
    reviews: 28,
    image: '',
    gallery: [],
    tags: ['Candid', 'Traditional', 'Cinematic'],
    verified: true,
    badge: 'Premium Partner',
    badge_color: 'gold',
    capacity: 'Up to 500 guests',
    experience_years: 6,
    slug: 'festivo-premier-studios',
    details: {
      email: user?.email || 'vendor@festivo.com',
      phone: '+91 98765 43210',
      serviceAreas: ['Bangalore', 'Mysore', 'Coorg'],
      languages: ['English', 'Kannada', 'Hindi'],
      workingDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun']
    }
  };

  // Enable demo mode to bypass pending verification screen
  const [demoMode, setDemoMode] = useState(false);

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'bookings'
    | 'calendar'
    | 'messages'
    | 'portfolio'
    | 'packages'
    | 'reviews'
    | 'earnings'
    | 'analytics'
    | 'deals'
    | 'settings'
    | 'support'
  >('dashboard');

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Payment Received', message: '₹42,500 credited for Amit & Priya Wedding Shoot.', is_read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', title: 'New Booking Request', message: 'Vikram Dev sent a request for a Pre-Wedding Shoot.', is_read: false, timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', title: 'Review Added', message: 'Sneha left a 5-star review: "Excellent work, captured moments..."', is_read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: '4', title: 'Package Viewed', message: 'Your "Corporate Event" package was viewed 14 times today.', is_read: true, timestamp: new Date(Date.now() - 172800000).toISOString() }
  ]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Bookings state
  const [bookings, setBookings] = useState<BookingWithVendor[]>([
    {
      id: 'b1',
      vendor_id: 'mock-vendor-id',
      customer_name: 'Amit Kumar',
      customer_email: 'amit@gmail.com',
      customer_phone: '+91 9900112233',
      event_type: 'Wedding Photography',
      event_date: '2026-08-15',
      guests: 300,
      special_requests: 'Require candid drone shots for the pool side haldi event.',
      total_amount: 150000,
      status: 'confirmed',
      payment_status: 'paid',
      payment_intent_id: 'pi_mock1',
      booking_ref: 'FEST-WED-815',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      vendor_name: 'Festivo Premier Studios'
    },
    {
      id: 'b2',
      vendor_id: 'mock-vendor-id',
      customer_name: 'Sneha Hegde',
      customer_email: 'sneha@yahoo.com',
      customer_phone: '+91 8899001122',
      event_type: 'Birthday Celebration',
      event_date: '2026-08-12',
      guests: 80,
      special_requests: 'Focus on toddler candid expressions.',
      total_amount: 250000,
      status: 'confirmed',
      payment_status: 'paid',
      payment_intent_id: 'pi_mock2',
      booking_ref: 'FEST-BDAY-812',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      vendor_name: 'Festivo Premier Studios'
    },
    {
      id: 'b3',
      vendor_id: 'mock-vendor-id',
      customer_name: 'Anjali Sharma',
      customer_email: 'anjali@gmail.com',
      customer_phone: '+91 7766554433',
      event_type: 'Pre-Wedding shoot',
      event_date: '2026-08-25',
      guests: 4,
      special_requests: 'Traditional outdoor shoot in heritage settings.',
      total_amount: 40000,
      status: 'confirmed',
      payment_status: 'unpaid',
      payment_intent_id: null,
      booking_ref: 'FEST-PRE-825',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      vendor_name: 'Festivo Premier Studios'
    }
  ]);

  // Booking requests (Rapido ride-request style)
  const [bookingRequests, setBookingRequests] = useState([
    { id: 'br1', customer: 'Vikram Dev', service: 'Pre-Wedding Shoot', budget: 45000, date: '2026-08-20', location: 'Nandi Hills, Bangalore', guests: 5, note: 'Need cinematic high-FPS videography.' },
    { id: 'br2', customer: 'Rohan Mehta', service: 'Half-day Portrait Session', budget: 15000, date: '2026-09-02', location: 'Studio Session, Bangalore', guests: 2, note: 'Professional corporate branding portfolio.' },
    { id: 'br3', customer: 'Meera Sen', service: 'Engagement Photography', budget: 60000, date: '2026-09-10', location: 'ITC Windsor, Bangalore', guests: 150, note: 'Require standard traditional plus candid coverage.' }
  ]);

  // Selected booking for detailed view modal
  const [selectedBooking, setSelectedBooking] = useState<BookingWithVendor | null>(null);

  // Availability state
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    '2026-08-10': false,
    '2026-08-12': false,
    '2026-08-15': false,
    '2026-08-20': true,
    '2026-08-25': false,
  });
  const [availabilityStatus, setAvailabilityStatus] = useState(true); // Toggle status

  // Portfolio state
  const [portfolio, setPortfolio] = useState([
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800'
  ]);

  // Services / Packages state
  const [services, setServices] = useState<VendorService[]>([
    { id: 'pkg1', vendor_id: 'mock-vendor-id', title: 'Wedding Premium', description: 'Complete wedding day coverage including candid, traditional, and 4K video teaser.', price: 120000, duration: 'Full Day', includes: ['2 Candid Photographers', '1 Traditional Videographer', '4K Cinematic Teaser (3-5 min)', 'Digital Album containing 300+ edited shots', 'Complimentary Drone session'] },
    { id: 'pkg2', vendor_id: 'mock-vendor-id', title: 'Corporate Branding', description: 'Professional headshots, event coverage, and group portraits with fast delivery.', price: 45000, duration: '6 Hours', includes: ['1 Lead Photographer', 'Professional studio light setup', '50 Retouched High-res portraits', 'All raw files delivered via secure link'] },
    { id: 'pkg3', vendor_id: 'mock-vendor-id', title: 'Birthday & Anniversary', description: 'Fun candid shoot covering cake cutting, guests interactions, and decor details.', price: 25000, duration: '4 Hours', includes: ['1 Candid Photographer', 'Highlight Reel (1 min)', '100 Edited digital photos', 'Fast 48-hour delivery'] }
  ]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState({ title: '', description: '', price: '', duration: '', includes: '' });

  // Reviews state
  const [reviewsList, setReviewsList] = useState([
    { id: 1, author: 'Rahul Deshmukh', rating: 5, comment: 'Excellent work, captured our moments perfectly! The team was extremely patient and polite during our long wedding rituals.', event: 'Wedding', date: '2026-07-28', reply: '', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100' },
    { id: 2, author: 'Sneha Hegde', rating: 5, comment: 'Very professional crew. Delivered the "sneak peek" album within 24 hours just as promised! Absolute stunners.', event: 'Birthday', date: '2026-07-15', reply: 'Thank you Sneha! It was a delight capturing your little one\'s birthday party.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    { id: 3, author: 'Anjali Sharma', rating: 4.8, comment: 'Loved the candid shots. The lighting was gorgeous, and the post-processing edits feel so clean and natural.', event: 'Pre-Wedding', date: '2026-07-02', reply: '', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100' }
  ]);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Chat/Messages state
  const [selectedChatUser, setSelectedChatUser] = useState('amit@gmail.com');
  const [chatUsers, setChatUsers] = useState([
    { email: 'amit@gmail.com', name: 'Amit Kumar', unread: 2, lastMsg: 'Sure, let\'s lock the Haldi timing for 10 AM.' },
    { email: 'sneha@yahoo.com', name: 'Sneha Hegde', unread: 0, lastMsg: 'Thanks for the quick album delivery!' },
    { email: 'vikram@dev.com', name: 'Vikram Dev', unread: 0, lastMsg: 'Can we schedule Nandi Hills at sunrise?' }
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', vendor_id: 'mock-vendor-id', customer_email: 'amit@gmail.com', customer_name: 'Amit Kumar', sender_type: 'customer', message: 'Hello! I wanted to check if you are available on Aug 15 for my wedding.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'm2', vendor_id: 'mock-vendor-id', customer_email: 'amit@gmail.com', customer_name: 'Amit Kumar', sender_type: 'vendor', message: 'Hi Amit, yes we have that slot open! What events are planned for the day?', created_at: new Date(Date.now() - 3600000 * 23).toISOString() },
    { id: 'm3', vendor_id: 'mock-vendor-id', customer_email: 'amit@gmail.com', customer_name: 'Amit Kumar', sender_type: 'customer', message: 'We have the main muhurtham at 9:00 AM, followed by reception in the evening. Also, we wanted to request a drone shoot.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'm4', vendor_id: 'mock-vendor-id', customer_email: 'amit@gmail.com', customer_name: 'Amit Kumar', sender_type: 'vendor', message: 'Perfect. Drones are included in our Wedding Premium package. I have confirmed your booking reference: FEST-WED-815.', created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    { id: 'm5', vendor_id: 'mock-vendor-id', customer_email: 'amit@gmail.com', customer_name: 'Amit Kumar', sender_type: 'customer', message: 'Sure, let\'s lock the Haldi timing for 10 AM.', created_at: new Date(Date.now() - 1800000).toISOString() }
  ]);
  const [newMessageText, setNewMessageText] = useState('');

  // Deals/Promo state
  const [deals, setDeals] = useState([
    { id: 'd1', code: 'FESTIVE10', discount: '10% OFF', description: '10% discount on all Wedding packages.', bookings_applied: 8, expiry: '2026-12-31', active: true },
    { id: 'd2', code: 'EARLYBIRD5K', discount: '₹5,000 Flat', description: 'Flat ₹5,000 off on booking 3 months in advance.', bookings_applied: 3, expiry: '2026-10-15', active: true },
    { id: 'd3', code: 'STUDIOSTAR', discount: 'Free Canvas Print', description: 'Complimentary premium canvas print with Corporate listings.', bookings_applied: 12, expiry: '2026-09-30', active: false }
  ]);
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealForm, setDealForm] = useState({ code: '', discount: '', description: '', expiry: '' });

  // Settings / Profile Form
  const [settingsForm, setSettingsForm] = useState({
    business_name: 'Festivo Premier Studios',
    bio: 'Award-winning wedding and fashion photographers based in Bangalore. Capturing candid, raw, and cinematic moments for over 6 years with 300+ happy couples.',
    phone: '+91 98765 43210',
    location: 'Bangalore, KA',
    capacity: 'Up to 500 guests',
    gst_number: '29AAAAA1111A1Z1',
    pan_number: 'ABCDE1234F',
    bank_account: '987654321098',
    ifsc: 'SBIN0001234',
    instagram: 'https://instagram.com/festivo_studios',
    facebook: 'https://facebook.com/festivostudios',
    website: 'https://festivostudios.com'
  });

  // Support tickets
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TKT-1024', subject: 'Payout delays', category: 'Payments', status: 'Closed', created_at: '2026-07-10' },
    { id: 'TKT-1090', subject: 'Need to add secondary photographer profile', category: 'Profile Settings', status: 'Open', created_at: '2026-08-01' }
  ]);
  const [supportForm, setSupportForm] = useState({ subject: '', category: 'Payments', message: '' });

  // Calendar State helper
  const currentMonth = { name: 'August 2026', days: 31, offset: 5 }; // August starts on Sat

  // Fetch real data on mount from Supabase
  useEffect(() => {
    if (!user) {
      // Setup finished loading even with mocks
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch vendors registered under current user email
        const { data: vendorData, error: vErr } = await supabase
          .from('vendors')
          .select('*');

        if (!vErr && vendorData && vendorData.length > 0) {
          const sanitized = sanitizeVendors(vendorData);
          // Filter by logged-in user email
          const matched = sanitized.filter(
            v => v.details?.email?.toLowerCase() === user.email?.toLowerCase()
          );
          if (matched.length > 0) {
            setVendors(matched);
            
            // Sync settings form
            const activeVendor = matched[0];
            setSettingsForm(prev => ({
              ...prev,
              business_name: activeVendor.name || prev.business_name,
              bio: activeVendor.description || prev.bio,
              location: activeVendor.location || prev.location,
              capacity: activeVendor.capacity || prev.capacity,
              phone: activeVendor.details?.phone || prev.phone,
              instagram: activeVendor.details?.instagram || prev.instagram,
              facebook: activeVendor.details?.facebook || prev.facebook,
              website: activeVendor.details?.website || prev.website,
            }));

            // Fetch bookings
            const { data: bookingData } = await supabase
              .from('bookings')
              .select('*')
              .eq('vendor_id', activeVendor.id)
              .order('created_at', { ascending: false });

            if (bookingData && bookingData.length > 0) {
              setBookings(bookingData.map((b: any) => ({
                ...b,
                vendor_name: activeVendor.name
              })));
            }

            // Fetch services
            const { data: servicesData } = await supabase
              .from('vendor_services')
              .select('*')
              .eq('vendor_id', activeVendor.id);
            if (servicesData && servicesData.length > 0) {
              setServices(servicesData as VendorService[]);
            }

            // Fetch reviews
            const { data: reviewsData } = await supabase
              .from('reviews')
              .select('*')
              .eq('vendor_id', activeVendor.id);
            if (reviewsData && reviewsData.length > 0) {
              setReviewsList(reviewsData.map((r: any, index: number) => ({
                id: r.id || index,
                author: r.customer_name || 'Happy Customer',
                rating: r.rating || 5,
                comment: r.comment || '',
                event: r.event_type || 'Event',
                date: r.created_at ? r.created_at.split('T')[0] : '2026-07-02',
                reply: r.reply || '',
                avatar: `https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&q=80&w=100`
              })));
            }
          }
        }
      } catch (err) {
        console.warn('Error loading real Supabase data, falling back to mocks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Display toast helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Actions handlers
  const handleBookingAccept = async (id: string) => {
    const requestToAccept = bookingRequests.find(r => r.id === id);
    if (!requestToAccept) return;

    const newBooking: BookingWithVendor = {
      id: crypto.randomUUID(),
      vendor_id: primaryVendor.id,
      customer_name: requestToAccept.customer,
      customer_email: `${requestToAccept.customer.toLowerCase().replace(' ', '')}@gmail.com`,
      customer_phone: '+91 9900112233',
      event_type: requestToAccept.service,
      event_date: requestToAccept.date,
      guests: requestToAccept.guests,
      special_requests: requestToAccept.note,
      total_amount: requestToAccept.budget,
      status: 'confirmed',
      payment_status: 'unpaid',
      payment_intent_id: null,
      booking_ref: `FEST-NEW-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
      vendor_name: primaryVendor.name
    };

    // Update locally
    setBookings(prev => [newBooking, ...prev]);
    setBookingRequests(prev => prev.filter(r => r.id !== id));
    
    // Add custom notification
    setNotifications(prev => [
      {
        id: crypto.randomUUID(),
        title: 'Booking Accepted',
        message: `You accepted ${requestToAccept.customer}'s request for ${requestToAccept.service}.`,
        is_read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    showToast('Booking request accepted successfully!');

    // Update database in background
    try {
      await supabase.from('bookings').insert({
        vendor_id: primaryVendor.id,
        customer_name: newBooking.customer_name,
        customer_email: newBooking.customer_email,
        customer_phone: newBooking.customer_phone,
        event_type: newBooking.event_type,
        event_date: newBooking.event_date,
        guests: newBooking.guests,
        special_requests: newBooking.special_requests,
        total_amount: newBooking.total_amount,
        status: 'confirmed',
        payment_status: 'unpaid',
        booking_ref: newBooking.booking_ref
      });
    } catch (err) {
      console.warn('Supabase booking insert error (expected in mock):', err);
    }
  };

  const handleBookingReject = (id: string) => {
    const req = bookingRequests.find(r => r.id === id);
    if (!req) return;
    setBookingRequests(prev => prev.filter(r => r.id !== id));
    showToast('Booking request declined.', 'error');
  };

  const handleToggleAvailability = () => {
    const nextStatus = !availabilityStatus;
    setAvailabilityStatus(nextStatus);
    showToast(`Business status updated to ${nextStatus ? 'Available' : 'Unavailable'}`);
  };

  const handleToggleDateAvailability = (dateStr: string) => {
    setAvailability(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
    showToast(`Availability toggled for ${dateStr}`);
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      vendor_id: primaryVendor.id,
      customer_email: selectedChatUser,
      sender_type: 'vendor',
      message: newMessageText.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    
    // Update last message in sidebar list
    setChatUsers(prev => prev.map(u => 
      u.email === selectedChatUser ? { ...u, lastMsg: newMessageText.trim() } : u
    ));

    setNewMessageText('');

    // Mock automatic customer reply in 2 seconds
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: crypto.randomUUID(),
        vendor_id: primaryVendor.id,
        customer_email: selectedChatUser,
        sender_type: 'customer',
        message: `Thanks for the response! Let me discuss this with my family and get back to you soon.`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, replyMsg]);
      setChatUsers(prev => prev.map(u => 
        u.email === selectedChatUser ? { ...u, lastMsg: replyMsg.message, unread: u.email === selectedChatUser ? 0 : u.unread + 1 } : u
      ));
    }, 2000);
  };

  const handleAddPackage = () => {
    if (!packageForm.title || !packageForm.price) {
      showToast('Please fill out the package title and price.', 'error');
      return;
    }

    const newService: VendorService = {
      id: crypto.randomUUID(),
      vendor_id: primaryVendor.id,
      title: packageForm.title,
      description: packageForm.description,
      price: parseFloat(packageForm.price),
      duration: packageForm.duration || 'Full Day',
      includes: packageForm.includes.split(',').map(i => i.trim()).filter(Boolean)
    };

    setServices(prev => [...prev, newService]);
    setPackageForm({ title: '', description: '', price: '', duration: '', includes: '' });
    setShowPackageForm(false);
    showToast('Service package added successfully!');
  };

  const handleDeletePackage = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    showToast('Service package deleted.', 'error');
  };

  const handleReviewReply = (reviewId: number) => {
    if (!replyText.trim()) return;

    setReviewsList(prev => prev.map(r => 
      r.id === reviewId ? { ...r, reply: replyText.trim() } : r
    ));
    setReplyText('');
    setActiveReplyId(null);
    showToast('Reply posted successfully!');
  };

  const handleAddDeal = () => {
    if (!dealForm.code || !dealForm.discount) {
      showToast('Please enter both discount code and discount rate.', 'error');
      return;
    }

    const newDeal = {
      id: crypto.randomUUID(),
      code: dealForm.code.toUpperCase(),
      discount: dealForm.discount,
      description: dealForm.description || 'Promotional coupon code.',
      bookings_applied: 0,
      expiry: dealForm.expiry || '2026-12-31',
      active: true
    };

    setDeals(prev => [newDeal, ...prev]);
    setDealForm({ code: '', discount: '', description: '', expiry: '' });
    setShowDealForm(false);
    showToast('Promotional deal created!');
  };

  const handleToggleDealStatus = (id: string) => {
    setDeals(prev => prev.map(d => 
      d.id === id ? { ...d, active: !d.active } : d
    ));
    showToast('Promo code status toggled.');
  };

  const handleSaveSettings = () => {
    // Update local settings state simulation
    showToast('Vendor profile updated successfully!');
  };

  const handleAddSupportTicket = () => {
    if (!supportForm.subject || !supportForm.message) {
      showToast('Please enter subject and message.', 'error');
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: supportForm.subject,
      category: supportForm.category,
      status: 'Open',
      created_at: new Date().toISOString().split('T')[0]
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    setSupportForm({ subject: '', category: 'Payments', message: '' });
    showToast('Support ticket registered. Our team will contact you.');
  };

  const handleUploadPortfolio = () => {
    const urls = [
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546032996-6dfacbaccd36?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800'
    ];
    // Random select
    const randomUrl = urls[Math.floor(Math.random() * urls.length)];
    setPortfolio(prev => [...prev, randomUrl]);
    showToast('New image uploaded to your portfolio gallery!');
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('All notifications marked as read.');
  };

  // Sidebar items config
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: Clock },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: chatUsers.filter(u => u.unread > 0).length },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'deals', label: 'Deals', icon: Percent },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  // Inline Registration Form States
  const [showRegForm, setShowRegForm] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Step 1: Account Information
  const [regEmail, setRegEmail] = useState(user?.email || '');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpVerified, setRegOtpVerified] = useState(false);

  // Step 2: Business Information
  const [regBusName, setRegBusName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState(profile?.full_name || '');
  const [regCategory, setRegCategory] = useState('Wedding Planner');
  const [regSubcategory, setRegSubcategory] = useState('');
  const [regDescription, setRegDescription] = useState('');

  // Step 3: Business Address
  const [regState, setRegState] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPincode, setRegPincode] = useState('');

  // Step 4: Contact Information
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regContactMobile, setRegContactMobile] = useState('');
  const [regContactAltMobile, setRegContactAltMobile] = useState('');
  const [regContactEmail, setRegContactEmail] = useState('');
  const [regWebsite, setRegWebsite] = useState('');

  // Step 5: Service Information
  const [regServiceAreas, setRegServiceAreas] = useState<string[]>([]);
  const [regExperience, setRegExperience] = useState('Fresher');
  const [regTeamSize, setRegTeamSize] = useState('Individual');
  const [regLanguages, setRegLanguages] = useState<string[]>([]);

  // Step 6: Pricing
  const [regPriceAmount, setRegPriceAmount] = useState('');
  const [regPriceType, setRegPriceType] = useState('Per Event');

  // Step 7: Portfolio
  const [regLogoUrl, setRegLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');
  const [regCoverUrl, setRegCoverUrl] = useState('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800');
  const [regPortfolioCount, setRegPortfolioCount] = useState(6);
  const [regVideoCount, setRegVideoCount] = useState(2);
  const regBrochureUploaded = true;

  // Step 8: KYC Bank & Documents
  const [regBankHolder, setRegBankHolder] = useState('');
  const [regBankName, setRegBankName] = useState('');
  const [regBankAccNum, setRegBankAccNum] = useState('');
  const [regBankIfsc, setRegBankIfsc] = useState('');

  // Step 9: Social handles
  const [regInsta, setRegInsta] = useState('');
  const [regFb, setRegFb] = useState('');
  const [regYt, setRegYt] = useState('');
  const [regLi, setRegLi] = useState('');
  const [regTw, setRegTw] = useState('');

  // Step 10: Availability
  const [regWorkingDays, setRegWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [regWorkingStart, setRegWorkingStart] = useState('09:00');
  const [regWorkingEnd, setRegWorkingEnd] = useState('18:00');

  // Step 11: Policies & Terms
  const [regConfirmCorrect, setRegConfirmCorrect] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regAgreePrivacy, setRegAgreePrivacy] = useState(false);

  // Dashboard KYC Upload Center states
  const [kycAadhaarFront, setKycAadhaarFront] = useState('');
  const [kycAadhaarBack, setKycAadhaarBack] = useState('');
  const [kycPan, setKycPan] = useState('');
  const [kycCheque, setKycCheque] = useState('');

  // KYC Verification Lock states
  const [kycStatus, setKycStatus] = useState(() => {
    const email = user?.email?.toLowerCase();
    if (!email) return 'Not Uploaded';
    if (email === 'vendor@festivo.com') return 'Approved';
    return localStorage.getItem(`festivo_kyc_status_${email}`) || 'Not Uploaded';
  });

  const kycUploaded = kycStatus === 'Approved';

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mb-4" />
        <p className="font-display font-bold text-sage-900 text-sm animate-pulse">Loading Festivo Dashboard...</p>
      </div>
    );
  }

  // Handle pending review check if demoMode is disabled and primaryVendor verified is false
  const getActiveStatus = () => {
    if (demoMode) return 'Approved';
    
    // Look up in local storage pending list
    const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    const matchedPending = pendingList.find((v: any) => 
      v.details?.email?.toLowerCase() === user?.email?.toLowerCase()
    );
    if (matchedPending) {
      return matchedPending.details?.status || 'Pending Verification';
    }

    // Look up in approved list
    const approvedList = JSON.parse(localStorage.getItem('festivo_approved_vendors') || '[]');
    const matchedApproved = approvedList.find((v: any) => 
      v.details?.email?.toLowerCase() === user?.email?.toLowerCase()
    );
    if (matchedApproved) {
      return 'Approved';
    }

    // Default fallback check
    if (user?.email?.toLowerCase() === 'vendor@festivo.com') return 'Approved';
    return 'Unregistered';
  };

  const activeStatus = getActiveStatus();

  // Onboarding hasListing check
  const hasListing = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]').some((v: any) => 
    v.details?.email?.toLowerCase() === user?.email?.toLowerCase()
  ) || JSON.parse(localStorage.getItem('festivo_approved_vendors') || '[]').some((v: any) => 
    v.details?.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  // Documents re-upload handlers
  const handleResubmitDocs = () => {
    const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    const updated = pendingList.map((v: any) => {
      if (v.details?.email?.toLowerCase() === user?.email?.toLowerCase()) {
        return {
          ...v,
          details: {
            ...v.details,
            status: 'Pending Verification'
          }
        };
      }
      return v;
    });
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updated));
    showToast('Documents resubmitted successfully!');
  };

  const handleKycSubmit = () => {
    if (!kycAadhaarFront || !kycAadhaarBack || !kycPan || !kycCheque) {
      showToast('⚠️ Please upload all required KYC files.');
      return;
    }

    const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    let vendorName = 'Vendor';
    let vendorId = '';
    const updated = pendingList.map((v: any) => {
      if (v.details?.email?.toLowerCase() === user?.email?.toLowerCase()) {
        vendorName = v.name;
        vendorId = v.id;
        return {
          ...v,
          details: {
            ...v.details,
            status: 'KYC Submitted',
            kyc: {
              aadhaarFront: kycAadhaarFront,
              aadhaarBack: kycAadhaarBack,
              pan: kycPan,
              cancelledCheque: kycCheque,
            }
          }
        };
      }
      return v;
    });

    localStorage.setItem('festivo_pending_vendors', JSON.stringify(updated));
    
    // Create admin notification
    const adminNotifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
    const newAdminNotification = {
      id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'kyc_submitted',
      vendorId: vendorId,
      vendorName: vendorName,
      message: `KYC documents submitted by "${vendorName}" for verification.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('festivo_admin_notifications', JSON.stringify([newAdminNotification, ...adminNotifications]));

    showToast('✓ KYC Documents submitted successfully for verification!');
  };

  const handleStartResubmitForm = () => {
    // Show inline form instead of navigating
    setShowRegForm(true);
    setRegStep(1);
    setRegEmail(user?.email || '');
  };

  const handleRegNext = () => {
    if (regStep === 1) {
      if (!regEmail || !regPhone || !regPassword) {
        setRegError('Please fill in email, phone, and password.');
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setRegError('Passwords do not match.');
        return;
      }
      if (!regOtpVerified) {
        setRegError('Please verify your mobile OTP code.');
        return;
      }
    }
    if (regStep === 2) {
      if (!regBusName || !regOwnerName || !regDescription) {
        setRegError('Business Name, Owner Name, and Description are required.');
        return;
      }
    }
    if (regStep === 6) {
      if (!regPriceAmount) {
        setRegError('Starting price is required.');
        return;
      }
    }
    if (regStep === 8) {
      if (!regBankHolder || !regBankAccNum || !regBankIfsc) {
        setRegError('Please provide Bank Holder Name, Number, and IFSC.');
        return;
      }
    }

    setRegError('');
    if (regStep < 11) {
      setRegStep(regStep + 1);
    }
  };

  const handleRegBack = () => {
    setRegError('');
    if (regStep > 1) {
      setRegStep(regStep - 1);
    }
  };

  const handleRegSendOtp = () => {
    if (!regPhone) {
      setRegError('Please input a valid mobile number.');
      return;
    }
    setRegOtpSent(true);
    setRegError('');
  };

  const handleRegVerifyOtp = () => {
    if (regOtpCode === '1234' || regOtpCode.length === 4) {
      setRegOtpVerified(true);
      setRegError('');
    } else {
      setRegError('Invalid OTP code. Enter any 4-digit code (e.g. 1234).');
    }
  };

  const handleToggleRegServiceArea = (area: string) => {
    if (regServiceAreas.includes(area)) {
      setRegServiceAreas(regServiceAreas.filter(a => a !== area));
    } else {
      setRegServiceAreas([...regServiceAreas, area]);
    }
  };

  const handleToggleRegLanguage = (lang: string) => {
    if (regLanguages.includes(lang)) {
      setRegLanguages(regLanguages.filter(l => l !== lang));
    } else {
      setRegLanguages([...regLanguages, lang]);
    }
  };

  const handleToggleRegWorkingDay = (day: string) => {
    if (regWorkingDays.includes(day)) {
      setRegWorkingDays(regWorkingDays.filter(d => d !== day));
    } else {
      setRegWorkingDays([...regWorkingDays, day]);
    }
  };

  const handleRegSubmit = async () => {
    if (!regConfirmCorrect || !regAgreeTerms || !regAgreePrivacy) {
      setRegError('You must accept all terms, conditions, and privacy policies.');
      return;
    }

    setRegSubmitting(true);
    setRegError('');

    const vendorId = `VND-${Math.floor(100000 + Math.random() * 900000)}`;
    const newVendor = {
      id: vendorId,
      name: regBusName,
      category: regCategory,
      location: `${regCity || 'Bangalore'}, ${regState || 'Karnataka'}`,
      price_amount: parseFloat(regPriceAmount) || 25000,
      price_label: 'Starting Package',
      price_unit: regPriceType.toLowerCase().replace('per ', ''),
      rating: 5.0,
      reviews: 0,
      image: regCoverUrl,
      logo: regLogoUrl,
      gallery: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
      ],
      tags: [regSubcategory || regCategory, 'Verified', regExperience],
      description: regDescription,
      verified: false,
      badge: 'Pending Review',
      badge_color: 'bg-gold-500',
      slug: regBusName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      details: {
        email: regEmail,
        phone: regPhone,
        owner: regOwnerName,
        address: `${regAddress}, ${regCity}, ${regPincode}`,
        serviceAreas: regServiceAreas,
        languages: regLanguages,
        teamSize: regTeamSize,
        experience: regExperience,
        instagram: regInsta,
        facebook: regFb,
        youtube: regYt,
        linkedin: regLi,
        twitter: regTw,
        workingDays: regWorkingDays,
        workingStart: regWorkingStart,
        workingEnd: regWorkingEnd,
        bank: {
          holder: regBankHolder,
          account: regBankAccNum,
          ifsc: regBankIfsc,
          name: regBankName,
        },
        kyc: {
          aadhaarFront: '',
          aadhaarBack: '',
          pan: '',
          cancelledCheque: '',
        },
        portfolioCount: regPortfolioCount,
        videoCount: regVideoCount,
        brochureUploaded: regBrochureUploaded,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Pending Verification'
      }
    };

    try {
      const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
      const filtered = pendingList.filter((v: any) => v.details?.email?.toLowerCase() !== regEmail.toLowerCase());
      localStorage.setItem('festivo_pending_vendors', JSON.stringify([...filtered, newVendor]));

      // Create admin notification
      const adminNotifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
      const newAdminNotification = {
        id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'new_application',
        vendorId: newVendor.id,
        vendorName: newVendor.name,
        message: `New vendor application submitted by "${newVendor.name}" (${newVendor.category}) in ${newVendor.location}.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('festivo_admin_notifications', JSON.stringify([newAdminNotification, ...adminNotifications]));

      await supabase.from('vendors').insert({
        id: newVendor.id,
        name: newVendor.name,
        category: newVendor.category,
        location: newVendor.location,
        price_amount: newVendor.price_amount,
        price_label: newVendor.price_label,
        price_unit: newVendor.price_unit,
        rating: newVendor.rating,
        reviews: newVendor.reviews,
        image: newVendor.image,
        gallery: newVendor.gallery,
        tags: newVendor.tags,
        description: newVendor.description,
        verified: false,
        slug: newVendor.slug,
        details: newVendor.details
      });
    } catch (e) {
      console.warn('Backend sync failed (proceeding with local registration queue):', e);
    } finally {
      setRegSubmitting(false);
      setShowRegForm(false);
      showToast('Enrollment application submitted successfully!');
    }
  };



  if (activeStatus !== 'Approved') {
    const matchedVendor = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]').find((v: any) => 
      v.details?.email?.toLowerCase() === user?.email?.toLowerCase()
    ) || primaryVendor;

    const rejectionReason = localStorage.getItem(`festivo_reject_reason_${matchedVendor?.id}`) || 'Verification documents could not be matched with registry records.';
    const requestedDocsList = localStorage.getItem(`festivo_requested_docs_${matchedVendor?.id}`) || 'Aadhaar Card Front copy and Bank Cancelled Cheque proof.';

    const CATEGORIES_LIST = [
      'Wedding Planner', 'Photographer', 'Videographer', 'Caterer',
      'Decorator', 'Makeup Artist', 'Venue', 'DJ', 'Entertainment',
      'Invitation Designer', 'Mehendi Artist', 'Transportation', 'Event Rental'
    ];
    const SERVICE_AREAS_OPTIONS = ['Bangalore', 'Hyderabad', 'Chennai', 'Mysore'];
    const EXPERIENCE_OPTIONS = ['Fresher', '1–2 Years', '3–5 Years', '5–10 Years', '10+ Years'];
    const TEAM_SIZE_OPTIONS = ['Individual', '2–5 Members', '6–10 Members', '10+'];
    const LANGUAGES_OPTIONS = ['English', 'Telugu', 'Hindi', 'Kannada', 'Tamil'];
    const PRICE_TYPES = ['Per Hour', 'Per Day', 'Per Event', 'Package'];
    const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between font-body text-dark-800 antialiased">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-sage-900 to-sage-800 py-6 text-white shadow-soft">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white">Festivo Partner Portal</h1>
                <p className="text-sage-200 text-xs">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDemoMode(true)}
                className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-sage-950 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Bypass (Developer Demo Mode)
              </button>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Status Onboarding / Registration wizard / Review queue */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center items-center">
          
          {/* OPTION A: RENDER INLINE 11-STEP FORM */}
          {showRegForm ? (
            <div className="w-full space-y-6 animate-scale-in">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-dark-500 uppercase tracking-widest">
                  <span>Step {regStep} of 11</span>
                  <span>{Math.round((regStep / 11) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sage-600 transition-all duration-300"
                    style={{ width: `${(regStep / 11) * 100}%` }}
                  />
                </div>
              </div>

              {regError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs font-semibold text-red-800 animate-scale-in">
                  <AlertCircle className="w-4.5 h-4.5 text-red-650 flex-shrink-0 mt-0.5" />
                  <p>{regError}</p>
                </div>
              )}

              <div className="bg-white border border-dark-100 rounded-3xl p-6 md:p-8 shadow-soft space-y-6 w-full">
                
                {/* STEP 1: Account info */}
                {regStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Account Information</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Setup your credentials to activate access.</p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold text-dark-600">
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Business Email Address *</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Mobile Number *</label>
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRegSendOtp}
                          className="h-11 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold transition-all text-[11px]"
                        >
                          {regOtpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      </div>

                      {regOtpSent && !regOtpVerified && (
                        <div className="bg-cream-50 border p-4 rounded-xl space-y-2 animate-scale-in">
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Verification OTP *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="Code (e.g. 1234)"
                              value={regOtpCode}
                              onChange={(e) => setRegOtpCode(e.target.value)}
                              className="bg-white border rounded-xl px-4 py-2 w-36 text-center tracking-widest outline-none font-bold"
                            />
                            <button
                              type="button"
                              onClick={handleRegVerifyOtp}
                              className="bg-sage-600 text-white px-4 rounded-xl font-bold text-[11px]"
                            >
                              Verify OTP
                            </button>
                          </div>
                        </div>
                      )}

                      {regOtpVerified && (
                        <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                          ✓ Mobile OTP code verified!
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Password *</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Confirm Password *</label>
                          <input
                            type="password"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Business Info */}
                {regStep === 2 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Business Details</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Tell clients about your company.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Business Name *</label>
                          <input
                            type="text"
                            value={regBusName}
                            onChange={(e) => setRegBusName(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Owner Name *</label>
                          <input
                            type="text"
                            value={regOwnerName}
                            onChange={(e) => setRegOwnerName(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Business Category *</label>
                          <select
                            value={regCategory}
                            onChange={(e) => setRegCategory(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-bold"
                          >
                            {CATEGORIES_LIST.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Subcategory</label>
                          <input
                            type="text"
                            placeholder="e.g. Candid Photo"
                            value={regSubcategory}
                            onChange={(e) => setRegSubcategory(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Description *</label>
                        <textarea
                          value={regDescription}
                          onChange={(e) => setRegDescription(e.target.value)}
                          rows={4}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Address */}
                {regStep === 3 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Business Address</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Where is your workspace located?</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Country</label>
                          <input
                            type="text"
                            value="India"
                            disabled
                            className="w-full bg-cream-100 border rounded-xl px-4 py-2.5 mt-1.5 outline-none font-bold text-dark-400 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">State</label>
                          <input
                            type="text"
                            value={regState}
                            onChange={(e) => setRegState(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">City</label>
                          <input
                            type="text"
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Complete Address</label>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                        />
                      </div>

                      <div className="w-1/2">
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Pincode</label>
                        <input
                          type="text"
                          value={regPincode}
                          onChange={(e) => setRegPincode(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Contact Info */}
                {regStep === 4 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Contact Information</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Primary coordinates for communication.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Contact Person</label>
                        <input
                          type="text"
                          value={regContactPerson}
                          onChange={(e) => setRegContactPerson(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Mobile Number</label>
                          <input
                            type="tel"
                            value={regContactMobile}
                            onChange={(e) => setRegContactMobile(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Alternate Mobile</label>
                          <input
                            type="tel"
                            value={regContactAltMobile}
                            onChange={(e) => setRegContactAltMobile(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Business Email</label>
                          <input
                            type="email"
                            value={regContactEmail}
                            onChange={(e) => setRegContactEmail(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Website</label>
                          <input
                            type="url"
                            value={regWebsite}
                            onChange={(e) => setRegWebsite(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Service Info */}
                {regStep === 5 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Service Information</h3>
                      <p className="text-dark-500 text-xs mt-0.5">State your team operational parameters.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400 mb-2">Service Areas</label>
                        <div className="flex flex-wrap gap-2">
                          {SERVICE_AREAS_OPTIONS.map(a => {
                            const act = regServiceAreas.includes(a);
                            return (
                              <button
                                key={a}
                                type="button"
                                onClick={() => handleToggleRegServiceArea(a)}
                                className={`px-4 py-2 rounded-xl border transition-colors text-xs font-bold ${
                                  act ? 'bg-sage-600 border-sage-600 text-white' : 'bg-cream-50 border-dark-100 text-dark-600'
                                }`}
                              >
                                {a}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Experience</label>
                          <select
                            value={regExperience}
                            onChange={(e) => setRegExperience(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-bold"
                          >
                            {EXPERIENCE_OPTIONS.map(exp => (
                              <option key={exp} value={exp}>{exp}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Team Size</label>
                          <select
                            value={regTeamSize}
                            onChange={(e) => setRegTeamSize(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-bold"
                          >
                            {TEAM_SIZE_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400 mb-2">Languages Spoken</label>
                        <div className="flex flex-wrap gap-4 pt-1">
                          {LANGUAGES_OPTIONS.map(l => (
                            <label key={l} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={regLanguages.includes(l)}
                                onChange={() => handleToggleRegLanguage(l)}
                                className="w-4 h-4 rounded text-sage-600 border-dark-100 focus:ring-sage-100"
                              />
                              <span>{l}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Pricing */}
                {regStep === 6 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Pricing Details</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Specify budget rates to align filters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Starting Price *</label>
                        <input
                          type="number"
                          value={regPriceAmount}
                          onChange={(e) => setRegPriceAmount(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400">Price Type</label>
                        <select
                          value={regPriceType}
                          onChange={(e) => setRegPriceType(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 outline-none font-bold"
                        >
                          {PRICE_TYPES.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Portfolio */}
                {regStep === 7 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Portfolio Assets</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Upload photos and catalog brochure documents.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-cream-50 border border-dashed text-center rounded-2xl flex flex-col items-center justify-center">
                        <Store className="w-6 h-6 text-sage-600" />
                        <p className="font-bold mt-1">Logo URL Profile</p>
                        <img src={regLogoUrl} alt="Logo Preview" className="w-12 h-12 object-cover rounded-lg mt-2 border" />
                        <input
                          type="file"
                          id="onboard-logo-file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setRegLogoUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('onboard-logo-file')?.click()}
                          className="mt-2 text-[9px] font-black text-sage-600 hover:underline"
                        >
                          Change Logo
                        </button>
                      </div>
                      <div className="p-4 bg-cream-50 border border-dashed text-center rounded-2xl flex flex-col items-center justify-center">
                        <Camera className="w-6 h-6 text-sage-600" />
                        <p className="font-bold mt-1">Cover Banner</p>
                        <img src={regCoverUrl} alt="Cover Preview" className="w-20 h-10 object-cover rounded-lg mt-2 border" />
                        <input
                          type="file"
                          id="onboard-cover-file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setRegCoverUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('onboard-cover-file')?.click()}
                          className="mt-2 text-[9px] font-black text-sage-600 hover:underline"
                        >
                          Change Cover
                        </button>
                      </div>

                      <div className="p-4 border rounded-xl flex justify-between items-center bg-white">
                        <span>Portfolio Images (max 20)</span>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setRegPortfolioCount(Math.max(1, regPortfolioCount - 1))} className="w-6 h-6 bg-cream-100 rounded font-bold">-</button>
                          <span className="w-8 text-center font-bold">{regPortfolioCount}</span>
                          <button type="button" onClick={() => setRegPortfolioCount(regPortfolioCount + 1)} className="w-6 h-6 bg-cream-100 rounded font-bold">+</button>
                        </div>
                      </div>
                      <div className="p-4 border rounded-xl flex justify-between items-center bg-white">
                        <span>Video Files (max 5)</span>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setRegVideoCount(Math.max(0, regVideoCount - 1))} className="w-6 h-6 bg-cream-100 rounded font-bold">-</button>
                          <span className="w-8 text-center font-bold">{regVideoCount}</span>
                          <button type="button" onClick={() => setRegVideoCount(regVideoCount + 1)} className="w-6 h-6 bg-cream-100 rounded font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: Payout Details */}
                {regStep === 8 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Payout Details</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Please provide your bank details to configure payout distributions.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block uppercase text-[10px] font-bold text-dark-400">Holder Name *</label>
                            <input
                              type="text"
                              value={regBankHolder}
                              onChange={(e) => setRegBankHolder(e.target.value)}
                              className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="block uppercase text-[10px] font-bold text-dark-400">Bank Name</label>
                            <input
                              type="text"
                              value={regBankName}
                              onChange={(e) => setRegBankName(e.target.value)}
                              className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block uppercase text-[10px] font-bold text-dark-400">Account Number *</label>
                            <input
                              type="text"
                              value={regBankAccNum}
                              onChange={(e) => setRegBankAccNum(e.target.value)}
                              className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="block uppercase text-[10px] font-bold text-dark-400">IFSC Code *</label>
                            <input
                              type="text"
                              value={regBankIfsc}
                              onChange={(e) => setRegBankIfsc(e.target.value)}
                              className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 9: Socials */}
                {regStep === 9 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Social Media Links</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Provide links to show external portfolio highlights.</p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="url"
                        placeholder="Instagram profile link"
                        value={regInsta}
                        onChange={(e) => setRegInsta(e.target.value)}
                        className="w-full bg-cream-50 border rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                      />
                      <input
                        type="url"
                        placeholder="Facebook page link"
                        value={regFb}
                        onChange={(e) => setRegFb(e.target.value)}
                        className="w-full bg-cream-50 border rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                      />
                      <input
                        type="url"
                        placeholder="YouTube channel link"
                        value={regYt}
                        onChange={(e) => setRegYt(e.target.value)}
                        className="w-full bg-cream-50 border rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                      />
                      <input
                        type="url"
                        placeholder="LinkedIn profile link"
                        value={regLi}
                        onChange={(e) => setRegLi(e.target.value)}
                        className="w-full bg-cream-50 border rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                      />
                      <input
                        type="url"
                        placeholder="Twitter profile link"
                        value={regTw}
                        onChange={(e) => setRegTw(e.target.value)}
                        className="w-full bg-cream-50 border rounded-xl px-4 py-2 mt-1 outline-none font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 10: Availability */}
                {regStep === 10 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Working Schedule</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Let clients know active hours.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-dark-400 mb-2">Working Days</label>
                        <div className="flex flex-wrap gap-3">
                          {WEEKDAYS.map(day => (
                            <label key={day} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={regWorkingDays.includes(day)}
                                onChange={() => handleToggleRegWorkingDay(day)}
                                className="w-4 h-4 rounded text-sage-600 border-dark-100 focus:ring-sage-100"
                              />
                              <span>{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">Start Time</label>
                          <input
                            type="time"
                            value={regWorkingStart}
                            onChange={(e) => setRegWorkingStart(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-dark-400">End Time</label>
                          <input
                            type="time"
                            value={regWorkingEnd}
                            onChange={(e) => setRegWorkingEnd(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 11: Terms */}
                {regStep === 11 && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-dark-600">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Terms &amp; Policies</h3>
                      <p className="text-dark-500 text-xs mt-0.5">Please accept to file application.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regConfirmCorrect}
                          onChange={(e) => setRegConfirmCorrect(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-sage-600 border-dark-100 focus:ring-sage-100"
                        />
                        <span>I confirm all provided data is correct.</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regAgreeTerms}
                          onChange={(e) => setRegAgreeTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-sage-600 border-dark-100 focus:ring-sage-100"
                        />
                        <span>I agree to Partner Terms &amp; Conditions.</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regAgreePrivacy}
                          onChange={(e) => setRegAgreePrivacy(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-sage-600 border-dark-100 focus:ring-sage-100"
                        />
                        <span>I agree to Privacy Policy guidelines.</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Actions Nav bar */}
                <div className="flex justify-between items-center border-t pt-4">
                  {regStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleRegBack}
                      className="px-4 py-2 border rounded-xl font-bold flex items-center gap-1 hover:bg-cream-50 text-xs transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {regStep < 11 ? (
                    <button
                      type="button"
                      onClick={handleRegNext}
                      className="px-5 py-2.5 bg-gradient-brand text-white rounded-xl font-black text-xs shadow flex items-center gap-1 hover:opacity-95 transition-opacity"
                    >
                      Next Step <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegSubmit}
                      disabled={regSubmitting}
                      className="px-6 py-2.5 bg-gradient-brand text-white rounded-xl font-black text-xs shadow hover:opacity-95 transition-opacity"
                    >
                      {regSubmitting ? 'Filing Application...' : 'File Application'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <>
              {/* OPTION B: UNREGISTERED WELCOME LANDING CARD */}
              {!hasListing ? (
                <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-sage-100 shadow-card w-full max-w-2xl transform transition-all animate-scale-in space-y-6">
                  <div className="w-16 h-16 bg-sage-50 border border-sage-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                    <Store className="w-8 h-8 text-sage-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-display text-2xl md:text-3xl font-black text-sage-900 tracking-tight">Welcome to Festivo Partner Network!</h2>
                    <p className="text-dark-500 text-xs font-semibold">Event Management Platform Marketplace</p>
                  </div>

                  <p className="text-dark-500 text-sm max-w-lg mx-auto leading-relaxed">
                    Create your premium vendor listing profile to showcase your portfolio, set calendar availability, define packages, and start receiving booking requests from event planners.
                  </p>

                  <button
                    onClick={() => setShowRegForm(true)}
                    className="w-full h-11 bg-gradient-brand text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all hover:opacity-95"
                  >
                    Begin Listing Profile Registration
                  </button>
                </div>
              ) : (
                <>
                  {/* OPTION C: EXISTING ENROLLMENT OUTCOMES */}
                  
                  {/* STATE 1: PENDING VERIFICATION */}
                  {activeStatus === 'Pending Verification' && (
                    <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-sage-100 shadow-card w-full max-w-2xl transform transition-all animate-scale-in space-y-6">
                      <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                        <Clock className="w-10 h-10 text-amber-655 animate-pulse" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="font-display text-2xl md:text-3xl font-black text-sage-900 tracking-tight">
                          Application Under Review
                        </h2>
                        <p className="text-sage-800 text-xs font-bold bg-cream-50 inline-block px-3 py-1 rounded-full border">
                          Business: {matchedVendor?.name}
                        </p>
                      </div>

                      <p className="text-dark-500 text-sm max-w-lg mx-auto leading-relaxed">
                        Your vendor registration application has been received and is currently in our verification queue. Our admin team is checking your Aadhaar, PAN, and Bank proof details.
                      </p>

                      {/* Progress Tracker */}
                      <div className="max-w-md mx-auto p-5 bg-cream-50/50 rounded-2xl border text-left text-xs font-semibold space-y-3">
                        <p className="font-bold text-sage-900 uppercase tracking-widest text-[9px] mb-1">Verification Steps</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-dark-600 flex items-center gap-1">✅ Email Verification</span>
                          <span className="text-emerald-600 font-bold">Verified</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dark-600 flex items-center gap-1">✅ Mobile Verification</span>
                          <span className="text-emerald-600 font-bold">Verified</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dark-100/50 pt-2 mt-2">
                          <span className="text-dark-700 flex items-center gap-1">⏳ KYC Document Check</span>
                          <span className="text-amber-600 font-bold animate-pulse">In Review Queue</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STATE 2: DOCUMENTS REQUESTED */}
                  {activeStatus === 'Documents Requested' && (
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-sage-100 shadow-card w-full max-w-2xl transform transition-all animate-scale-in space-y-6">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                          <AlertCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="font-display text-2xl font-black text-blue-900 tracking-tight">Additional Documents Requested</h2>
                        <p className="text-xs text-dark-500 font-bold bg-cream-50 inline-block px-3 py-1 rounded-full border">Action Required</p>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-150 p-5 rounded-2xl text-xs leading-relaxed text-blue-900 font-semibold space-y-1">
                        <p className="font-bold text-blue-950 uppercase text-[9px] tracking-wider mb-1">Requested Items:</p>
                        <p>"{requestedDocsList}"</p>
                      </div>

                      {/* Upload Dropzones */}
                      <div className="space-y-4 pt-2">
                        <div className="border border-dashed border-dark-200 bg-cream-50/50 p-4 rounded-xl text-center cursor-pointer hover:bg-cream-50 transition-colors">
                          <Upload className="w-6 h-6 text-sage-600 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-dark-800">Upload Requested Documents File</p>
                          <p className="text-[9px] text-dark-400 font-semibold mt-0.5">Select image or PDF file (max 10MB)</p>
                        </div>

                        <button
                          onClick={handleResubmitDocs}
                          className="w-full h-11 bg-gradient-brand text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all hover:opacity-95"
                        >
                          Resubmit Documents for Verification
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATE: PENDING KYC */}
                  {activeStatus === 'Pending KYC' && (
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-sage-100 shadow-card w-full max-w-2xl transform transition-all animate-scale-in space-y-6">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-sage-50 border border-sage-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                          <Building2 className="w-8 h-8 text-sage-600 animate-bounce" />
                        </div>
                        <h2 className="font-display text-2xl font-black text-sage-900 tracking-tight">Submit Business KYC Verification</h2>
                        <p className="text-xs text-dark-500 font-bold bg-cream-50 inline-block px-3 py-1 rounded-full border">Aadhaar, PAN & Cancelled Cheque</p>
                      </div>

                      <p className="text-dark-500 text-sm leading-relaxed text-center max-w-lg mx-auto font-semibold">
                        Your listing profile has been accepted! Please upload your mandatory KYC documents to complete your verification and fully unlock your vendor dashboard.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Aadhaar Front */}
                        <div className="bg-cream-50 p-4 rounded-2xl border border-dashed border-dark-200 text-center flex flex-col items-center justify-center">
                          <p className="text-xs font-bold text-dark-800">Aadhaar Card Front *</p>
                          {kycAadhaarFront ? (
                            <img src={kycAadhaarFront} alt="Aadhaar Front" className="w-20 h-12 object-cover mt-2 border rounded-lg" />
                          ) : (
                            <div className="w-20 h-12 bg-dark-100/50 rounded-lg flex items-center justify-center text-[9px] text-dark-400 font-bold mt-2">No file selected</div>
                          )}
                          <input
                            type="file"
                            id="kyc-aadhaar-front"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setKycAadhaarFront(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('kyc-aadhaar-front')?.click()}
                            className="text-[9px] font-black text-sage-600 hover:underline mt-2.5"
                          >
                            {kycAadhaarFront ? 'Change Image' : 'Select File'}
                          </button>
                        </div>

                        {/* Aadhaar Back */}
                        <div className="bg-cream-50 p-4 rounded-2xl border border-dashed border-dark-200 text-center flex flex-col items-center justify-center">
                          <p className="text-xs font-bold text-dark-800">Aadhaar Card Back *</p>
                          {kycAadhaarBack ? (
                            <img src={kycAadhaarBack} alt="Aadhaar Back" className="w-20 h-12 object-cover mt-2 border rounded-lg" />
                          ) : (
                            <div className="w-20 h-12 bg-dark-100/50 rounded-lg flex items-center justify-center text-[9px] text-dark-400 font-bold mt-2">No file selected</div>
                          )}
                          <input
                            type="file"
                            id="kyc-aadhaar-back"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setKycAadhaarBack(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('kyc-aadhaar-back')?.click()}
                            className="text-[9px] font-black text-sage-600 hover:underline mt-2.5"
                          >
                            {kycAadhaarBack ? 'Change Image' : 'Select File'}
                          </button>
                        </div>

                        {/* PAN Card */}
                        <div className="bg-cream-50 p-4 rounded-2xl border border-dashed border-dark-200 text-center flex flex-col items-center justify-center">
                          <p className="text-xs font-bold text-dark-800">PAN Card *</p>
                          {kycPan ? (
                            <img src={kycPan} alt="PAN Card" className="w-20 h-12 object-cover mt-2 border rounded-lg" />
                          ) : (
                            <div className="w-20 h-12 bg-dark-100/50 rounded-lg flex items-center justify-center text-[9px] text-dark-400 font-bold mt-2">No file selected</div>
                          )}
                          <input
                            type="file"
                            id="kyc-pan-card"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setKycPan(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('kyc-pan-card')?.click()}
                            className="text-[9px] font-black text-sage-600 hover:underline mt-2.5"
                          >
                            {kycPan ? 'Change Image' : 'Select File'}
                          </button>
                        </div>

                        {/* Cancelled Cheque */}
                        <div className="bg-cream-50 p-4 rounded-2xl border border-dashed border-dark-200 text-center flex flex-col items-center justify-center">
                          <p className="text-xs font-bold text-dark-800">Cancelled Cheque *</p>
                          {kycCheque ? (
                            <img src={kycCheque} alt="Cheque" className="w-20 h-12 object-cover mt-2 border rounded-lg" />
                          ) : (
                            <div className="w-20 h-12 bg-dark-100/50 rounded-lg flex items-center justify-center text-[9px] text-dark-400 font-bold mt-2">No file selected</div>
                          )}
                          <input
                            type="file"
                            id="kyc-cancelled-cheque"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setKycCheque(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('kyc-cancelled-cheque')?.click()}
                            className="text-[9px] font-black text-sage-600 hover:underline mt-2.5"
                          >
                            {kycCheque ? 'Change Image' : 'Select File'}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleKycSubmit}
                        className="w-full h-11 bg-gradient-brand text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all hover:opacity-95 mt-4"
                      >
                        Submit KYC Documents for Verification
                      </button>
                    </div>
                  )}

                  {/* STATE: KYC SUBMITTED */}
                  {activeStatus === 'KYC Submitted' && (
                    <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-sage-100 shadow-card w-full max-w-2xl transform transition-all animate-scale-in space-y-6">
                      <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                        <Clock className="w-10 h-10 text-emerald-600 animate-spin" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="font-display text-2xl md:text-3xl font-black text-sage-900 tracking-tight">
                          KYC Under Review
                        </h2>
                        <p className="text-sage-800 text-xs font-bold bg-cream-50 inline-block px-3 py-1 rounded-full border">
                          Business: {matchedVendor?.name}
                        </p>
                      </div>

                      <p className="text-dark-500 text-sm max-w-lg mx-auto leading-relaxed font-semibold">
                        Your KYC verification documents have been submitted successfully. Our admin team is currently reviewing your Aadhaar, PAN, and Cancelled Cheque copies.
                      </p>

                      <div className="max-w-md mx-auto p-5 bg-cream-50/50 rounded-2xl border text-left text-xs font-semibold space-y-3">
                        <p className="font-bold text-sage-900 uppercase tracking-widest text-[9px] mb-1">Verification Steps</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-dark-600 flex items-center gap-1">✅ Listing Profile details</span>
                          <span className="text-emerald-650 font-bold">Approved</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dark-600 flex items-center gap-1">⏳ KYC Document Review</span>
                          <span className="text-amber-600 font-bold animate-pulse">Awaiting Verification</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STATE 3: REJECTED */}
                  {activeStatus === 'Rejected' && (
                    <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-sage-100 shadow-card w-full max-w-2xl transform transition-all animate-scale-in space-y-6">
                      <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="font-display text-2xl font-black text-red-900 tracking-tight">Application Rejected</h2>
                        <p className="text-xs text-dark-500 font-bold bg-cream-50 inline-block px-3 py-1 rounded-full border">Enrollment Declined</p>
                      </div>

                      <div className="bg-red-50 border border-red-150 p-5 rounded-2xl text-xs leading-relaxed text-red-800 text-left font-semibold space-y-1">
                        <p className="font-bold text-red-950 uppercase text-[9px] tracking-wider mb-1">Rejection Details:</p>
                        <p>"{rejectionReason}"</p>
                      </div>

                      <p className="text-dark-500 text-xs leading-relaxed">
                        You can review your registration details, edit the required fields, upload valid KYC proofs, and resubmit the enrollment application.
                      </p>

                      <button
                        onClick={handleStartResubmitForm}
                        className="w-full h-11 bg-gradient-brand text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all hover:opacity-95"
                      >
                        Edit &amp; Resubmit Application
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-sage-100 text-center text-[10px] font-semibold text-dark-400 tracking-wider bg-white">
          &copy; {new Date().getFullYear()} FESTIVO PARTNER PORTAL. ALL RIGHTS RESERVED.
        </footer>
      </div>
    );
  }

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(b => 
    b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.booking_ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-body text-dark-800 antialiased selection:bg-sage-100 selection:text-sage-800">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] transform animate-fade-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-card border text-sm font-semibold ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-600" />}
            {toast.text}
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="flex flex-1 relative min-h-screen">
        
        {/* Sidebar Panel - Desktop: Expanded (280px) | Tablet/Mobile: Drawer */}
        <aside className={`
          fixed top-0 bottom-0 left-0 z-40 w-[280px] bg-white border-r border-dark-100 flex flex-col justify-between transition-transform duration-300
          lg:translate-x-0 lg:static lg:h-auto
          ${sidebarOpen ? 'translate-x-0 shadow-card-hover' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            
            {/* Sidebar Brand Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-dark-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-black text-xl text-sage-900 tracking-tight">Festivo</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="lg:hidden p-1 hover:bg-cream-100 rounded-lg text-dark-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Main Links */}
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isLocked = !kycUploaded && item.id !== 'dashboard' && item.id !== 'support';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isLocked) {
                        showToast('Please upload your KYC documents to unlock this section.', 'error');
                        return;
                      }
                      setActiveTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group
                      ${isActive 
                        ? 'bg-sage-600 text-white shadow-soft' 
                        : isLocked
                          ? 'text-dark-300 opacity-50 cursor-not-allowed'
                          : 'text-dark-600 hover:text-sage-800 hover:bg-cream-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform ${
                        isActive 
                          ? 'text-white' 
                          : isLocked
                            ? 'text-dark-300'
                            : 'text-dark-400 group-hover:text-sage-600 group-hover:scale-110'
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {isLocked ? (
                      <span className="text-[10px] text-dark-400">🔒</span>
                    ) : (
                      item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-sage-700' : 'bg-sage-100 text-sage-700'
                        }`}>
                          {item.badge}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer info */}
            <div className="p-4 border-t border-dark-100 space-y-3">
              {/* Demo Mode Toggle */}
              <div className="flex items-center justify-between p-2 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[11px] font-bold text-dark-600">Demo Account</span>
                <button 
                  onClick={() => {
                    setDemoMode(!demoMode);
                    showToast(`Demo bypass ${!demoMode ? 'enabled' : 'disabled'}`);
                  }}
                  className="text-sage-600 hover:text-sage-800"
                >
                  {demoMode ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={async () => {
                  showToast('Logging out...');
                  await signOut();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
              >
                <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay (Mobile/Tablet drawer backdrop) */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-dark-950/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Main Work Area (Right Side layout) */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[1600px] mx-auto w-full">
          
          {/* Top Navigation Bar */}
          <header className="h-20 bg-white border-b border-dark-100 flex items-center justify-between px-6 md:px-8 z-20">
            
            {/* Topbar Left: Brand Title & Mobile Menu Trigger */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-cream-50 rounded-xl text-dark-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="font-display font-black text-dark-900 text-lg md:text-xl">
                  Good Morning, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Vendor'}
                </h2>
                <p className="text-dark-500 text-xs font-medium">Manage your business effortlessly.</p>
              </div>
            </div>

            {/* Topbar Right: Actions Center */}
            <div className="flex items-center gap-3 md:gap-6">
              
              {/* Search Bar Input */}
              <div className="hidden md:flex items-center bg-cream-50 border border-dark-100 rounded-2xl px-4 py-2 w-64 focus-within:border-sage-300 focus-within:ring-2 focus-within:ring-sage-100 transition-all">
                <span className="text-dark-400 mr-2">🔎</span>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none text-dark-800 placeholder-dark-400"
                />
              </div>

              {/* Wallet Earnings Balance indicator */}
              <div 
                onClick={() => setActiveTab('earnings')}
                className="cursor-pointer flex items-center gap-2 bg-cream-100 hover:bg-cream-200 border border-cream-200 rounded-2xl px-4 py-2 text-sage-950 transition-all"
              >
                <Wallet className="w-4 h-4 text-sage-700" />
                <div className="text-left leading-none">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-sage-800">Earnings</p>
                  <p className="text-xs font-black mt-0.5">₹42,500</p>
                </div>
              </div>

              {/* Notifications bell dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="w-11 h-11 bg-cream-50 border border-dark-100 rounded-2xl flex items-center justify-center text-dark-600 hover:bg-cream-100 transition-colors relative"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {showNotifDropdown && (
                  <>
                    <div 
                      onClick={() => setShowNotifDropdown(false)}
                      className="fixed inset-0 z-30"
                    />
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-card border border-dark-100 z-40 p-4 animate-scale-in origin-top-right">
                      <div className="flex items-center justify-between pb-3 border-b border-dark-100 mb-3">
                        <h4 className="font-display font-black text-sage-900 text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllNotificationsRead}
                            className="text-xs text-sage-600 hover:underline font-bold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {notifications.map(n => (
                          <div 
                            key={n.id}
                            onClick={() => {
                              handleMarkNotificationRead(n.id);
                              setShowNotifDropdown(false);
                            }}
                            className={`p-3 rounded-xl text-left cursor-pointer transition-all ${
                              n.is_read ? 'bg-cream-50 hover:bg-cream-100/50' : 'bg-sage-50/50 hover:bg-sage-50 border-l-4 border-sage-500'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <p className="font-bold text-dark-900 text-xs">{n.title}</p>
                              {!n.is_read && <span className="w-1.5 h-1.5 bg-sage-500 rounded-full mt-1" />}
                            </div>
                            <p className="text-dark-500 text-[11px] leading-normal mt-0.5">{n.message}</p>
                            <p className="text-dark-400 text-[9px] mt-1.5">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Avatar circle */}
              <div 
                onClick={() => setActiveTab('settings')}
                className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-display text-sm font-bold shadow-soft border border-white hover:scale-105 cursor-pointer transition-transform"
              >
                {settingsForm.business_name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
              </div>

            </div>
          </header>

          {/* Render Area for Tabs */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">

            {/* TAB: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-up">
                
                {/* KYC Verification Lock Banner */}
                {kycStatus === 'Not Uploaded' && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/25 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-soft animate-scale-in">
                    <div className="space-y-2 max-w-xl text-left">
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="font-display text-base">KYC Identity Documents Required</span>
                      </div>
                      <p className="text-dark-600 text-xs leading-relaxed font-semibold">
                        Your vendor profile listing is accepted by the administration! To comply with Marketplace Payout & Booking Policies, please upload your KYC identity verification documents (Aadhaar Front/Back and PAN Card) for review.
                      </p>
                      
                      {/* Document file uploader elements */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div className="p-3 bg-white/80 border border-dashed border-dark-200 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold text-dark-500">Aadhaar Front</span>
                          <span className="px-2 py-1 bg-sage-50 text-sage-750 text-[9px] font-black rounded cursor-pointer hover:bg-sage-100 transition-colors">Select File</span>
                        </div>
                        <div className="p-3 bg-white/80 border border-dashed border-dark-200 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold text-dark-500">Aadhaar Back</span>
                          <span className="px-2 py-1 bg-sage-50 text-sage-750 text-[9px] font-black rounded cursor-pointer hover:bg-sage-100 transition-colors">Select File</span>
                        </div>
                        <div className="p-3 bg-white/80 border border-dashed border-dark-200 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold text-dark-500">PAN Card</span>
                          <span className="px-2 py-1 bg-sage-50 text-sage-750 text-[9px] font-black rounded cursor-pointer hover:bg-sage-100 transition-colors">Select File</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const email = user?.email?.toLowerCase();
                        if (email) {
                          localStorage.setItem(`festivo_kyc_status_${email}`, 'Pending Verification');
                        }
                        setKycStatus('Pending Verification');
                        showToast('KYC documents submitted. Pending admin verification.');
                      }}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-black shadow-md transition-all self-stretch md:self-auto flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4" /> Submit Documents
                    </button>
                  </div>
                )}

                {kycStatus === 'Pending Verification' && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/25 rounded-3xl p-6 md:p-8 flex items-center gap-4 shadow-soft animate-scale-in text-left">
                    <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-amber-850 font-display font-black text-sm">KYC Documents Under Review</h4>
                      <p className="text-dark-600 text-xs font-semibold mt-1">
                        Your identity verification documents have been submitted and are under compliance review. Once approved by the administrator, your dashboard navigation and features will be unlocked.
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Hero Summary Cards Section */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Card 1: New Requests */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">New Requests</p>
                        <h3 className="font-display font-black text-dark-900 text-3xl mt-2">{bookingRequests.length}</h3>
                      </div>
                      <div className="w-11 h-11 bg-sage-50 border border-sage-100 rounded-xl flex items-center justify-center text-sage-600">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-emerald-600 text-xs font-bold">
                      <span>✓ Active requests ready</span>
                    </div>
                  </div>

                  {/* Card 2: Confirmed Bookings */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">Confirmed Bookings</p>
                        <h3 className="font-display font-black text-dark-900 text-3xl mt-2">
                          {bookings.filter(b => b.status === 'confirmed').length}
                        </h3>
                      </div>
                      <div className="w-11 h-11 bg-sage-50 border border-sage-100 rounded-xl flex items-center justify-center text-sage-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-dark-500 text-xs font-semibold">
                      <span>📆 Next event: Aug 12</span>
                    </div>
                  </div>

                  {/* Card 3: Today's Earnings */}
                  <div className="bg-gradient-brand rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Today's Earnings</p>
                        <h3 className="font-display font-black text-white text-3xl mt-2">₹42,500</h3>
                      </div>
                      <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-gold-200">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-gold-300 text-xs font-bold">
                      <span>★ 15% Comm. paid</span>
                    </div>
                  </div>

                  {/* Card 4: Average Rating */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">Average Rating</p>
                        <h3 className="font-display font-black text-dark-900 text-3xl mt-2">4.9</h3>
                      </div>
                      <div className="w-11 h-11 bg-gold-50 border border-gold-150 rounded-xl flex items-center justify-center text-gold-500">
                        <Star className="w-5 h-5 fill-gold-500 text-gold-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-gold-600 text-xs font-bold">
                      <span>★ Top Rated Partner</span>
                    </div>
                  </div>

                </section>

                {/* 2. Main Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column (70%) */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Upcoming Events Timeline */}
                    <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display font-black text-dark-900 text-lg">Upcoming Events</h3>
                        <button 
                          onClick={() => setActiveTab('bookings')}
                          className="text-xs font-bold text-sage-600 hover:text-sage-800 flex items-center gap-1 transition-colors"
                        >
                          View all bookings <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="text-center py-10 text-dark-400 text-sm">No upcoming events scheduled.</div>
                      ) : (
                        <div className="relative border-l border-dark-100 pl-6 ml-3 space-y-6">
                          {bookings.map(b => (
                            <div key={b.id} className="relative group">
                              {/* Timeline indicator node */}
                              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-sage-500 shadow-soft group-hover:scale-125 transition-transform" />
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50/50 hover:bg-cream-50 p-4 rounded-xl border border-cream-100 transition-all">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-dark-900">{b.customer_name}</span>
                                    <span className="text-[10px] bg-sage-100 text-sage-700 font-bold px-2 py-0.5 rounded-full">
                                      {b.event_type}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-dark-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.event_date}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Bangalore, KA</span>
                                    <span className="col-span-2 text-sage-700 font-bold mt-1">Budget: ₹{b.total_amount.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setSelectedBooking(b)}
                                    className="px-3.5 py-2 bg-cream-200 hover:bg-cream-300 text-dark-800 rounded-xl text-xs font-bold transition-all h-11"
                                  >
                                    View Details
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setSelectedChatUser(b.customer_email);
                                      setActiveTab('messages');
                                    }}
                                    className="p-2.5 bg-sage-50 hover:bg-sage-100 border border-sage-100 text-sage-600 rounded-xl transition-all w-11 h-11 flex items-center justify-center"
                                    title="Chat with Customer"
                                  >
                                    <MessageSquare className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent Booking Requests */}
                    <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-display font-black text-dark-900 text-lg">Recent Booking Requests</h3>
                          <p className="text-dark-500 text-xs font-semibold mt-0.5">Quickly accept or decline incoming offers.</p>
                        </div>
                        <span className="text-xs bg-sage-100 text-sage-700 font-bold px-2.5 py-1 rounded-full">
                          {bookingRequests.length} Pending
                        </span>
                      </div>

                      {bookingRequests.length === 0 ? (
                        <div className="text-center py-10 bg-cream-50/50 rounded-2xl border border-dashed border-dark-200">
                          <p className="text-dark-400 text-sm font-semibold">No booking requests pending.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bookingRequests.map(req => (
                            <div 
                              key={req.id}
                              className="bg-cream-50/70 hover:bg-cream-50 border border-cream-200 rounded-2xl p-5 shadow-soft transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-bold text-dark-900 text-sm">{req.customer}</h4>
                                    <p className="text-xs font-semibold text-sage-700 mt-0.5">{req.service}</p>
                                  </div>
                                  <span className="text-sm font-black text-dark-900">₹{req.budget.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="mt-3.5 space-y-1.5 border-t border-dark-100 pt-3 text-xs font-semibold text-dark-500">
                                  <p className="flex items-center gap-1.5">📆 {req.date}</p>
                                  <p className="flex items-center gap-1.5">📍 {req.location}</p>
                                  {req.note && (
                                    <p className="bg-white/50 border border-dark-100 p-2 rounded-xl text-dark-600 text-[10px] leading-relaxed mt-2.5">
                                      "{req.note}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-5">
                                <button 
                                  onClick={() => handleBookingReject(req.id)}
                                  className="h-11 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all"
                                >
                                  Decline
                                </button>
                                <button 
                                  onClick={() => handleBookingAccept(req.id)}
                                  className="h-11 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column (30%) */}
                  <div className="space-y-8">
                    
                    {/* Availability Card */}
                    <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                      <h3 className="font-display font-black text-dark-900 text-base mb-4">Availability Status</h3>
                      <div className="flex items-center justify-between bg-cream-50 p-4 rounded-xl border border-cream-200">
                        <div>
                          <p className="text-xs font-bold text-dark-900">Accepting Bookings</p>
                          <p className="text-dark-500 text-[10px] font-semibold mt-0.5">Toggle availability on explore directory.</p>
                        </div>
                        <button 
                          onClick={handleToggleAvailability}
                          className="text-sage-600 focus:outline-none"
                        >
                          {availabilityStatus ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-dark-400" />}
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-dark-500">
                        <span className={`w-2.5 h-2.5 rounded-full ${availabilityStatus ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span>Status: {availabilityStatus ? 'Online & Available' : 'Offline / Bookings Paused'}</span>
                      </div>
                    </div>

                    {/* Profile Completion Card */}
                    <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-display font-black text-dark-900 text-base">Profile Setup</h3>
                        <span className="text-xs font-black text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-100">75% Done</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6">
                        {/* Custom SVG Progress Ring */}
                        <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" fill="transparent" stroke="#f1f5f9" strokeWidth="5" />
                            <circle cx="32" cy="32" r="26" fill="transparent" stroke="#5d8560" strokeWidth="5" strokeDasharray="163" strokeDashoffset="41" />
                          </svg>
                          <span className="absolute text-xs font-black text-sage-900">75%</span>
                        </div>
                        <div className="text-xs font-semibold text-dark-500">
                          <p className="text-dark-800 font-bold">Complete your checklist</p>
                          <p className="mt-0.5">Help customer book you faster with full document verification.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { task: 'Upload Portfolio', done: true, tab: 'portfolio' },
                          { task: 'Add Packages', done: true, tab: 'packages' },
                          { task: 'Verify Documents', done: false, tab: 'settings' },
                          { task: 'Bank Verification', done: false, tab: 'settings' }
                        ].map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTab(t.tab as any)}
                            className="w-full flex items-center justify-between p-3 bg-cream-50/50 hover:bg-cream-50 rounded-xl border border-cream-100 text-left transition-colors"
                          >
                            <span className={`text-xs font-bold ${t.done ? 'text-dark-500 line-through' : 'text-dark-800'}`}>
                              {t.task}
                            </span>
                            {t.done ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Today's Schedule Timeline */}
                    <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                      <h3 className="font-display font-black text-dark-900 text-base mb-4">Today's Schedule</h3>
                      <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-100">
                        
                        {[
                          { time: '10:00 AM', label: 'Wedding Shoot', desc: 'Amit & Priya Wedding Rituals', category: 'Wedding' },
                          { time: '02:00 PM', label: 'Venue Walkthrough', desc: 'Pre-check decoration details at Leela Palace', category: 'General' },
                          { time: '06:00 PM', label: 'Reception Coverage', desc: 'Capture entries and guest wishes', category: 'Reception' }
                        ].map((s, idx) => (
                          <div key={idx} className="relative pl-6">
                            <div className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-sage-500 ring-4 ring-white" />
                            <p className="text-[10px] font-bold text-sage-600 uppercase">{s.time}</p>
                            <p className="text-xs font-bold text-dark-900 mt-0.5">{s.label}</p>
                            <p className="text-[11px] text-dark-500 font-medium mt-0.5">{s.desc}</p>
                          </div>
                        ))}

                      </div>
                    </div>

                    {/* Performance Card */}
                    <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                      <h3 className="font-display font-black text-dark-900 text-base mb-4">Performance Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Avg Rating', val: '4.9 ★', desc: 'Excellent' },
                          { label: 'Completed Events', val: '84', desc: 'This Year' },
                          { label: 'Response Time', val: '12 mins', desc: 'Very Fast' },
                          { label: 'Repeat Customers', val: '24%', desc: 'Strong Loyalty' }
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-cream-50 p-3.5 rounded-xl border border-cream-200">
                            <p className="text-dark-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="font-display font-black text-sage-900 text-lg mt-1">{stat.val}</p>
                            <p className="text-dark-400 text-[9px] font-medium mt-0.5">{stat.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB: BOOKINGS LIST */}
            {activeTab === 'bookings' && (
              <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-6 animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">All Bookings</h3>
                    <p className="text-dark-500 text-xs font-medium">Browse confirmed bookings and past orders.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3.5 py-1.5 bg-sage-600 text-white rounded-xl text-xs font-bold shadow-soft">
                      All
                    </button>
                    <button className="px-3.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-dark-700 rounded-xl text-xs font-bold">
                      Confirmed
                    </button>
                    <button className="px-3.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-dark-700 rounded-xl text-xs font-bold">
                      Pending
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-100 text-dark-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 font-bold">Ref No.</th>
                        <th className="pb-3 font-bold">Customer</th>
                        <th className="pb-3 font-bold">Service</th>
                        <th className="pb-3 font-bold">Date</th>
                        <th className="pb-3 font-bold text-right">Budget</th>
                        <th className="pb-3 font-bold text-center">Status</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100 text-sm">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-cream-50/50 transition-colors">
                          <td className="py-4 font-bold text-dark-900">{b.booking_ref}</td>
                          <td className="py-4">
                            <div>
                              <p className="font-bold text-dark-800">{b.customer_name}</p>
                              <p className="text-[11px] text-dark-400 font-semibold">{b.customer_email}</p>
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-dark-700">{b.event_type}</td>
                          <td className="py-4 font-semibold text-dark-600">{b.event_date}</td>
                          <td className="py-4 text-right font-black text-dark-900">₹{b.total_amount.toLocaleString('en-IN')}</td>
                          <td className="py-4 text-center">
                            <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-dark-700 text-xs font-bold rounded-lg transition-all"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: CALENDAR VIEW */}
            {activeTab === 'calendar' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up">
                
                {/* Month Calendar Grid Card */}
                <div className="lg:col-span-2 bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-black text-dark-900 text-lg">{currentMonth.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1 bg-cream-100 hover:bg-cream-200 rounded-lg text-dark-600 text-xs font-bold">&larr;</button>
                      <button className="p-1 bg-cream-100 hover:bg-cream-200 rounded-lg text-dark-600 text-xs font-bold">&rarr;</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-dark-400 mb-2">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {/* Padding cells */}
                    {Array.from({ length: currentMonth.offset }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square bg-cream-50/50 rounded-xl" />
                    ))}

                    {/* Month cells */}
                    {Array.from({ length: currentMonth.days }).map((_, i) => {
                      const dayNo = i + 1;
                      const dateStr = `2026-08-${String(dayNo).padStart(2, '0')}`;
                      const isBlocked = availability[dateStr] === false;
                      const dateBookings = bookings.filter(b => b.event_date === dateStr);
                      const hasBooking = dateBookings.length > 0;

                      return (
                        <div 
                          key={dayNo} 
                          onClick={() => handleToggleDateAvailability(dateStr)}
                          className={`
                            aspect-square rounded-xl p-2 cursor-pointer transition-all flex flex-col justify-between border relative group
                            ${hasBooking 
                              ? 'bg-sage-50 border-sage-200 text-sage-950 font-bold' 
                              : isBlocked 
                                ? 'bg-red-50 border-red-100 text-red-700' 
                                : 'bg-white border-dark-100 text-dark-800 hover:bg-cream-100'
                            }
                          `}
                        >
                          <span className="text-xs">{dayNo}</span>
                          <div className="flex flex-col gap-0.5 items-center w-full">
                            {hasBooking && (
                              <span className="w-1.5 h-1.5 bg-sage-600 rounded-full" title="Booked Event" />
                            )}
                            {isBlocked && !hasBooking && (
                              <span className="text-[7px] font-black uppercase text-red-500">Blocked</span>
                            )}
                          </div>

                          {/* Hover tooltip */}
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-dark-900 text-white text-[9px] p-2 rounded-lg shadow-card z-50 w-24 pointer-events-none mb-1">
                            {hasBooking 
                              ? `Event: ${dateBookings[0].customer_name}` 
                              : isBlocked 
                                ? 'Date Blocked' 
                                : 'Available'
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar Detail Side Panel */}
                <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-6">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-base">Calendar Legend</h3>
                    <p className="text-dark-500 text-xs font-semibold mt-0.5">Click any calendar cell to block/unblock dates instantly.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
                      <span className="w-4 h-4 bg-white border border-dark-150 rounded-md" />
                      <span className="text-xs font-bold text-dark-800">Available Slots (Default)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-150 rounded-xl">
                      <span className="w-4 h-4 bg-red-500 rounded-md" />
                      <span className="text-xs font-bold text-red-700">Blocked Dates (Vacation/Off)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-sage-50 border border-sage-150 rounded-xl">
                      <span className="w-4 h-4 bg-sage-600 rounded-md" />
                      <span className="text-xs font-bold text-sage-800">Booked Event Slots</span>
                    </div>
                  </div>

                  <div className="border-t border-dark-100 pt-6">
                    <h4 className="font-bold text-dark-900 text-sm mb-3">Scheduled Dates This Month</h4>
                    <div className="space-y-3">
                      {bookings.map(b => (
                        <div key={b.id} className="p-3 bg-cream-50/50 rounded-xl border border-cream-100 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-dark-900">{b.customer_name}</p>
                            <p className="text-dark-500 text-[10px] font-semibold mt-0.5">{b.event_type}</p>
                          </div>
                          <span className="font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full">{b.event_date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: MESSAGES / CHAT */}
            {activeTab === 'messages' && (
              <div className="bg-white border border-dark-100 rounded-2xl p-0 shadow-soft h-[600px] overflow-hidden flex animate-fade-up">
                
                {/* Chat Customer selection panel (Left) */}
                <div className="w-80 border-r border-dark-100 flex flex-col">
                  <div className="p-4 border-b border-dark-100">
                    <h3 className="font-display font-black text-dark-900 text-base">Direct Messages</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-dark-100">
                    {chatUsers.map(u => {
                      const isSelected = selectedChatUser === u.email;
                      return (
                        <button
                          key={u.email}
                          onClick={() => setSelectedChatUser(u.email)}
                          className={`w-full p-4 text-left flex justify-between items-start transition-colors ${
                            isSelected ? 'bg-cream-100' : 'hover:bg-cream-50/50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-dark-900 text-sm truncate">{u.name}</p>
                            <p className="text-xs text-dark-500 truncate mt-0.5 font-medium">{u.lastMsg}</p>
                          </div>
                          {u.unread > 0 && (
                            <span className="text-[10px] font-bold text-white bg-sage-600 px-2 py-0.5 rounded-full">
                              {u.unread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Chat bubbles window (Right) */}
                <div className="flex-1 flex flex-col h-full bg-cream-50/30">
                  
                  {/* Chat User Header */}
                  <div className="h-16 border-b border-dark-100 bg-white px-6 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-dark-900 text-sm">
                        {chatUsers.find(u => u.email === selectedChatUser)?.name || selectedChatUser}
                      </p>
                      <p className="text-[10px] text-dark-500 font-semibold">{selectedChatUser}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online
                    </span>
                  </div>

                  {/* Message History list */}
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {messages
                      .filter(m => m.customer_email === selectedChatUser)
                      .map((msg, index) => {
                        const isVendor = msg.sender_type === 'vendor';
                        return (
                          <div key={index} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-4 rounded-2xl shadow-soft text-sm font-medium ${
                              isVendor 
                                ? 'bg-sage-600 text-white rounded-tr-none' 
                                : 'bg-white border border-dark-100 text-dark-800 rounded-tl-none'
                            }`}>
                              <p className="leading-relaxed">{msg.message}</p>
                              <p className={`text-[9px] mt-2 text-right ${isVendor ? 'text-white/70' : 'text-dark-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Chat input box */}
                  <div className="p-4 border-t border-dark-100 bg-white flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-cream-50 border border-dark-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none text-dark-800 placeholder-dark-400 focus:border-sage-300 transition-all"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="w-12 h-12 bg-sage-600 hover:bg-sage-700 text-white rounded-2xl flex items-center justify-center transition-colors shadow-soft"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: PORTFOLIO SECTION */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Portfolio Preview Gallery</h3>
                    <p className="text-dark-500 text-xs font-semibold mt-0.5">Showcase your best clicks to event planners visiting your profile.</p>
                  </div>
                  <button 
                    onClick={handleUploadPortfolio}
                    className="h-11 bg-gradient-brand text-white hover:opacity-95 rounded-xl px-6 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4.5 h-4.5" /> Upload Portfolio Image
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {portfolio.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-dark-100 rounded-2xl overflow-hidden shadow-soft group hover:shadow-card hover:-translate-y-0.5 transition-all relative aspect-video"
                    >
                      <img 
                        src={img} 
                        alt={`Portfolio sample ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-dark-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setPortfolio(prev => prev.filter((_, i) => i !== idx));
                            showToast('Portfolio image removed.', 'error');
                          }}
                          className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center text-red-600 shadow-soft hover:bg-white"
                          title="Delete photo"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PACKAGES SECTION */}
            {activeTab === 'packages' && (
              <div className="space-y-6 animate-fade-up">
                
                {/* Header listing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Services & Pricing Packages</h3>
                    <p className="text-dark-500 text-xs font-semibold mt-0.5">Manage your standard pricing plans offered on public search listing.</p>
                  </div>
                  <button 
                    onClick={() => setShowPackageForm(!showPackageForm)}
                    className="h-11 bg-gradient-brand text-white rounded-xl px-6 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4.5 h-4.5" /> Add New Package
                  </button>
                </div>

                {/* Form to add package */}
                {showPackageForm && (
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-4 animate-scale-in">
                    <h4 className="font-display font-black text-dark-900 text-sm">Add Pricing Package</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Package Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Wedding Cinematic Premium"
                          value={packageForm.title}
                          onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Pricing (INR)</label>
                        <input
                          type="number"
                          placeholder="e.g. 75000"
                          value={packageForm.price}
                          onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 6 Hours / Full Day"
                          value={packageForm.duration}
                          onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Includes (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 Photographer, Candid teaser, Digital Album"
                          value={packageForm.includes}
                          onChange={(e) => setPackageForm({ ...packageForm, includes: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-dark-500 uppercase">Description</label>
                        <textarea
                          placeholder="Briefly state what this package is best suited for..."
                          value={packageForm.description}
                          onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                          rows={3}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setShowPackageForm(false)}
                        className="px-4 py-2 bg-cream-200 text-dark-700 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddPackage}
                        className="px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs"
                      >
                        Create Package
                      </button>
                    </div>
                  </div>
                )}

                {/* Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map(pkg => (
                    <div 
                      key={pkg.id}
                      className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft flex flex-col justify-between hover:shadow-card hover:-translate-y-0.5 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-display font-black text-dark-900 text-base">{pkg.title}</h4>
                          <span className="text-[10px] font-bold text-sage-600 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-100">
                            {pkg.duration}
                          </span>
                        </div>
                        <p className="text-xs font-black text-dark-900 text-lg">₹{pkg.price.toLocaleString('en-IN')}</p>
                        <p className="text-dark-500 text-[11px] leading-relaxed mt-2.5 font-medium mb-4">{pkg.description}</p>
                        
                        <div className="border-t border-dark-100 pt-4 space-y-2">
                          <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wide">Inclusions</p>
                          <ul className="space-y-1.5">
                            {pkg.includes.map((inc, i) => (
                              <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-dark-600">
                                <span className="text-sage-600 font-bold mt-0.5">✓</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-6 border-t border-dark-100 pt-4">
                        <button className="h-10 border border-dark-100 hover:bg-cream-50 text-dark-700 rounded-xl text-xs font-bold transition-all">
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="h-10 border border-red-105 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold transition-all"
                        >
                          Delete
                        </button>
                        <button className="h-10 bg-cream-200 hover:bg-cream-300 text-dark-800 rounded-xl text-xs font-bold transition-all">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: REVIEWS SECTION */}
            {activeTab === 'reviews' && (
              <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-6 animate-fade-up">
                <div>
                  <h3 className="font-display font-black text-dark-900 text-lg">Customer Reviews</h3>
                  <p className="text-dark-500 text-xs font-medium">Read client reviews and post official responses.</p>
                </div>

                <div className="divide-y divide-dark-100">
                  {reviewsList.map(r => (
                    <div key={r.id} className="py-6 flex gap-4 items-start">
                      <img 
                        src={r.avatar} 
                        alt={r.author}
                        className="w-12 h-12 rounded-2xl object-cover border border-dark-100 flex-shrink-0"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-dark-900 text-sm">{r.author}</p>
                            <p className="text-[10px] text-dark-400 font-bold">{r.event} · {r.date}</p>
                          </div>
                          
                          {/* Rating display stars */}
                          <div className="flex gap-0.5 text-gold-500 text-xs font-bold">
                            {'★'.repeat(Math.floor(r.rating))}
                            {r.rating % 1 !== 0 && '½'}
                          </div>
                        </div>

                        <p className="text-dark-700 text-xs leading-relaxed font-semibold">{r.comment}</p>

                        {/* Existing Official Reply */}
                        {r.reply ? (
                          <div className="bg-cream-50 p-4 rounded-xl border border-cream-200 text-xs font-medium mt-3">
                            <p className="font-bold text-sage-900">Official Reply:</p>
                            <p className="text-dark-600 mt-1">"{r.reply}"</p>
                          </div>
                        ) : (
                          <div className="pt-2">
                            {activeReplyId === r.id ? (
                              <div className="space-y-2 mt-2">
                                <textarea
                                  placeholder="Write your polite reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={2}
                                  className="w-full bg-cream-50 border border-dark-100 rounded-xl p-3 text-xs outline-none font-medium resize-none"
                                />
                                <div className="flex gap-1.5 justify-end">
                                  <button 
                                    onClick={() => setActiveReplyId(null)}
                                    className="px-3 py-1.5 bg-cream-200 text-dark-700 rounded-lg text-xs font-bold"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleReviewReply(r.id)}
                                    className="px-4 py-1.5 bg-sage-600 text-white rounded-lg text-xs font-bold"
                                  >
                                    Post Reply
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setActiveReplyId(r.id);
                                  setReplyText('');
                                }}
                                className="px-3.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-dark-700 text-[10px] font-black rounded-lg transition-all"
                              >
                                Reply to Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EARNINGS & GRAPH */}
            {activeTab === 'earnings' && (
              <div className="space-y-8 animate-fade-up">
                
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                    <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">Today's Earnings</p>
                    <h3 className="font-display font-black text-dark-900 text-3xl mt-2">₹42,500</h3>
                    <p className="text-[10px] text-dark-400 mt-2 font-bold uppercase">Credited via Stripe</p>
                  </div>

                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                    <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">Weekly Income</p>
                    <h3 className="font-display font-black text-dark-900 text-3xl mt-2">₹1,75,000</h3>
                    <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase">▲ +12% from last week</p>
                  </div>

                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                    <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">Monthly Income</p>
                    <h3 className="font-display font-black text-dark-900 text-3xl mt-2">₹4,40,000</h3>
                    <p className="text-[10px] text-dark-400 mt-2 font-bold uppercase">Target: ₹5L goal</p>
                  </div>

                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft flex flex-col justify-between">
                    <div>
                      <p className="text-dark-500 text-xs font-bold uppercase tracking-wider">Pending Payout</p>
                      <h3 className="font-display font-black text-sage-600 text-3xl mt-2">₹90,000</h3>
                    </div>
                    <button 
                      onClick={() => showToast('Payout request registered. Processing takes 2-3 business days.')}
                      className="mt-4 w-full h-10 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
                    >
                      Withdraw Balance
                    </button>
                  </div>

                </div>

                {/* Earnings Minimal line chart */}
                <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-display font-black text-dark-900 text-base">Monthly Earnings Trend</h3>
                      <p className="text-dark-500 text-xs font-semibold mt-0.5">Graphical growth pattern of vendor services.</p>
                    </div>
                    <span className="text-xs bg-sage-50 text-sage-700 font-bold px-2.5 py-1 rounded-full border border-sage-100">FY 2026</span>
                  </div>

                  {/* SVG Line Graph */}
                  <div className="relative h-64 bg-cream-50/50 rounded-2xl border border-cream-200 p-4">
                    <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5d8560" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#5d8560" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="600" y2="50" stroke="#eef1ee" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#eef1ee" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="#eef1ee" strokeWidth="1" strokeDasharray="4" />

                      {/* Area Fill */}
                      <path 
                        d="M 50 160 Q 150 140 250 80 T 450 110 T 550 40 L 550 200 L 50 200 Z" 
                        fill="url(#chartGrad)" 
                      />

                      {/* Chart Line */}
                      <path 
                        d="M 50 160 Q 150 140 250 80 T 450 110 T 550 40" 
                        fill="none" 
                        stroke="#5d8560" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />

                      {/* Dots on nodes */}
                      <circle cx="50" cy="160" r="5" fill="#ffffff" stroke="#5d8560" strokeWidth="2.5" />
                      <circle cx="150" cy="140" r="5" fill="#ffffff" stroke="#5d8560" strokeWidth="2.5" />
                      <circle cx="250" cy="80" r="5" fill="#ffffff" stroke="#5d8560" strokeWidth="2.5" />
                      <circle cx="350" cy="95" r="5" fill="#ffffff" stroke="#5d8560" strokeWidth="2.5" />
                      <circle cx="450" cy="110" r="5" fill="#ffffff" stroke="#5d8560" strokeWidth="2.5" />
                      <circle cx="550" cy="40" r="5" fill="#ffffff" stroke="#5d8560" strokeWidth="2.5" />
                    </svg>

                    {/* Chart Labels */}
                    <div className="flex justify-between text-[10px] font-bold text-dark-400 mt-4 px-6 uppercase tracking-wider">
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-fade-up">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Gauge style card */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                    <h3 className="font-display font-black text-dark-900 text-base mb-4">Traffic Conversion Rate</h3>
                    <div className="flex flex-col items-center py-8">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="68" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                          <circle cx="80" cy="80" r="68" fill="transparent" stroke="#5d8560" strokeWidth="8" strokeDasharray="427" strokeDashoffset="128" />
                        </svg>
                        <div className="absolute text-center">
                          <p className="font-display font-black text-dark-900 text-3xl">70%</p>
                          <p className="text-dark-400 text-[10px] font-bold uppercase mt-1">Excellent</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-dark-500 text-center max-w-xs mt-6 leading-relaxed">
                        Your page conversion is 12% higher than average photographers in Bangalore region.
                      </p>
                    </div>
                  </div>

                  {/* Customer distribution */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                    <h3 className="font-display font-black text-dark-900 text-base mb-4">Event Types Distribution</h3>
                    
                    <div className="space-y-4 py-4">
                      {[
                        { cat: 'Weddings', pct: 60, color: 'bg-sage-600' },
                        { cat: 'Corporate Shoots', pct: 25, color: 'bg-gold-500' },
                        { cat: 'Birthdays & Private Parties', pct: 15, color: 'bg-cream-600' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-dark-800">
                            <span>{item.cat}</span>
                            <span>{item.pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-cream-50 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Grid performance statistics */}
                <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                  <h3 className="font-display font-black text-dark-900 text-base mb-6">Key Conversion Statistics</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 text-center">
                      <p className="text-dark-500 text-[10px] font-bold uppercase">Profile Views</p>
                      <p className="font-display font-black text-dark-950 text-2xl mt-1.5">1,036</p>
                    </div>
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 text-center">
                      <p className="text-dark-500 text-[10px] font-bold uppercase">Leads Generated</p>
                      <p className="font-display font-black text-dark-950 text-2xl mt-1.5">72</p>
                    </div>
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 text-center">
                      <p className="text-dark-500 text-[10px] font-bold uppercase">Completed Bookings</p>
                      <p className="font-display font-black text-dark-950 text-2xl mt-1.5">18</p>
                    </div>
                    <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 text-center">
                      <p className="text-dark-500 text-[10px] font-bold uppercase">Revenue Conversion</p>
                      <p className="font-display font-black text-sage-600 text-2xl mt-1.5">₹4,25,000</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: DEALS / PROMOTIONS */}
            {activeTab === 'deals' && (
              <div className="space-y-6 animate-fade-up">
                
                {/* Header promo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Promotions & Coupons</h3>
                    <p className="text-dark-500 text-xs font-semibold mt-0.5">Offer custom discount codes to attract premium event planners.</p>
                  </div>
                  <button 
                    onClick={() => setShowDealForm(!showDealForm)}
                    className="h-11 bg-gradient-brand text-white rounded-xl px-6 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4.5 h-4.5" /> Create Coupon
                  </button>
                </div>

                {/* Form to add promo */}
                {showDealForm && (
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-4 animate-scale-in">
                    <h4 className="font-display font-black text-dark-900 text-sm">Create New Promo Deal</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Coupon Code</label>
                        <input
                          type="text"
                          placeholder="e.g. WEDFEST15"
                          value={dealForm.code}
                          onChange={(e) => setDealForm({ ...dealForm, code: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Discount Rate</label>
                        <input
                          type="text"
                          placeholder="e.g. 15% OFF / ₹5000 Flat"
                          value={dealForm.discount}
                          onChange={(e) => setDealForm({ ...dealForm, discount: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Expiry Date</label>
                        <input
                          type="date"
                          value={dealForm.expiry}
                          onChange={(e) => setDealForm({ ...dealForm, expiry: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Applicable on booking premium photography package."
                          value={dealForm.description}
                          onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setShowDealForm(false)}
                        className="px-4 py-2 bg-cream-200 text-dark-700 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddDeal}
                        className="px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl text-xs"
                      >
                        Save Coupon
                      </button>
                    </div>
                  </div>
                )}

                {/* Promo codes list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {deals.map(d => (
                    <div 
                      key={d.id}
                      className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft flex flex-col justify-between hover:shadow-card hover:-translate-y-0.5 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-100">
                              {d.discount}
                            </span>
                            <h4 className="font-display font-black text-dark-900 text-lg mt-2 tracking-wide">{d.code}</h4>
                          </div>
                          
                          {/* Active badge */}
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            d.active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {d.active ? 'Active' : 'Disabled'}
                          </span>
                        </div>

                        <p className="text-dark-500 text-[11px] leading-relaxed mt-3 font-semibold">{d.description}</p>
                        
                        <div className="border-t border-dark-100 pt-4 mt-4 text-[10px] font-bold text-dark-400 space-y-1.5">
                          <p>APPLIED BOOKINGS: {d.bookings_applied}</p>
                          <p>EXPIRY: {d.expiry}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleToggleDealStatus(d.id)}
                        className={`mt-6 w-full h-10 border rounded-xl text-xs font-bold transition-all ${
                          d.active 
                            ? 'border-red-105 text-red-500 hover:bg-red-50' 
                            : 'border-sage-200 text-sage-600 hover:bg-sage-50'
                        }`}
                      >
                        {d.active ? 'Deactivate Coupon' : 'Activate Coupon'}
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: SETTINGS & PROFILE */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-8 animate-fade-up">
                
                <div>
                  <h3 className="font-display font-black text-dark-900 text-lg">Business Settings</h3>
                  <p className="text-dark-500 text-xs font-medium">Update business information and bank account payouts setup.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* General Profile fields */}
                  <div className="space-y-4">
                    <h4 className="font-display font-black text-sage-900 text-sm border-b border-dark-100 pb-2">Business Information</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Business Name</label>
                      <input
                        type="text"
                        value={settingsForm.business_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, business_name: e.target.value })}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Location</label>
                      <input
                        type="text"
                        value={settingsForm.location}
                        onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Business Biography (Bio)</label>
                      <textarea
                        value={settingsForm.bio}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Financial & Social fields */}
                  <div className="space-y-6">
                    
                    {/* Bank Payout settings */}
                    <div className="space-y-4">
                      <h4 className="font-display font-black text-sage-900 text-sm border-b border-dark-100 pb-2">Bank & Tax Verification</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-dark-500 uppercase">GST Number</label>
                          <input
                            type="text"
                            value={settingsForm.gst_number}
                            onChange={(e) => setSettingsForm({ ...settingsForm, gst_number: e.target.value })}
                            placeholder="e.g. 29AAAAA1111A1Z1"
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-dark-500 uppercase">PAN Number</label>
                          <input
                            type="text"
                            value={settingsForm.pan_number}
                            onChange={(e) => setSettingsForm({ ...settingsForm, pan_number: e.target.value })}
                            placeholder="e.g. ABCDE1234F"
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-dark-500 uppercase">Bank Account No.</label>
                          <input
                            type="text"
                            value={settingsForm.bank_account}
                            onChange={(e) => setSettingsForm({ ...settingsForm, bank_account: e.target.value })}
                            placeholder="Bank Account Number"
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-dark-500 uppercase">IFSC Code</label>
                          <input
                            type="text"
                            value={settingsForm.ifsc}
                            onChange={(e) => setSettingsForm({ ...settingsForm, ifsc: e.target.value })}
                            placeholder="IFSC Code"
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Media links */}
                    <div className="space-y-4">
                      <h4 className="font-display font-black text-sage-900 text-sm border-b border-dark-100 pb-2">Social Profiles</h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-2 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                          <Instagram className="w-4 h-4 text-sage-600" />
                          <input
                            type="text"
                            value={settingsForm.instagram}
                            onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                            className="bg-transparent text-sm w-full outline-none font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                          <Facebook className="w-4 h-4 text-sage-600" />
                          <input
                            type="text"
                            value={settingsForm.facebook}
                            onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                            className="bg-transparent text-sm w-full outline-none font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                          <Globe className="w-4 h-4 text-sage-600" />
                          <input
                            type="text"
                            value={settingsForm.website}
                            onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                            className="bg-transparent text-sm w-full outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="border-t border-dark-100 pt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-cream-200 text-dark-700 rounded-xl text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveSettings}
                    className="px-8 py-2.5 bg-gradient-brand text-white rounded-xl text-sm font-bold shadow-soft"
                  >
                    Save Changes
                  </button>
                </div>

              </div>
            )}

            {/* TAB: SUPPORT / HELP */}
            {activeTab === 'support' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up">
                
                {/* Tickets registry list */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Create Ticket */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-4">
                    <h3 className="font-display font-black text-dark-900 text-base">Register Support Ticket</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Support Category</label>
                        <select
                          value={supportForm.category}
                          onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                        >
                          <option value="Payments">Payments & Payouts</option>
                          <option value="Profile Settings">Profile Listing</option>
                          <option value="Booking System">Booking Disputes</option>
                          <option value="General">General Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Subject / Brief title</label>
                        <input
                          type="text"
                          placeholder="What issue are you facing?"
                          value={supportForm.subject}
                          onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Detailed Description</label>
                        <textarea
                          placeholder="Describe the problem in detail so our partner support team can assist you."
                          value={supportForm.message}
                          onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                          rows={4}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 text-sm mt-1.5 outline-none font-medium resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleAddSupportTicket}
                        className="px-6 py-2.5 bg-gradient-brand text-white rounded-xl text-xs font-black shadow-soft"
                      >
                        Submit Ticket
                      </button>
                    </div>
                  </div>

                  {/* Past Support Tickets */}
                  <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft">
                    <h3 className="font-display font-black text-dark-900 text-base mb-4">Past Tickets</h3>
                    
                    <div className="divide-y divide-dark-100">
                      {supportTickets.map(t => (
                        <div key={t.id} className="py-4 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-dark-900">{t.subject}</p>
                            <p className="text-dark-500 text-[10px] font-semibold mt-1">Ref: {t.id} · Cat: {t.category} · {t.created_at}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full font-black uppercase ${
                            t.status === 'Open' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-dark-50 text-dark-600 border border-dark-150'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* FAQ side panel */}
                <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-soft space-y-6">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-base">Frequently Asked Questions</h3>
                    <p className="text-dark-500 text-xs font-semibold mt-0.5">Quick guides to help manage your partner dashboard.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { q: 'How do payouts work?', a: 'Once an event is successfully completed, the funds are automatically released to your registered bank account via Stripe within 48 hours.' },
                      { q: 'Can I block holiday dates?', a: 'Yes! Go to the Calendar tab and click on specific dates to block them. They will immediately show as booked/unavailable to customers.' },
                      { q: 'How do I add multiple listing services?', a: 'Navigate to the Packages tab and click "Add New Package". Each package goes live instantly.' }
                    ].map((faq, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-bold text-sage-900 text-xs">Q: {faq.q}</p>
                        <p className="text-dark-500 text-[11px] font-semibold leading-relaxed">A: {faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-dark-100 z-50 flex justify-around items-center">
        {[
          { id: 'dashboard', label: 'Home', icon: Building2 },
          { id: 'bookings', label: 'Bookings', icon: Calendar },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'earnings', label: 'Earnings', icon: DollarSign },
          { id: 'settings', label: 'Profile', icon: Settings },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center gap-1 ${
                isActive ? 'text-sage-600 font-bold' : 'text-dark-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Booking Details Dialog / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 border border-dark-100 shadow-card max-w-md w-full animate-scale-in space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-sage-700 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-100">
                  {selectedBooking.booking_ref}
                </span>
                <h3 className="font-display font-black text-dark-900 text-lg mt-2">Booking Details</h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1 hover:bg-cream-100 rounded-lg text-dark-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-dark-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Customer Name</p>
                  <p className="text-sm font-bold text-dark-950 mt-1">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Event Date</p>
                  <p className="text-sm font-bold text-dark-950 mt-1">{selectedBooking.event_date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Email Address</p>
                  <p className="text-sm font-bold text-dark-950 mt-1">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Phone Number</p>
                  <p className="text-sm font-bold text-dark-950 mt-1">{selectedBooking.customer_phone}</p>
                </div>
              </div>

              <div className="border-t border-dark-100 pt-4">
                <p className="text-[10px] font-bold text-dark-400 uppercase">Event / Package Service</p>
                <p className="text-sm font-bold text-dark-950 mt-1">{selectedBooking.event_type}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-dark-400 uppercase">Guest Count</p>
                <p className="text-sm font-bold text-dark-950 mt-1">{selectedBooking.guests} Guests</p>
              </div>

              {selectedBooking.special_requests && (
                <div className="bg-cream-50 border border-cream-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Special Instructions</p>
                  <p className="text-dark-800 leading-relaxed mt-1">"{selectedBooking.special_requests}"</p>
                </div>
              )}

              <div className="border-t border-dark-100 pt-4 flex justify-between items-center text-sm">
                <div>
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Payment Status</p>
                  <p className="text-xs font-black uppercase text-emerald-600 mt-0.5">{selectedBooking.payment_status}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-dark-400 uppercase">Total Amount</p>
                  <p className="text-base font-black text-dark-900 mt-0.5">₹{selectedBooking.total_amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedBooking(null)}
              className="w-full h-11 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-all shadow-soft"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
