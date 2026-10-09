# Production-Ready Node.js + TypeScript + PostgreSQL + Prisma API

A clean, modular, production-ready enterprise REST API built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM. Includes full Role-Based Access Control (RBAC) supporting **Admin**, **Users**, and **Partners**.

---

## 📁 Project Architecture

```
my-app/
├── prisma/
│   ├── schema.prisma          # Database schema (User, PartnerProfile, RefreshToken, Roles)
│   ├── migrations/            # Auto-generated SQL migrations
│   ├── seed.ts                # Main Prisma seed runner
│   └── seeds/                 # Domain-specific seed files (users, partners, admins)
│       └── users.seed.ts
│
├── src/
│   ├── main.ts                # Entrypoint: boots server, connects DB, graceful shutdown
│   ├── app.ts                 # Express app builder (middlewares, routing, no .listen())
│   │
│   ├── config/
│   │   ├── env.ts             # Validates process.env with Zod & exports typed config
│   │   └── logger.ts          # Structured Pino logger with pino-pretty in dev
│   │
│   ├── database/
│   │   ├── prisma.ts          # Singleton PrismaClient instance
│   │   └── transaction.ts     # Wrapper helper for Prisma interactive transactions
│   │
│   ├── modules/
│   │   ├── users/
│   │   │   ├── controllers/         # user-auth, user-profile, user-legal, user-home
│   │   │   ├── services/            # user-auth, user-profile, user-legal, user-home
│   │   │   ├── routes/              # user-auth, user-profile, user-legal, user-home, users.routes.ts
│   │   │   ├── repositories/        # users.repository, user-otp, user-consent, user-home
│   │   │   ├── schemas/             # user-auth, user-profile, user-legal, user-home schemas
│   │   │   ├── middlewares/         # user.middleware.ts
│   │   │   ├── types/               # user, user-auth, user-legal, user-home types
│   │   │   └── tests/               # users.test, user-otp.test, user-legal.test, user-home.test
│   │   │
│   │   ├── admin/
│   │   │   ├── controllers/         # admin-auth, admin-users, admin-partners, admin-stats
│   │   │   ├── services/            # admin-auth, admin-users, admin-partners, admin-stats
│   │   │   ├── routes/              # admin-auth, admin-users, admin-partners, admin-stats, admin.routes.ts
│   │   │   ├── repositories/        # admin.repository.ts (metrics & aggregations)
│   │   │   ├── schemas/             # admin-auth, admin-users, admin-partners schemas
│   │   │   ├── middlewares/         # admin-guard.middleware.ts
│   │   │   ├── types/               # admin.types.ts
│   │   │   └── tests/               # admin.test.ts
│   │   │
│   │   └── partners/
│   │       ├── controllers/         # partner-auth, partner-profile, partner-legal, partner-onboard, partner-machines
│   │       ├── services/            # partner-auth, partner-profile, partner-legal, partner-onboard, partner-machines
│   │       ├── routes/              # partner-auth, partner-profile, partner-legal, partner-onboard, partner-machines
│   │       ├── repositories/        # partners.repository, partner-otp, partner-consent, partner-machines
│   │       ├── schemas/             # partner-auth, partner-profile, partner-legal schemas
│   │       ├── middlewares/         # partner-guard.middleware.ts
│   │       ├── types/               # partner, partner-auth, partner-legal types
│   │       └── tests/               # partners.test, partner-otp.test, partner-legal.test
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts          # Base operational error
│   │   │   ├── http-errors.ts       # NotFound, Conflict, Unauthorized, Forbidden...
│   │   │   └── prisma-error.ts      # Maps Prisma P2002, P2025, etc. to AppError
│   │   ├── middlewares/
│   │   │   ├── error-handler.ts     # Centralized error handler
│   │   │   ├── validate.ts          # Generic Zod request validator (body, query, params)
│   │   │   ├── authenticate.ts      # JWT authentication & authorize(Role...) RBAC
│   │   │   ├── rate-limit.ts        # Express rate limiter configuration
│   │   │   └── request-id.ts        # Request ID tracing (x-request-id)
│   │   ├── services/
│   │   │   ├── pdf/                 # Reusable PDF generator (PDFKit / Puppeteer providers, caching)
│   │   │   └── sms/                 # SMS dispatch service & mock provider
│   │   ├── utils/
│   │   │   ├── send-pdf.ts          # Reusable streaming PDF helper with ETag & attachment support
│   │   │   ├── pagination.ts        # Pagination parser and metadata helper
│   │   │   ├── hash.ts              # Bcrypt password hashing
│   │   │   └── async-handler.ts     # Async route wrapper for Express
│   │   ├── constants/
│   │   │   ├── content/legal/       # Versioned Markdown legal docs & meta.json catalog
│   │   │   └── roles.ts             # System roles & partner statuses
│   │   └── types/
│   │       └── express.d.ts         # Declaration merging for Express.Request (req.user)
│   │
│   ├── jobs/                        # Background workers (cleanup tasks, BullMQ/cron)
│   ├── events/                      # Strongly-typed domain EventEmitter
│   └── routes.ts                    # Mounts modules under /api/v1 and health check /health
│
├── tests/
│   ├── setup.ts               # Global Vitest test setup & env configuration
│   ├── helpers/
│   │   ├── factories.ts       # Mock model factories for testing
│   │   └── test-db.ts         # Database cleanup utilities for test suites
│   ├── integration/
│   │   └── api.test.ts        # API integration tests with Supertest
│   └── e2e/
│       └── auth-flow.test.ts  # End-to-end auth and authorization scenarios
│
├── scripts/
│   └── backfill-roles.ts      # One-off maintenance & data migration script
├── docker/
│   └── Dockerfile             # Multi-stage production container build
├── docker-compose.yml         # Local stack: PostgreSQL 16 + Redis 7 + API
├── .github/workflows/ci.yml   # CI pipeline: Lint, Test with Postgres, Build
│
├── .env                       # Local secrets (git ignored)
├── .env.example               # Environment variables template
├── eslint.config.mjs          # ESLint configuration
├── .prettierrc                # Prettier code formatting rules
├── .gitignore                 # Git ignore rules
├── .dockerignore              # Docker ignore rules
├── tsconfig.json              # TypeScript root configuration
├── tsconfig.build.json        # Production build configuration (excludes tests)
├── vitest.config.mts          # Vitest testing configuration
└── package.json
```

