# API Documentation

Welcome to the API documentation for the project.

## Modules

* [Partner Authentication & Referral API](partner-auth.md)
  * Endpoints:
    * `POST /api/partner/auth/send-otp`
    * `POST /api/partner/auth/verify-otp`
    * `POST /api/partner/auth/resend-otp`
    * `POST /api/partner/auth/refresh`
    * `POST /api/partner/auth/logout`
  * Complete request/response schemas
  * Happy path examples
  * Worst case & edge case failure modes (validation, rate limit, expired OTP, attempt limits, referral logic)
