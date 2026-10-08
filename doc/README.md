# API Documentation

Welcome to the API documentation for the project.

## Modules

* [User Authentication & Referral API](user-auth.md)
  * Endpoints:
    * `POST /api/user/auth/send-otp`
    * `POST /api/user/auth/verify-otp`
    * `POST /api/user/auth/resend-otp`
    * `POST /api/user/auth/refresh`
    * `POST /api/user/auth/logout`
  * Complete request/response schemas
  * Happy path examples (First signup & returning login)
  * Worst case & edge case failure modes (validation, rate limit, expired OTP, attempt limits, referral logic, deactivated accounts)

* [Partner Authentication & Referral API](partner-auth.md)
  * Endpoints:
    * `POST /api/partner/auth/send-otp`
    * `POST /api/partner/auth/verify-otp`
    * `POST /api/partner/auth/resend-otp`
    * `POST /api/partner/auth/refresh`
    * `POST /api/partner/auth/logout`
  * Complete request/response schemas
  * Happy path examples (First signup & returning login)
  * Worst case & edge case failure modes (validation, rate limit, expired OTP, attempt limits, referral logic, deactivated accounts)

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