---

## 👥 Multi-Role Authorization Architecture

The platform provides granular access controls for three primary actor types:

| Role | Description | Capabilities |
| :--- | :--- | :--- |
| `ADMIN` | Platform Administrator | Manage all users, toggle account statuses, approve/reject/suspend partner accounts, set partner commission rates, delete users. |
| `USER` | Standard End-User | Self-registration, view and update personal profile, password updates, account management. |
| `PARTNER` | Business / Merchant | Dedicated partner registration with business profile (`companyName`, `businessRegNumber`, `businessCategory`), lifecycle status (`PENDING` ➔ `APPROVED` ➔ `SUSPENDED`), partner-specific profile updates. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+ (tested on Node v22 and v25)
- **PostgreSQL**: Local daemon or Docker

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` and JWT secrets in `.env` match your environment.

### 3. Spin Up PostgreSQL (Docker Compose)
If using Docker:
```bash
docker compose up -d postgres redis
```

### 4. Database Migration & Seeding
Run the Prisma migrations against your PostgreSQL instance:
```bash
# Apply migrations to database
npx prisma migrate dev --name init

# Or deploy existing migrations
npm run prisma:deploy

# Seed initial admin, user, and partners
npm run prisma:seed
```

**Default Seeded Credentials:**
- **Admin**: `admin@example.com` / `Password123!`
- **User**: `user@example.com` / `Password123!`
- **Partner (Approved)**: `partner@example.com` / `Password123!`
- **Partner (Pending)**: `partner-pending@example.com` / `Password123!`

### 5. Running the Application
```bash
# Start in watch mode for development
npm run dev

# Build TypeScript to dist/
npm run build

# Start production server
npm start
```

### 6. Running Tests & Quality Checks
```bash
# Run Vitest test suite
npm test

# Run linter
npm run lint

