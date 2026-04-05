# PixelMarket v0.1 — Photography Marketplace

A full-stack photography marketplace where photographers can sell, rent, and auction their work. Built with Next.js 14, Drizzle ORM, Auth.js v5, Supabase, Stripe, GSAP, and Lenis.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Actions, RSC) |
| Database | PostgreSQL via Supabase + Drizzle ORM |
| Auth | Auth.js v5 — credentials, magic link, Google, GitHub |
| Payments | Stripe Checkout + Webhooks |
| Storage | Supabase Storage (photos, thumbnails, watermarked, avatars, covers) |
| Image Processing | Sharp (thumbnails, watermarks, EXIF extraction, HEIC conversion) |
| Animations | GSAP 3.12 + ScrollTrigger |
| Smooth Scroll | Lenis |
| Styling | Tailwind CSS + Radix UI primitives |
| State | Zustand (toasts), Server Components (data) |
| Validation | Zod |
| Font | Azeret Mono |

---

## Project Structure

```
pixel-market/
├── app/
│   ├── (auth)/                        # Unauthenticated pages
│   │   ├── login/page.tsx             # Credentials, magic link, OAuth
│   │   ├── signup/page.tsx            # Registration
│   │   ├── forgot-password/page.tsx   # Email reset request
│   │   ├── reset-password/page.tsx    # Token-based password reset
│   │   ├── verify/page.tsx            # Magic link confirmation
│   │   └── error.tsx                  # Auth error boundary
│   ├── (main)/                        # Authenticated pages (with header)
│   │   ├── dashboard/page.tsx         # Photo feed + infinite scroll + sidebar
│   │   ├── photos/[slug]/page.tsx     # Photo detail + purchase + owner actions
│   │   ├── photographers/[username]/  # User profile + portfolio
│   │   ├── upload/page.tsx            # Upload with HEIC support + monetization
│   │   ├── checkout/[photoId]/        # Stripe checkout + success
│   │   ├── search/page.tsx            # Search with pagination
│   │   ├── collections/page.tsx       # Collection listing + CRUD
│   │   ├── collections/[id]/page.tsx  # Collection detail + photo management
│   │   ├── settings/page.tsx          # Profile editing
│   │   ├── error.tsx                  # Main error boundary
│   │   └── loading.tsx                # Loading skeleton
│   ├── api/
│   │   ├── auth/[...nextauth]/        # Auth.js route handler
│   │   ├── stripe/webhook/            # Stripe webhook handler
│   │   └── photos/archive/            # Archive/restore API
│   ├── globals.css                    # Tailwind + design tokens
│   ├── layout.tsx                     # Root layout (Azeret Mono)
│   ├── page.tsx                       # Landing page with GSAP
│   ├── error.tsx                      # Root error boundary
│   ├── global-error.tsx               # Fatal error boundary
│   └── not-found.tsx                  # Custom 404
├── components/
│   ├── ui/                            # Button, Card, Input, Avatar, Badge, etc.
│   ├── shared/                        # SiteHeader (4 dropdowns), FollowButton
│   ├── photos/                        # PhotoCard, LikeButton, CommentSection,
│   │                                  # PurchasePanel, OwnerActions, InfiniteGrid
│   ├── collections/                   # CreateCollection, DeleteCollection,
│   │                                  # EditCollection, SaveToCollection,
│   │                                  # RemoveFromCollection
│   ├── dashboard/                     # CategoryFilter, Sidebar
│   └── providers.tsx                  # Session + Theme + Lenis + GSAP
├── lib/
│   ├── actions/
│   │   ├── auth.ts                    # Signup, forgot/reset password
│   │   ├── photos.ts                  # Upload, like, comment, search, delete
│   │   ├── users.ts                   # Follow, profile, notifications
│   │   ├── purchases.ts              # Stripe checkout, auction bids
│   │   └── collections.ts            # Collection CRUD, add/remove photos
│   ├── db/
│   │   ├── schema.ts                  # 15+ Drizzle tables + relations
│   │   └── index.ts                   # Pooled database connection
│   ├── image-processing.ts           # Sharp pipeline: thumbnails, watermarks, EXIF
│   ├── auth.ts                        # Full Auth.js config (Node.js runtime)
│   ├── auth.config.ts                 # Edge-safe auth config (middleware)
│   ├── supabase.ts                    # Storage client + upload/delete helpers
│   ├── hooks/use-gsap.ts             # Reusable scroll animation hooks
│   └── utils/
│       ├── index.ts                   # cn(), slugify(), formatPrice(), timeAgo()
│       └── password.ts                # PBKDF2 hashing (Web Crypto API)
├── types/
│   ├── nodemailer.d.ts               # Nodemailer v7 types
│   └── heic-convert.d.ts             # HEIC conversion types
├── middleware.ts                       # Route protection (Edge-safe)
├── scripts/seed.ts                    # Category + tag seeder
└── drizzle.config.ts                  # Drizzle Kit config
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project
- [Stripe](https://stripe.com) account
- (Optional) Google and GitHub OAuth apps

### 1. Clone and install

```bash
git clone https://github.com/Ritiksh0h/pixel-market.git
cd pixel-market
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` — see `.env.example` for all required variables.

Generate auth secret:
```bash
openssl rand -base64 32
```

### 3. Set up Supabase Storage

Dashboard → **Storage** → create these **public** buckets:
`photos`, `thumbnails`, `watermarked`, `avatars`, `covers`

### 4. Set up database

```bash
npm run db:push    # Push schema to Supabase
npm run db:seed    # Seed categories and tags
```

### 5. Run

```bash
npm run dev
```

### 6. Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Features

### Authentication
- [x] Email + password signup/login
- [x] Magic link (passwordless) login
- [x] Google OAuth + GitHub OAuth
- [x] Forgot password → email reset
- [x] Route protection via Edge middleware
- [x] JWT sessions with DB-backed username resolution

### Image Pipeline (Sharp)
- [x] Thumbnail generation (600px wide, progressive JPEG)
- [x] Watermark overlay (diagonal repeating "PixelMarket" + badge)
- [x] EXIF extraction (camera, lens, aperture, shutter, ISO, focal length, date)
- [x] HEIC/HEIF support (server-side conversion via heic-convert)
- [x] Client-side HEIC preview with heic2any fallback
- [x] Three files per upload: original, thumbnail, watermarked

### Dashboard
- [x] Masonry photo grid (CSS columns)
- [x] Infinite scroll (IntersectionObserver, 20 per page)
- [x] Category filter pills
- [x] Sidebar: Categories, Popular Tags, Trending, Activity
- [x] Responsive (sidebar hidden on mobile)

### Photo Detail
- [x] Side-by-side layout (photo + narrow sidebar)
- [x] Watermarked preview for non-purchasers
- [x] EXIF metadata grid (camera, lens, aperture, shutter, ISO, focal length, resolution, size, date, location)
- [x] Like, save, share action bar
- [x] Comment system with optimistic updates
- [x] Tags with search links
- [x] "More from photographer" grid

### Owner Actions
- [x] Edit photo (link to upload form)
- [x] Archive / restore (hide from feed)
- [x] Delete with two-step confirmation
- [x] Download original

### Purchases
- [x] License selection (Personal / Commercial / Extended)
- [x] Stripe Checkout for buy and rent flows
- [x] Webhook-based purchase fulfillment
- [x] Platform fee calculation (15%)
- [x] Auction bidding with outbid notifications
- [x] Free download for non-monetized photos

### Collections
- [x] Create with name, description, privacy toggle
- [x] Edit name, description, privacy
- [x] Delete with confirmation
- [x] Save photos from photo detail page (dropdown with checkboxes)
- [x] Remove photos from collection detail page
- [x] 2×2 photo grid preview on collection cards

### Notifications
- [x] Database-backed notification system
- [x] Real data in header dropdown (lazy-loaded on open)
- [x] Typed icons per notification type (follow, like, comment, purchase, bid)
- [x] Mark all as read
- [x] Notifications created for: likes, comments, follows, purchases, bids

### Other
- [x] Photographer profiles with stats + portfolio tabs
- [x] Full-text search with pagination
- [x] Profile settings with avatar upload
- [x] Dark/light theme toggle
- [x] Smooth scroll (Lenis) + GSAP scroll animations
- [x] Toast notifications (Zustand)
- [x] Keyboard shortcuts (Cmd+K for search)
- [x] Error boundaries (global, root, main, auth, 404)
- [x] Loading states

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Server Actions over API routes | Cleaner, auto revalidation, type-safe |
| Split auth config (auth.ts + auth.config.ts) | Edge middleware can't import nodemailer |
| JWT sessions | Fast reads, username resolved from DB on first use |
| Denormalized counters | `likeCount`, `viewCount` avoid COUNT queries |
| Slug-based URLs | SEO-friendly photo pages |
| Optimistic updates | Instant UI, async server sync |
| PBKDF2 via Web Crypto | No native deps, works in all runtimes |
| Lazy Stripe initialization | Prevents build-time crash on Vercel |
| heic-convert (server) + heic2any (client) | Full HEIC support without native libheif |
| IntersectionObserver infinite scroll | No pagination URLs, smooth UX |

---

## Remaining Work

### High Priority
- [ ] Rate limiting on server actions (prevent spam likes/comments/uploads)
- [ ] Stripe Connect for seller payouts (sellers currently can't withdraw)
- [ ] Auction end handler (cron or Edge Function to close expired auctions)

### Medium Priority
- [ ] HTML email templates (currently plain text for magic link + password reset)
- [ ] Edit photo form (route exists at `/upload?edit={slug}` but form not wired)
- [ ] Search improvements (tag-based search, photographer name search, suggestions)
- [ ] Admin panel for content moderation
- [ ] Dynamic OG images per photo (SEO)

### Low Priority
- [ ] Unit and integration tests
- [ ] Seller analytics dashboard
- [ ] PWA support
- [ ] Real-time notifications (Supabase Realtime or polling)
- [ ] Bulk upload support

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed categories + tags |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

---

## Changelog

### v0.1.0

**Initial release** — complete rewrite from prototype.

- Auth.js v5 with 4 providers (credentials, magic link, Google, GitHub)
- Drizzle ORM schema (15+ tables) with full relations
- Supabase Storage for file uploads (photos, thumbnails, watermarked, avatars, covers)
- Sharp image pipeline (thumbnails, watermarks, EXIF extraction)
- HEIC/HEIF upload support (server + client conversion)
- Stripe Checkout for purchases and rentals
- Auction bidding system with notifications
- Collection CRUD with save-to-collection from photo detail
- Real notification dropdown (DB-backed, lazy-loaded)
- Infinite scroll on dashboard (IntersectionObserver)
- Owner actions (edit, archive, delete) on photo detail
- Error boundaries (global, root, main, auth, 404, loading)
- GSAP + Lenis animations
- Azeret Mono design language
- Edge-compatible middleware (split auth config)
- Responsive design (mobile-first grid, hidden sidebar on mobile)

---

## License

MIT
