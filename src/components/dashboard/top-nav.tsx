import { motion } from 'framer-motion';
import { Search, Bell, Wallet, Menu, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

interface TopNavProps {
  onMenuClick: () => void;
  notifCount: number;
}

export function TopNav({ onMenuClick, notifCount }: TopNavProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Greeting */}
      <div className="hidden sm:block">
        <motion.h2
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-dark-900 sm:text-2xl"
        >
          Good Morning, Aarav
        </motion.h2>
        <p className="text-sm text-muted-foreground">Manage your business effortlessly.</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings, clients..."
            className="h-11 w-64 rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-80"
          />
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          {notifCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">
              {notifCount}
            </span>
          )}
        </button>

        {/* Wallet */}
        <button
          onClick={() => navigate('/earnings')}
          className="hidden h-11 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-dark-900 transition-colors hover:bg-muted sm:flex"
        >
          <Wallet className="h-4 w-4 text-primary" />
          ₹2,48,500
        </button>

        {/* Avatar with photo upload */}
        <div className="relative">
          <button
            onClick={() => navigate('/settings')}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-sm font-bold text-white shadow-glow-sage ring-2 ring-white"
          >
            {photo ? (
              <img src={photo} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              'AS'
            )}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-sage-600 text-white shadow-sm transition-colors hover:bg-sage-700"
            title="Upload profile photo"
          >
            <Camera className="h-2.5 w-2.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}
