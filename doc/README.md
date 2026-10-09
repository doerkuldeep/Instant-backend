# API Documentation

Welcome to the API documentation for the project.

## Modules

* [User Authentication & Referral API](user-auth.md)
  * Endpoints:
    * `POST /api/user/auth/send-otp`
    * `POST /api/user/auth/verify-otp` (includes mandatory `acceptedTerms` & `requiresReconsent`)
    * `POST /api/user/auth/resend-otp`
    * `POST /api/user/auth/refresh`
    * `POST /api/user/auth/logout`
  * Complete request/response schemas
  * Happy path examples (First signup & returning login)
  * Worst case & edge case failure modes (validation, rate limit, expired OTP, attempt limits, referral logic, deactivated accounts)

* [Customer Legal & Help Documentation API](user-legal.md)
  * Endpoints:
    * `GET /api/user/legal` (Catalog of 12 customer legal & help documents)
    * `GET /api/user/legal/faqs` (Categorized FAQ PDF with Table of Contents on page 1)
    * `GET /api/user/legal/:slug` (Branded PDF streaming, `lang` fallback, `download`, 304 ETag caching)
    * `POST /api/user/legal/consent` (Authenticated re-consent tracking)
  * Multi-language support (`en`, `hi`)
  * Automated signup consent & `requiresReconsent` lifecycle

* [Customer Homepage & Discovery Feed API](user-homepage.md)
  * Endpoints:
    * `GET /api/user/home` & `/feed` (Unified single-call homepage feed, optional Bearer auth)
    * `GET /api/user/home/banners` (Hero promotional banners & carousel slides)
    * `GET /api/user/home/categories` (Curated top categories with counts & popularity)
    * `GET /api/user/home/featured` (Curated iconic & trending machines across segments)
    * `GET /api/user/home/segments` (LIGHT, HEAVY, OTHER segments with starting daily rates)
    * `GET /api/user/home/promotions` (Active platform coupons & discount offers)
    * `GET /api/user/home/trust-markers` (Platform safety standards & certifications)
    * `GET /api/user/home/testimonials` (Verified contractor reviews & stories)
    * `GET /api/user/home/search-trends` (Trending machinery search suggestions)


* [Partner Authentication & Referral API](partner-auth.md)
  * Endpoints:
    * `POST /api/partner/auth/send-otp`
    * `POST /api/partner/auth/verify-otp` (includes mandatory `acceptedTerms` & `requiresReconsent`)
    * `POST /api/partner/auth/resend-otp`
    * `POST /api/partner/auth/refresh`
    * `POST /api/partner/auth/logout`
  * Complete request/response schemas
  * Happy path examples (First signup & returning login)
  * Worst case & edge case failure modes (validation, rate limit, expired OTP, attempt limits, referral logic, deactivated accounts)

* [Partner Legal & Help Documentation API](partner-legal.md)
  * Endpoints:
    * `GET /api/partner/legal` (Catalog of 12 partner legal & help documents)
    * `GET /api/partner/legal/faqs` (Categorized FAQ PDF with Table of Contents on page 1)
    * `GET /api/partner/legal/:slug` (Branded PDF streaming, `lang` fallback, `download`, 304 ETag caching)
    * `POST /api/partner/legal/consent` (Authenticated re-consent tracking)
  * Multi-language support (`en`, `hi`)
  * Automated signup consent & `requiresReconsent` lifecycle

* [Machine & Category Rental Catalog API](machines-catalog.md)
  * Endpoints:
    * `GET /api/v1/categories` & `/api/categories`
    * `GET /api/v1/categories/:idOrSlug` & `/api/categories/:idOrSlug`
    * `GET /api/v1/machines` & `/api/machines` (search, segment, rate, fuel, brand filters)
    * `GET /api/v1/machines/:idOrSlug` & `/api/machines/:idOrSlug`
    * `GET /api/v1/machines/segments` & `/api/machines/segments`
    * `GET /api/v1/machines/featured` & `/api/machines/featured`
    * `GET /api/v1/machines/search/suggestions` & `/api/machines/search/suggestions`
  * Comprehensive rental rate structures, specifications, and segment categorization (LIGHT, HEAVY, OTHER).