# Format code with Prettier
npm run format
```

---

## 📡 API Endpoints Overview

All module routes are mounted under `/api/v1`.

### Health Check
- `GET /health` - Database connectivity & service health status

### 👤 Users Domain (`/api/v1/users` & `/api/user`)
- `POST /api/user/auth/send-otp` - Dispatch secure 6-digit OTP via SMS (Rate limited: 3 / 10 min)
- `POST /api/user/auth/verify-otp` - Verify OTP, handle user registration with mandatory terms acceptance & referral tracking
- `POST /api/user/auth/resend-otp` - Invalidate & dispatch fresh OTP
- `POST /api/user/auth/refresh` - Rotate user JWT tokens
- `POST /api/user/auth/logout` - Revoke user session
- `GET /api/user/legal` - List catalog of 12 customer legal documents and policies
- `GET /api/user/legal/faqs` - Categorized customer FAQs PDF with Table of Contents on page 1
- `GET /api/user/legal/:slug` - Stream branded document PDF (supports `?lang=`, `?download=true`, and 304 ETag caching)
- `POST /api/user/legal/consent` - Record customer re-acceptance for document version *(Bearer Auth: `USER`)*
- `GET /api/user/home` *(or `/feed`)* - Customer homepage aggregated feed (supports `?format=sdui` and `?format=html`)
- `GET /api/user/home/sdui` *(or `/layout`)* - Full Server-Driven UI (SDUI) dynamic screen layout, widget components, tokens & deep-link actions
- `GET /api/user/home/preview` - Live interactive HTML web page rendered directly by the backend from SDUI layout
- `GET /api/user/home/banners` - Active marketing hero banners
- `GET /api/user/home/categories` - Equipment rental categories with machine counts
- `GET /api/user/home/featured` - Featured & trending machines with segment filtering (`?segment=`, `?limit=`)
- `GET /api/user/home/segments` - Industry segments overview (Earthmoving, Aerial, Compaction, Concrete...)
- `GET /api/user/home/promotions` - Active seasonal rental discount vouchers & promotions
- `GET /api/user/home/trust-markers` - Platform guarantees (verified operators, insurance, SLA, fast delivery)
- `GET /api/user/home/testimonials` - Verified contractor reviews and ratings
- `GET /api/user/home/search-trends` - Trending popular rental searches and tags
- `GET /api/v1/users/me` - Get current user profile *(Bearer Auth)*
- `PATCH /api/v1/users/me` - Update personal profile (`firstName`, `lastName`) *(Bearer Auth)*
- `GET /api/v1/users/:id` - Lookup user profile *(Bearer Auth)*

### 🏢 Partners Domain (`/api/v1/partners` & `/api/partner`)
- `POST /api/partner/auth/send-otp` - Dispatch secure 6-digit OTP via SMS (Rate limited: 3 / 10 min)
- `POST /api/partner/auth/verify-otp` - Verify OTP, handle partner onboarding with mandatory terms acceptance & referral tracking
- `POST /api/partner/auth/resend-otp` - Invalidate & dispatch fresh OTP
- `POST /api/partner/auth/refresh` - Rotate partner JWT tokens
- `POST /api/partner/auth/logout` - Revoke partner session
- `GET /api/partner/legal` - List catalog of 12 partner legal documents and agreements
- `GET /api/partner/legal/faqs` - Categorized partner FAQs PDF with Table of Contents on page 1
- `GET /api/partner/legal/:slug` - Stream branded document PDF (supports `?lang=`, `?download=true`, and 304 ETag caching)
- `POST /api/partner/legal/consent` - Record partner re-acceptance for document version *(Bearer Auth: `PARTNER`)*
- `GET /api/v1/partners/profile` - Get business partner profile *(Bearer Auth: `PARTNER`)*
- `PATCH /api/v1/partners/profile` - Update company details *(Bearer Auth: `PARTNER`)*
- `GET /api/v1/partners/status` - Check partner approval status *(Bearer Auth: `PARTNER`)*

### 🛡️ Admin Domain (`/api/v1/admin`)
- `POST /api/v1/admin/auth/login` - Authenticate admin *(Strict `ADMIN` role check)*
- `POST /api/v1/admin/auth/refresh` - Rotate admin refresh token
- `POST /api/v1/admin/auth/logout` - Revoke admin session
- `GET /api/v1/admin/users` - Paginated user list with filter by `role`, `partnerStatus`, `search` *(Bearer Auth: `ADMIN`)*
- `GET /api/v1/admin/users/:id` - View full user details *(Bearer Auth: `ADMIN`)*
- `PATCH /api/v1/admin/users/:id` - Update user role or active status *(Bearer Auth: `ADMIN`)*
- `DELETE /api/v1/admin/users/:id` - Delete user account *(Bearer Auth: `ADMIN`)*
- `PATCH /api/v1/admin/partners/:id/status` - Approve/reject/suspend partner and set commission *(Bearer Auth: `ADMIN`)*
- `GET /api/v1/admin/stats` - System overview metrics (user counts by role, partner states) *(Bearer Auth: `ADMIN`)*

### 🔑 Unified Auth (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Standard registration endpoint
- `POST /api/v1/auth/register-partner` - Partner registration endpoint
- `POST /api/v1/auth/login` - General login endpoint
- `POST /api/v1/auth/refresh` - Token rotation
- `POST /api/v1/auth/logout` - Session revocation
- `GET /api/v1/auth/me` - Authenticated user details *(Bearer Auth)*
- `POST /api/v1/auth/change-password` - Update password and revoke sessions *(Bearer Auth)*
# Instant-backend
