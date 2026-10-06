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
│   │   │   ├── controllers/         # user-auth.controller.ts, user-profile.controller.ts
│   │   │   ├── services/            # user-auth.service.ts, user-profile.service.ts
│   │   │   ├── routes/              # user-auth.routes.ts, user-profile.routes.ts, users.routes.ts
│   │   │   ├── repositories/        # users.repository.ts
│   │   │   ├── schemas/             # user-auth.schema.ts, user-profile.schema.ts
│   │   │   ├── middlewares/         # user.middleware.ts
│   │   │   ├── types/               # user.types.ts
│   │   │   └── tests/               # users.test.ts
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
│   │       ├── controllers/         # partner-auth.controller.ts, partner-profile.controller.ts
│   │       ├── services/            # partner-auth.service.ts, partner-profile.service.ts
│   │       ├── routes/              # partner-auth.routes.ts, partner-profile.routes.ts, partners.routes.ts
│   │       ├── repositories/        # partners.repository.ts
│   │       ├── schemas/             # partner-auth.schema.ts, partner-profile.schema.ts
│   │       ├── middlewares/         # partner-guard.middleware.ts
│   │       ├── types/               # partner.types.ts
│   │       └── tests/               # partners.test.ts
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
│   │   ├── utils/
│   │   │   ├── pagination.ts        # Pagination parser and metadata helper
│   │   │   ├── hash.ts              # Bcrypt password hashing
│   │   │   └── async-handler.ts     # Async route wrapper for Express
│   │   ├── constants/
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

### 👤 Users Domain (`/api/v1/users`)
- `POST /api/v1/users/auth/register` - Register standard end-user account
- `POST /api/v1/users/auth/login` - Authenticate end-user and issue JWT tokens
- `POST /api/v1/users/auth/refresh` - Rotate refresh token
- `POST /api/v1/users/auth/logout` - Revoke user session
- `GET /api/v1/users/me` - Get current user profile *(Bearer Auth)*
- `PATCH /api/v1/users/me` - Update personal profile (`firstName`, `lastName`) *(Bearer Auth)*
- `GET /api/v1/users/:id` - Lookup user profile *(Bearer Auth)*

### 🏢 Partners Domain (`/api/v1/partners`)
- `POST /api/v1/partners/auth/register` - Register partner with company & registration details (status: `PENDING`)
- `POST /api/v1/partners/auth/login` - Authenticate partner (verifies `PARTNER` role)
- `POST /api/v1/partners/auth/refresh` - Rotate partner refresh token
- `POST /api/v1/partners/auth/logout` - Revoke partner session
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
