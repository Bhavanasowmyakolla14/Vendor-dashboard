import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Vendor = {
  id: string;
  name: string;
  category: string;
  location: string;
  price_amount: number;
  price_label: string;
  price_unit: string;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  tags: string[];
  description: string;
  verified: boolean;
  badge: string | null;
  badge_color: string | null;
  capacity: string | null;
  experience_years: number | null;
  slug: string;
  created_at: string;
};

export type Booking = {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: string;
  event_date: string;
  guests: number;
  special_requests: string | null;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_intent_id: string | null;
  booking_ref: string;
  created_at: string;
};

const VENDOR_CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  'Pandit': '/images/pandit.png',
  'Mehendi Artist': '/images/mehndi.png',
  'Tent House': '/images/tent.png',
  'Flower Decor': '/images/flowers.png',
  'Anchor': '/images/anchor.png',
  'Photographer': '/images/photographer.png',
  'Lights': '/images/lights.png',
  'Makeup': '/images/makeup.png',
  'Travel': '/images/travel.png',
  'Wedding Hall': '/images/wedding_hall.png',
};

const VENDOR_CATEGORY_MAP: Record<string, string> = {
  'Venue': 'Wedding Hall',
  'Photography': 'Photographer',
  'Decoration': 'Decorator',
  'Entertainment': 'DJ',
  'Coordinator': 'Anchor'
};

export function sanitizeVendor(vendor: Vendor | null | undefined): Vendor | null {
  if (!vendor) return null;
  const sanitized = { ...vendor };
  
  if (sanitized.category && VENDOR_CATEGORY_MAP[sanitized.category]) {
    sanitized.category = VENDOR_CATEGORY_MAP[sanitized.category];
  }
  
  const img = sanitized.image || '';
  
  if (img.includes('3171837') && VENDOR_CATEGORY_IMAGE_OVERRIDES[sanitized.category]) {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES[sanitized.category];
  } else if (img.includes('3993449')) {
    if (sanitized.category === 'Mehendi Artist') sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Mehendi Artist'];
    else if (sanitized.category === 'Makeup') sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Makeup'];
  } else if (img.includes('169198') && (sanitized.category === 'Tent House' || sanitized.category === 'Flower Decor')) {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES[sanitized.category];
  } else if (img.includes('3184291') && sanitized.category === 'Anchor') {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Anchor'];
  } else if (img.includes('2253870') && sanitized.category === 'Photographer') {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Photographer'];
  } else if (img.includes('3806288') && sanitized.category === 'Travel') {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Travel'];
  } else if (img.includes('1579253') && sanitized.category === 'Wedding Hall') {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Wedding Hall'];
  } else if (img.includes('2693208') && sanitized.category === 'Lights') {
    sanitized.image = VENDOR_CATEGORY_IMAGE_OVERRIDES['Lights'];
  }

  if (Array.isArray(sanitized.gallery)) {
    sanitized.gallery = sanitized.gallery.map(gUrl => {
      if (gUrl.includes('3171837') && VENDOR_CATEGORY_IMAGE_OVERRIDES[sanitized.category]) {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES[sanitized.category];
      }
      if (gUrl.includes('3993449')) {
        if (sanitized.category === 'Mehendi Artist') return VENDOR_CATEGORY_IMAGE_OVERRIDES['Mehendi Artist'];
        if (sanitized.category === 'Makeup') return VENDOR_CATEGORY_IMAGE_OVERRIDES['Makeup'];
      }
      if (gUrl.includes('169198') && (sanitized.category === 'Tent House' || sanitized.category === 'Flower Decor')) {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES[sanitized.category];
      }
      if (gUrl.includes('3184291') && sanitized.category === 'Anchor') {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES['Anchor'];
      }
      if (gUrl.includes('2253870') && sanitized.category === 'Photographer') {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES['Photographer'];
      }
      if (gUrl.includes('3806288') && sanitized.category === 'Travel') {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES['Travel'];
      }
      if (gUrl.includes('1579253') && sanitized.category === 'Wedding Hall') {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES['Wedding Hall'];
      }
      if (gUrl.includes('2693208') && sanitized.category === 'Lights') {
        return VENDOR_CATEGORY_IMAGE_OVERRIDES['Lights'];
      }
      return gUrl;
    });
  }

  return sanitized;
}

export function sanitizeVendors(vendors: Vendor[] | null | undefined): Vendor[] {
  if (!vendors) return [];
  return vendors.map(v => sanitizeVendor(v)).filter((v): v is Vendor => v !== null);
}

