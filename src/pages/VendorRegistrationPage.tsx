import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Camera, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, Sparkles, AlertCircle, Store, Tag, Clock, Mail,
  Globe, Shield, Phone, Landmark, FileText, Check,
  Instagram, Facebook, Youtube, Linkedin, Twitter
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const CATEGORIES_LIST = [
  'Wedding Planner',
  'Photographer',
  'Videographer',
  'Caterer',
  'Decorator',
  'Makeup Artist',
  'Venue',
  'DJ',
  'Entertainment',
  'Invitation Designer',
  'Mehendi Artist',
  'Transportation',
  'Event Rental'
];

const SERVICE_AREAS_OPTIONS = ['Bangalore', 'Hyderabad', 'Chennai', 'Mysore'];
const EXPERIENCE_OPTIONS = ['Fresher', '1–2 Years', '3–5 Years', '5–10 Years', '10+ Years'];
const TEAM_SIZE_OPTIONS = ['Individual', '2–5 Members', '6–10 Members', '10+'];
const LANGUAGES_OPTIONS = ['English', 'Telugu', 'Hindi', 'Kannada', 'Tamil'];
const PRICE_TYPES = ['Per Hour', 'Per Day', 'Per Event', 'Package'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function VendorRegistrationPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Account Information
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Business Information
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('Wedding Planner');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');

  // Step 3: Business Address
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 4: Contact Information
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactAltMobile, setContactAltMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Step 5: Service Information
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [experience, setExperience] = useState('Fresher');
  const [teamSize, setTeamSize] = useState('Individual');
  const [languages, setLanguages] = useState<string[]>([]);

  // Step 6: Pricing
  const [priceAmount, setPriceAmount] = useState('');
  const [priceType, setPriceType] = useState('Per Event');

  // Step 7: Portfolio
  const [logoUrl, setLogoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Cover Banner
  const [galleryUrls, setGalleryUrls] = useState(''); // Portfolio Images (max 20)
  const [videoUrls, setVideoUrls] = useState(''); // Videos (max 5)
  const [brochureUrl, setBrochureUrl] = useState(''); // Brochure

  // Step 8: Business Verification (KYC)
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState('');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [gstUrl, setGstUrl] = useState('');
  const [regCertUrl, setRegCertUrl] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccNum, setBankAccNum] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState('');

  // Step 9: Social Media (Optional)
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  // Step 10: Availability
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [workingStart, setWorkingStart] = useState('09:00');
  const [workingEnd, setWorkingEnd] = useState('18:00');

  // Step 11: Terms & Conditions
  const [confirmCorrect, setConfirmCorrect] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // File Upload Animation states
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'logo') setLogoUrl(base64String);
      else if (type === 'cover') setImageUrl(base64String);
      else if (type === 'aadhaarF') setAadhaarFrontUrl(base64String);
      else if (type === 'aadhaarB') setAadhaarBackUrl(base64String);
      else if (type === 'pan') setPanUrl(base64String);
      else if (type === 'cheque') setCancelledChequeUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (currentStep < 11) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleToggleServiceArea = (area: string) => {
    if (serviceAreas.includes(area)) {
      setServiceAreas(serviceAreas.filter(a => a !== area));
    } else {
      setServiceAreas([...serviceAreas, area]);
    }
  };

  const handleToggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleToggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 11) return;
    setSubmitting(true);
    setError('');

    const formattedBusinessName = businessName.trim() || 'Festivo Partner Vendor';
    const slug = formattedBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
    const tags = [category, subcategory, experience, city].filter(Boolean);
    const gallery = galleryUrls ? galleryUrls.split(',').map(u => u.trim()).filter(Boolean) : (imageUrl ? [imageUrl] : []);

    const newVendor = {
      name: formattedBusinessName,
      category,
      location: city || state || 'India',
      price_amount: parseFloat(priceAmount) || 12000,
      price_label: priceType.toLowerCase(),
      price_unit: '₹',
      rating: 5.0,
      reviews: 0,
      image: logoUrl || imageUrl || '',
      gallery,
      tags,
      description: description || 'No business description provided yet.',
      verified: false,
      badge: 'Pending Review',
      badge_color: 'bg-gold-500',
      capacity: teamSize,
      experience_years: experience.includes('Years') ? parseInt(experience, 10) : 1,
      slug,
      // Store all custom form step values within details object for administration view
      details: {
        email: businessEmail,
        phone: businessPhone,
        ownerName,
        subcategory,
        address,
        country,
        state,
        city,
        pincode,
        contactPerson,
        contactMobile,
        contactAltMobile,
        contactEmail,
        website,
        experience,
        teamSize,
        serviceAreas,
        languages,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        panUrl,
        gstUrl,
        regCertUrl,
        bankHolderName,
        bankAccNum,
        bankIfsc,
        bankName,
        cancelledChequeUrl,
        instagram,
        facebook,
        youtube,
        linkedin,
        twitter,
        workingDays,
        workingHours: `${workingStart} - ${workingEnd}`,
      }
    };

    // Save to local pending storage for MVC logic
    try {
      const localPending = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
      localStorage.setItem('festivo_pending_vendors', JSON.stringify([...localPending, { ...newVendor, id: crypto.randomUUID() }]));
      
      // Attempt db write
      await supabase.from('vendors').insert(newVendor);
    } catch (err) {
      console.warn('Persistence log:', err);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const stepsList = [
    { num: 1, title: 'Account' },
    { num: 2, title: 'Business' },
    { num: 3, title: 'Address' },
    { num: 4, title: 'Contacts' },
    { num: 5, title: 'Services' },
    { num: 6, title: 'Pricing' },
    { num: 7, title: 'Portfolio' },
    { num: 8, title: 'KYC & Bank' },
    { num: 9, title: 'Socials' },
    { num: 10, title: 'Availability' },
    { num: 11, title: 'Finalize' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-24 pb-16">
        {/* Banner */}
        <div className="bg-gradient-to-br from-sage-900 via-sage-800 to-dark-900 py-10 relative overflow-hidden">
          <div className="orb w-96 h-96 bg-gold-500/10 -top-20 -right-20" />
          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 text-sage-300 hover:text-white transition-colors mb-3 group text-sm font-bold animate-fade-in"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </button>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1 text-gold-300 text-xs font-bold mb-3 shadow-sm">
              <Store className="w-3.5 h-3.5" /> Enrolled Business Partner
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              Vendor Enrollment <span className="text-gradient-gold">Application</span>
            </h1>
            <p className="text-sage-200 text-sm max-w-xl mx-auto font-medium">
              Complete the registration form to submit your portfolio. All fields are optional to facilitate easy testing.
            </p>
          </div>
        </div>

        {/* Multi-step Stepper */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl shadow-soft p-4 border border-sage-100/60 overflow-x-auto flex justify-between gap-2 scrollbar-none">
            {stepsList.map(step => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className="flex flex-col items-center flex-1 min-w-[70px] transition-all"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 mb-1.5 transition-all ${
                    isActive 
                      ? 'bg-sage-800 text-white border-sage-800 shadow-glow scale-110' 
                      : isCompleted 
                        ? 'bg-sage-100 text-sage-800 border-sage-200' 
                        : 'bg-white text-dark-400 border-sage-200 hover:border-sage-400'
                  }`}>
                    {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[3]" /> : step.num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-sage-900 font-extrabold' : 'text-dark-400'}`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Jump for Testing */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs font-bold text-dark-500">
            <span>Quick Navigator (Testing):</span>
            <select
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value))}
              className="bg-white border border-sage-200 rounded-lg px-2 py-1 outline-none text-sage-900 font-bold focus:ring-1 focus:ring-sage-400 cursor-pointer"
            >
              {stepsList.map(s => (
                <option key={s.num} value={s.num}>Step {s.num}: {s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto px-4 mt-6">
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-card p-10 text-center border border-sage-200 animate-scale-in">
              <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-sage-600 animate-pulse" />
              </div>
              <h2 className="font-display text-3xl font-bold text-sage-900 mb-3">Application Logged!</h2>
              <p className="text-dark-600 text-base max-w-lg mx-auto mb-6 font-medium leading-relaxed">
                Your business profile listing has been created as <b>"{businessName || 'Festivo Partner Vendor'}"</b> and sent to the Admin verification panel.
              </p>
              <div className="bg-sage-50 rounded-2xl p-5 border border-sage-200 max-w-md mx-auto mb-8 text-left space-y-2.5">
                <p className="text-xs font-bold text-sage-800 uppercase tracking-wider">Next Step Guidelines</p>
                <div className="flex items-start gap-2 text-xs text-dark-700">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <span>Admin verifies registrations and business details in the admin portal.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-dark-700">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <span>Approved listings appear immediately under the selected categories.</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/vendor-dashboard')}
                  className="px-8 py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all"
                >
                  Go to Vendor Dashboard
                </button>
                <button
                  onClick={() => { setSubmitted(false); setCurrentStep(1); }}
                  className="px-6 py-3.5 bg-sage-100 hover:bg-sage-200 text-sage-800 font-bold rounded-xl transition-all"
                >
                  Fill New Form
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-card p-6 md:p-8 border border-sage-200">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* STEP 1: Account Information */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 1: Account Information</h3>
                        <p className="text-dark-400 text-xs font-medium">Create your vendor portal credentials</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Business Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. contact@yourbusiness.com"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Password</label>
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Confirm Password</label>
                          <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Business Information */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 2: Business Information</h3>
                        <p className="text-dark-400 text-xs font-medium">Basic details regarding your operations</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Business Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Rosewood Events"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Owner Name</label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Business Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 bg-white font-medium cursor-pointer"
                          >
                            {CATEGORIES_LIST.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Business Subcategory</label>
                          <input
                            type="text"
                            placeholder="e.g. Candid Wedding, Luxury Cakes"
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Business Description</label>
                        <textarea
                          rows={3}
                          placeholder="Tell customers about your services, specializations, and unique offerings..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Business Address */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 3: Business Address</h3>
                        <p className="text-dark-400 text-xs font-medium">Where is your base location or main studio?</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Country</label>
                          <input
                            type="text"
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">State</label>
                          <input
                            type="text"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">City</label>
                          <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3">
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Complete Address</label>
                          <input
                            type="text"
                            placeholder="Street, Landmark, Building Details"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Pincode</label>
                          <input
                            type="text"
                            placeholder="6-digit PIN"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Contact Information */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 4: Contact Information</h3>
                        <p className="text-dark-400 text-xs font-medium">Customer support and inquiries contact points</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Contact Person</label>
                          <input
                            type="text"
                            placeholder="Full name of representative"
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Mobile Number</label>
                          <input
                            type="tel"
                            placeholder="Mobile"
                            value={contactMobile}
                            onChange={(e) => setContactMobile(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Alternate Mobile Number</label>
                          <input
                            type="tel"
                            placeholder="Alt mobile (Optional)"
                            value={contactAltMobile}
                            onChange={(e) => setContactAltMobile(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Business Email</label>
                          <input
                            type="email"
                            placeholder="Email address for inquiries"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Website (Optional)</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                          <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Service Information */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 5: Service Information</h3>
                        <p className="text-dark-400 text-xs font-medium">Define your operational capability and language preferences</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Service Areas (Multi-select) */}
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-2">Service Areas (Multi-select)</label>
                        <div className="flex flex-wrap gap-2">
                          {SERVICE_AREAS_OPTIONS.map(area => {
                            const selected = serviceAreas.includes(area);
                            return (
                              <button
                                key={area}
                                type="button"
                                onClick={() => handleToggleServiceArea(area)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  selected 
                                    ? 'bg-sage-800 text-white border-sage-800 shadow-sm' 
                                    : 'bg-white text-sage-800 border-sage-200 hover:border-sage-300'
                                }`}
                              >
                                {area}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Experience and Team Size */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Experience</label>
                          <select
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 bg-white font-medium cursor-pointer"
                          >
                            {EXPERIENCE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Team Size</label>
                          <select
                            value={teamSize}
                            onChange={(e) => setTeamSize(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 bg-white font-medium cursor-pointer"
                          >
                            {TEAM_SIZE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Languages Spoken (Checkbox) */}
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-2">Languages Spoken</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-sage-50/50 p-4 rounded-2xl border border-sage-100">
                          {LANGUAGES_OPTIONS.map(lang => {
                            const checked = languages.includes(lang);
                            return (
                              <label key={lang} className="flex items-center gap-2 text-xs font-bold text-dark-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleLanguage(lang)}
                                  className="w-4 h-4 rounded border-sage-300 text-sage-800 focus:ring-sage-500 accent-sage-800"
                                />
                                {lang}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Pricing */}
                {currentStep === 6 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 6: Pricing</h3>
                        <p className="text-dark-400 text-xs font-medium">State your starting price amount and structure</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Starting Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 25000"
                          value={priceAmount}
                          onChange={(e) => setPriceAmount(e.target.value)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-bold text-sage-900"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Price Type</label>
                        <select
                          value={priceType}
                          onChange={(e) => setPriceType(e.target.value)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 bg-white font-medium cursor-pointer"
                        >
                          {PRICE_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Portfolio */}
                {currentStep === 7 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 7: Portfolio</h3>
                        <p className="text-dark-400 text-xs font-medium">Link or simulate uploading visual samples of your works</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Logo Upload */}
                      <div className="bg-sage-50/50 p-4 rounded-2xl border border-dashed border-sage-200 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-dark-700">Business Logo</h4>
                          <p className="text-[10px] text-dark-400">Square layout recommended (PNG/JPG)</p>
                          {logoUrl && <span className="text-[10px] text-sage-700 font-bold">✓ Logo uploaded / selected</span>}
                        </div>
                        <label className="px-4 py-2 bg-sage-800 text-white rounded-xl text-xs font-bold hover:bg-sage-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          {logoUrl ? 'Change Logo' : 'Upload File'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo')}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Cover Banner Upload */}
                      <div className="bg-sage-50/50 p-4 rounded-2xl border border-dashed border-sage-200 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-dark-700">Cover Banner</h4>
                          <p className="text-[10px] text-dark-400">Landscape banner for the top of profile listing</p>
                          {imageUrl && <span className="text-[10px] text-sage-700 font-bold">✓ Cover banner uploaded / selected</span>}
                        </div>
                        <label className="px-4 py-2 bg-sage-800 text-white rounded-xl text-xs font-bold hover:bg-sage-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          {imageUrl ? 'Change Banner' : 'Upload File'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'cover')}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Manual URLs for Advanced Users */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Portfolio Images (Max 20, comma-separated URLs)</label>
                          <input
                            type="text"
                            placeholder="https://image1.jpg, https://image2.jpg"
                            value={galleryUrls}
                            onChange={(e) => setGalleryUrls(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Videos (Max 5, comma-separated URLs)</label>
                          <input
                            type="text"
                            placeholder="https://youtube.com/watch?v=..., https://vimeo.com/..."
                            value={videoUrls}
                            onChange={(e) => setVideoUrls(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Brochure Link (PDF URL)</label>
                          <input
                            type="url"
                            placeholder="https://example.com/brochure.pdf"
                            value={brochureUrl}
                            onChange={(e) => setBrochureUrl(e.target.value)}
                            className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: Business Verification (KYC) */}
                {currentStep === 8 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 8: Business Verification (KYC) & Bank</h3>
                        <p className="text-dark-400 text-xs font-medium">Submit government credentials & payouts details</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Document Upload Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-sage-50/30 p-3.5 rounded-xl border border-sage-200/60 flex flex-col justify-between">
                          <span className="text-xs font-bold text-dark-700 block mb-1">Aadhaar Card (Front)</span>
                          <label className="w-full py-2 bg-sage-800 text-white rounded-lg text-xs font-bold hover:bg-sage-700 transition-all flex items-center justify-center gap-1 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            {aadhaarFrontUrl ? 'Uploaded ✓' : 'Upload Front'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'aadhaarF')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="bg-sage-50/30 p-3.5 rounded-xl border border-sage-200/60 flex flex-col justify-between">
                          <span className="text-xs font-bold text-dark-700 block mb-1">Aadhaar Card (Back)</span>
                          <label className="w-full py-2 bg-sage-800 text-white rounded-lg text-xs font-bold hover:bg-sage-700 transition-all flex items-center justify-center gap-1 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            {aadhaarBackUrl ? 'Uploaded ✓' : 'Upload Back'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'aadhaarB')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1">PAN Card Link/File</label>
                          <label className="w-full py-2.5 bg-sage-800 hover:bg-sage-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" /> {panUrl ? 'Change PAN ✓' : 'Upload PAN'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'pan')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1">GST Certificate (Optional)</label>
                          <input
                            type="text"
                            placeholder="GST Certificate URL"
                            value={gstUrl}
                            onChange={(e) => setGstUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1">Reg. Certificate (Optional)</label>
                          <input
                            type="text"
                            placeholder="Registration URL"
                            value={regCertUrl}
                            onChange={(e) => setRegCertUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>
                      </div>

                      {/* Bank Details section */}
                      <div className="bg-sage-50/50 p-4 rounded-2xl border border-sage-100 space-y-3 mt-2">
                        <h4 className="text-xs font-bold text-sage-900 flex items-center gap-1.5 uppercase tracking-wider">
                          <Landmark className="w-4 h-4" /> Bank Account Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-dark-700 font-bold text-[10px] mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              placeholder="Account Holder"
                              value={bankHolderName}
                              onChange={(e) => setBankHolderName(e.target.value)}
                              className="w-full px-3 py-2 border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-300 font-medium bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-dark-700 font-bold text-[10px] mb-1">Account Number</label>
                            <input
                              type="text"
                              placeholder="Acc Number"
                              value={bankAccNum}
                              onChange={(e) => setBankAccNum(e.target.value)}
                              className="w-full px-3 py-2 border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-300 font-medium bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-dark-700 font-bold text-[10px] mb-1">IFSC Code</label>
                            <input
                              type="text"
                              placeholder="IFSC Code"
                              value={bankIfsc}
                              onChange={(e) => setBankIfsc(e.target.value)}
                              className="w-full px-3 py-2 border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-300 font-medium bg-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-dark-700 font-bold text-[10px] mb-1">Bank Name</label>
                            <input
                              type="text"
                              placeholder="e.g. State Bank of India"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full px-3 py-2 border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-300 font-medium bg-white"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-sage-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-dark-700 block">Cancelled Cheque / Passbook Image</span>
                            {cancelledChequeUrl && <span className="text-[9px] text-sage-700 font-bold">✓ Cheque copy selected</span>}
                          </div>
                          <label className="px-4 py-2 bg-sage-800 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            {cancelledChequeUrl ? 'Change Cheque Image' : 'Upload File'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'cheque')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 9: Social Media */}
                {currentStep === 9 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 9: Social Media (Optional)</h3>
                        <p className="text-dark-400 text-xs font-medium">Link your business social handles for extra credibility</p>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-650">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="Instagram Profile URL"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className="flex-1 px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                          <Facebook className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="Facebook Page URL"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          className="flex-1 px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                          <Youtube className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="YouTube Channel URL"
                          value={youtube}
                          onChange={(e) => setYoutube(e.target.value)}
                          className="flex-1 px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                          <Linkedin className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="LinkedIn Company Page URL"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="flex-1 px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark-50 flex items-center justify-center text-dark-900">
                          <Twitter className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="X (Twitter) Profile URL"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="flex-1 px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 10: Availability */}
                {currentStep === 10 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 10: Availability</h3>
                        <p className="text-dark-400 text-xs font-medium">State your active operational days and working hours</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Working Days */}
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-2">Working Days</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {WEEKDAYS.map(day => {
                            const checked = workingDays.includes(day);
                            return (
                              <label key={day} className="flex items-center gap-2 text-xs font-bold text-dark-700 cursor-pointer bg-sage-50/50 p-2.5 rounded-xl border border-sage-100">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleWorkingDay(day)}
                                  className="w-4 h-4 rounded border-sage-300 text-sage-800 focus:ring-sage-500 accent-sage-800"
                                />
                                {day.substring(0, 3)}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Working Hours */}
                      <div>
                        <label className="block text-dark-700 font-bold text-xs mb-2">Working Hours</label>
                        <div className="grid grid-cols-2 gap-4 bg-sage-50/30 p-4 rounded-2xl border border-sage-200/60">
                          <div>
                            <label className="block text-[10px] text-dark-500 font-bold mb-1">Start Time</label>
                            <input
                              type="time"
                              value={workingStart}
                              onChange={(e) => setWorkingStart(e.target.value)}
                              className="w-full px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-dark-500 font-bold mb-1">End Time</label>
                            <input
                              type="time"
                              value={workingEnd}
                              onChange={(e) => setWorkingEnd(e.target.value)}
                              className="w-full px-4 py-2 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 11: Terms & Conditions */}
                {currentStep === 11 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-sage-900">Step 11: Terms & Conditions</h3>
                        <p className="text-dark-400 text-xs font-medium">Verify your entries and finalize submission</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 bg-sage-50/50 p-5 rounded-2xl border border-sage-100">
                      <label className="flex items-start gap-2 text-xs font-bold text-dark-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmCorrect}
                          onChange={(e) => setConfirmCorrect(e.target.checked)}
                          className="w-4 h-4 rounded border-sage-300 text-sage-800 focus:ring-sage-500 mt-0.5 accent-sage-800"
                        />
                        <span>I confirm all information provided is correct.</span>
                      </label>

                      <label className="flex items-start gap-2 text-xs font-bold text-dark-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 rounded border-sage-300 text-sage-800 focus:ring-sage-500 mt-0.5 accent-sage-800"
                        />
                        <span>I agree to the Terms & Conditions.</span>
                      </label>

                      <label className="flex items-start gap-2 text-xs font-bold text-dark-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={(e) => setAgreePrivacy(e.target.checked)}
                          className="w-4 h-4 rounded border-sage-300 text-sage-800 focus:ring-sage-500 mt-0.5 accent-sage-800"
                        />
                        <span>I agree to the Privacy Policy.</span>
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 font-bold text-xs animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Controls */}
                <div className="pt-4 flex justify-between items-center border-t border-sage-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2.5 bg-sage-100 hover:bg-sage-200 text-sage-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 11 ? (
                    <button
                      key="btn-next"
                      type="button"
                      onClick={handleNext}
                      className="px-7 py-2.5 bg-sage-800 hover:bg-sage-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      key="btn-submit"
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 bg-gradient-brand text-white font-bold text-sm rounded-xl hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5 shadow-md"
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Enrollment Application'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
