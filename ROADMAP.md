# Festivo — Backend & Customer Dashboard Roadmap

## Phase 1: Database Setup (Supabase)

### Tables to Create

#### `vendors`
- `id` (uuid, PK, references auth.users)
- `business_name` (text)
- `category` (text — Photographer, Decorator, Caterer, etc.)
- `city` (text)
- `phone` (text)
- `avatar_url` (text)
- `is_available` (boolean, default true)
- `rating` (numeric, default 0)
- `total_reviews` (integer, default 0)
- `profile_completion` (integer, default 0)
- `created_at` (timestamptz)

#### `packages`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `name` (text)
- `price` (numeric)
- `services_included` (text[])
- `is_popular` (boolean)
- `created_at` (timestamptz)

#### `bookings`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `customer_id` (uuid, FK → customers)
- `event_type` (text)
- `event_date` (date)
- `event_time` (time)
- `location` (text)
- `budget` (numeric)
- `status` (text — pending, confirmed, completed, cancelled)
- `created_at` (timestamptz)

#### `reviews`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `customer_id` (uuid, FK → customers)
- `rating` (integer, 1–5)
- `review_text` (text)
- `event_id` (uuid, FK → bookings)
- `created_at` (timestamptz)

#### `earnings`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `booking_id` (uuid, FK → bookings)
- `amount` (numeric)
- `status` (text — pending, completed)
- `created_at` (timestamptz)

#### `notifications`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `type` (text — payment, booking, review, package)
- `title` (text)
- `message` (text)
- `is_read` (boolean, default false)
- `created_at` (timestamptz)

#### `portfolio_items`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `image_url` (text)
- `category` (text)
- `is_featured` (boolean)
- `created_at` (timestamptz)

#### `messages`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `customer_id` (uuid, FK → customers)
- `sender` (text — vendor, customer)
- `message` (text)
- `read` (boolean)
- `created_at` (timestamptz)

#### `deals`
- `id` (uuid, PK)
- `vendor_id` (uuid, FK → vendors)
- `title` (text)
- `description` (text)
- `discount` (text)
- `status` (text — active, expired)
- `end_date` (date)
- `created_at` (timestamptz)

### RLS Policies
Each table needs 4 policies (SELECT, INSERT, UPDATE, DELETE) scoped to `auth.uid() = vendor_id` so vendors can only access their own data.

---

## Phase 2: Authentication

- Enable Supabase email/password auth
- Vendor signup flow: email, password, business name, category, city
- Session management with `onAuthStateChange`
- Protected routes — redirect to login if not authenticated
- Profile photo upload to Supabase Storage bucket `vendor-avatars`

---

## Phase 3: Connect Dashboard to Live Data

Replace mock data in `src/lib/dashboard-data.ts` with Supabase queries:

1. **Summary Cards** — `SELECT count(*) FROM bookings WHERE status = 'pending'` etc.
2. **Upcoming Events** — `SELECT * FROM bookings WHERE vendor_id = ? AND event_date >= now() ORDER BY event_date`
3. **Booking Requests** — `SELECT * FROM bookings WHERE status = 'pending'` with Accept/Reject updating status
4. **Earnings** — `SELECT sum(amount) FROM earnings WHERE vendor_id = ? AND status = 'completed'`
5. **Reviews** — `SELECT * FROM reviews WHERE vendor_id = ? ORDER BY created_at DESC`
6. **Notifications** — `SELECT * FROM notifications WHERE vendor_id = ? ORDER BY created_at DESC`
7. **Portfolio** — `SELECT * FROM portfolio_items WHERE vendor_id = ?`
8. **Packages** — `SELECT * FROM packages WHERE vendor_id = ?`
9. **Messages** — `SELECT * FROM messages WHERE vendor_id = ? ORDER BY created_at`
10. **Availability toggle** — `UPDATE vendors SET is_available = ? WHERE id = ?`

Use Supabase Realtime subscriptions for live updates on bookings, messages, and notifications.

---

## Phase 4: Customer Dashboard

A separate app/route for customers to browse and book vendors.

### Customer Tables

#### `customers`
- `id` (uuid, PK, references auth.users)
- `full_name` (text)
- `phone` (text)
- `avatar_url` (text)
- `city` (text)
- `created_at` (timestamptz)

#### `customer_favorites`
- `id` (uuid, PK)
- `customer_id` (uuid, FK → customers)
- `vendor_id` (uuid, FK → vendors)

### Customer Dashboard Pages

1. **Home / Browse** — Search vendors by category, city, rating. Filter and sort. Grid of vendor cards.
2. **Vendor Profile** — View vendor portfolio, packages, reviews, availability. Book button.
3. **Booking Flow** — Select package, pick date/time, enter event details, confirm. Creates a booking row with status `pending`.
4. **My Bookings** — List of customer's bookings with status tracking.
5. **Messages** — Chat with vendors (shared `messages` table).
6. **Reviews** — Leave reviews after completed events.
7. **Profile** — Manage personal info and avatar.

### Customer App Routes
```
/                → Browse vendors
/vendor/:id      → Vendor profile
/book/:vendorId  → Booking flow
/bookings        → My bookings
/messages        → Chat with vendors
/profile         → Customer settings
```

---

## Phase 5: Realtime & Notifications

- Supabase Realtime channels for:
  - New booking requests (vendor side)
  - Booking status changes (customer side)
  - New messages (both sides)
  - New reviews (vendor side)
- Push notifications via Supabase Edge Functions
- Email notifications for key events

---

## Phase 6: Payments (Stripe)

- Connect Stripe for vendor payouts
- Customer pays through platform at booking confirmation
- Platform takes a commission, rest goes to vendor
- Use `bolt-stripe` skill for integration guidance

---

## Phase 7: Advanced Features

- Vendor analytics with real data aggregation
- Search with Postgres full-text search
- Map-based vendor discovery
- Calendar sync (Google Calendar integration)
- Automated payout scheduling
- Review moderation
- Vendor verification (document upload)
- Multi-language support
