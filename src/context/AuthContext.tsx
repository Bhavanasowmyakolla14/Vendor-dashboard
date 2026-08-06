import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-client';

export type KycStatus = 'unverified' | 'pending' | 'verified';

export interface KycDocumentRecord {
  govtIdType: string;
  govtIdNumber: string;
  govtIdFile?: string;
  businessRegNumber?: string;
  businessRegFile?: string;
  bankProofFile?: string;
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  website: string;
  businessName: string;
  category: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  upiId: string;
  bankAccount: string;
  ifsc: string;
  usernameHistory: number[]; // Timestamps of username modifications
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_default_01',
  email: 'aarav.photography@luxuryweddings.in',
  fullName: 'Aarav Sharma',
  username: 'aarav.photography',
  website: 'https://royalmoments.in',
  businessName: 'Royal Moments Studio',
  category: 'Wedding & Event Photography',
  phone: '+91 98765 43210',
  location: 'Mumbai & Udaipur, India',
  bio: 'Award-winning destination wedding photographer capturing royal moments across India ✨📸',
  avatar: 'AS',
  upiId: 'aarav.sharma@okaxis',
  bankAccount: '•••• •••• 8842',
  ifsc: 'HDFC0001234',
  usernameHistory: [],
};

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  isAdminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;

  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, name: string, business: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  // Instagram Username Rules
  canChangeUsername: () => { allowed: boolean; remainingChanges: number; daysUntilReset?: number };
  changeUsername: (newUsername: string) => { success: boolean; message: string };

  // Admin KYC Approval State
  kycStatus: KycStatus;
  kycRecord: KycDocumentRecord | null;
  submitKycDocuments: (record: Omit<KycDocumentRecord, 'submittedAt'>) => void;
  adminApproveKyc: () => void;
  adminRejectKyc: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vendor_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_USER, ...parsed };
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vendor_is_authenticated') === 'true';
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);

  // KYC Verification State
  const [kycStatus, setKycStatus] = useState<KycStatus>(() => {
    const saved = localStorage.getItem('vendor_kyc_status');
    if (saved) return saved as KycStatus;
    return 'unverified';
  });

  const [kycRecord, setKycRecord] = useState<KycDocumentRecord | null>(() => {
    const saved = localStorage.getItem('vendor_kyc_record');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('vendor_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('vendor_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('vendor_kyc_status', kycStatus);
  }, [kycStatus]);

  useEffect(() => {
    if (kycRecord) {
      localStorage.setItem('vendor_kyc_record', JSON.stringify(kycRecord));
    }
  }, [kycRecord]);

  // Sync with Supabase Auth if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || prev.email,
          }));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || prev.email,
          }));
        } else {
          setIsAuthenticated(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Instagram Username Rule Check: Max 2 changes within 14 days
  const canChangeUsername = () => {
    const now = Date.now();
    const history = user.usernameHistory || [];
    // Filter history to last 14 days
    const recentChanges = history.filter(timestamp => now - timestamp < FOURTEEN_DAYS_MS);

    if (recentChanges.length >= 2) {
      const oldestInWindow = Math.min(...recentChanges);
      const daysUntilReset = Math.ceil((FOURTEEN_DAYS_MS - (now - oldestInWindow)) / (24 * 60 * 60 * 1000));
      return {
        allowed: false,
        remainingChanges: 0,
        daysUntilReset,
      };
    }

    return {
      allowed: true,
      remainingChanges: 2 - recentChanges.length,
    };
  };

  const changeUsername = (newUsername: string): { success: boolean; message: string } => {
    const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (!cleanUsername) {
      return { success: false, message: 'Invalid username format.' };
    }

    if (cleanUsername === user.username) {
      return { success: true, message: 'Username is unchanged.' };
    }

    const check = canChangeUsername();
    if (!check.allowed) {
      return {
        success: false,
        message: `Username Rule: You can only change your @username handle twice every 14 days. Please wait ${check.daysUntilReset} more day(s).`,
      };
    }

    const now = Date.now();
    const updatedHistory = [...(user.usernameHistory || []), now];

    setUser(prev => ({
      ...prev,
      username: cleanUsername,
      usernameHistory: updatedHistory,
    }));

    return {
      success: true,
      message: `Username updated to @${cleanUsername}! (${2 - updatedHistory.filter(t => now - t < FOURTEEN_DAYS_MS).length} changes remaining in 14 days)`,
    };
  };

  const login = async (email: string, _pass: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithPassword({ email, password: _pass });
    }
    setIsAuthenticated(true);
    setUser(prev => ({
      ...prev,
      email,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
    }));
    return true;
  };

  const signup = async (email: string, name: string, business: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signUp({ email, password: 'password123' });
    }
    setIsAuthenticated(true);
    setUser(prev => ({
      ...prev,
      email,
      fullName: name,
      businessName: business,
      username: name.toLowerCase().replace(/\s+/g, '.'),
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase() || 'VN',
    }));
    return true;
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  // Vendor submits documents -> status moves to 'pending' for Admin approval
  const submitKycDocuments = (record: Omit<KycDocumentRecord, 'submittedAt'>) => {
    const fullRecord: KycDocumentRecord = {
      ...record,
      submittedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setKycRecord(fullRecord);
    setKycStatus('pending');
  };

  // Admin Portal functions
  const adminApproveKyc = () => {
    setKycStatus('verified');
  };

  const adminRejectKyc = () => {
    setKycStatus('unverified');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthModalOpen,
        setAuthModalOpen,

        isAdminModalOpen,
        setAdminModalOpen,

        login,
        signup,
        logout,
        updateProfile,

        canChangeUsername,
        changeUsername,

        kycStatus,
        kycRecord,
        submitKycDocuments,
        adminApproveKyc,
        adminRejectKyc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
