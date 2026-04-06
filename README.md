# PixelMarket

A full-stack photography marketplace where photographers upload, sell, rent, and auction their work. Buyers browse, purchase licenses, and build collections.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions, Server Components)
- **Database:** PostgreSQL via Supabase + Drizzle ORM
- **Auth:** Auth.js v5 (credentials, magic link, Google OAuth, GitHub OAuth)
- **Payments:** Stripe Checkout + Webhooks
- **Storage:** Supabase Storage (5 public buckets)
- **Image Processing:** Sharp (resize, watermark, EXIF extraction, HEIC conversion)
- **Animations:** GSAP 3.12 + ScrollTrigger
- **Smooth Scroll:** Lenis
- **Styling:** Tailwind CSS + Radix UI primitives
- **State:** Zustand (toasts), React Server Components (data)
- **Validation:** Zod
- **Font:** Azeret Mono

## Features

### Authentication
- Email/password signup with auto-generated usernames
- Magic link sign-in (branded HTML email)
- Google and GitHub OAuth
- Forgot/reset password flow (branded HTML email)
- JWT sessions with DB-backed username resolution
- Edge-safe middleware for route protection

### Photo Management
- Drag-and-drop upload (JPG, PNG, WebP, HEIC — up to 50MB)
- Sharp image pipeline: thumbnail generation (600px JPEG), diagonal watermark overlay, EXIF extraction (camera, lens, aperture, shutter speed, ISO, focal length)
- HEIC to JPEG server-side conversion with client-side preview
- Edit photo metadata — prefilled form at `/upload?edit={slug}`
- Archive/restore and delete with Supabase Storage cleanup
- View count tracking

### Monetization
- Three models per photo: direct sale, rental, auction
- Automatic license generation (Personal, Commercial, Extended) with tiered pricing
- Stripe Checkout integration with webhook fulfillment
- 15% platform fee, 85% seller share
- Auction system with bidding, outbid notifications, and auto-close (on-demand + daily Vercel cron)

### Social
- Like with optimistic updates and notifications
- Comment with optimistic updates and notifications
- Follow/unfollow with live follower count
- Notification system (DB-backed, lazy-loaded dropdown, typed icons, mark all read)

### Collections
- Full CRUD (create, edit name/description/privacy, delete)
- Save-to-collection dropdown on photo detail (checks saved state on mount)
- Quick-save bookmark on photo cards (auto-creates "Saved" collection)
- Accurate photo counts
- Collection detail page with photo grid and remove button

### Search
- Searches by title, description, location, tag name, and photographer name/username
- Pagination with bookmark state preserved in results

### Dashboard
- Masonry grid (CSS columns, responsive 1/2/3 columns)
- Infinite scroll (IntersectionObserver, 20 photos per page)
- Category filter with sidebar

### Commerce Pages
- **Purchase history** (`/purchases`) — all purchases with re-download button
- **Seller earnings** (`/earnings`) — 4 stat cards + full sales history with buyer info
- **Checkout success** — working download button linked to original file

### Admin Panel (`/admin`)
- Access controlled by `ADMIN_EMAILS` env var (no schema migration needed)
- **Dashboard** — total users, photos, purchases, revenue + weekly growth
- **User management** — search, list, delete with cascade
- **Photo moderation** — search, filter (all/published/archived), archive/publish toggle, delete
- Sidebar layout on desktop, horizontal nav on mobile

### Profile & Settings
- Server-fetched full profile with all fields prefilled
- Avatar upload with preview
- Photographer profile page with cover image, stats grid, photo portfolio
- Social links (Twitter, Instagram, website)

### UI/UX
- Monochrome logo (block P — white on black)
- Split card auth pages (form left, photo right)
- Responsive mobile header (search icon on mobile, icon-only upload button)
- Image shimmer placeholders while loading
- Share button (Web Share API + clipboard fallback)
- Cmd+K / Ctrl+K search shortcut, Escape to close
- Dark/light theme toggle
- Error boundaries (global, route-level, 404)
- Smooth scroll (Lenis) + GSAP landing page animations
- Toast notifications (Zustand)

### SEO
- `generateMetadata` on photo detail and photographer pages
- OG images using watermarked photos for social sharing
- SVG favicon

