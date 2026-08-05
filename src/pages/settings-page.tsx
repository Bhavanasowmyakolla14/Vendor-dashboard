import { motion } from 'framer-motion';
import { Settings, Camera, User, Mail, Phone, MapPin, Building2, Shield, Bell, CreditCard, Check } from 'lucide-react';
import { useRef, useState } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" icon={Settings} />

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                activeTab === tab.id ? 'bg-sage-600 text-white shadow-glow-sage' : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile photo upload */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-dark-900">Profile Photo</h3>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-2xl font-bold text-white shadow-glow-sage">
                  {photo ? (
                    <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    'AS'
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-sage-600 text-white shadow-md transition-colors hover:bg-sage-700"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-900">Upload your photo</p>
                <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 5MB. Square images work best.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
                  >
                    Choose File
                  </button>
                  {photo && (
                    <button
                      onClick={() => setPhoto(null)}
                      className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-dark-700 hover:bg-muted"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-dark-900">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Full Name', value: 'Aarav Sharma', icon: User },
                { label: 'Email', value: 'aarav@festivo.com', icon: Mail },
                { label: 'Phone', value: '+91 98765 43210', icon: Phone },
                { label: 'City', value: 'Mumbai, Maharashtra', icon: MapPin },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label}>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-dark-700">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {field.label}
                    </label>
                    <input
                      defaultValue={field.value}
                      className="h-11 w-full rounded-xl border border-border bg-cream-50 px-4 text-sm text-dark-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-dark-700 hover:bg-muted">Cancel</button>
              <button className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sage hover:bg-sage-700">
                <Check className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'business' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Business Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Business Name', value: 'Aarav Studios' },
              { label: 'GST Number', value: '27ABCDE1234F1Z5' },
              { label: 'Service Category', value: 'Photography & Videography' },
              { label: 'Years of Experience', value: '8 years' },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">{f.label}</label>
                <input defaultValue={f.value} className="h-11 w-full rounded-xl border border-border bg-cream-50 px-4 text-sm text-dark-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Security Settings</h3>
          <div className="space-y-4">
            {[
              { label: 'Current Password', placeholder: 'Enter current password' },
              { label: 'New Password', placeholder: 'Enter new password' },
              { label: 'Confirm Password', placeholder: 'Re-enter new password' },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">{f.label}</label>
                <input type="password" placeholder={f.placeholder} className="h-11 w-full rounded-xl border border-border bg-cream-50 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            ))}
            <button className="rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sage hover:bg-sage-700">Update Password</button>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Notification Preferences</h3>
          <div className="space-y-3">
            {['New booking requests', 'Payment received', 'New reviews', 'Package viewed', 'Marketing emails'].map((pref, i) => (
              <div key={pref} className="flex items-center justify-between rounded-xl border border-border bg-cream-50/50 p-3.5">
                <span className="text-sm font-medium text-dark-700">{pref}</span>
                <button className={cn('relative h-7 w-12 rounded-full transition-colors', i < 4 ? 'bg-sage-600' : 'bg-dark-200')}>
                  <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform', i < 4 ? 'left-6' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'payments' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-cream-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50"><CreditCard className="h-5 w-5 text-sage-600" /></div>
                <div><p className="text-sm font-semibold text-dark-900">HDFC Bank ****4321</p><p className="text-xs text-muted-foreground">Default payout account</p></div>
              </div>
              <span className="rounded-full bg-sage-50 px-2.5 py-1 text-[11px] font-semibold text-sage-700">Active</span>
            </div>
            <button className="w-full rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-sage-400 hover:text-sage-600">+ Add Payment Method</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
