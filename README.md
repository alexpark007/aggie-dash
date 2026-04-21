# Davis Delivers 🚴

> **Local restaurants. Student drivers. Community first.**

A full-stack food delivery platform for Downtown Davis, CA — a community alternative to Uber Eats where local restaurants pay lower fees and UC Davis students get hired as delivery drivers on scheduled shifts.

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (auth, PostgreSQL database, real-time subscriptions)
- **Tailwind CSS** (UC Davis Navy + Gold theme)
- **Stripe** (customer payments, restaurant subscriptions)

---

## The 4 Portals

| URL | Portal | Who uses it |
|-----|--------|-------------|
| `/` | Customer site | Anyone ordering food |
| `/restaurant` | Restaurant portal | Restaurant owners |
| `/driver` | Driver app | UC Davis student drivers |
| `/admin` | Admin portal | Downtown Davis Association |
| `/admin-login` | Admin login | Admins only |

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repo>
cd aggie-dash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Run the database migration:**
   - Go to **SQL Editor** in your Supabase dashboard
   - Paste and run the contents of `supabase/migrations/001_initial_schema.sql`

4. **Enable Realtime** for the `orders` and `deliveries` tables:
   - Go to **Database → Replication**
   - Enable realtime for `orders` and `deliveries`

5. **(Optional) Seed demo data:**
   - First create auth users for the 3 demo restaurants in **Auth → Users**
   - Copy their UUIDs into `supabase/seed/seed.sql` (replacing the placeholder UUIDs)
   - Run the seed file in SQL Editor

### 3. Create Admin User

1. Create a user in Supabase Auth → Users with your email
2. Run this SQL in the SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
   ```
3. This user can now log in at `/admin-login`

### 4. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Copy your API keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

3. **Create the restaurant subscription product:**
   - Go to Products → Add Product
   - Name: "Davis Delivers Restaurant Subscription"
   - Price: $150.00/month (recurring)
   - Copy the Price ID → `STRIPE_RESTAURANT_PRICE_ID`

4. **Set up the webhook:**
   - Go to Developers → Webhooks → Add Endpoint
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `customer.subscription.deleted`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

   For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 5. Environment Variables

Fill in `.env.local` with all values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_RESTAURANT_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Delivery Zone

Davis Delivers only serves **Davis, CA 95616** (Downtown Davis + UC Davis campus).
Delivery addresses are validated against zip codes 95616/95617/95618.

---

## Business Model

| Revenue source | Amount |
|---------------|--------|
| Restaurant subscription | **$150/month flat** — no per-order % |
| Customer delivery fee | **$3.99 flat** per order |
| Driver pay | **Hourly rate** (set by admin, default $18/hr) |

---

## Database Schema

```
profiles          — extends Supabase auth.users (role: customer/restaurant/driver/admin)
restaurants       — restaurant info, hours, Stripe subscription
menu_items        — items with price, category, availability
customers         — customer profiles linked to auth
orders            — order with status, totals, delivery address
order_items       — line items for each order
drivers           — student driver applications (status: pending/approved/active/rejected)
shifts            — scheduled driver shifts with hourly rate
deliveries        — delivery assignments linking orders, drivers, and shifts
platform_settings — global settings (hourly rate, delivery fee) — singleton row
```

---

## Key Features

### Customer Site (`/`)
- Browse all active Downtown Davis restaurants
- Mobile-first menu with add-to-cart
- Cart persisted in localStorage
- Stripe Checkout with tip selector
- Davis-only address validation
- Real-time order tracking via Supabase subscriptions

### Restaurant Portal (`/restaurant`)
- Self-service onboarding (admin approves)
- Full menu builder (add/edit/delete items, toggle availability)
- Real-time order dashboard with status updates
- 7-day analytics (revenue, order count, popular items)
- Flat $150/month Stripe subscription (no per-order %)

### Driver App (`/driver`)
- UCD student application form (requires @ucdavis.edu email)
- Admin approval workflow
- View scheduled shifts
- Active delivery workflow: pick up → deliver
- Earnings summary per shift

### Admin Portal (`/admin`)
- Platform revenue dashboard
- Approve/reject restaurants and drivers
- Schedule driver shifts with custom hourly rate
- View all orders across the platform
- Configure global platform settings

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx            homepage (restaurant grid)
│   ├── cart/               shopping cart
│   ├── checkout/           Stripe checkout
│   ├── account/orders/     order history
│   ├── auth/               login, signup, callback
│   ├── admin/              admin portal (protected by middleware)
│   ├── admin-login/        admin login (standalone)
│   ├── driver/             driver landing + app
│   ├── restaurant/         restaurant portal
│   ├── order/              order tracking + confirmation
│   └── api/                Stripe + order API routes
├── components/
│   ├── admin/              admin portal components
│   ├── auth/               auth forms
│   ├── customer/           menu, cart, checkout, tracking
│   ├── driver/             driver app components
│   ├── layout/             Navbar, Footer
│   ├── restaurant/         restaurant portal components
│   └── ui/                 Button, Input, Card, Modal, Badge
├── hooks/                  useCart
├── lib/
│   ├── cart.ts             localStorage cart logic
│   ├── supabase/           client, server, middleware
│   └── utils.ts            formatCurrency, formatDate, isWithinDavisCA
└── types/                  TypeScript types for all entities
supabase/
├── migrations/             001_initial_schema.sql
└── seed/                   seed.sql (3 demo restaurants)
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import into [vercel.com](https://vercel.com)
3. Add all environment variables in project settings
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Update the Stripe webhook endpoint URL to your production domain

---

## Notes

- **Supabase RLS** is enabled on all tables — see the migration for policies
- **Real-time** is enabled for `orders` and `deliveries` tables
- Cart state is stored in **localStorage** (no server-side cart needed)
- All monetary amounts are stored in **dollars** in the database; Stripe receives **cents**
- The `profiles` table auto-populates via a Postgres trigger on `auth.users` insert
- Admin route protection is enforced in both middleware and individual page redirects