### Backend
- Rate limiting (in-memory sliding window per user/action)
- Branded HTML email templates (password reset, magic link)
- Archived photos blocked for non-owners
- TypeScript strict union narrowing throughout

## Project Structure

```
app/
├── page.tsx                          # Landing page
├── layout.tsx                        # Root layout (metadata, fonts, providers)
├── (auth)/                           # Auth pages (split card layout)
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   └── reset-password/
├── (main)/                           # Authenticated pages
│   ├── dashboard/                    # Photo feed + infinite scroll
│   ├── photos/[slug]/                # Photo detail + comments + purchase
│   ├── photographers/[username]/     # Profile + portfolio
│   ├── upload/                       # Upload + edit photo
│   ├── checkout/[photoId]/           # Stripe checkout + success
│   ├── search/                       # Full-text search
│   ├── collections/                  # List + detail
│   ├── purchases/                    # Purchase history
│   ├── earnings/                     # Seller dashboard
│   └── settings/                     # Profile editing
├── (admin)/                          # Admin panel
│   └── admin/
│       ├── page.tsx                  # Stats dashboard
│       ├── users/                    # User management
│       └── photos/                   # Photo moderation
└── api/
    ├── auth/[...nextauth]/
    ├── stripe/webhook/
    ├── cron/auctions/
    └── photos/archive/

lib/
├── db/schema.ts                      # 17 tables + relations
├── actions/
│   ├── admin.ts                      # Admin stats, user/photo management
│   ├── auctions.ts                   # Auction close + notifications
│   ├── auth.ts                       # Signup, forgot/reset password
│   ├── collections.ts                # CRUD, quick-save, isPhotoSaved
│   ├── photos.ts                     # Upload, edit, search, feed, like, comment
│   ├── purchases.ts                  # Checkout, bids, fulfillment
│   └── users.ts                      # Follow, profile, notifications
├── auth.ts                           # Auth.js config
├── auth.config.ts                    # Edge-safe auth config
├── email-templates.ts                # Branded HTML emails
├── image-processing.ts               # Sharp pipeline
├── rate-limit.ts                     # Sliding window limiter
├── supabase.ts                       # Storage helpers
└── utils/

components/
├── auth/                             # OAuth buttons, login/signup/reset forms
├── collections/                      # Create, edit, delete, save-to, remove
├── dashboard/                        # Category filter, sidebar
├── photos/                           # Card, like, comment, checkout, purchase panel
├── shared/                           # Site header, follow button
├── settings-form.tsx
├── providers.tsx
└── ui/                               # Radix primitives
```

## Database (17 tables)

users, accounts, sessions, verificationTokens, categories, photos, tags, photoTags, licenses, follows, likes, comments, collections, collectionPhotos, purchases, auctionBids, notifications

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Ritiksh0h/pixel-market.git
cd pixel-market
npm install
```

### 2. Supabase

Create a project at [supabase.com](https://supabase.com). Copy URL, anon key, and service role key from Settings → API. Copy connection strings from Settings → Database. Create 5 public storage buckets: `photos`, `thumbnails`, `watermarked`, `avatars`, `covers`.

### 3. Stripe

Copy Secret Key and Publishable Key from [stripe.com](https://dashboard.stripe.com). Create a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`, select `checkout.session.completed`, and copy the Webhook Secret.

### 4. OAuth (optional)

Google: [console.cloud.google.com](https://console.cloud.google.com) → OAuth 2.0 → callback `http://localhost:3000/api/auth/callback/google`

GitHub: [github.com/settings/developers](https://github.com/settings/developers) → OAuth App → callback `http://localhost:3000/api/auth/callback/github`

### 5. Environment

```bash
cp .env.example .env
openssl rand -base64 32  # Generate AUTH_SECRET
# Fill in all values
```

### 6. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 7. Run

```bash
npm run dev
```

### 8. Stripe local testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Environment Variables

```
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
AUTH_URL
AUTH_TRUST_HOST
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
EMAIL_SERVER_HOST
EMAIL_SERVER_PORT
EMAIL_SERVER_USER
EMAIL_SERVER_PASSWORD
EMAIL_FROM
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
CRON_SECRET
ADMIN_EMAILS
```

## Remaining

- Stripe Connect for seller payouts
- Unit and integration tests