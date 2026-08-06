-- ====================================================================
-- PostgreSQL Database Schema for Vendor Dashboard
-- Compatible with Next.js API, Supabase, and PostgreSQL Engine
-- ====================================================================

-- 1. ENUMS
CREATE TYPE booking_status_type AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('payment', 'booking', 'review', 'package', 'system');
CREATE TYPE ticket_priority_type AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status_type AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 2. USERS & VENDORS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bio TEXT,
    location VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 4.90,
    total_reviews INT DEFAULT 312,
    today_earnings DECIMAL(12, 2) DEFAULT 48250.00,
    upi_id VARCHAR(100),
    bank_account VARCHAR(100),
    bank_ifsc VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_avatar VARCHAR(10),
    service_type VARCHAR(255) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    budget VARCHAR(100) NOT NULL,
    status booking_status_type DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    start_time VARCHAR(50) NOT NULL,
    end_time VARCHAR(50),
    location VARCHAR(255),
    client_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. MESSAGES & CHAT CONVERSATIONS
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_avatar VARCHAR(10) NOT NULL,
    last_message TEXT,
    last_message_time VARCHAR(100),
    unread_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL, -- 'vendor' or 'customer'
    text TEXT NOT NULL,
    timestamp VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(100) NOT NULL,
    services TEXT[] NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    customer VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    date VARCHAR(100) NOT NULL,
    reply TEXT,
    reply_date VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. DEALS & PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    discount_percentage INT NOT NULL,
    valid_till VARCHAR(100) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TRANSACTIONS & EARNINGS LOG
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'credit', -- 'credit' or 'payout'
    date VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    time VARCHAR(100) NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ticket_priority_type DEFAULT 'medium',
    status ticket_status_type DEFAULT 'open',
    message TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_calendar_vendor ON calendar_events(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_vendor ON notifications(vendor_id);
