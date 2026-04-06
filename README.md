# PixelMarket — Photography Marketplace

A full-stack photography marketplace built with Next.js 14, Drizzle ORM, Auth.js, Supabase, Stripe, GSAP, and Lenis.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions, Server Components)
- **Database:** PostgreSQL via Supabase + Drizzle ORM
- **Auth:** Auth.js v5 (credentials, magic link, Google, GitHub)
- **Payments:** Stripe Checkout + Webhooks
- **Storage:** Supabase Storage (photos, thumbnails, avatars)
- **Animations:** GSAP 3.12 + ScrollTrigger
- **Smooth Scroll:** Lenis
- **Styling:** Tailwind CSS + Radix UI primitives
- **State:** Zustand (toasts), React Server Components (data)
- **Validation:** Zod
- **Forms:** React Hook Form (auth), native FormData (actions)

## Architecture

```
app/
├── (auth)/              # Auth pages (login, signup, forgot/reset password, verify)
├── (main)/              # Authenticated pages with site header
│   ├── dashboard/       # Photo feed with masonry grid
│   ├── photos/[slug]/   # Photo detail with metadata, comments, purchase
│   ├── photographers/[username]/  # User profiles
│   ├── upload/          # Photo upload with monetization options
│   ├── checkout/        # Stripe checkout flow
│   ├── search/          # Search results
│   ├── collections/     # User collections
│   └── settings/        # Profile editing
├── api/
│   ├── auth/[...nextauth]/  # Auth.js handler
│   └── stripe/webhook/      # Stripe webhook
└── page.tsx             # Landing page

lib/
├── db/
│   ├── schema.ts        # Drizzle schema (all tables + relations)
│   └── index.ts         # Database connection
├── actions/
│   ├── auth.ts          # Signup, forgot/reset password
│   ├── photos.ts        # Upload, like, comment, search, feed
│   ├── users.ts         # Follow, profile, notifications
│   └── purchases.ts     # Stripe checkout, bids, fulfillment
├── auth.ts              # Auth.js configuration
├── supabase.ts          # Storage client + helpers
├── hooks/use-gsap.ts    # Reusable GSAP scroll animations
└── utils/
    ├── index.ts         # cn(), slugify(), formatPrice(), timeAgo()
    └── password.ts      # PBKDF2 hashing (Web Crypto API)

components/
├── ui/                  # Base UI primitives (Button, Card, Input, etc.)
├── shared/              # Site header, follow button
├── photos/              # Photo card, like button, comments, purchase panel
├── dashboard/           # Category filter, sidebar
├── auth/                # (reserved for auth-specific components)
└── providers.tsx        # SessionProvider + ThemeProvider + Lenis + GSAP
```

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd pixel-market
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy the URL, anon key, and service role key
3. Go to **Settings → Database** and copy the connection strings
4. Create storage buckets:
   - Go to **Storage** → Create buckets: `photos`, `thumbnails`, `watermarked`, `avatars`, `covers`
   - Set all buckets to **public** (for serving images)

### 3. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Copy your **Secret Key** and **Publishable Key** from the Dashboard
3. Set up a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
4. Select the `checkout.session.completed` event
5. Copy the **Webhook Secret**

### 4. Set up OAuth (optional)

**Google:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as redirect URI

**GitHub:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL to `http://localhost:3000/api/auth/callback/github`

### 5. Configure environment

```bash
cp .env.example .env
# Fill in all values in .env
```

Generate the auth secret:
```bash
openssl rand -base64 32
```

### 6. Set up database

```bash
# Generate migration files from schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed categories and tags
npm run db:seed

# (Optional) Open Drizzle Studio to browse data
npm run db:studio
```

### 7. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 8. Test Stripe locally

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret it gives you into .env
```

## Features Implemented

- [x] Landing page with GSAP scroll animations
- [x] Auth: credentials signup/login, magic link, Google, GitHub
- [x] Forgot password + reset password (email flow)
- [x] Route protection via middleware
- [x] Dashboard with masonry photo grid + category filter
- [x] Photo upload with drag-and-drop + Supabase Storage
- [x] Monetization: sell, rent, and auction options
- [x] Automatic license generation (Personal, Commercial, Extended)
- [x] Photo detail page with EXIF metadata display
- [x] Like system with optimistic updates + notifications
- [x] Comment system with optimistic updates + notifications
- [x] Stripe Checkout for purchases
- [x] Auction bidding with outbid notifications
- [x] Follow/unfollow with notifications
- [x] Photographer profiles with stats and photo grid
- [x] Full-text search with pagination
- [x] Collections page
- [x] Profile settings with avatar/cover upload
- [x] Dark/light theme toggle
- [x] Smooth scroll (Lenis)
- [x] Notification system (database-backed)
- [x] Keyboard shortcuts (Cmd+K for search)
- [x] Responsive design
- [x] Toast notifications (Zustand)

## Remaining Work (TODO)

- [ ] Image processing pipeline (Sharp: resize thumbnails, extract EXIF, generate watermarks)
- [ ] Stripe Connect for seller payouts
- [ ] Real-time notification dropdown (poll or Supabase Realtime)
- [ ] Collection CRUD (create, add/remove photos, delete)
- [ ] Infinite scroll / load more on dashboard
- [ ] Admin panel for content moderation
- [ ] Email templates (HTML instead of plain text)
- [ ] Rate limiting on API routes
- [ ] Unit and integration tests
- [ ] SEO: dynamic OG images per photo
- [ ] PWA support
- [ ] Analytics dashboard for sellers

## Key Design Decisions

1. **Server Actions over API routes** — Cleaner code, automatic revalidation, type safety across the boundary.
2. **Denormalized counters** — `likeCount`, `viewCount`, `downloadCount` on the photos table avoid expensive COUNT queries on every page load.
3. **Slug-based URLs** — `/photos/mountain-sunrise-1712345678` is more SEO-friendly than `/photos/clxyz123`.
4. **Optimistic updates** — Like and comment actions update UI immediately, then sync with server.
5. **JWT sessions** — Faster than database sessions for read-heavy pages. Session data is kept minimal.
6. **PBKDF2 via Web Crypto** — No native dependencies (unlike bcrypt). Runs in Edge runtime.
