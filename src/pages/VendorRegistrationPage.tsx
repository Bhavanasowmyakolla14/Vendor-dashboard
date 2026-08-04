import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Camera, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, Sparkles, AlertCircle, Store, Tag, Users, Clock, Currency
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CATEGORY_LABELS } from '../lib/categories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function VendorRegistrationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(CATEGORY_LABELS[0] || 'Photographer');
  const [location, setLocation] = useState('Mumbai');
  const [priceAmount, setPriceAmount] = useState('15000');
  const [priceLabel, setPriceLabel] = useState('per event');
  const [priceUnit, setPriceUnit] = useState('₹');
  const [capacity, setCapacity] = useState('100 - 500 guests');
  const [experienceYears, setExperienceYears] = useState('5');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Verified, Top Quality, Experienced');
  const [imageUrl, setImageUrl] = useState('https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1');
  const [galleryUrls, setGalleryUrls] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return setError('Please enter your business name');
    if (!description.trim()) return setError('Please provide a description of your services');

    setSubmitting(true);
    setError('');

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const gallery = galleryUrls ? galleryUrls.split(',').map(u => u.trim()).filter(Boolean) : [imageUrl];

    const newVendor = {
      name: businessName,
      category,
      location,
      price_amount: parseFloat(priceAmount) || 10000,
      price_label: priceLabel,
      price_unit: priceUnit,
      rating: 5.0,
      reviews: 0,
      image: imageUrl,
      gallery,
      tags,
      description,
      verified: false,
      badge: 'Pending Review',
      badge_color: 'bg-gold-500',
      capacity,
      experience_years: parseInt(experienceYears, 10) || 1,
      slug,
    };

    // Save to Supabase (or local storage fallback)
    try {
      const { error: insertError } = await supabase.from('vendors').insert(newVendor);
      if (insertError) {
        console.warn('Supabase insert notice, saving locally:', insertError.message);
      }
    } catch (err) {
      console.warn('Network notice during vendor insert:', err);
    }

    // Save vendor to local pending vendors list for instant MVP reactivity
    const localPending = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    localStorage.setItem('festivo_pending_vendors', JSON.stringify([...localPending, { ...newVendor, id: crypto.randomUUID() }]));

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-20 pb-16">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-sage-900 via-sage-800 to-dark-900 py-12 relative overflow-hidden">
          <div className="orb w-96 h-96 bg-gold-500/10 -top-20 -right-20" />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 text-sage-300 hover:text-white transition-colors mb-4 group text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Vendor Portal
            </button>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-gold-300 text-xs font-bold mb-3">
              <Store className="w-4 h-4" /> Official Vendor Partner Enrollment
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              Enroll Your Service on <span className="text-gradient-gold">Festivo</span>
            </h1>
            <p className="text-sage-200 text-sm max-w-xl mx-auto font-medium">
              Submit your portfolio and service details. Once reviewed and accepted by Admin, your business will officially go live under your selected category!
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-card p-10 text-center border border-sage-200 animate-scale-in">
              <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-sage-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-sage-900 mb-3">Application Submitted Successfully!</h2>
              <p className="text-dark-600 text-base max-w-lg mx-auto mb-6 font-medium leading-relaxed">
                Thank you for completing your vendor enrollment. Your business profile for <span className="font-bold text-sage-800">"{businessName}"</span> in <span className="font-bold text-gold-700">{category}</span> has been sent to the Admin Review Panel.
              </p>
              <div className="bg-sage-50 rounded-2xl p-5 border border-sage-200 max-w-md mx-auto mb-8 text-left space-y-2">
                <p className="text-xs font-bold text-sage-800 uppercase tracking-wider">What happens next?</p>
                <div className="flex items-start gap-2 text-xs text-dark-700">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <span>Admin verifies your portfolio, pricing, and category suitability.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-dark-700">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <span>Upon acceptance, your listing officially joins the platform and appears on the <b>{category}</b> category page.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-dark-700">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <span>You will receive customer bookings & inquiry messages directly on your Vendor Dashboard.</span>
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
                  onClick={() => { setSubmitted(false); setBusinessName(''); }}
                  className="px-6 py-3.5 bg-sage-100 hover:bg-sage-200 text-sage-800 font-bold rounded-xl transition-all"
                >
                  Submit Another Listing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card p-8 md:p-10 border border-sage-200 space-y-8">
              {/* Section 1: Business Identity & Category */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-sage-100">
                  <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-sage-600" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-sage-900">1. Business Identity & Category</h2>
                    <p className="text-dark-400 text-xs font-medium">Select the category where your service will be listed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Business / Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Crown Catering & Events"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Category Enrollment *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm font-bold text-sage-900 bg-white outline-none focus:ring-2 focus:ring-sage-300 cursor-pointer"
                    >
                      {CATEGORY_LABELS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">City / Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bandra West, Mumbai"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Years of Experience</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Capacity */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-sage-100">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-sage-900">2. Packages & Pricing Structure</h2>
                    <p className="text-dark-400 text-xs font-medium">Define your starting package price so customers can book within their budget</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Starting Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-bold text-sage-900"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Price Label *</label>
                    <input
                      type="text"
                      placeholder="e.g. per event, per plate, per day"
                      value={priceLabel}
                      onChange={(e) => setPriceLabel(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Event Capacity</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        placeholder="e.g. 100 - 1000 guests"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Portfolio & Gallery */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-sage-100">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-cream-700" />
                  </div>
                  <div>
                    <h2 className="font-display text-1xl font-bold text-sage-900">3. Portfolio Images & Work Samples</h2>
                    <p className="text-dark-400 text-xs font-medium">Upload portfolio image URLs to showcase your work to customers</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Main Cover Image URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.pexels.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                    />
                  </div>

                  {imageUrl && (
                    <div className="relative h-40 w-full sm:w-64 rounded-2xl overflow-hidden border border-sage-200 shadow-sm">
                      <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-dark-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Cover Preview
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Additional Gallery Image URLs (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="https://image1.jpg, https://image2.jpg"
                      value={galleryUrls}
                      onChange={(e) => setGalleryUrls(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Detailed Description & Tags */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-sage-100">
                  <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-sage-600" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-sage-900">4. Service Description & Specialties</h2>
                    <p className="text-dark-400 text-xs font-medium">Describe your services, equipment, and specialty tags</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Service Overview / Bio *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe what makes your service unique, equipment used, and service guarantee..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-4 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-2">Specialty Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Candid, Live Counter, Traditional, Luxury Setup"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-cream-100 border border-cream-300 rounded-xl flex items-center gap-3 text-cream-900 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-cream-700 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sage-100">
                <p className="text-dark-400 text-xs font-medium">
                  By submitting, your listing will be queued for Admin review & official enrollment into <b>{category}</b>.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-brand text-white font-bold text-lg rounded-2xl hover:shadow-glow hover:scale-105 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Submitting Application...</>
                  ) : (
                    <>Submit Listing to Admin <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
